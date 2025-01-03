import { ERC20 } from "../contract.js"
import { addressMaker, compareID, getMap, timeConverter, shortDisplayValue } from "./utils/utils.js"

const infoClose = document.getElementById('info-close')
    infoClose.addEventListener('click', closeInfo)

export const pastFightsFunc = async (address, contract, network, signer, isDesktop) => {
    let pastFights = await contract.getPlayerFullFights(address, 30).then(fights => fights).catch(err => [])
    pastFights = pastFights.filter(v => v.owner != ethers.constants.AddressZero && v.finishTime != 0)
    pastFights = [...pastFights].sort(compareID)
    // let pastFights = [
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 1,
    //       rounds: 1,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     },
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 2,
    //       rounds: 2,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     },    
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 3,
    //       rounds: 3,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     }, 
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 3,
    //       rounds: 3,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     },   
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 3,
    //       rounds: 3,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     },    
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 3,
    //       rounds: 3,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     },   
    //     {
    //       ID: 1,
    //       amountPerRound: 1e18, // в зависимости от значения
    //       baseAmount: 1e18,      // аналогично
    //       createTime: 1730000009,               // примерное значение
    //       finishTime: 1730000009,
    //       playersAmount: 3,
    //       rounds: 3,
    //       owner: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    //       token: "0x0000000000000000000000000000000000000000"
    //     }    
    // ]
    let pastgames = document.getElementById("pastgames")
    let pastGamesListBar = document.getElementById('pastgames-list')
    let pastGamesListBarDesktop = document.getElementById('pastgames-list-desktop')
    let isInfoModal = document.getElementById('info_modal').style.display === 'flex'
    if (!SimpleBar.instances.get(pastGamesListBar)) {
        new SimpleBar(pastGamesListBar, { });        
    }
    if (!SimpleBar.instances.get(pastGamesListBarDesktop)) {
        new SimpleBar(pastGamesListBarDesktop, { });        
    }
    let pastGamesListDesktop = pastGamesListBarDesktop.querySelector('.simplebar-content')
    let pastGamesList = pastGamesListBar.querySelector('.simplebar-content')
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
    const children = Array.from(pastGamesList.children);
    if (children.length === 0) {
      document.getElementById("pastgames_empty").style.display = ''
      pastgames.classList.add("empty")
    } else {
        document.getElementById("pastgames_empty").style.display = 'none'
        pastgames.classList.remove("empty")
        // pastgames.appendChild(pastGamesList)
    }
}

const pastgamesBtn = isDesktop ? document.querySelector('#pastgames-btn-desktop') : document.querySelector('#pastgames-btn')
pastgamesBtn.addEventListener('click', () => {
    const opengames = isDesktop ? document.getElementById("opengames-desktop") : document.getElementById("opengames")
    const pastGamesList = isDesktop ? document.getElementById('pastgames-list-desktop').querySelector('.simplebar-content') : document.getElementById('pastgames-list').querySelector('.simplebar-content')
    const pastgames = isDesktop ? document.getElementById("pastgames-desktop") : document.getElementById("pastgames")
    pastgames.classList.add('active')
    pastgames.style.display = ''
    opengames.style.display = 'none'
    opengames.classList.remove('active')
    const children = Array.from(pastGamesList.children);
    
    if (children.length === 0) {
        isDesktop ? document.getElementById("pastgames_empty-desktop").style.display = '' : document.getElementById("pastgames_empty").style.display = '';
        document.querySelector('#pastgames_empty-title-desktop').textContent = 'Empty:('
        document.querySelector('#pastgames_empty-desc-desktop').textContent = "That's where your game history will be listed."
        pastgames.classList.add("empty")
    }
    else {
        isDesktop ? document.getElementById("pastgames_empty-desktop").style.display = 'none' : document.getElementById("pastgames_empty").style.display = 'none'
        pastgames.classList.remove("empty")
        // pastgames.appendChild(pastGamesList)
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
    let pastGamesList = isDesktop ? document.getElementById('pastgames-list-desktop').querySelector('.simplebar-content') : document.getElementById('pastgames-list').querySelector('.simplebar-content')

    //mobile and landscape 
    let infoContentTop = document.getElementById('info-content-top')
    let infoContentBottom = document.getElementById('info-content-bottom')
    let infoContent = document.getElementById('info-content')

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
        li.className = 'games__row border-style desktop'
        li.setAttribute('value', fight.ID.toString())
        const dote1 = document.createElement('div')
        const dote2 = document.createElement('div')
        const dote3 = document.createElement('div')
        const dote4 = document.createElement('div')
        const border1 = document.createElement('div')
        const border2 = document.createElement('div')
        const border3 = document.createElement('div')
        const border4 = document.createElement('div')
        const border5 = document.createElement('div')
        const border6 = document.createElement('div')
        const border7 = document.createElement('div')
        const border8 = document.createElement('div')
        dote1.className = 'dote dote1'
        dote2.className = 'dote dote2'
        dote3.className = 'dote dote3'
        dote4.className = 'dote dote4'
        border1.className = 'c-border border1'
        border2.className = 'c-border border2'
        border3.className = 'c-border border3'
        border4.className = 'c-border border4'
        border5.className = 'c-border border5'
        border6.className = 'c-border border6'
        border7.className = 'c-border border7'
        border8.className = 'c-border border8'
        li.append(dote1, dote2, dote3, dote4, border1, border2, border3, border4, border5, border6, border7, border8)
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
    let playerStatsArray = []
    let gameStats = new URLSearchParams();
    gameStats.append("gameID", fight.ID)
    gameStats.append("chainid", network.chainid)
    fetch('/statistics?' + gameStats.toString())
        .then(async (res) => {
            const stats = await res.json()
            //set ourself to arr[0]
            stats.sort((a, b) => {
                if (a.player.toLowerCase() === address.toLowerCase()) return -1;
                if (b.player.toLowerCase() === address.toLowerCase()) return 1;
                return 0;
            });
            roundsElem.textContent = `${parseInt(rounds) - parseInt(stats[0].remainingrounds)}/${parseInt(rounds)}`
            const fightBaseAmount = BigInt(fight.baseAmount.toString())
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
                    winLoseSpan.textContent = 'Win: '
                    const value = shortDisplayValue((amountLose * BigInt(-1)).toString() / (10**decimals).toString())
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
                addressPLink.href = `${network.explorer}/address/${v.player}`

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
                    const title = document.createElement('span')
                    title.className = 'stats-col-title'
                    title.textContent = 'Players and stats'
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
                            info.setAttribute('data-fight', fight.ID.toString())
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
                console.log('here1')
                infoContent.appendChild(infoContentTop)
                //infoContentBottom.appendChild(players_stats_mobile)
                infoContent.appendChild(infoContentBottom)
            }
        })
        .catch(err => console.error(err))
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