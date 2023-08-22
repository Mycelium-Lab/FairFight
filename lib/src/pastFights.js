import { ERC20 } from "../contract.js"
import { addressMaker, compareID, getMap, timeConverter } from "./utils/utils.js"

export const pastFightsFunc = async (address, contract, network, signer) => {
    let pastFights = await contract.getPlayerFullFights(address, 30).then(fights => fights).catch(err => [])
    pastFights = pastFights.filter(v => v.owner != ethers.constants.AddressZero && v.finishTime != 0)
    pastFights = [...pastFights].sort(compareID)
    let pastgames = document.getElementById("pastgames")
    let pastGamesList = document.getElementById('pastgames-list')
    for (let i = 0; i < pastFights.length; i++) {
        await addToPastFights(pastFights[i], network, signer, address, '')
    }
    if (pastGamesList.children.length == 1) {
      document.getElementById("pastgames_empty").style.display = ''
      pastgames.classList.add("empty")

    } else {
      document.getElementById("pastgames_empty").style.display = 'none'
      pastgames.classList.remove("empty")
      pastgames.appendChild(pastGamesList)
    }
}

export const addToPastFights = async (fight, network, signer, address, from) => {
    let queryGameProps = new URLSearchParams();
    queryGameProps.append("gameid", fight.ID.toString())
    queryGameProps.append("chainid", network.chainid)
    let mapID = await fetch('/getgamesprops?' + queryGameProps).then(async (res) => (await res.json()).map).catch(err => {
      console.log(err)
      return 0
    })
    const mapProperties = getMap(mapID)
    let pastGamesList = document.getElementById('pastgames-list')
    let finishTime = fight.finishTime
    if (from === 'fromOpenFights') {
        finishTime = Math.floor((new Date()).getTime() / 1000)
        const lastAddedID = pastGamesList.children.item(0).getAttribute('value')
        if (lastAddedID === fight.ID.toString()) {
            return
        }
    }
    let token = network.currency
    let decimals = 18
    if (fight.token != ethers.constants.AddressZero) {
        const currentTokenContract = new ethers.Contract(fight.token, ERC20, signer)
        token = await currentTokenContract.symbol()
        decimals = await currentTokenContract.decimals()
    }
    let li = document.createElement('div')
    li.className = 'games__row'
    li.setAttribute('value', fight.ID.toString())
    const headerDiv = document.createElement('div')
    const rounds = fight.rounds
    headerDiv.className = 'games__item games__item__header'
    const pID = document.createElement('p')
    const pIDData = document.createElement('p')
    pID.textContent = 'Game ID'
    pIDData.textContent = `${fight.ID.toString()}`
    pID.appendChild(pIDData)
    const pStatus = document.createElement('p')
    const pStatusData = document.createElement('p')
    pStatus.textContent = 'Status'
    pStatusData.textContent = `Game over`
    pStatus.appendChild(pStatusData)
    const pDate = document.createElement('p')
    const pDateData = document.createElement('p')
    pDate.textContent = 'Date'
    pDateData.textContent = `${timeConverter(finishTime)}`
    pDate.appendChild(pDateData)
    const betPerRoundP = document.createElement('p')
    const betPerRound = document.createElement('p')
    betPerRoundP.textContent = 'Bet per round'
    betPerRound.textContent = `${fight.amountPerRound / 10**decimals} ${token}`
    betPerRoundP.appendChild(betPerRound)
    const roundsElemP = document.createElement('p')
    const roundsElem = document.createElement('p')
    roundsElemP.textContent = 'Round'
    roundsElemP.appendChild(roundsElem)
    const mapP = document.createElement('p')
    const map = document.createElement('p')
    mapP.textContent = 'Map'
    map.textContent = mapProperties.name
    map.className = 'map-show'
    mapP.appendChild(map)
    headerDiv.appendChild(pID)
    headerDiv.appendChild(pStatus)
    headerDiv.appendChild(pDate)
    headerDiv.appendChild(betPerRoundP)
    headerDiv.appendChild(roundsElemP)
    headerDiv.appendChild(mapP)

    /*const yourdepositP = document.createElement('p')
    const yourdeposit = document.createElement('p')
    yourdepositP.textContent = 'Your deposit: '
    yourdeposit.textContent = `${fight.baseAmount / 10**decimals} ${token}`
    yourdepositP.appendChild(yourdeposit)*/
    
    const mapHiddenModal = document.querySelector('#modal__map')
    map.addEventListener("mouseover", (event) => {
      mapHiddenModal.src = mapProperties.image
      mapHiddenModal.classList.add('active')
    });
    map.addEventListener("mouseleave", (event) => {
      mapHiddenModal.classList.remove('active')
    });
    const players_stats = document.createElement('div')
    players_stats.className = "games__item games__item__footer"
    //const bottomDivText = document.createElement('p')
    //bottomDivText.textContent = 'Players & stats:'
    const youStats = document.createElement('div')
    youStats.className = 'you-stats-col'
    const youStatsHeader = document.createElement('div')
    youStatsHeader.className = 'you-stats-col-header'
    youStats.appendChild(youStatsHeader)
    const youStatsFirstCol = document.createElement('div')
    youStatsFirstCol.className = 'opengames__col_first opengames__col'
    youStats.appendChild(youStatsFirstCol)
    const youStatsLastCol = document.createElement('div')
    youStatsLastCol.className = 'opengames__col_last opengames__col'
    youStats.appendChild(youStatsLastCol)
    const decorate = document.createElement('div')
    decorate.className = 'decorate-stats-col'
    const title = document.createElement('img')
    title.src = '../media/svg/players_and_stats.svg'
    title.className = 'stats-col-title'
    decorate.appendChild(title)
    const vs = document.createElement('img')
    vs.src = '../media/svg/vs.svg'
    vs.className = 'stats-col-title-vs'
    decorate.appendChild(vs)
    const enemyStats = document.createElement('div')
    enemyStats.className = 'enemy-stats-col'
    const enemyStatsHeader = document.createElement('div')
    enemyStatsHeader.className = 'enemy-stats-col-header'
    enemyStats.appendChild(enemyStatsHeader)
    const enemyStatsFirstCol = document.createElement('div')
    enemyStatsFirstCol.className = 'opengames__col_first opengames__col'
    enemyStats.appendChild(enemyStatsFirstCol)
    const enemyStatsLastCol = document.createElement('div')
    enemyStatsLastCol.className = 'opengames__col_last opengames__col'
    enemyStats.appendChild(enemyStatsLastCol)
    players_stats.appendChild(youStats)
    players_stats.appendChild(decorate)
    players_stats.appendChild(enemyStats)
    let queryStatsPlayer1 = new URLSearchParams();
    queryStatsPlayer1.append("gameID", fight.ID)
    queryStatsPlayer1.append("chainid", network.chainid)
    fetch('/statistics?' + queryStatsPlayer1.toString())
        .then(async (res) => {
            const stats = await res.json()
            const player1Stats = stats.find(s => s.player == address)
            const player2Stats = stats.find(s => s.player != address)
            const addressPlayer1 = addressMaker(address)
            const addressPlayer2 = addressMaker(player2Stats.player)  
            roundsElem.textContent = `${parseInt(rounds) - parseInt(player1Stats.remainingrounds)}/${parseInt(rounds)}`
            //PLAYER 1 (YOU)
            const amount1 = BigInt(player1Stats.amount.toString())
            const amount2 = BigInt(player2Stats.amount.toString())
            const amountLose1 = BigInt(fight.baseAmount.toString()) - amount1
            const amountLose2 = BigInt(fight.baseAmount.toString()) - amount2
            let winLoseSpan1 = document.createElement('span')
            let winLoseText = '';
            let classNameWinLose = 'green'
            if (amount1 < amount2) {
                winLoseSpan1.textContent = 'Lose: '
                winLoseText = `${(amountLose1).toString() / (10**decimals).toString()} ${token}`
                classNameWinLose = "red"
            } else if (amount1 > amount2) {
                winLoseSpan1.textContent = 'Win: '
                winLoseText = `${(amountLose1 * BigInt(-1)).toString() / (10**decimals).toString()} ${token}`
            } else {
                winLoseText = `Win: 0 ${token}`
                classNameWinLose = `active`
            }
            const youStatsHeaderTitle = document.createElement('p')
            youStatsHeaderTitle.textContent = 'YOU'
            const addressP = document.createElement('p')
            addressP.textContent = `${addressPlayer1}`
            const addressPName = document.createElement('span')
            addressPName.textContent = 'Wallet: '
            const deposit = document.createElement('p')
            deposit.textContent = `${fight.baseAmount / 10**decimals} ${token}`
            const depositName = document.createElement('span')
            depositName.textContent = 'Dep: '
            const kills = document.createElement('p')
            const deaths = document.createElement('p')
            const killsName = document.createElement('span')
            const deathsName = document.createElement('span')
            killsName.textContent = 'Kills: '
            kills.textContent = `${player1Stats.kills}`
            deathsName.textContent = 'Deaths: '
            deaths.textContent = `${player1Stats.deaths}`
            const winLose = document.createElement('p')
            winLose.textContent = winLoseText
            winLose.className = classNameWinLose
            youStatsHeader.appendChild(youStatsHeaderTitle)
            youStatsFirstCol.appendChild(winLose)
            youStatsFirstCol.appendChild(deposit)
            youStatsFirstCol.appendChild(addressP)
            youStatsLastCol.appendChild(kills)
            youStatsLastCol.appendChild(deaths)
            addressP.prepend(addressPName)
            winLose.prepend(winLoseSpan1)
            kills.prepend(killsName)
            deaths.prepend(deathsName)
            deposit.prepend(depositName)
            //PLAYER 2 (ENEMY)
            let classNameWinLose2 = 'green'
            let winLoseText2;
            let winLoseSpan2 = document.createElement('span')
            if (amount2 < amount1) {
                winLoseSpan2.textContent = 'Lose: '
                winLoseText2 = `${(amountLose2).toString() / (10**decimals).toString()} ${token}`
                classNameWinLose2 = "red"
            } else if (amount2 > amount1) {
                winLoseSpan2.textContent = 'Win: '
                winLoseText2 = `${(amountLose2 * BigInt(-1)).toString() / (10**decimals).toString()} ${token}`
            } else {
                winLoseText2 = `Win: 0 ${token}`
                classNameWinLose2 = `active`
            }
            const enemyStatsHeaderTitle = document.createElement('p')
            enemyStatsHeaderTitle.textContent = 'ENEMY'
            const addressP2 = document.createElement('p')
            addressP2.textContent = `${addressPlayer2}`
            const addressP2Name =  document.createElement('span')
            addressP2Name.textContent = 'Wallet: '
            const deposit2 = document.createElement('p')
            deposit2.textContent = `${fight.baseAmount / 10**decimals} ${token}`
            const deposit2Name =  document.createElement('span')
            deposit2Name.textContent = 'Dep: '
            const kills2 = document.createElement('p')
            kills2.textContent = `${player2Stats.kills}`
            const kills2Name = document.createElement('span')
            kills2Name.textContent = 'Kills: '
            const death2 = document.createElement('p')
            death2.textContent = `${player2Stats.deaths}`
            const death2Name = document.createElement('span')
            death2Name.textContent = 'Deaths: '
            const winLose2 = document.createElement('p')
            winLose2.textContent = winLoseText2
            winLose2.className = classNameWinLose2
            enemyStatsHeader.appendChild(enemyStatsHeaderTitle)
            enemyStatsFirstCol.appendChild(kills2)
            enemyStatsFirstCol.appendChild(death2)
            enemyStatsLastCol.appendChild(winLose2)
            enemyStatsLastCol.appendChild(deposit2)
            enemyStatsLastCol.appendChild(addressP2)
            winLose2.prepend(winLoseSpan2)
            addressP2.prepend(addressP2Name)
            winLose2.prepend(winLoseSpan2)
            kills2.prepend(kills2Name)
            death2.prepend(death2Name)
            deposit2.prepend(deposit2Name)
        })
        .catch(err => console.error(err))
    li.appendChild(headerDiv)
    li.appendChild(players_stats)
    pastGamesList.insertBefore(li, pastGamesList.firstChild)
}