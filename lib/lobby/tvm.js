/*
 * The TVM (TON) half of the lobby.
 *
 * Loaded by lib/lobby.js only on a TON page - see the note there for why this
 * is an import() and not an import. Everything chain-shaped goes through the
 * adapter built below: the TonConnect session, every opcode the lobby sends,
 * base-unit arithmetic and address form. There is no `beginCell` and no
 * `@ton/ton` import in this file.
 *
 * This page is a Telegram mini app, so free-to-play is the default and the
 * wallet is optional: everything from `startF2P` down runs whether or not one
 * is connected.
 */
import { openFightsTon } from '../src/ton/openFights.js'
import { pastFightsTon } from '../src/ton/pastFights.js'
// Was ../src/f2p/{openFights,pastFights}.js - two one-line re-export shims that
// existed only to keep this file's old import paths alive until the entries
// merged. They are gone; this is the implementation.
import { openFightsF2P, pastFightsF2P } from '../src/fights/f2p.js'
import { renderShop } from '../src/items/shop.js'
import { addInventoryItem, renderInventory, setItemsChain } from '../src/items/inventory.js'
import { InventoryTypes, mobileAndTabletCheck } from '../src/utils/utils'
import { networkFromQuery } from '../chain/index.js'
import { tvmChain } from '../chain/tvm.js'
import { betForm, showError, wireBetTotals, wireInfoModal } from './chrome.js'

const F2P_POLL_MS = 7500
const F2P_CHAINID = 999999
const CLAIM_NFT_COST = 150

const INVENTORY_LIST_FOR = {
    [InventoryTypes.ARMORS]: '#left-inventory-armors-list',
    [InventoryTypes.WEAPONS]: '#left-inventory-weapons-list',
    [InventoryTypes.BOOTS]: '#left-inventory-boots-list'
}

const postJSON = (url, body) => fetch(url, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
})

const fetchJSON = async (url) => (await fetch(url)).json()

export const startTonLobby = async () => {
    const isMobile = mobileAndTabletCheck()
    if (!isMobile) {
        document.querySelector('.playform-not-supported-popup-tg').style.display = 'block'
    }
    const checkOrientation = () => {
        document.querySelector('.tg-rotate-popup').style.display =
            (isMobile && window.innerWidth > 500) ? 'flex' : 'none'
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)

    // ?network= picks the chain; an id from another family (or none) falls back
    // to this family's default. See lib/chain/index.js.
    const network = networkFromQuery('tvm')
    // One adapter for the page. It owns the single TonConnectUI instance and
    // mounts its button into #connect, which is what the raw
    // `new TonConnectUI(...)` here used to do.
    const chain = tvmChain({network})
    // The NFT-claim flow below writes into the inventory lists, and can run
    // before the inventory panel has been rendered.
    setItemsChain(chain)

    try {
        window.telegramAnalytics.init({
            token: 'eyJhcHBfbmFtZSI6IkZhaXJGaWdodCIsImFwcF91cmwiOiJodHRwczovL3QubWUvZmFpcmZpZ2h0c19ib3QiLCJhcHBfZG9tYWluIjoiaHR0cHM6Ly9mYWlyZmlnaHQuZmFpcnByb3RvY29sLnNvbHV0aW9ucy90b24ifQ==!x6N8ACuiFFPQqEeSFSO+7Emouo0vscPjidfv+dpcISk=',
            appName: 'FairFight',
        })
    } catch (error) {
        console.log(error)
    }

    const newGameModal = document.querySelector('#my_modal')
    const f2pChecker = document.querySelector('#f2p_checker')
    wireModeToggle(f2pChecker)
    ;['#btn_modal_window', '#btn_modal_window_mobile', '#btn_modal_window_mobile_f2p'].forEach(selector => {
        document.querySelector(selector).addEventListener('click', () => {
            newGameModal.style.display = 'flex'
        })
    })

    let tgInitData = null
    let username = localStorage.getItem('telegram_username')
    let chatid
    if (window.Telegram.WebApp.initData) {
        tgInitData = window.Telegram.WebApp.initData
        const data = await getUsernameFromInitData(tgInitData)
        username = data.username
        chatid = data.chatid
    }

    const form = betForm()
    wireBetTotals(form)
    const createGameBtn = document.querySelector('#createGame')
    createGameBtn.disabled = false

    // The free and the on-chain create paths are two listeners on the same
    // button, each ignoring the clicks meant for the other. That is how it has
    // always been - the on-chain one is only added once a wallet is connected.
    createGameBtn.addEventListener('click', async () => {
        if (!f2pChecker.checked) return
        const amountPerRound = chain.toBaseUnits(form.amount.value)
        const res = await postJSON('/f2p/create', {
            owner: username,
            map: form.mapId(),
            rounds: form.roundsValue(),
            baseAmount: (amountPerRound * BigInt(form.roundsValue())).toString(),
            amountPerRound: amountPerRound.toString(),
            players: form.playersValue(),
            initData: tgInitData,
            chainid: F2P_CHAINID
        })
        if (res.status == 200) {
            await openFightsF2P((await fetchJSON('/f2p')).fights, username)
            newGameModal.style.display = 'none'
        } else {
            showError(await res.text())
        }
    })

    // The adapter recovers the session from TonConnect's own localStorage entry
    // and canonicalizes it; a page with no wallet gets null and stays in F2P.
    let address = null
    try {
        address = chain.getAccount()
    } catch (error) {}
    if (address) {
        await startOnChain(chain, address, form, f2pChecker, newGameModal, createGameBtn)
        await postJSON('/ton/setaddress', {initData: tgInitData, username, address, chatid})
    }
    chain.onAccountChanged((account) => {
        // A wallet arriving mid-session reloads onto the connected page rather
        // than trying to graft the on-chain half onto a running F2P one.
        if (!address && account) window.location.reload()
    })

    // Once. The old file called this from inside the connected branch as well,
    // so a connected page rendered every shop item twice.
    await renderShop(chain, address, isMobile)
    await startF2P(username)
    await wireClaimNft(chain, address, username, tgInitData)
}

/*
 * #f2p_checker is a toggle on one page, not a network selector: free-to-play is
 * a mode, and the two sets of panels swap places.
 */
const wireModeToggle = (f2pChecker) => {
    const paid = ['#games_checker', '#opengames', '#pastgames'].map(s => document.querySelector(s))
    const free = ['#games_checker-f2p', '#opengames-f2p', '#pastgames-f2p'].map(s => document.querySelector(s))
    const f2pText = document.querySelector('#f2p-text')

    document.querySelector('#opengames-f2p').style.display = ''
    document.querySelector('#opengames-f2p-btn').addEventListener('click', () => {
        document.querySelector('#opengames-f2p').style.display = ''
        document.querySelector('#pastgames-f2p').style.display = 'none'
    })
    document.querySelector('#pastgames-f2p-btn').addEventListener('click', () => {
        document.querySelector('#pastgames-f2p').style.display = ''
        document.querySelector('#opengames-f2p').style.display = 'none'
    })
    f2pChecker.addEventListener('change', () => {
        const free2play = f2pChecker.checked
        f2pText.textContent = free2play ? 'free to play' : 'pay to play'
        paid.forEach(el => el.style.display = free2play ? 'none' : '')
        free.forEach(el => el.style.display = free2play ? '' : 'none')
    })
}

/*
 * The wallet half. Only reached when TonConnect has a session.
 */
const startOnChain = async (chain, address, form, f2pChecker, newGameModal, createGameBtn) => {
    let stopWatchingFights
    try {
        createGameBtn.addEventListener('click', async () => {
            if (f2pChecker.checked) return
            const result = await chain.createFight({
                amountPerRound: chain.toBaseUnits(form.amount.value),
                rounds: form.roundsValue(),
                players: form.playersValue()
            })
            await postJSON('/ton/map', {address, map: form.mapId()})
            // caps.syncReceipt is false: sendTransaction hands back a BOC, so
            // there is no receipt to wait on here.
            if (result) {
                newGameModal.style.display = 'none'
                document.getElementById('pending_subtitle').textContent = 'We are checking your transaction, fight will appear in the list of open games. You can close this modal.'
                document.getElementById('pending_modal').style.display = 'flex'
            }
        })

        let fights = await chain.listOpenFights()
        /*
         * Pull discovery. caps.liveEvents is false on this family, so the
         * adapter polls and emits one 'refresh' carrying the whole list - the
         * same interface the EVM lobby drives off contract.on, not a fabricated
         * event stream.
         */
        stopWatchingFights = chain.watchFights(async (ev) => {
            try {
                await openFightsTon(chain, ev.fights, address)
            } catch (error) {
                console.log(error)
            }
        })

        const query = new URLSearchParams({address, chainid: chain.wireChainId})
        const pastFights = await fetchJSON(`/statistics/all/?${query.toString()}`)
        try {
            await pastFightsTon(chain, pastFights, address)
        } catch (error) {}
        wireInfoModal('#pastgames-table [data-fight]', () => pastFightsTon(chain, pastFights, address))

        try {
            await openFightsTon(chain, fights, address)
        } catch (error) {}
        try {
            await renderInventory(chain, address)
        } catch (error) {}
    } catch (error) {
        console.log(error)
        if (stopWatchingFights) stopWatchingFights()
    }
}

/*
 * The free half. Runs with no wallet: identity is the Telegram handle.
 */
const startF2P = async (username) => {
    let fights = (await fetchJSON('/f2p')).fights
    setInterval(async () => {
        try {
            fights = (await fetchJSON('/f2p')).fights
            await openFightsF2P(fights, username)
        } catch (error) {
            console.log(error)
        }
    }, F2P_POLL_MS)
    const pastFights = (await fetchJSON(`/f2p/pastfights?player=${username}`)).fights

    document.querySelector('#opengames_empty-f2p').style.display = 'none'
    await openFightsF2P(fights, username)
    await pastFightsF2P(pastFights, username)
    wireInfoModal('#pastgames-table-f2p [data-fight]', () => pastFightsF2P(pastFights, username))
}

/*
 * FAIR earned free-to-play buys one NFT. The mint is a server-side transfer, so
 * there is no receipt to wait on: the adapter polls the inventory and resolves
 * when the new NFT turns up.
 */
const wireClaimNft = async (chain, address, username, tgInitData) => {
    const query = new URLSearchParams({initData: tgInitData, username})
    const board = await fetchJSON(`/f2p/board/?${query.toString()}`).catch(() => ({board: {tokens: 0}}))
    document.querySelector('#f2p_balance__value').textContent = board.board.tokens

    document.querySelector('#f2p_ton_claim_nft_btn').addEventListener('click', async () => {
        if (!address) return showError('You need to connect wallet in the main menu to claim NFT')
        if (board.board.tokens < CLAIM_NFT_COST) return showError('Not enough FAIR tokens to claim NFT')

        document.getElementById('pending_subtitle').textContent = 'We are checking your transaction, NFT will appear in your inventory and wallet. You can close this modal.'
        document.getElementById('pending_modal').style.display = 'flex'
        const result = await postJSON('/ton/mintnft', {initData: tgInitData, username, address})
        if (result.status != 200) {
            document.getElementById('pending_modal').style.display = 'none'
            showError(await result.text() || 'Something went wrong')
            return
        }
        try {
            const newItem = await chain.awaitNewNft(address)
            const listItemId = INVENTORY_LIST_FOR[newItem.collection] || '#left-inventory-characters-list'
            const slots = document.querySelector(listItemId).querySelectorAll('.item-list__slot')
            const firstEmpty = Array.from(slots).findIndex(v => v.childElementCount === 4)
            addInventoryItem(listItemId, newItem, newItem.collection, address, chain.chainid, firstEmpty, undefined, newItem.nftAddress)
            document.querySelector('#new-success-modal-text').textContent = 'You have successfully purchased the NFT'
            // caps.explorerTxLinks is false: a server-side mint has no ref this
            // page can resolve, so the link stays inert rather than being built
            // out of an undefined hash.
            document.querySelector('#new-success-modal-link').href = '#'
            document.querySelector('#new-success-modal-img').src = newItem.image
            document.querySelector('#new-success-modal').style.display = 'flex'
        } catch (error) {
            console.log(error)
        }
    })
}

async function getUsernameFromInitData(initData) {
    const params = new URLSearchParams(initData)
    const userEncoded = params.get('user')
    let username = null
    let chatid = null

    if (userEncoded) {
        const userObj = JSON.parse(decodeURIComponent(userEncoded))
        username = userObj.username
        chatid = userObj.id
    }

    if (chatid) {
        try {
            await postJSON('/ton/chatid', {chatid, username, initData})
        } catch (error) {
            console.log(error)
        }
    }

    return {username, chatid}
}
