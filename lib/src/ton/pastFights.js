import { addressMaker, compareID, getMap, timeConverter, shortDisplayValue } from "../utils/utils.js"

const infoClose = document.getElementById('info-close')
    infoClose.addEventListener('click', closeInfo)

export const pastFightsTon = async (pastFights, address) => {    
    pastFights = pastFights.reduce((acc, game) => {
        // Проверяем, есть ли уже запись для текущего gameid
        let existingGame = acc.find(g => g.gameid === game.gameid);
        
        if (existingGame) {
            // Если запись есть, добавляем текущего игрока в stats
            existingGame.stats.push({
                player: game.player,
                token: game.token,
                amount: game.amount,
                kills: game.kills,
                deaths: game.deaths,
                remainingrounds: game.remainingrounds,
                finishtime: game.finishtime
            });
        } else {
            // Если записи нет, создаем новую и добавляем stats
            acc.push({
                ...game,
                stats: [{
                    player: game.player,
                    token: game.token,
                    amount: game.amount,
                    kills: game.kills,
                    deaths: game.deaths,
                    remainingrounds: game.remainingrounds,
                    finishtime: game.finishtime
                }]
            });
        }
        
        return acc;
    }, []);
    let isInfoModal = document.getElementById('info_modal').style.display === 'flex'
    if(isInfoModal) {
        const fightId = localStorage.getItem('fight_id')
        const index = pastFights.findIndex(fight => fight.gameid.toString() === fightId)
        await addToPastFights(pastFights[index], address, isInfoModal, '')
    }
    else {
        for (let i = 0; i < pastFights.length; i++) {
            await addToPastFights(pastFights[i], address, isInfoModal, '')
        }
    }
    let pastgames = document.getElementById("pastgames")
    let pastGamesSimpleBar = document.getElementById('pastgames-list')
    const pastGamesSimpleBarContent = pastGamesSimpleBar.querySelector('.simplebar-content');
    const pastGamesList = Array.from(pastGamesSimpleBarContent.children);
    
    if (pastGamesList.length === 1) {
      document.getElementById("pastgames_empty").style.display = ''
      pastgames.classList.add("empty")
    }
    else {
        document.getElementById("pastgames_empty").style.display = 'none'
        pastgames.classList.remove("empty")
        // pastgames.appendChild(pastGamesList)
      }
}

const pastgamesBtn = document.querySelector('#pastgames-btn')
pastgamesBtn.addEventListener('click', () => {
    const pastGamesList = document.getElementById('pastgames-list')
    const pastgames = document.getElementById("pastgames")
    const opengames = document.getElementById("opengames")
    pastgames.style.display = ''
    opengames.style.display = 'none'
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

export const addToPastFights = async (fight, address, isInfoModal, from) => {
    let mapID = 0
    const mapProperties = getMap(mapID)
    let pastGamesList = document.getElementById('pastgames-list')

    //mobile and landscape 
    let infoContentTop = document.getElementById('info-content-top')
    let infoContentBottom = document.getElementById('info-content-bottom')
    let infoContent = document.getElementById('info-content')

    let isDesktop = window.innerWidth > 1024

    let finishTime = fight.finishtime
    if (from === 'fromOpenFights') {
        finishTime = Math.floor((new Date()).getTime())
        const lastAddedID = pastGamesList.children.item(0).getAttribute('value')
        if (lastAddedID === fight.gameid.toString()) {
            return
        }
    }
    let token = 'TON'
    let decimals = 9
    let headerDiv
    let li
    let tableRow
    if(isDesktop) {
        li = document.createElement('div')
        li.className = 'games__row border-style'
        li.setAttribute('value', fight.gameid.toString())
        const corn1 = document.createElement('div')
        const corn2 = document.createElement('div')
        const corn3 = document.createElement('div')
        const corn4 = document.createElement('div')
        corn1.className = 'corn corn1'
        corn2.className = 'corn corn2'
        corn3.className = 'corn corn3'
        corn4.className = 'corn corn4'
        li.append(corn1, corn2, corn3, corn4)
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
    pIDData.textContent = ` ${fight.gameid.toString()}`

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
    pDateData.textContent = ` ${timeConverter(Math.floor(finishTime / 1000))}`
    if(isDesktop || isInfoModal) {
        pDate.appendChild(pDateData)
    }
    const betPerRoundP = document.createElement('p')
    const betPerRound = isDesktop ? document.createElement('p') : document.createElement('span') 
    betPerRoundP.textContent = 'Bet per round'
    betPerRoundP.classList.add('p__betPerRound')
    betPerRound.textContent = ` ${(BigInt(fight.amountperround) / BigInt(10**decimals)).toString()} ${token}`
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
    let playerStatsArray = []
    const stats = fight.stats
    //set ourself to arr[0]
    stats.sort((a, b) => {
        if (a.player.toLowerCase() === address.toLowerCase()) return -1;
        if (b.player.toLowerCase() === address.toLowerCase()) return 1;
        return 0;
    });
    roundsElem.textContent = `${parseInt(rounds) - parseInt(stats[0].remainingrounds)}/${parseInt(rounds)}`
    const fightBaseAmount = BigInt(fight.baseamount.toString())
    for (let i = 0; i < stats.length; i+=2) {
        let players_stats = document.createElement('div')
        players_stats.className = "games__item games__item__footer"
        playerStatsArray.push(players_stats)
    }
    let oneTimeElemForMobile = false
    stats.forEach((v, i) => {
        const addressPlayer = addressMaker(v.player)
        const amount = BigInt(v.amount.toString())
        const amountLose = fightBaseAmount - amount
        let winLoseSpan = document.createElement('span')
        let winLoseText = '';
        let classNameWinLose = 'green'
        if (amount < fightBaseAmount) {
            winLoseSpan.textContent = 'Lose: '
            const value = shortDisplayValue((amountLose).toString() / (10**decimals).toString())
            winLoseText = `${value} ${token}`
            classNameWinLose = "red"
        } else if (amount > fightBaseAmount) {
            const value = shortDisplayValue((amountLose * BigInt(-1)).toString() / (10**decimals).toString())
            winLoseSpan.textContent = 'Win: '
            winLoseText = `${value} ${token}`
        } else {
            winLoseSpan = 'Win: '
            winLoseText = `0 ${token}`
            classNameWinLose = `pg-active`
        }
        let statsHeaderTitle = document.createElement('p')
        statsHeaderTitle.textContent = i == 0 ? 'YOU' : `ENEMY #${i}`
        let addressP = document.createElement('p')
        const addressPLink = document.createElement('a')
        addressPLink.textContent = `${addressPlayer}`
        addressPLink.target = "_blank"
        addressPLink.href = `https://tonscan.org/address/${v.player}`

        let addressPName = document.createElement('span')
        addressPName.textContent = 'Wallet: '
        let deposit = document.createElement('p')
        deposit.textContent = `${fight.baseamount / 10**decimals} ${token}`
        let depositName = document.createElement('span')
        depositName.textContent = 'Dep: '
        let kills = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        let deaths = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        let killsName = document.createElement('span')
        let deathsName = document.createElement('span')
        killsName.textContent = 'Kills: '
        kills.textContent = `${v.kills}`
        deathsName.textContent = 'Deaths: '
        deaths.textContent = `${v.deaths}`
        let winLose = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        winLose.textContent = winLoseText
        winLose.className = classNameWinLose
        if (i % 2 == 0) {
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
            if (i != stats.length - 1) {
                const vs = document.createElement('img')
                vs.src = '../media/svg/vs.svg'
                vs.className = 'stats-col-title-vs'
                decorate.appendChild(vs)
            }
            if(isDesktop) {
                youStatsHeader.appendChild(statsHeaderTitle)
                youStatsFirstCol.appendChild(winLose)
                youStatsFirstCol.appendChild(deposit)
                youStatsFirstCol.appendChild(addressP)
                youStatsLastCol.appendChild(kills)
                youStatsLastCol.appendChild(deaths)
                addressP.prepend(addressPLink)
                addressP.prepend(addressPName)
                winLose.prepend(winLoseSpan)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
            } else if (isInfoModal) {
                const bottomContentYou = document.createElement('div')
                const you = document.createElement('div')
                you.classList.add('infoContent-bottom__you')
                you.textContent = 'You'
                bottomContentYou.classList.add('infoContent-bottom__content-you')
                youStatsHeader.appendChild(statsHeaderTitle)
                youStatsFirstCol.appendChild(winLose)
                youStatsFirstCol.appendChild(deposit)
                youStatsFirstCol.appendChild(addressP)
                youStatsLastCol.appendChild(kills)
                youStatsLastCol.appendChild(deaths)
                addressP.prepend(addressPLink)
                addressP.prepend(addressPName)
                winLose.prepend(winLoseSpan)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
                bottomContentYou.appendChild(youStatsFirstCol)
                bottomContentYou.appendChild(youStatsLastCol)
                infoContentBottom.appendChild(you)
                infoContentBottom.appendChild(bottomContentYou)
            } else {
                if (!oneTimeElemForMobile) {
                    const info = document.createElement('td')
                    info.setAttribute('data-fight', fight.gameid.toString())
                    tableRow.appendChild(winLose)
                    tableRow.appendChild(kills)
                    tableRow.appendChild(deaths)
                    tableRow.appendChild(deaths)
                    tableRow.appendChild(info)
                    oneTimeElemForMobile = true
                }
            }
            /*
                Math.floor(i % 2 == 0 ? Math.abs(i + 0.1) / 2 : i / 2)
                means what level of players stats to use, because on one level only 2 players 
            */
            playerStatsArray[Math.floor(i % 2 == 0 ? Math.abs(i + 0.1) / 2 : i / 2)].appendChild(youStats)
            playerStatsArray[Math.floor(i % 2 == 0 ? Math.abs(i + 0.1) / 2 : i / 2)].appendChild(decorate)
        } else {
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
            if (isDesktop){ 
                winLose.textContent = winLoseText
                winLose.className = classNameWinLose
                enemyStatsHeader.appendChild(statsHeaderTitle)
                enemyStatsFirstCol.appendChild(kills)
                enemyStatsFirstCol.appendChild(deaths)
                enemyStatsLastCol.appendChild(winLose)
                enemyStatsLastCol.appendChild(deposit)
                enemyStatsLastCol.appendChild(addressP)
                winLose.prepend(winLoseSpan)
                addressP.prepend(addressPLink)
                addressP.prepend(addressPName)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
            }
            else if (isInfoModal) {
                winLose.textContent = winLoseText
                winLose.className = classNameWinLose
                const bottomContentEnemy = document.createElement('div')
                const enemy = document.createElement('div')
                enemy.classList.add('infoContent-bottom__enemy')
                enemy.textContent = `Enemy #${i}`
                bottomContentEnemy.classList.add('infoContent-bottom__content-enemy')
                enemyStatsHeader.appendChild(statsHeaderTitle)
                enemyStatsFirstCol.appendChild(kills)
                enemyStatsFirstCol.appendChild(deaths)
                enemyStatsLastCol.appendChild(winLose)
                enemyStatsLastCol.appendChild(deposit)
                enemyStatsLastCol.appendChild(addressP)
                winLose.prepend(winLoseSpan)
                addressP.prepend(addressPLink)
                addressP.prepend(addressPName)
                kills.prepend(killsName)
                deaths.prepend(deathsName)
                deposit.prepend(depositName)
                bottomContentEnemy.appendChild(enemyStatsFirstCol)
                bottomContentEnemy.appendChild(enemyStatsLastCol)
                infoContentBottom.appendChild(enemy)
                infoContentBottom.appendChild(bottomContentEnemy)
            }
            playerStatsArray[Math.floor(i % 2 == 0 ? Math.abs(i + 0.1) / 2 : i / 2)].appendChild(enemyStats)
        }
    })
    if(isDesktop) {
        li.appendChild(headerDiv)
        playerStatsArray.forEach(v => li.appendChild(v))
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

    if (!SimpleBar.instances.get(pastGamesList)) {
        new SimpleBar(pastGamesList, { });        
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
    document.getElementById('info_modal').style.display = 'none'
}