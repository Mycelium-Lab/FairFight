import { getMap } from "../utils/utils";

const tonChainId = 999999

export const openFightsTon = async (fights) => {
    let opengames = document.getElementById("opengames")
    let openGamesList = document.getElementById("opengames-list")
    if (fights.length === 0) {
      document.getElementById("opengames_empty").style.display = '';
      opengames.classList.add('empty')
    } else {
      document.getElementById("opengames_empty").style.display = 'none';
      opengames.classList.remove('empty')
      fights.forEach(async (fight, index) => {
        const child = await appendOpenFight(fight, index, tonChainId)
        openGamesList.appendChild(child)
      })
    }
    
}

const appendOpenFight = async (fight, index, chainid = tonChainId) => {
    index = index.toString()
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
    let buttonText = 'Join'
    button.textContent = "Join"
    let decimals = 9
    button.textContent = buttonText
    button.className = 'close-button join-button opengames__btn'
    button.addEventListener('click', async (event) => {
        window.addEventListener("popstate", () => {});
        const amountToPlay = fight.baseAmount
        //join
        // const body = beginCell()
        //     .storeUint(0x45E011DD, 32)
        //     .storeInt(0, 257)
        //     .endCell();
        // const transaction = {
        //     validUntil: Math.floor(Date.now() / 1000) + 360,
        //     messages: [
        //         {
        //             address: Address.parse('EQA2Amn-QDbPaxqY4DIerGDiGdTLwOmWTXMqLgaajAHvet9v').toString(),
        //             amount: (amountToPlay + toNano(0.05)).toString(), 
        //             payload: body.toBoc().toString("base64") 
        //         }
        //     ]
        // }
        // const result = await tonConnectUI.sendTransaction(transaction)
    })
    let queryGameProps = new URLSearchParams();
    queryGameProps.append("gameid", index)
    queryGameProps.append("chainid", chainid)
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