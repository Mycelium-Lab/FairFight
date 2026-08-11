/*
 * The TVM (TON) half of the chain-family seam.
 *
 * This is the ONLY file under lib/ that may name `beginCell`. Every opcode the
 * lobby sends is built here.
 *
 * Four capabilities shape the whole file, and none of them are cosmetic:
 *
 *  - liveEvents: false. There is no event feed. Discovery polls GET /ton/fights.
 *    `watchFights` therefore emits ONE 'refresh' event carrying the whole list.
 *    It deliberately does not diff successive polls into created/joined/
 *    withdrawn events: a fabricated event stream would be wrong at the edges
 *    (two changes inside one interval, a fight created and withdrawn between
 *    polls) and no caller needs it.
 *  - requiresApproval: false. There is no allowance, so getAllowance answers
 *    MAX_UINT256 and approve resolves immediately. The two-step approve/buy UI
 *    collapses to one step without the call site branching.
 *  - syncReceipt: false. tonConnectUI.sendTransaction resolves with a BOC, not a
 *    confirmed tx hash. That is why submit and confirm are separate operations
 *    at all, and why there is nothing to put in an explorer URL.
 *  - chainSwitch: false. TON has no wallet_switchEthereumChain analogue.
 *
 * Addresses are base64url and CASE-SIGNIFICANT, and one account has several
 * textual forms (bounceable / non-bounceable / testnet). `canonicalize` and
 * `equals` own that; `.toLowerCase()` on a TON address is a bug everywhere
 * except when comparing against a copy the server lowercased on insert, which
 * `equals` handles as its last resort.
 *
 * The item half of this file was lib/src/items/tvm.js, folded in for the same
 * reason as on the EVM side: both halves need the same TonConnect session, the
 * same address handling and the same "no receipt" story.
 */
import { TonConnectUI } from '@tonconnect/ui'
import { Address, beginCell, toNano } from '@ton/ton'
import { findNetwork } from '../modules/networks.js'
import { InventoryTypes, createShortAddress } from '../src/utils/utils.js'
import { fromBaseUnits, makeCaps, toBaseUnits, MAX_UINT256 } from './index.js'

const MANIFEST_URL = 'https://raw.githubusercontent.com/Mycelium-Lab/FairFight/master/lib/tonconnect-manifest.json'

// Gas headroom added on top of the stake, per operation. These were inline
// constants at each call site.
const GAS_CREATE = toNano(0.01)
const GAS_JOIN = toNano(0.015)
const GAS_WITHDRAW = toNano(0.01)
const GAS_FINISH = toNano(0.015)
const GAS_SHOP = toNano(0.05) * 2n

const OP_CREATE = 0x22FC5B29
const OP_JOIN = 0x45E011DD
const OP_WITHDRAW = 0x1BC3CF3B
const OP_FINISH_INNER = 0xB7766AF2
const OP_FINISH = 0x65C269F1
const OP_BUY_NFT = 0xD0170C90

const FIGHT_POLL_MS = 7500
const INVENTORY_POLL_MS = 20000
const LOOTBOX_PRICE = toNano(2)

// The shop contract's buy opcode indexes collections in this order.
const nftTypeIndexFor = {
    [InventoryTypes.CHARACTERS]: 0,
    [InventoryTypes.ARMORS]: 1,
    [InventoryTypes.BOOTS]: 2,
    [InventoryTypes.WEAPONS]: 3
}

export const getInventory = async (address) => {
    const rawResponse = await fetch('/ton/inventory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({address})
    }).catch(err => {
        console.log(err)
        return {}
    });
    return await rawResponse.json();
}

export const findUniqueNewNftItem = (inventory, newInventory) => {
    inventory = (inventory || []).filter(item => item);
    newInventory = (newInventory || []).filter(item => item);
    return newInventory.find(newItem => !inventory.some(item => item.address === newItem.address)) || null
}

const withNftAddress = (item) => ({...item, nftAddress: item.address})

const sessionProof = () => {
    try {
        return {initData: window.Telegram.WebApp.initData}
    } catch (error) {
        return {initData: null}
    }
}

export const tvmChain = ({network = findNetwork(0), mountConnectButtonAt = 'connect'} = {}) => {
    const contractAddress = network.contractAddress
    const nativeAsset = {
        symbol: network.currency,
        address: null,
        decimals: Number(network.decimals),
        src: '/media/tokens/ton.png'
    }

    const tonConnectUI = new TonConnectUI({
        manifestUrl: MANIFEST_URL,
        buttonRootId: mountConnectButtonAt
    })

    const canonicalize = (a) => {
        try { return Address.parse(a).toString() } catch (error) { return a }
    }
    const parses = (a) => {
        try { Address.parse(a); return true } catch (error) { return false }
    }

    /**
     * True when two strings name the same account.
     *
     * Both sides are canonicalized when they parse, which is what makes the
     * several textual forms of one TON account compare equal. When one side does
     * NOT parse it is a copy the server lowercased on insert (the statistics and
     * signatures tables do this), and the only comparison left is
     * case-insensitive on the raw text - which is exactly what the call sites
     * used to do inline, and the reason they must not keep doing it.
     */
    const equals = (a, b) => {
        if (!a || !b) return false
        if (a === b) return true
        if (parses(a) && parses(b)) return canonicalize(a) === canonicalize(b)
        return a.toLowerCase() === b.toLowerCase()
    }

    let address = null
    try {
        address = canonicalize(
            JSON.parse(localStorage.getItem('ton-connect-storage_bridge-connection'))
                .connectEvent.payload.items[0].address
        )
    } catch (error) {
        address = null
    }

    const send = (to, amount, body) => tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: Address.parse(to).toString(),
                amount: amount.toString(),
                payload: body.toBoc().toString('base64')
            }
        ]
    })

    // /ton/fights speaks the contract's own field names and returns everything as
    // strings. One shape for the whole client.
    const normalizeFight = (raw) => ({
        id: String(raw.id),
        owner: raw.owner,
        token: null,
        amountPerRound: BigInt(raw.amountPerRound),
        baseAmount: BigInt(raw.baseAmount),
        rounds: parseInt(raw.rounds),
        maxPlayers: parseInt(raw.maxPlayersAmount),
        createTime: parseInt(raw.createTime),
        finishTime: parseInt(raw.finishTime),
        players: raw.players || [],
        claimedBy: raw.playersClaimed || {}
    })

    const listOpenFights = async () => {
        const body = await (await fetch('/ton/fights')).json()
        return (body.fights || []).map(normalizeFight)
    }

    const awaitNewNft = async (who) => {
        const before = await getInventory(who)
        return new Promise(resolve => {
            const checker = setInterval(async () => {
                try {
                    const after = await getInventory(who)
                    const newItem = findUniqueNewNftItem(before.nfts, after.nfts)
                    if (newItem) {
                        clearInterval(checker)
                        resolve(withNftAddress(newItem))
                    }
                } catch (error) {
                    console.log(error)
                }
            }, INVENTORY_POLL_MS)
        })
    }

    return {
        family: 'tvm',
        // TON rides chain id 0 on the wire; the socket room name and every server
        // table are keyed on it.
        wireChainId: 0,
        chainid: 0,
        network,
        nativeAsset,

        caps: makeCaps({
            tokenChoice: false,
            requiresApproval: false,
            liveEvents: false,
            syncReceipt: false,
            chainSwitch: false,
            multiplayerTimer: false,
            perItemNftAddress: true,
            explorerTxLinks: false,
            dismissItemModalOnBackdropClick: false
        }),

        // ----------------------------------------------------------- session

        get connected() { return !!address },
        getAccount: () => address,

        /** TonConnect mounts its own button, so there is nothing to resume. */
        resume: async () => address,
        connect: async () => address,
        disconnect: () => tonConnectUI.disconnect(),

        /** Credential the server accepts for this family: the Telegram initData. */
        getSessionProof: async () => sessionProof(),

        onAccountChanged: (cb) => tonConnectUI.onStatusChange((wallet) => {
            try {
                address = canonicalize(wallet.account.address)
            } catch (error) {
                address = null
            }
            cb(address)
        }),

        onChainChanged: () => () => {},
        rememberAccount: () => {},

        /** No analogue on TON. caps.chainSwitch is false; this is here so that
         *  a shared call site can call it unconditionally. */
        switchChain: async () => {},
        useConfidentialProvider: () => {},

        // ---------------------------------------------------- assets/allowance

        listAssets: () => [nativeAsset],
        assetFor: async () => nativeAsset,

        // There is no allowance on TON. Answering MAX_UINT256 and resolving
        // approve() immediately is what lets the approve/buy UI collapse without
        // an `if (family === 'evm')` at the call site.
        getAllowance: async () => MAX_UINT256,
        approve: async () => ({ref: null}),

        // ----------------------------------------------------------- fights

        listOpenFights,
        getFight: async (id) => (await listOpenFights()).find(f => f.id === String(id)) || null,
        getPlayers: async (id) => ((await listOpenFights()).find(f => f.id === String(id)) || {}).players || [],
        getMyLastFight: async (who) =>
            (await listOpenFights()).find(f => (f.players || []).some(p => equals(p, who))) || null,

        hasClaimed: (fight, who) =>
            Object.entries(fight.claimedBy || {}).some(([player, claimed]) => claimed && equals(player, who)),
        isPlayer: (fight, who) => (fight.players || []).some(p => equals(p, who)),

        /**
         * Pull discovery. One 'refresh' per poll carrying the whole list - see
         * the header: no synthesised per-fight events.
         */
        watchFights: (cb) => {
            const timer = setInterval(async () => {
                try {
                    cb({kind: 'refresh', fights: await listOpenFights()})
                } catch (error) {
                    console.log(error)
                }
            }, FIGHT_POLL_MS)
            return () => clearInterval(timer)
        },

        createFight: ({amountPerRound, rounds, players}) => send(
            contractAddress,
            amountPerRound * BigInt(rounds) + GAS_CREATE,
            beginCell()
                .storeUint(OP_CREATE, 32)
                .storeCoins(amountPerRound)
                .storeInt(BigInt(rounds), 257)
                .storeInt(BigInt(players), 257)
                .endCell()
        ),

        joinFight: ({id, stake}) => send(
            contractAddress,
            BigInt(stake) + GAS_JOIN,
            beginCell().storeUint(OP_JOIN, 32).storeInt(BigInt(id), 257).endCell()
        ),

        withdrawFight: (id) => send(
            contractAddress,
            GAS_WITHDRAW,
            beginCell().storeUint(OP_WITHDRAW, 32).storeInt(BigInt(id), 257).endCell()
        ),

        /**
         * The same /sign envelope the EVM side claims with, in the other
         * encoding: TON reads only `s` (a base64 Ed25519 signature) and ignores
         * r and v, which the server leaves empty.
         */
        claimPayout: (id, voucher) => {
            const finishData = beginCell()
                .storeUint(OP_FINISH_INNER, 32)
                .storeInt(BigInt(id), 257)
                .storeAddress(Address.parse(address))
                .storeAddress(Address.parse(contractAddress))
                .storeCoins(voucher.amount)
                .endCell()
            const signatureCell = beginCell().storeBuffer(Buffer.from(voucher.s, 'base64')).endCell()
            return send(
                contractAddress,
                GAS_FINISH,
                beginCell()
                    .storeUint(OP_FINISH, 32)
                    .storeBuilder(finishData.asBuilder())
                    .storeRef(signatureCell)
                    .endCell()
            )
        },

        voucherIsClaimable: (voucher) => !!voucher.s,

        /**
         * There is no receipt. Nothing to wait on and nothing to return; the
         * caller shows its "we are checking your transaction" modal and finds
         * out by polling.
         */
        confirm: async (submitted) => submitted,

        // ------------------------------------------------------------- units

        toBaseUnits: (human, asset = nativeAsset) => toBaseUnits(human, asset.decimals),
        fromBaseUnits: (units, asset = nativeAsset) => fromBaseUnits(units, asset.decimals),
        formatAmount: (units, asset = nativeAsset) =>
            `${fromBaseUnits(units, asset.decimals)} ${asset.symbol}`,

        // --------------------------------------------------------- addresses

        canonicalize,
        equals,
        isValidAddress: parses,
        shortAddress: (a) => createShortAddress(a),
        explorerAddressUrl: (a) => `${network.explorer}/address/${a}`,
        /** null: a BOC is not a hash. caps.explorerTxLinks is false. */
        explorerTxUrl: () => null,

        // ------------------------------------------------------------- items

        route: (name) => `ton/${name}`,

        fetchInventory: getInventory,

        listOwnedNfts: async (who, inventory) => (inventory.nfts || []).filter(v => v).map(withNftAddress),

        equippedNftAddress: (inventory, itemType, itemId) =>
            (inventory.nfts || []).find(v => v && v.type === itemType && v.id === itemId)?.address,

        priceOf: (json) => json.priceTon,

        buyShopItem: ({nftTypeName, index, json}) => send(
            network.shopAddress,
            toNano(json.priceTon) + GAS_SHOP,
            beginCell()
                .storeUint(OP_BUY_NFT, 32)
                .storeInt(BigInt(nftTypeIndexFor[nftTypeName]), 257)
                .storeInt(BigInt(index), 257)
                .endCell()
        ),

        awaitNewNft,

        // "Buy now" opens a rail picker rather than buying directly. On desktop
        // the button itself also buys, because the dropdown is never mounted
        // there - only the mobile item modal hosts it.
        buildPaymentRails: ({buyButton, buy, nftTypeName, index, isDesktop}) => {
            const dropdown = document.createElement('div')
            dropdown.classList.add('buy-now-btn__wrapper-dropdown')
            const buyTon = document.createElement('span')
            buyTon.id = 'buy-via-ton'
            buyTon.textContent = 'Buy via Ton'
            const line = document.createElement('span')
            line.classList.add('line')
            const buyAeon = document.createElement('span')
            buyAeon.textContent = 'Buy via Aeon'
            ;[buyTon, buyAeon].forEach(rail => rail.addEventListener('click', () => {
                rail.style.backgroundColor = "var(--bs-warning)";
                setTimeout(() => {
                    rail.style.backgroundColor = "transparent";
                }, 250);
            }))
            dropdown.append(buyTon, line, buyAeon)

            buyButton.addEventListener('click', () => {
                dropdown.style.cssText = dropdown.style.display !== "flex"
                    ? 'display: flex !important;'
                    : 'display: none !important;'
            })
            const eventButton = isDesktop ? buyButton : buyTon
            eventButton.addEventListener('click', () => buy(dropdown))
            buyAeon.addEventListener('click', () => payWithAeon(nftTypeName, index))
            return {dropdown}
        },

        lootbox: {
            available: !!network.lootboxAddress,
            loadPricing: async () => ({price: LOOTBOX_PRICE, allowance: 0n}),
            buy: (price) => send(
                network.lootboxAddress,
                price + GAS_SHOP,
                beginCell().storeUint(0, 32).storeStringTail('Buy').endCell()
            )
        }
    }
}

// Card / off-chain rail: the server signs the order, Aeon hosts the checkout.
const payWithAeon = async (nftTypeName, index) => {
    const errorModal = document.querySelector('#new-error-modal')
    const errorModalText = document.querySelector('#new-error-modal-text')
    const response = await fetch('/aeon/sign', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...sessionProof(),
            nftType: nftTypeIndexFor[nftTypeName],
            nftId: parseInt(index)
        })
    })
    if (response.status != 200) {
        errorModal.style.display = 'flex'
        errorModalText.textContent = await response.text()
        return
    }
    const resSign = await response.json()
    const responseAeon = await fetch('https://sbx-crypto-payment-api.aeon.xyz/open/api/tg/payment/V2', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resSign)
    })
    const responseAeonJson = await responseAeon.json()
    if (responseAeon.status != 200) {
        errorModal.style.display = 'flex'
        errorModalText.textContent = responseAeonJson.msg
        return
    }
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = responseAeonJson.model.webUrl;
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
