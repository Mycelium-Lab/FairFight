import { isDesktop } from "../../index";
import { addressMaker, getMap } from "../utils/utils";

const BUTTON_TEXT = {
    FINISH: 'finish',
    JOIN: 'join',
    WITHDRAW: 'withdraw'
}

export const openFightsF2PEvm = async (fights, username, network, sign) => {
    const openGamesBtn = document.querySelector('#opengames-f2p-btn-desktop')
    openGamesBtn.addEventListener('click', () => {
        const opengames = document.getElementById("opengames-f2p-evm-desktop")
        const openGamesList = document.getElementById('opengames-list-f2p-evm-desktop')
        const pastgames = document.getElementById("pastgames-f2p-evm-desktop") 
        opengames.classList.add('active')
        opengames.style.display = ''
        pastgames.style.display = 'none'
        pastgames.classList.remove('active')
        const children = Array.from(openGamesList.children);
        
        if (children.length === 1) {
            document.getElementById("opengames_empty-f2p-evm-desktop").style.display = ''
            opengames.classList.add("empty")
        }
        else {
            document.getElementById("opengames_empty-f2p-evm-desktop").style.display = 'none'
            opengames.classList.remove("empty")
            // pastgames.appendChild(pastGamesList)
        }
        document.querySelector('#opengames-f2p-btn-desktop').classList.add('active')
        document.querySelector('#pastgames-f2p-btn-desktop').classList.remove('active')
    })
    let opengames = isDesktop ? document.getElementById("opengames-f2p-evm-desktop") : document.getElementById("opengames-f2p-evm")
    let openGamesSimpleBar = document.getElementById("opengames-list-f2p-evm")
    if (!SimpleBar.instances.get(openGamesSimpleBar)) {
        new SimpleBar(openGamesSimpleBar, { });
    }
    let openGamesList = isDesktop ? document.querySelector('#opengames-list-f2p-evm-desktop') :  openGamesSimpleBar.querySelector('.simplebar-content')
    
    let counter = 0
    fights.forEach(async (fight) => {
        const child = await appendOpenFight(fight, username, network, sign)
        if (child) {
            openGamesList.appendChild(child)
        }
    })
    openGamesList.childNodes.forEach(v => {
      if (v.id && v.id.includes('openbattle_')) {
          let index = v.id.split('openbattle_')[1]
          let fightExist = fights.find(v => v.gameid == index)
          if (!fightExist) {
              openGamesList.removeChild(v)
          } else {
              counter += 1
          }
      }
    })
    if (counter == 0) {
        isDesktop ? document.getElementById("opengames_empty-f2p-evm-desktop").style.display = '' : document.getElementById("opengames_empty-f2p-evm").style.display = '';
        opengames.classList.remove('empty')
    } else {
        isDesktop ? document.getElementById("opengames_empty-f2p-evm-desktop").style.display = 'none' : document.getElementById("opengames_empty-f2p-evm").style.display = 'none';
        opengames.classList.remove('empty')
    }
}

const appendOpenFight = async (fight, username, network, sign) => {
    let index = fight.gameid
    let buttonText = BUTTON_TEXT.JOIN
    let signature, amount
    if (username == fight.owner) {
        buttonText = BUTTON_TEXT.WITHDRAW
    }
    if (fight.players_list.length >= 2 && fight.players_list.includes(username)) {
        let enemies = fight.players_list.filter(v => v != username)
        localStorage.setItem('underlying_network_id', network.chainid)
        localStorage.setItem('tonwallet', username)
        localStorage.setItem('ton_enemies', enemies)
        localStorage.setItem('realBalance', fight.baseamount)
        localStorage.setItem('amountPerRound', fight.amountperround)
        localStorage.setItem(`deposit_${999998}_${index}`, fight.baseamount)
        localStorage.setItem('rounds', fight.rounds)
        window.location.href = `/ton_game/?ID=${index}&network=${999998}&token=${'FAIR'}&decimals=${9}`
    }
    let fightExits = document.querySelector(`#openbattle_${index}`)
    if (fightExits) {
        return
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
    if (buttonText === BUTTON_TEXT.WITHDRAW)
        button.innerHTML = `<span style="font-size: 7px">${buttonText}</span>`;

    button.className = 'close-button join-button opengames__btn'
    button.addEventListener('click', async (event) => {
        window.addEventListener("popstate", () => {});
        const amountToPlay = fight.baseamount
        if (buttonText === BUTTON_TEXT.WITHDRAW) {
            const res = await fetch('/f2p/withdraw', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameid: index,
                    sign_evm: sign
                })
            })
            const responseStatus = res.status
            if (responseStatus == 200) {
                let fights = (await (await fetch('/f2p')).json()).fights
                await openFightsF2PEvm(fights, username)
            }
            console.log(responseStatus)
        }
        if (buttonText === BUTTON_TEXT.JOIN) {
            const res = await fetch('/f2p/join', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameid: index,
                    player: username,
                    sign_evm: sign
                })
            })
            const responseStatus = res.status
            if (responseStatus == 200) {
                let enemies = fight.players_list.filter(v => v != username)
                localStorage.setItem('underlying_network_id', network.chainid)
                localStorage.setItem('tonwallet', username)
                localStorage.setItem('ton_enemies', enemies)
                localStorage.setItem('realBalance', fight.baseamount)
                localStorage.setItem('amountPerRound', fight.amountperround)
                localStorage.setItem(`deposit_${999998}_${index}`, fight.baseamount)
                localStorage.setItem('rounds', fight.rounds)
                window.location.href = `/ton_game/?ID=${index}&network=${999998}&token=${'FAIR'}&decimals=${9}`
            }
            console.log(responseStatus)
        }
        if (buttonText === BUTTON_TEXT.FINISH) {
        }
    })
    const map = getMap(fight.map)
    const addressPlayer1 = addressMaker(fight.owner);
    const headerDiv = document.createElement('div')
    headerDiv.className = `games__item`
    const pID = document.createElement('p')
    const pIDData = document.createElement('span')
    pID.textContent = 'id: '
    pIDData.textContent = `${index}`
    pID.appendChild(pIDData)
    pIDData.className = 'game_wallet_id'
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
    middleDivSpan.textContent = `${buttonText == BUTTON_TEXT.WITHDRAW ? 'Your game. ' : ''}Waiting for an opponent or timer`
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
    pPlayers.textContent = `Players: ${fight.players.toString()}`
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
    amountDepositOrClaimP.id = `amount_deposit_or_claim_p_${index}`
    betPerRound.textContent = `${fight.amountperround / 10**9} FAIR`
    amountDepositOrClaim.textContent = `${fight.baseamount / 10**9} FAIR`
    li.appendChild(headerDiv)
    li.appendChild(middleDiv)
    li.appendChild(bottomDiv)
    bottomDiv.appendChild(button)
    return li
}