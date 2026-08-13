// TON open-fight list.
//
// All chain access goes through the adapter (lib/chain/tvm.js): no `beginCell`,
// no TonConnect handle, no contract address, no opcodes. What is left here is
// DOM and the button state machine, exactly as on the EVM side.
//
// The fights arriving here are the adapter's normalised shape - BigInt amounts,
// `maxPlayers`, `claimedBy` - not the raw /ton/fights JSON, so amounts are
// formatted by the adapter instead of being divided by 10**9 in floating point.
import { addressMaker, getMap } from "../utils/utils";
import { MOBILE_DECOR, renderFightRow } from "../fights/rows.js";

const BUTTON_TEXT = {
    FINISH: 'finish',
    JOIN: 'join',
    WITHDRAW: 'withdraw'
}

const pendingModal = document.getElementById('pending_modal')
const pendingModalSubtitle = document.getElementById('pending_subtitle')
let openGamesList = document.querySelector("#opengames-list")

const matchUrl = (chain, id) =>
    `/ton_game/?ID=${id}&network=${chain.wireChainId}&token=${chain.nativeAsset.symbol}&decimals=${chain.nativeAsset.decimals}`

export const openFightsTon = async (chain, fights, address) => {
    let opengames = document.getElementById("opengames")
    if (!SimpleBar.instances.get(openGamesList)) {
        new SimpleBar(openGamesList, { });
    }
    if (fights.length === 0) {
        document.getElementById("opengames_empty").style.display = '';
        opengames.classList.add('empty');
    } else {
        for (let i = 0; i < fights.length; i++) {
            const child = await appendOpenFight(chain, fights[i], address)
            if (child) {
                if (document.querySelector('#opengames-list .simplebar-content')) {
                    document.querySelector('#opengames-list .simplebar-content').appendChild(child)
                }
            }
        }
    }
    let counter = 0
    document.querySelectorAll('#opengames-list .games__row').forEach(v => {
        if (v.id && v.id.includes('openbattle_')) {
            let index = v.id.split('openbattle_')[1]
            let fightExist = fights.find(v => v.id == index)
            if (!fightExist || chain.hasClaimed(fightExist, address)) {
                document.querySelector('#opengames-list .simplebar-content').removeChild(v)
            } else {
                counter += 1
            }
        }
    })
    if (counter != 0) {
      document.getElementById("opengames_empty").style.display = 'none';
      opengames.classList.remove('empty')
    } else {
      document.getElementById("opengames_empty").style.display = '';
      opengames.classList.add('empty');
    }
}

const opengamesBtn = document.querySelector('#opengames-btn')
opengamesBtn.addEventListener('click', () => {
    const pastgames = document.getElementById("pastgames")
    const opengames = document.getElementById("opengames")
    pastgames.style.display = 'none'
    opengames.style.display = ''
})

const appendOpenFight = async (chain, fight, address) => {
    let index = fight.id
    let buttonText = BUTTON_TEXT.JOIN
    let voucher, remainingRounds
    if (chain.equals(address, fight.owner)) {
        buttonText = BUTTON_TEXT.WITHDRAW
    }
    if (fight.players.length >= 2 && chain.isPlayer(fight, address)) {
        if (chain.hasClaimed(fight, address)) {
            openGamesList.childNodes.forEach(v => {
                if (v.id && v.id.includes('openbattle_')) {
                    let index = v.id.split('openbattle_')[1]
                    if (index == fight.id) {
                        openGamesList.removeChild(v)
                    }
                }
            })
            return
        }
        let enemies = fight.players.filter(v => !chain.equals(v, address))
        let queryStatsPlayer = new URLSearchParams();
        queryStatsPlayer.append("gameID", index)
        queryStatsPlayer.append("address", address)
        queryStatsPlayer.append("chainid", chain.wireChainId)
        const res = await fetch('/sign?' + queryStatsPlayer.toString())
        const playerStats = await res.json()
        // The claimable test is per family: EVM waits for r, TVM for s.
        if (chain.voucherIsClaimable(playerStats)) {
            voucher = playerStats
            buttonText = BUTTON_TEXT.FINISH
            const resStatistics = await fetch('/statistics?' + queryStatsPlayer.toString())
            const playerStatistics = await resStatistics.json()
            // The statistics table stores addresses lowercased, so this
            // comparison must go through the adapter rather than lowercasing here.
            const playerOneStats = playerStatistics.find(v => chain.equals(v.player, address))
            remainingRounds = playerOneStats.remainingrounds
        } else {
            localStorage.setItem('ton_game_owner', fight.owner)
            localStorage.setItem('tonwallet', address)
            localStorage.setItem('ton_enemies', enemies)
            localStorage.setItem('realBalance', fight.baseAmount)
            localStorage.setItem('amountPerRound', fight.amountPerRound)
            localStorage.setItem(`deposit_${chain.wireChainId}_${index}`, fight.baseAmount)
            localStorage.setItem('rounds', fight.rounds)
            window.location.href = matchUrl(chain, index)
        }
    } else {
        if (fight.finishTime != 0) return
    }
    let fightExits = document.querySelector(`#openbattle_${index}`)
    if (fightExits) {
        return
    }

    let button = document.createElement("button")
    button.value = index
    button.innerHTML = `<span>${buttonText}</span>`
    button.className = 'close-button join-button opengames__btn'
    button.addEventListener('click', async (event) => {
        window.addEventListener("popstate", () => {});
        let result
        let pendingText
        if (buttonText === BUTTON_TEXT.WITHDRAW) {
            result = await chain.withdrawFight(index)
            pendingText = 'We are checking your transaction, fight will disappear from the list of open games. You can close this modal.'
        }
        if (buttonText === BUTTON_TEXT.JOIN) {
            result = await chain.joinFight({id: index, stake: fight.baseAmount})
            pendingText = 'We are checking your transaction, you will be autoredirected to game screen. You can close this modal.'
        }
        if (buttonText === BUTTON_TEXT.FINISH) {
            result = await chain.claimPayout(index, voucher)
            pendingText = 'We are checking your transaction, fight will disappear from the list of open games. You can close this modal.'
        }
        // caps.syncReceipt is false here: sendTransaction hands back a BOC, so
        // there is nothing to confirm and the user is told to come back later.
        if (result) {
            pendingModalSubtitle.textContent = pendingText
            pendingModal.style.display = 'flex'
        }
    })
    let queryGameProps = new URLSearchParams();
    queryGameProps.append("gameid", index)
    queryGameProps.append("chainid", chain.wireChainId)
    queryGameProps.append("player", fight.owner)
    let mapID = await fetch('/getgamesprops?' + queryGameProps).then(async (res) => (await res.json()).map).catch(err => {
        console.log(err)
        return 0
    })
    const map = getMap(mapID)
    // const addressPlayer1 = addressMaker(fight.owner);
    const addressPlayer1 = fight.owner
    const rounds = fight.rounds
    let statusText = `Game over. Claim your reward`
    if (buttonText === BUTTON_TEXT.WITHDRAW) {
        statusText = `Your game. Waiting for an opponent or timer`
    } else if (buttonText === BUTTON_TEXT.JOIN) {
        statusText = `Waiting for an opponent or timer`
    }
    let amountDepositOrClaimText = 'To deposit: '
    let amountDepositOrClaimNumber = chain.formatAmount(fight.baseAmount)
    if (buttonText === BUTTON_TEXT.FINISH) {
        amountDepositOrClaimText = 'Amount to claim: '
        amountDepositOrClaimNumber = chain.formatAmount(BigInt(voucher.amount))
    }
    const encodedText = encodeURIComponent(`${addressMaker(address)} invite you to play fairfights p2p game (id: ${index})`)
    return renderFightRow({
        rowClass: 'games__row border-style',
        decor: MOBILE_DECOR,
        hiddenInput: true,
        id: index,
        creator: { text: addressPlayer1, href: chain.explorerAddressUrl(fight.owner) },
        map,
        rounds: {
            text: `Current round: ${(remainingRounds != undefined) ? (parseInt(rounds) - remainingRounds) : 0}/${rounds}`,
            className: `right`
        },
        status: { id: `mygame_status_${index}`, text: statusText },
        players: { text: `Players: ${fight.maxPlayers}` },
        bet: { text: chain.formatAmount(fight.amountPerRound) },
        deposit: {
            label: amountDepositOrClaimText,
            text: amountDepositOrClaimNumber,
            // NB: fight.index is undefined - kept as-is, this id is not read anywhere
            pId: `amount_deposit_or_claim_p_${fight.index}`
        },
        inviteLink: buttonText === BUTTON_TEXT.WITHDRAW
            ? { href: `https://t.me/share/url?url=https://t.me/fairfights_bot?startapp&text=${encodedText}` }
            : null,
        button
    }).li
}
