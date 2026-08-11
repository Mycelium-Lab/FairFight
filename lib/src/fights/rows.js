/*
 * The four fight lists - EVM p2p, TON p2p, free-to-play, and the EVM "my current
 * battle" row - build the same two rows. They disagree only about leaf values, so the
 * markup lives here and every caller passes the values it already computed.
 *
 * Deliberately dumb: no fetching, no chain calls, no navigation, no decisions about
 * which button to show. Callers keep all of that, and hand the finished button element
 * to `renderFightRow`.
 */
import { addressMaker, shortDisplayValue } from '../utils/utils.js'

// The desktop skin draws dots and cut corners, the mobile one only corners.
export const DESKTOP_DECOR = [
    'dote dote1', 'dote dote2', 'dote dote3', 'dote dote4',
    'c-border border1', 'c-border border2', 'c-border border3', 'c-border border4',
    'c-border border5', 'c-border border6', 'c-border border7', 'c-border border8'
]
export const MOBILE_DECOR = ['corn corn1', 'corn corn2', 'corn corn3', 'corn corn4']

// ------------------------------------------------------------------ open fights

/*
 * spec:
 *   rowClass      string                     class of the row container
 *   decor         [string]                   corner/border decoration divs, in order
 *   hiddenInput   bool                       carry the id in a hidden <input class="id">
 *   id            string|number              fight id, used for row id/value and "id: "
 *   idClass       string?                    class for the id value <span>
 *   creator       {text, href}
 *   map           {name, image}              map name + preview shown on hover
 *   rounds        {html?, text?, className}  set html or text, never both
 *   status        {id, text?, maxWidth?}
 *   timer         {id}?                      countdown slot for >2 player fights
 *   players       {html?, text?}
 *   bet           {text, id?}
 *   deposit       {label, text, pId, spanId?}
 *   inviteLink    {href, marginTop?}?
 *   button        Element?                   already wired by the caller
 */
export const renderFightRow = (spec) => {
    const li = document.createElement('div')
    li.className = spec.rowClass
    if (spec.decor) {
        li.append(...spec.decor.map(className => {
            const decor = document.createElement('div')
            decor.className = className
            return decor
        }))
    }
    if (spec.hiddenInput) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.value = spec.id
        input.className = 'id'
        li.appendChild(input)
    }
    li.id = `openbattle_${spec.id}`
    li.setAttribute('value', spec.id)

    const headerDiv = document.createElement('div')
    headerDiv.className = `games__item`
    const pID = document.createElement('p')
    const pIDData = document.createElement('span')
    pID.textContent = 'id: '
    pIDData.textContent = `${spec.id}`
    if (spec.idClass) {
        pIDData.className = spec.idClass
    }
    pID.appendChild(pIDData)
    const pCreator = document.createElement('p')
    const pCreatorData = document.createElement('a')
    pCreator.textContent = 'Creator: '
    pCreatorData.target = "_blank"
    pCreatorData.href = spec.creator.href
    pCreatorData.textContent = `${spec.creator.text}`
    pCreatorData.className = 'creator-link active'
    pCreator.appendChild(pCreatorData)
    const pMap = document.createElement('p')
    const pMapData = document.createElement('span')
    pMap.textContent = 'Map: '
    pMapData.textContent = spec.map.name
    pMapData.className = 'active map-show'
    const mapHiddenModal = document.querySelector('#modal__map')
    pMapData.addEventListener("mouseover", () => {
        mapHiddenModal.src = spec.map.image
        mapHiddenModal.classList.add('active')
    });
    pMapData.addEventListener("mouseleave", () => {
        mapHiddenModal.classList.remove('active')
    });
    pMap.appendChild(pMapData)
    headerDiv.appendChild(pID)
    headerDiv.appendChild(pCreator)
    headerDiv.appendChild(pMap)
    const roundsElem = document.createElement('p')
    if (spec.rounds.html !== undefined) {
        roundsElem.innerHTML = spec.rounds.html
    } else if (spec.rounds.text !== undefined) {
        roundsElem.textContent = spec.rounds.text
    }
    roundsElem.className = spec.rounds.className
    headerDiv.appendChild(roundsElem)

    const middleDiv = document.createElement('div')
    const middleDivP = document.createElement('p')
    if (spec.status.maxWidth) {
        middleDivP.style.maxWidth = spec.status.maxWidth
    }
    const statusSpan = document.createElement('span')
    middleDivP.textContent = 'Status: '
    statusSpan.id = spec.status.id
    if (spec.status.text !== undefined) {
        statusSpan.textContent = spec.status.text
    }
    middleDivP.appendChild(statusSpan)
    middleDiv.appendChild(middleDivP)
    if (spec.timer) {
        const middleDivPTimer = document.createElement('p')
        const middleDivSpanTimer = document.createElement('span')
        middleDivSpanTimer.id = spec.timer.id
        middleDivPTimer.textContent = 'Timer: '
        middleDivSpanTimer.textContent = '00:00'
        middleDivPTimer.appendChild(middleDivSpanTimer)
        middleDiv.appendChild(middleDivPTimer)
    }
    const pPlayers = document.createElement('p')
    if (spec.players.html !== undefined) {
        pPlayers.innerHTML = spec.players.html
    } else {
        pPlayers.textContent = spec.players.text
    }
    middleDiv.appendChild(pPlayers)
    middleDiv.className = 'games__item'

    const bottomDiv = document.createElement('div')
    bottomDiv.className = 'games__item_last games__item'
    const betPerRoundP = document.createElement('p')
    betPerRoundP.textContent = 'Bet per round: '
    const betPerRound = document.createElement('span')
    if (spec.bet.id) {
        betPerRound.id = spec.bet.id
    }
    betPerRoundP.appendChild(betPerRound)
    const amountDepositOrClaimP = document.createElement('P')
    amountDepositOrClaimP.textContent = spec.deposit.label
    const amountDepositOrClaim = document.createElement('span')
    if (spec.deposit.spanId) {
        amountDepositOrClaim.id = spec.deposit.spanId
    }
    amountDepositOrClaimP.appendChild(amountDepositOrClaim)
    bottomDiv.appendChild(betPerRoundP)
    bottomDiv.appendChild(amountDepositOrClaimP)
    amountDepositOrClaimP.id = spec.deposit.pId
    betPerRound.textContent = spec.bet.text
    amountDepositOrClaim.textContent = spec.deposit.text
    if (spec.inviteLink) {
        const link = document.createElement('a')
        const span = document.createElement('span')
        link.classList = 'invite-friend-btn'
        span.textContent = 'Invite a friend'
        link.href = spec.inviteLink.href
        if (spec.inviteLink.marginTop) {
            link.style.marginTop = spec.inviteLink.marginTop
        }
        link.appendChild(span)
        bottomDiv.appendChild(link)
    }

    li.appendChild(headerDiv)
    li.appendChild(middleDiv)
    li.appendChild(bottomDiv)
    if (spec.button) {
        bottomDiv.appendChild(spec.button)
    }
    return { li, headerDiv, roundsElem, statusSpan, betPerRound, amountDepositOrClaim, bottomDiv }
}

// ------------------------------------------------------------------ past fights

/*
 * Three shapes out of one description: a desktop row, a mobile table row, or the
 * mobile "info" modal. Which one is decided by the caller's isDesktop/isInfoModal,
 * exactly as before.
 *
 * spec:
 *   isDesktop, isInfoModal  bool
 *   rowClass       string                 desktop row class
 *   decor          [string]               desktop decoration divs
 *   value          string                 fight id, as the row's value attribute
 *   idText         string                 already formatted (leading space included)
 *   dateText       string                 already formatted
 *   betPerRoundText string                already formatted
 *   depositText    string                 per-player deposit, already formatted
 *   map            {name, image}
 *   rounds         string|number          total rounds
 *   stats          [{player, amount, kills, deaths, remainingrounds}]  sorted, self first
 *   baseAmount     BigInt                 to classify win/lose/draw
 *   token          string
 *   decimals       number
 *   explorerUrl    (player) => string
 *   statsColTitle  {kind: 'span'|'img', text?, src?}
 *   enemyModalAddressCol 'first'|'last'   which column holds the wallet in the modal
 *   list           Element                container the row is inserted into
 *   tableId        string                 id of the mobile table
 */
export const renderPastFightRow = (spec) => {
    const { isDesktop, isInfoModal, stats } = spec

    //mobile and landscape
    const infoContentTop = document.getElementById('info-content-top')
    const infoContentBottom = document.getElementById('info-content-bottom')
    const infoContent = document.getElementById('info-content')

    let headerDiv
    let li
    let tableRow
    if (isDesktop) {
        li = document.createElement('div')
        li.className = spec.rowClass
        li.setAttribute('value', spec.value)
        li.append(...spec.decor.map(className => {
            const decor = document.createElement('div')
            decor.className = className
            return decor
        }))
        headerDiv = document.createElement('div')
        headerDiv.className = 'games__item games__item__header'
    }
    else if (!isInfoModal) {
        tableRow = document.createElement('tr')
        tableRow.classList.add('table__row')
    }

    const rounds = spec.rounds
    const pID = document.createElement('p')
    pID.classList.add('p__id')
    pID.textContent = 'Game ID'

    const pIDData = isDesktop ? document.createElement('p') : isInfoModal ? document.createElement('span') : document.createElement('td')
    pIDData.textContent = spec.idText

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
    pDateData.textContent = spec.dateText
    if(isDesktop || isInfoModal) {
        pDate.appendChild(pDateData)
    }
    const betPerRoundP = document.createElement('p')
    const betPerRound = isDesktop ? document.createElement('p') : document.createElement('span')
    betPerRoundP.textContent = 'Bet per round'
    betPerRoundP.classList.add('p__betPerRound')
    betPerRound.textContent = spec.betPerRoundText
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
    map.textContent = spec.map.name
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
    map.addEventListener("mouseover", () => {
      mapHiddenModal.src = spec.map.image
      mapHiddenModal.classList.add('pg-active')
    });
    map.addEventListener("mouseleave", () => {
      mapHiddenModal.classList.remove('pg-active')
    });
    const playerStatsArray = []
    roundsElem.textContent = `${parseInt(rounds) - parseInt(stats[0].remainingrounds)}/${parseInt(rounds)}`
    const fightBaseAmount = spec.baseAmount
    const token = spec.token
    const decimals = spec.decimals
    for (let i = 0; i < stats.length; i+=2) {
        const players_stats = document.createElement('div')
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
        const statsHeaderTitle = document.createElement('p')
        statsHeaderTitle.textContent = i == 0 ? 'YOU' : `ENEMY #${i}`
        const addressP = document.createElement('p')
        const addressPLink = document.createElement('a')
        addressPLink.textContent = `${addressPlayer}`
        addressPLink.target = "_blank"
        addressPLink.href = spec.explorerUrl(v.player)

        const addressPName = document.createElement('span')
        addressPName.textContent = 'Wallet: '
        const deposit = document.createElement('p')
        deposit.textContent = spec.depositText
        const depositName = document.createElement('span')
        depositName.textContent = 'Dep: '
        const kills = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        const deaths = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        const killsName = document.createElement('span')
        const deathsName = document.createElement('span')
        killsName.textContent = 'Kills: '
        kills.textContent = `${v.kills}`
        deathsName.textContent = 'Deaths: '
        deaths.textContent = `${v.deaths}`
        const winLose = isDesktop || isInfoModal ? document.createElement('p') : document.createElement('td')
        winLose.textContent = winLoseText
        winLose.className = classNameWinLose
        if (i % 2 == 0) {
            const youStats = document.createElement('div')
            youStats.className = 'you-stats-col'
            const youStatsFirstCol = document.createElement('div')
            const youStatsHeader = document.createElement('div')
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
            const title = document.createElement(spec.statsColTitle.kind)
            if (spec.statsColTitle.kind === 'img') {
                title.src = spec.statsColTitle.src
            } else {
                title.textContent = spec.statsColTitle.text
            }
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
                    info.setAttribute('data-fight', spec.value)
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
                // free-to-play puts the wallet under kills/deaths, the chains put it
                // in the right-hand column
                if (spec.enemyModalAddressCol === 'first') {
                    enemyStatsFirstCol.appendChild(addressP)
                }
                enemyStatsLastCol.appendChild(winLose)
                enemyStatsLastCol.appendChild(deposit)
                if (spec.enemyModalAddressCol !== 'first') {
                    enemyStatsLastCol.appendChild(addressP)
                }
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
        spec.list.insertBefore(li, spec.list.firstChild)
    }
    else if(!isInfoModal){
        let pastGamesTable = document.querySelector(`#${spec.tableId}`)
        if(!pastGamesTable) {
            pastGamesTable = document.createElement('table')
            pastGamesTable.setAttribute('id', spec.tableId)
            spec.list.appendChild(pastGamesTable)
        }
        pastGamesTable.insertBefore(tableRow, pastGamesTable.firstChild)
    }
    else {
        infoContent.appendChild(infoContentTop)
        infoContent.appendChild(infoContentBottom)
    }
    return { li, tableRow }
}
