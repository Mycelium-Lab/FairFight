import { Address, beginCell, toNano } from "@ton/ton";
import { addressMaker, getMap } from "../utils/utils";
import { MOBILE_DECOR, renderFightRow } from "../fights/rows.js";

const BUTTON_TEXT = {
    FINISH: 'finish',
    JOIN: 'join',
    WITHDRAW: 'withdraw'
}

const tonChainId = 0

const pendingModal = document.getElementById('pending_modal')
const pendingModalSubtitle = document.getElementById('pending_subtitle')
let openGamesList = document.querySelector("#opengames-list")

export const openFightsTon = async (fights, address, tonConnectUI, contractAddress) => {
    let opengames = document.getElementById("opengames")
    let openGamesEmpty = document.getElementById("opengames_empty");
    if (!SimpleBar.instances.get(openGamesList)) {
        new SimpleBar(openGamesList, { });        
    }
    if (fights.length === 0) {
        document.getElementById("opengames_empty").style.display = '';
        opengames.classList.add('empty');
    } else {
        for (let i = 0; i < fights.length; i++) {
            const child = await appendOpenFight(fights[i], tonChainId, address, tonConnectUI, contractAddress)
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
            if (!fightExist || fightExist.playersClaimed[`${address}`] == true) {
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

const appendOpenFight = async (fight, chainid = tonChainId, address, tonConnectUI, contractAddress) => {
    let index = fight.id
    let buttonText = BUTTON_TEXT.JOIN
    let signature, amount, remainingRounds
    if (address == fight.owner) {
        buttonText = BUTTON_TEXT.WITHDRAW
    }
    if (fight.players.length >= 2 && fight.players.includes(address)) {
        if (fight.playersClaimed[`${address}`] == true) {
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
        let enemiesStr = ``
        let enemies = fight.players.filter(v => v != address)
        enemies.forEach((enemy, i) => {
            if (i == enemies.length - 1) {
                enemiesStr += `${enemy}`   
            } else {
                enemiesStr += `${enemy},`
            }
        })
        let queryStatsPlayer = new URLSearchParams();
        queryStatsPlayer.append("gameID", index)
        queryStatsPlayer.append("address", address)
        queryStatsPlayer.append("chainid", chainid)
        const res = await fetch('/sign?' + queryStatsPlayer.toString())
        const playerStats = await res.json()
        if (playerStats.s) {
            signature = playerStats.s
            amount = playerStats.amount
            buttonText = BUTTON_TEXT.FINISH
            const resStatistics = await fetch('/statistics?' + queryStatsPlayer.toString())
            const playerStatistics = await resStatistics.json()
            const playerOneStats = playerStatistics.find(v => v.player.toLowerCase() === address.toLowerCase())
            remainingRounds = playerOneStats.remainingrounds
        } else {
            localStorage.setItem('ton_game_owner', fight.owner)
            localStorage.setItem('tonwallet', address)
            localStorage.setItem('ton_enemies', enemies)
            localStorage.setItem('realBalance', fight.baseAmount)
            localStorage.setItem('amountPerRound', fight.amountPerRound)
            localStorage.setItem(`deposit_${0}_${index}`, fight.baseAmount)
            localStorage.setItem('rounds', fight.rounds)
            window.location.href = `/ton_game/?ID=${index}&network=${chainid}&token=${'TON'}&decimals=${9}`
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
    let decimals = 9
    button.innerHTML = `<span>${buttonText}</span>`
    button.className = 'close-button join-button opengames__btn'
    button.addEventListener('click', async (event) => {
        window.addEventListener("popstate", () => {});
        const amountToPlay = fight.baseAmount
        if (buttonText === BUTTON_TEXT.WITHDRAW) {
            const body = beginCell()
                .storeUint(0x1BC3CF3B, 32)
                .storeInt(parseInt(index), 257)
                .endCell();
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: [
                    {
                        address: Address.parse(contractAddress).toString(),
                        amount: (toNano(0.01)).toString(), 
                        payload: body.toBoc().toString("base64") 
                    }
                ]
            }
            const result = await tonConnectUI.sendTransaction(transaction)
            if (result) {
                pendingModalSubtitle.textContent = 'We are checking your transaction, fight will disappear from the list of open games. You can close this modal.'
                pendingModal.style.display = 'flex'
            }
        }
        if (buttonText === BUTTON_TEXT.JOIN) {
            const body = beginCell()
                .storeUint(0x45E011DD, 32)
                .storeInt(index, 257)
                .endCell();
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: [
                    {
                        address: Address.parse(contractAddress).toString(),
                        amount: (BigInt(fight.baseAmount) + toNano(0.015)).toString(), 
                        payload: body.toBoc().toString("base64") 
                    }
                ]
            }
            const result = await tonConnectUI.sendTransaction(transaction)
            if (result) {
                pendingModalSubtitle.textContent = 'We are checking your transaction, you will be autoredirected to game screen. You can close this modal.'
                pendingModal.style.display = 'flex'
            }
        }
        if (buttonText === BUTTON_TEXT.FINISH) {
            const finishData = beginCell()
                .storeUint(0xB7766AF2, 32)
                .storeInt(index, 257)
                .storeAddress(Address.parse(address))
                .storeAddress(Address.parse(contractAddress))
                .storeCoins(amount)
                .endCell();
            const signatureCell = beginCell().storeBuffer(Buffer.from(signature, 'base64')).endCell()
            const body = beginCell()
                .storeUint(0x65C269F1, 32)
                .storeBuilder(finishData.asBuilder())
                .storeRef(signatureCell)
                .endCell()
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: [
                    {
                        address: Address.parse(contractAddress).toString(),
                        amount: toNano(0.015).toString(), 
                        payload: body.toBoc().toString("base64")
                    }
                ]
            };
            const result = await tonConnectUI.sendTransaction(transaction);
            if (result) {
                pendingModalSubtitle.textContent = 'We are checking your transaction, fight will disappear from the list of open games. You can close this modal.'
                pendingModal.style.display = 'flex'
            }
        }
    })
    let queryGameProps = new URLSearchParams();
    queryGameProps.append("gameid", index)
    queryGameProps.append("chainid", chainid)
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
    let amountDepositOrClaimNumber = `${fight.baseAmount / 10**decimals} TON`
    if (buttonText === BUTTON_TEXT.FINISH) {
        amountDepositOrClaimText = 'Amount to claim: '
        amountDepositOrClaimNumber = `${amount / 10**decimals} TON`
    }
    const encodedText = encodeURIComponent(`${addressMaker(address)} invite you to play fairfights p2p game (id: ${index})`)
    return renderFightRow({
        rowClass: 'games__row border-style',
        decor: MOBILE_DECOR,
        hiddenInput: true,
        id: index,
        creator: { text: addressPlayer1, href: `#` },
        map,
        rounds: {
            text: `Current round: ${(remainingRounds != undefined) ? (parseInt(rounds) - remainingRounds) : 0}/${rounds}`,
            className: `right`
        },
        status: { id: `mygame_status_${index}`, text: statusText },
        players: { text: `Players: ${fight.maxPlayersAmount.toString()}` },
        bet: { text: `${fight.amountPerRound / 10**decimals} TON` },
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
