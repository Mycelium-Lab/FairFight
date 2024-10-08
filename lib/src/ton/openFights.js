import { Address, beginCell, toNano } from "@ton/ton";
import { getMap } from "../utils/utils";

const BUTTON_TEXT = {
    FINISH: 'finish',
    JOIN: 'join',
    WITHDRAW: 'withdraw'
}

const tonChainId = 0

export const openFightsTon = async (fights, address, tonConnectUI, contractAddress) => {
    let opengames = document.getElementById("opengames")
    let openGamesList = document.getElementById("opengames-list")
    let openGamesEmpty = document.getElementById("opengames_empty");
    
    openGamesList.childNodes.forEach(v => {
        if (v != openGamesEmpty) openGamesList.removeChild(v)
    })

    if (fights.length === 0) {
      document.getElementById("opengames_empty").style.display = '';
      opengames.classList.add('empty');
    } else {
      let counter = 0
      fights.forEach(async (fight) => {
        const child = await appendOpenFight(fight, tonChainId, address, tonConnectUI, contractAddress)
        if (child) {
            openGamesList.appendChild(child)
            counter += 1
        }
      })
      if (counter != 0) {
        document.getElementById("opengames_empty").style.display = 'none';
        opengames.classList.remove('empty')
      }
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
    let signature, amount
    if (address == fight.owner) {
        buttonText = BUTTON_TEXT.WITHDRAW
    }
    if (fight.players.length >= 2 && fight.players.includes(address)) {
        if (fight.playersClaimed[`${address}`] == true) return
        let enemies = fight.players.filter(v => v != address)
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
    let li = document.createElement('div')
    let input = document.createElement('input')
    input.type = 'hidden'
    input.value = index
    input.className = 'id'
    li.className = 'games__row border-style'
    const corn1 = document.createElement('div')
    const corn2 = document.createElement('div')
    const corn3 = document.createElement('div')
    const corn4 = document.createElement('div')
    corn1.className = 'corn corn1'
    corn2.className = 'corn corn2'
    corn3.className = 'corn corn3'
    corn4.className = 'corn corn4'
    li.append(corn1, corn2, corn3, corn4)
    li.appendChild(input)
    li.id = `openbattle_${index}`
    li.setAttribute('value', index)

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
                        amount: (toNano(0.05)).toString(), 
                        payload: body.toBoc().toString("base64") 
                    }
                ]
            }
            await tonConnectUI.sendTransaction(transaction)
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
                        amount: (BigInt(fight.baseAmount) + toNano(0.05)).toString(), 
                        payload: body.toBoc().toString("base64") 
                    }
                ]
            }
            await tonConnectUI.sendTransaction(transaction)
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
                        amount: toNano(0.05).toString(), 
                        payload: body.toBoc().toString("base64")
                    }
                ]
            };
            
            await tonConnectUI.sendTransaction(transaction);
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
    const headerDiv = document.createElement('div')
    headerDiv.className = `games__item`
    const pID = document.createElement('p')
    const pIDData = document.createElement('span')
    pID.textContent = 'id: '
    pIDData.textContent = `${index}`
    pID.appendChild(pIDData)
    const pCreator = document.createElement('p')
    const pCreatorData = document.createElement('a')
    pCreator.textContent = 'Creator: '
    pCreatorData.target = "_blank"
    pCreatorData.href = `#`
    pCreatorData.textContent = `${addressPlayer1}`
    pCreatorData.className = 'creator-link active'
    pCreator.appendChild(pCreatorData)
    const pMap = document.createElement('p')
    const pMapData = document.createElement('span')
    pMap.textContent = 'Map: '
    pMapData.textContent = map.name
    pMapData.className = 'active map-show'
    const mapHiddenModal = document.querySelector('#modal__map')
    pMapData.addEventListener("mouseover", (event) => {
        mapHiddenModal.src = map.image
        mapHiddenModal.classList.add('active')
    });
    pMapData.addEventListener("mouseleave", (event) => {
        mapHiddenModal.classList.remove('active')
    });
    pMap.appendChild(pMapData)
    headerDiv.appendChild(pID)
    headerDiv.appendChild(pCreator)
    headerDiv.appendChild(pMap)
    const currentBattleRoundsElem = document.createElement('p')
    const rounds = fight.rounds
    currentBattleRoundsElem.textContent = `Current round: ${0}/${rounds}`
    currentBattleRoundsElem.className = `right`
    headerDiv.appendChild(currentBattleRoundsElem)
    const middleDiv = document.createElement('div')
    const middleDivP = document.createElement('p')
    const middleDivSpan = document.createElement('span')
    middleDivP.textContent = 'Status: '
    middleDivSpan.id = `mygame_status_${index}`
    middleDivSpan.textContent = `Waiting for an opponent or timer`
    middleDivP.appendChild(middleDivSpan)
    middleDiv.appendChild(middleDivP)
    // if (fight.playersAmount > 2) {
    //     const middleDivPTimer = document.createElement('p')
    //     const middleDivSpanTimer = document.createElement('span')
    //     middleDivSpanTimer.id = `game_timer_${fight.ID.toString()}`
    //     middleDivPTimer.textContent = 'Timer: '
    //     middleDivSpanTimer.textContent = '00:00'
    //     middleDivPTimer.appendChild(middleDivSpanTimer)
    //     middleDiv.appendChild(middleDivPTimer)
    // }
    const pPlayers = document.createElement('p')
    pPlayers.textContent = `Players: ${fight.maxPlayersAmount.toString()}`
    middleDiv.appendChild(pPlayers)
    middleDiv.className = 'games__item'
    const bottomDiv = document.createElement('div')
    bottomDiv.className = 'games__item_last games__item'
    const betPerRoundP = document.createElement('p')
    betPerRoundP.textContent = 'Bet per round: '
    const betPerRound = document.createElement('span')
    // betPerRound.id = `bet_per_round`
    betPerRoundP.appendChild(betPerRound)
    const amountDepositOrClaimP = document.createElement('P')
    amountDepositOrClaimP.textContent = 'To deposit: '
    const amountDepositOrClaim = document.createElement('span')
    amountDepositOrClaimP.appendChild(amountDepositOrClaim)
    bottomDiv.appendChild(betPerRoundP)
    bottomDiv.appendChild(amountDepositOrClaimP)
    amountDepositOrClaimP.id = `amount_deposit_or_claim_p_${fight.index}`
    betPerRound.textContent = `${fight.amountPerRound / 10**9} TON`
    amountDepositOrClaim.textContent = `${fight.baseAmount / 10**9} TON`
    li.appendChild(headerDiv)
    li.appendChild(middleDiv)
    li.appendChild(bottomDiv)
    bottomDiv.appendChild(button)
    return li
}