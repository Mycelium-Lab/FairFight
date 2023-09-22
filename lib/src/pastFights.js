import { ERC20 } from "../contract.js"
import { addressMaker, compareID, getMap, timeConverter } from "./utils/utils.js"

const infoClose = document.getElementById('info-close')
    infoClose.addEventListener('click', closeInfo)

export const pastFightsFunc = async (address, contract, network, signer) => {
    let pastFights = await contract.getPlayerFullFights(address, 30).then(fights => fights).catch(err => [])
    pastFights = pastFights.filter(v => v.owner != ethers.constants.AddressZero && v.finishTime != 0)
    pastFights = [...pastFights].sort(compareID)
    let pastgames = document.getElementById("pastgames")
    let pastGamesList = document.getElementById('pastgames-list')
    let isInfoModal = document.getElementById('info_modal').style.display === 'flex'
    if(isInfoModal) {
        const fightId = localStorage.getItem('fight_id')
        const index = pastFights.findIndex(fight => fight.ID.toString() === fightId)
        await addToPastFights(pastFights[index], network, signer, address, '', isInfoModal)
    }
    else {
        for (let i = 0; i < pastFights.length; i++) {
            await addToPastFights(pastFights[i], network, signer, address, '', isInfoModal)
        }
    }
    if (pastGamesList.children.length === 1) {
      document.getElementById("pastgames_empty").style.display = ''
      pastgames.classList.add("empty")
    }
    else {
        document.getElementById("pastgames_empty").style.display = 'none'
        pastgames.classList.remove("empty")
        pastgames.appendChild(pastGamesList)
      }
}

const pastgamesBtn = document.querySelector('#pastgames-btn')
pastgamesBtn.addEventListener('click', () => {
    const pastGamesList = document.getElementById('pastgames-list')
    const pastgames = document.getElementById("pastgames")
    if (pastGamesList.children.length === 1) {
        document.getElementById("pastgames_empty").style.display = ''
        pastgames.classList.add("empty")
      }
      else {
          document.getElementById("pastgames_empty").style.display = 'none'
          pastgames.classList.remove("empty")
          pastgames.appendChild(pastGamesList)
        }
})

export const addToPastFights = async (fight, network, signer, address, from, isInfoModal) => {
    let queryGameProps = new URLSearchParams();
    queryGameProps.append("gameid", fight.ID.toString())
    queryGameProps.append("chainid", network.chainid)
    let mapID = await fetch('/getgamesprops?' + queryGameProps).then(async (res) => (await res.json()).map).catch(err => {
      console.log(err)
      return 0
    })
    const mapProperties = getMap(mapID)
    let pastGamesList = document.getElementById('pastgames-list')

    //mobile and landscape 
    let infoContentTop = document.getElementById('info-content-top')
    let infoContentBottom = document.getElementById('info-content-bottom')
    let infoContent = document.getElementById('info-content')

    let isDesktop = window.innerWidth > 1024

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

    let headerDiv
    let li
    let tableRow

    if(isDesktop) {
        li = document.createElement('div')
        li.className = 'games__row'
        li.setAttribute('value', fight.ID.toString())
        headerDiv = document.createElement('div')
        headerDiv.className = 'games__item games__item__header'
    }
    else if (!isInfoModal) {
        tableRow = document.createElement('tr')
        tableRow.classList.add('table__row')
    }

    const rounds = fight.rounds
    const pID = document.createElement('p')
    pID.classList.add('p__id')
    pID.textContent = 'Game ID'

    const pIDData = isDesktop ? document.createElement('p') : isInfoModal ? document.createElement('span') : document.createElement('td')
    pIDData.textContent = ` ${fight.ID.toString()}`

    if(isDesktop || isInfoModal) {
        pID.appendChild(pIDData)
    }
    const pStatus = document.createElement('p')
    const pStatusData = isDesktop ? document.createElement('p') : document.createElement('span') 
    pStatus.textContent = 'Status'
    pStatus.classList.add('p__status')
    pStatusData.textContent = ` Game over`
    pStatus.appendChild(pStatusData)
    let pDate
    if(isDesktop || isInfoModal) {
        pDate = document.createElement('p')
        pDate.textContent = 'Date'
        pDate.classList.add('p__date')
    }
    const pDateData = isDesktop ? document.createElement('p') : isInfoModal ? document.createElement('span') :  document.createElement('td')
    pDateData.textContent = ` ${timeConverter(finishTime)}`
    if(isDesktop || isInfoModal) {
        pDate.appendChild(pDateData)
    }
    const betPerRoundP = document.createElement('p')
    const betPerRound = isDesktop ? document.createElement('p') : document.createElement('span') 
    betPerRoundP.textContent = 'Bet per round'
    betPerRoundP.classList.add('p__betPerRound')
    betPerRound.textContent = ` ${fight.amountPerRound / 10**decimals} ${token}`
    betPerRoundP.appendChild(betPerRound)
    const roundsElemP = document.createElement('p')
    const roundsElem = isDesktop ? document.createElement('p') : document.createElement('span') 
    roundsElemP.textContent = 'Round '
    roundsElemP.classList.add('p__round')
    roundsElemP.appendChild(roundsElem)
    const mapP = document.createElement('p')
    const map = isDesktop ? document.createElement('p') : document.createElement('span') 
    mapP.textContent = 'Map '
    mapP.classList.add('p__map')
    map.textContent = mapProperties.name
    map.className = 'map-show'
    mapP.appendChild(map)

    if(isDesktop) {
        headerDiv.appendChild(pID)
        headerDiv.appendChild(pStatus)
        headerDiv.appendChild(pDate)
        headerDiv.appendChild(betPerRoundP)
        headerDiv.appendChild(roundsElemP)
        headerDiv.appendChild(mapP)
    }
    else if (!isInfoModal) {
        tableRow.appendChild(pDateData)
    }
    else {
        const leftCol = document.createElement('div')
        leftCol.classList.add('col_left')
        const rightCol = document.createElement('div')
        rightCol.classList.add('col_right')
        infoContentTop.appendChild(leftCol)
        infoContentTop.appendChild(rightCol)
        leftCol.appendChild(pID)
        leftCol.appendChild(betPerRoundP)
        leftCol.appendChild(pDate)
        rightCol.appendChild(pStatus)
        rightCol.appendChild(roundsElemP)
        rightCol.appendChild(mapP)
        
        const title = document.createElement('div')
        title.textContent = 'Players & stats'
        title.classList.add('infoContent-bottom__title')
        infoContentBottom.appendChild(title)
    }
    
    const mapHiddenModal = document.querySelector('#modal__map')
    map.addEventListener("mouseover", (event) => {
      mapHiddenModal.src = mapProperties.image
      mapHiddenModal.classList.add('pg-active')
    });
    map.addEventListener("mouseleave", (event) => {
      mapHiddenModal.classList.remove('pg-active')
    });
    const players_stats = document.createElement('div')
    players_stats.className = "games__item games__item__footer"
    //const bottomDivText = document.createElement('p')
    //bottomDivText.textContent = 'Players & stats:'
    const youStats = document.createElement('div')
    youStats.className = 'you-stats-col'
    const youStatsFirstCol = document.createElement('div')
    let youStatsHeader = document.createElement('div')
    if(isDesktop) {
        youStatsHeader.className = 'you-stats-col-header'
        youStats.appendChild(youStatsHeader)
        youStatsFirstCol.className = 'opengames__col_first opengames__col'
    }
    youStats.appendChild(youStatsFirstCol)
  
    const youStatsLastCol = document.createElement('div')
    if(isDesktop) {
        youStatsLastCol.className = 'opengames__col_last opengames__col'
    }
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
    const enemyStatsFirstCol = document.createElement('div')
    const enemyStatsHeader = document.createElement('div')
    if(isDesktop) {
        enemyStatsHeader.className = 'enemy-stats-col-header'
        enemyStats.appendChild(enemyStatsHeader)
        enemyStatsFirstCol.className = 'opengames__col_first opengames__col'
    }
    enemyStats.appendChild(enemyStatsFirstCol)
    const enemyStatsLastCol = document.createElement('div')
    if(isDesktop) {
        enemyStatsLastCol.className = 'opengames__col_last opengames__col'
    }
    enemyStats.appendChild(enemyStatsLastCol)
   
    if(isDesktop) {
        players_stats.appendChild(youStats)
        players_stats.appendChild(decorate)
        players_stats.appendChild(enemyStats)
        
    }
    let queryStatsPlayer1 = new URLSearchParams();
    queryStatsPlayer1.append("gameID", fight.ID)
    queryStatsPlayer1.append("chainid", network.chainid)
    fetch('/statistics?' + queryStatsPlayer1.toString())
        .then(async (res) => {
            const stats = await res.json()
            const player1Stats = stats.find(s => s.player.toLowerCase() == address.toLowerCase())
            const player2Stats = stats.find(s => s.player.toLowerCase() != address.toLowerCase())
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
                winLoseSpan1 = 'Win: '
                winLoseText = `0 ${token}`
                classNameWinLose = `pg-active`
            }
            let youStatsHeaderTitle = document.createElement('p')
            youStatsHeaderTitle.textContent = 'YOU'
            let addressP = document.createElement('p')
            const addressP1Link = document.createElement('a')
            addressP1Link.textContent = `${addressPlayer1}`
            addressP1Link.target = "_blank"
            addressP1Link.href = `${network.explorer}/address/${address}`

            let addressPName = document.createElement('span')
            addressPName.textContent = 'Wallet: '
            let deposit = document.createElement('p')
            deposit.textContent = `${fight.baseAmount / 10**decimals} ${token}`
            let depositName = document.createElement('span')
            depositName.textContent = 'Dep: '
            let kills = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
            let deaths = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
            let killsName = document.createElement('span')
            let deathsName = document.createElement('span')
            killsName.textContent = 'Kills: '
            kills.textContent = `${player1Stats.kills}`
            deathsName.textContent = 'Deaths: '
            deaths.textContent = `${player1Stats.deaths}`
            let winLose = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
            winLose.textContent = winLoseText
            winLose.className = classNameWinLose
            if(isDesktop) {
                youStatsHeader.appendChild(youStatsHeaderTitle)
                youStatsFirstCol.appendChild(winLose)
                youStatsFirstCol.appendChild(deposit)
                youStatsFirstCol.appendChild(addressP)
                youStatsLastCol.appendChild(kills)
                youStatsLastCol.appendChild(deaths)
                addressP.prepend(addressP1Link)
                addressP.prepend(addressPName)
                winLose.prepend(winLoseSpan1)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
            }
            else if (isInfoModal) {
                const bottomContentYou = document.createElement('div')
                const you = document.createElement('div')
                you.classList.add('infoContent-bottom__you')
                you.textContent = 'You'
                bottomContentYou.classList.add('infoContent-bottom__content-you')
                youStatsHeader.appendChild(youStatsHeaderTitle)
                youStatsFirstCol.appendChild(winLose)
                youStatsFirstCol.appendChild(deposit)
                youStatsFirstCol.appendChild(addressP)
                youStatsLastCol.appendChild(kills)
                youStatsLastCol.appendChild(deaths)
                addressP.prepend(addressP1Link)
                addressP.prepend(addressPName)
                winLose.prepend(winLoseSpan1)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
                bottomContentYou.appendChild(youStatsFirstCol)
                bottomContentYou.appendChild(youStatsLastCol)
                infoContentBottom.appendChild(you)
                infoContentBottom.appendChild(bottomContentYou)
            }
            else {
                const info = document.createElement('td')
                info.setAttribute('data-fight', fight.ID.toString())
                tableRow.appendChild(winLose)
                tableRow.appendChild(kills)
                tableRow.appendChild(deaths)
                tableRow.appendChild(deaths)
                tableRow.appendChild(info)
            }
           
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
                winLoseSpan2 = 'Win: '
                winLoseText2 = `0 ${token}`
                classNameWinLose2 = `pg-active`
            }
            const enemyStatsHeaderTitle = document.createElement('p')
            enemyStatsHeaderTitle.textContent = 'ENEMY'
            const addressP2 = document.createElement('p')
            const addressP2Link = document.createElement('a')
            addressP2Link.textContent = `${addressPlayer2}`
            addressP2Link.target = "_blank"
            addressP2Link.href = `${network.explorer}/address/${player2Stats.player}`
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
            if (isDesktop){ 
                winLose2.textContent = winLoseText2
                winLose2.className = classNameWinLose2
                enemyStatsHeader.appendChild(enemyStatsHeaderTitle)
                enemyStatsFirstCol.appendChild(kills2)
                enemyStatsFirstCol.appendChild(death2)
                enemyStatsLastCol.appendChild(winLose2)
                enemyStatsLastCol.appendChild(deposit2)
                enemyStatsLastCol.appendChild(addressP2)
                winLose2.prepend(winLoseSpan2)
                addressP2.prepend(addressP2Link)
                addressP2.prepend(addressP2Name)
                kills2.prepend(kills2Name)
                death2.prepend(death2Name)
                deposit2.prepend(deposit2Name)
            }
            else if (isInfoModal) {
                winLose2.textContent = winLoseText2
                winLose2.className = classNameWinLose2
                const bottomContentEnemy = document.createElement('div')
                const enemy = document.createElement('div')
                enemy.classList.add('infoContent-bottom__enemy')
                enemy.textContent = 'Emeny'
                bottomContentEnemy.classList.add('infoContent-bottom__content-enemy')
                enemyStatsHeader.appendChild(enemyStatsHeaderTitle)
                enemyStatsFirstCol.appendChild(kills2)
                enemyStatsFirstCol.appendChild(death2)
                enemyStatsLastCol.appendChild(winLose2)
                enemyStatsLastCol.appendChild(deposit2)
                enemyStatsLastCol.appendChild(addressP2)
                winLose2.prepend(winLoseSpan2)
                addressP2.prepend(addressP2Link)
                addressP2.prepend(addressP2Name)
                kills2.prepend(kills2Name)
                death2.prepend(death2Name)
                deposit2.prepend(deposit2Name)
                bottomContentEnemy.appendChild(enemyStatsFirstCol)
                bottomContentEnemy.appendChild(enemyStatsLastCol)
                infoContentBottom.appendChild(enemy)
                infoContentBottom.appendChild(bottomContentEnemy)
            }
        })
        .catch(err => console.error(err))
        if(isDesktop) {
            li.appendChild(headerDiv)
            li.appendChild(players_stats)
            pastGamesList.insertBefore(li, pastGamesList.firstChild)
        }
        else if(!isInfoModal){
            let pastGamesTable = document.querySelector('#pastgames-table')
            if(!pastGamesTable) {
                pastGamesTable = document.createElement('table')
                pastGamesTable.setAttribute('id', 'pastgames-table')
                pastGamesList.appendChild(pastGamesTable)
            }          
            pastGamesTable.insertBefore(tableRow, pastGamesTable.firstChild)
        }
        else {
            infoContent.appendChild(infoContentTop)
            //infoContentBottom.appendChild(players_stats_mobile)
            infoContent.appendChild(infoContentBottom)
        }
}

function closeInfo ()  {
    const infoContentTop = document.getElementById('info-content-top')
    const infoContentBottom = document.getElementById('info-content-bottom')
    const InfoContentTopChildren = Array.from(infoContentTop.children)
    const InfoContentBottomChildren = Array.from(infoContentBottom.children)
    InfoContentTopChildren.forEach(content => {
        content.remove()
    })
    InfoContentBottomChildren.forEach(content => {
        content.remove()
    })
}