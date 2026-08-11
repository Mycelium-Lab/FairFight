import { addressMaker, getMap, shortDisplayValue, timeConverter } from "../utils/utils.js"

const BUTTON_TEXT = {
    FINISH: 'finish',
    JOIN: 'join',
    WITHDRAW: 'withdraw'
}

// Free-to-play is a mode, not a chain, but it rides on two pseudo chain ids that the
// server keys its tables on (server/f2p/service.js): 999999 for the Telegram/TON lobby,
// 999998 for the EVM one. The only thing that differs between them on the client is the
// session credential and how an owner is displayed - see tonMode()/evmMode() below.
const TON_F2P_CHAINID = 999999
const EVM_F2P_CHAINID = 999998

const TOKEN = 'FAIR'
const DECIMALS = 9

const isDesktop = window.innerWidth > 1024

const tonMode = () => {
    let initData
    try {
        initData = window.Telegram.WebApp.initData
    } catch (error) {
        initData = null
    }
    return {
        chainid: TON_F2P_CHAINID,
        credential: { initData },
        underlyingNetworkId: null,
        // TON owners are Telegram usernames, not addresses - shortening them is wrong.
        shortenOwner: false
    }
}

const evmMode = (network, sign) => ({
    chainid: EVM_F2P_CHAINID,
    credential: { sign_evm: sign },
    // room-connection.js needs to know which real chain to send the player back to.
    underlyingNetworkId: network.chainid,
    shortenOwner: true
})

// index.html carries a second, desktop-only copy of every F2P panel; index_ton.html does
// not (that page is mobile-only by construction). Fall back to the mobile id so that one
// module drives both pages.
const panel = (id) => (isDesktop && document.getElementById(`${id}-desktop`)) || document.getElementById(id)

const barContent = (root) => {
    if (!SimpleBar.instances.get(root)) {
        new SimpleBar(root, { })
    }
    return root.querySelector('.simplebar-content')
}

const listContent = (id) => barContent(panel(id))

const showError = (message) => {
    document.getElementById("error_modal").style.display = 'flex'
    document.getElementById("error_modal_text").textContent = message
}

const DESKTOP_DECOR = [
    'dote dote1', 'dote dote2', 'dote dote3', 'dote dote4',
    'c-border border1', 'c-border border2', 'c-border border3', 'c-border border4',
    'c-border border5', 'c-border border6', 'c-border border7', 'c-border border8'
]
const MOBILE_DECOR = ['corn corn1', 'corn corn2', 'corn corn3', 'corn corn4']

const decorateRow = (li) => {
    li.append(...(isDesktop ? DESKTOP_DECOR : MOBILE_DECOR).map(className => {
        const decor = document.createElement('div')
        decor.className = className
        return decor
    }))
}

// Everything the match page reads out of localStorage before the socket connects.
const enterMatch = (mode, fight, username) => {
    if (mode.underlyingNetworkId !== null) {
        localStorage.setItem('underlying_network_id', mode.underlyingNetworkId)
    }
    localStorage.setItem('tonwallet', username)
    localStorage.setItem('ton_enemies', fight.players_list.filter(v => v != username))
    localStorage.setItem('realBalance', fight.baseamount)
    localStorage.setItem('amountPerRound', fight.amountperround)
    localStorage.setItem(`deposit_${mode.chainid}_${fight.gameid}`, fight.baseamount)
    localStorage.setItem('rounds', fight.rounds)
    window.location.href = `/ton_game/?ID=${fight.gameid}&network=${mode.chainid}&token=${TOKEN}&decimals=${DECIMALS}`
}

const fetchJSON = async (url) => (await (await fetch(url)).json())

const postJSON = (url, body) => fetch(url, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
})

// ---------------------------------------------------------------- open fights

const renderOpenFights = async (fights, username, mode) => {
    const opengames = panel('opengames-f2p')
    const openGamesList = listContent('opengames-list-f2p')

    // Sequential, not fights.forEach(async ...): the emptiness count below has to run
    // after the rows exist, otherwise the first render always reports "empty".
    for (const fight of fights) {
        const child = appendOpenFight(fight, username, mode)
        if (child) {
            openGamesList.appendChild(child)
        }
    }

    let counter = 0
    Array.from(openGamesList.children).forEach(v => {
        if (v.id && v.id.includes('openbattle_')) {
            const index = v.id.split('openbattle_')[1]
            if (!fights.find(fight => fight.gameid == index)) {
                openGamesList.removeChild(v)
            } else {
                counter += 1
            }
        }
    })

    panel('opengames_empty-f2p').style.display = counter == 0 ? '' : 'none'
    opengames.classList.remove('empty')
}

const appendOpenFight = (fight, username, mode) => {
    const index = fight.gameid
    let buttonText = BUTTON_TEXT.JOIN
    if (username == fight.owner) {
        buttonText = BUTTON_TEXT.WITHDRAW
    }
    if (fight.players_list.length >= 2) {
        if (fight.players_list.includes(username)) {
            enterMatch(mode, fight, username)
        } else if (fight.players == 2) {
            return
        }
    }
    if (document.querySelector(`#openbattle_${index}`)) {
        return
    }

    const li = document.createElement('div')
    li.className = `games__row border-style ${isDesktop ? 'desktop' : ''}`
    decorateRow(li)
    const input = document.createElement('input')
    input.type = 'hidden'
    input.value = index
    input.className = 'id'
    li.appendChild(input)
    li.id = `openbattle_${index}`
    li.setAttribute('value', index)

    const button = document.createElement("button")
    button.value = index
    button.className = 'close-button join-button opengames__btn'
    button.innerHTML = buttonText === BUTTON_TEXT.WITHDRAW
        ? `<span style="font-size:${isDesktop ? '12px' : '7px'}">${buttonText}</span>`
        : `<span>${buttonText}</span>`
    button.addEventListener('click', async () => {
        window.addEventListener("popstate", () => {});
        if (buttonText === BUTTON_TEXT.WITHDRAW) {
            const res = await postJSON('/f2p/withdraw', { gameid: index, ...mode.credential })
            if (res.status == 200) {
                const fights = (await fetchJSON(`/f2p?chainid=${mode.chainid}`)).fights
                await renderOpenFights(fights, username, mode)
            } else {
                showError(await res.text())
            }
        }
        if (buttonText === BUTTON_TEXT.JOIN) {
            const res = await postJSON('/f2p/join', { gameid: index, player: username, ...mode.credential })
            if (res.status == 200) {
                enterMatch(mode, fight, username)
            } else {
                showError(await res.text())
            }
        }
    })

    const map = getMap(fight.map)
    const addressPlayer1 = mode.shortenOwner ? addressMaker(fight.owner) : fight.owner
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
    pMapData.addEventListener("mouseover", () => {
        mapHiddenModal.src = map.image
        mapHiddenModal.classList.add('active')
    });
    pMapData.addEventListener("mouseleave", () => {
        mapHiddenModal.classList.remove('active')
    });
    pMap.appendChild(pMapData)
    headerDiv.appendChild(pID)
    headerDiv.appendChild(pCreator)
    headerDiv.appendChild(pMap)
    const currentBattleRoundsElem = document.createElement('p')
    currentBattleRoundsElem.textContent = `Current round: ${0}/${fight.rounds}`
    currentBattleRoundsElem.className = `right`
    headerDiv.appendChild(currentBattleRoundsElem)

    const middleDiv = document.createElement('div')
    middleDiv.className = 'games__item'
    const middleDivP = document.createElement('p')
    middleDivP.style.maxWidth = '278px'
    const middleDivSpan = document.createElement('span')
    middleDivP.textContent = 'Status: '
    middleDivSpan.id = `mygame_status_${index}`
    middleDivSpan.textContent = `${buttonText == BUTTON_TEXT.WITHDRAW ? 'Your game. ' : ''}Waiting for an opponent or timer`
    middleDivP.appendChild(middleDivSpan)
    middleDiv.appendChild(middleDivP)
    const pPlayers = document.createElement('p')
    pPlayers.textContent = `Players: ${fight.players.toString()}`
    middleDiv.appendChild(pPlayers)

    const bottomDiv = document.createElement('div')
    bottomDiv.className = 'games__item_last games__item'
    const betPerRoundP = document.createElement('p')
    betPerRoundP.textContent = 'Bet per round: '
    const betPerRound = document.createElement('span')
    betPerRoundP.appendChild(betPerRound)
    const amountDepositOrClaimP = document.createElement('P')
    amountDepositOrClaimP.textContent = 'To deposit: '
    const amountDepositOrClaim = document.createElement('span')
    amountDepositOrClaimP.appendChild(amountDepositOrClaim)
    bottomDiv.appendChild(betPerRoundP)
    bottomDiv.appendChild(amountDepositOrClaimP)
    amountDepositOrClaimP.id = `amount_deposit_or_claim_p_${index}`
    betPerRound.textContent = `${fight.amountperround / 10**DECIMALS} ${TOKEN}`
    amountDepositOrClaim.textContent = `${fight.baseamount / 10**DECIMALS} ${TOKEN}`
    if (buttonText === BUTTON_TEXT.WITHDRAW) {
        const link = document.createElement('a')
        const span = document.createElement('span')
        link.classList = 'invite-friend-btn'
        span.textContent = 'Invite a friend'
        const encodedText = encodeURIComponent(`@${username} invite you to play fairfights f2p game (id: ${index})`)
        link.href = `https://t.me/share/url?url=https://t.me/fairfights_bot?startapp&text=${encodedText}`
        link.style.marginTop = "30px"
        link.appendChild(span)
        bottomDiv.appendChild(link)
    }

    li.appendChild(headerDiv)
    li.appendChild(middleDiv)
    li.appendChild(bottomDiv)
    bottomDiv.appendChild(button)
    return li
}

// ---------------------------------------------------------------- past fights

document.getElementById('info-close').addEventListener('click', closeInfo)

const renderPastFights = async (pastFights, username) => {
    const pastgames = panel('pastgames-f2p')
    const pastGamesList = listContent('pastgames-list-f2p')
    const isInfoModal = document.getElementById('info_modal').style.display === 'flex'
    if (isInfoModal) {
        const fightId = localStorage.getItem('fight_id')
        const index = pastFights.findIndex(fight => fight.gameid.toString() === fightId)
        await addToPastFights(pastFights[index], username, isInfoModal, '')
    }
    else {
        for (let i = 0; i < pastFights.length; i++) {
            await addToPastFights(pastFights[i], username, isInfoModal, '')
        }
    }
    // One static child - the empty-state block - means no rows were added.
    const empty = pastGamesList.children.length === 1
    panel('pastgames_empty-f2p').style.display = empty ? '' : 'none'
    pastgames.classList.toggle("empty", empty)
    // The desktop lobby ships this copy blank and fills it in here; index_ton.html has
    // no -desktop panel at all, hence the existence check rather than an isDesktop one.
    const emptyTitle = document.getElementById('pastgames_empty-title-f2p-desktop')
    if (empty && emptyTitle) {
        emptyTitle.textContent = 'Empty:('
        document.getElementById('pastgames_empty-desc-f2p-desktop').textContent = "That's where your game history will be listed."
    }
}

const addToPastFights = async (fight, username, isInfoModal, from) => {
    const mapProperties = getMap(fight.map)
    const pastGamesList = listContent('pastgames-list-f2p')

    //mobile and landscape
    const infoContentTop = document.getElementById('info-content-top')
    const infoContentBottom = document.getElementById('info-content-bottom')
    const infoContent = document.getElementById('info-content')

    let finishTime = fight.finishtime
    if (from === 'fromOpenFights') {
        finishTime = Math.floor((new Date()).getTime())
        const lastAddedID = pastGamesList.children.item(0).getAttribute('value')
        if (lastAddedID === fight.gameid.toString()) {
            return
        }
    }
    const token = TOKEN
    const decimals = DECIMALS
    let headerDiv
    let li
    let tableRow
    if(isDesktop) {
        li = document.createElement('div')
        li.className = 'games__row border-style desktop'
        li.setAttribute('value', fight.gameid.toString())
        decorateRow(li)
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
    pIDData.textContent = ` ${addressMaker(fight.gameid.toString())}`

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
    map.addEventListener("mouseover", () => {
      mapHiddenModal.src = mapProperties.image
      mapHiddenModal.classList.add('pg-active')
    });
    map.addEventListener("mouseleave", () => {
      mapHiddenModal.classList.remove('pg-active')
    });
    const playerStatsArray = []
    const stats = fight.statistics
    //set ourself to arr[0]
    stats.sort((a, b) => {
        if (a.player.toLowerCase() === username.toLowerCase()) return -1;
        if (b.player.toLowerCase() === username.toLowerCase()) return 1;
        return 0;
    });
    roundsElem.textContent = `${parseInt(rounds) - parseInt(stats[0].remainingrounds)}/${parseInt(rounds)}`
    const fightBaseAmount = BigInt(fight.baseamount.toString())
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
        addressPLink.href = `https://tonscan.org/address/${v.player}`

        const addressPName = document.createElement('span')
        addressPName.textContent = 'Wallet: '
        const deposit = document.createElement('p')
        deposit.textContent = `${fight.baseamount / 10**decimals} ${token}`
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
                enemyStatsFirstCol.appendChild(addressP)
                enemyStatsLastCol.appendChild(winLose)
                enemyStatsLastCol.appendChild(deposit)
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
        let pastGamesTable = document.querySelector('#pastgames-table-f2p')
        if(!pastGamesTable) {
            pastGamesTable = document.createElement('table')
            pastGamesTable.setAttribute('id', 'pastgames-table-f2p')
            pastGamesList.appendChild(pastGamesTable)
        }
        pastGamesTable.insertBefore(tableRow, pastGamesTable.firstChild)
    }
    else {
        infoContent.appendChild(infoContentTop)
        infoContent.appendChild(infoContentBottom)
    }
}

function closeInfo () {
    const infoContentTop = document.getElementById('info-content-top')
    const infoContentBottom = document.getElementById('info-content-bottom')
    Array.from(infoContentTop.children).forEach(content => content.remove())
    Array.from(infoContentBottom.children).forEach(content => content.remove())
    document.getElementById('info_modal').style.display = 'none'
}

// ------------------------------------------------------------- TON entry points
// index_ton.js drives the TON lobby itself (create game, polling, FAIR balance) and
// only calls into these two.

export const openFightsF2P = (fights, username) => renderOpenFights(fights, username, tonMode())

let tonPastGamesTabWired = false

export const pastFightsF2P = async (pastFights, username) => {
    if (!tonPastGamesTabWired) {
        tonPastGamesTabWired = true
        document.querySelector('#pastgames-f2p-btn').addEventListener('click', () => {
            const pastgames = panel('pastgames-f2p')
            const empty = listContent('pastgames-list-f2p').children.length === 1
            panel('pastgames_empty-f2p').style.display = empty ? '' : 'none'
            pastgames.classList.toggle("empty", empty)
        })
    }
    await renderPastFights(pastFights, username)
}

// ------------------------------------------------------------- EVM entry point

export async function mainF2PEvm(address, network, sign) {
    const mode = evmMode(network, sign)
    const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p')
    const newGameModal = document.querySelector("#my_modal")
    const createGameBtnF2P = document.querySelector('#createGame-f2p')
    const amountPerRound = document.querySelector('#amountPerDeath')

    wireDesktopTabs(newGameBtnF2P)

    newGameBtnF2P.addEventListener('click', (e) => openNewGameModal(newGameModal, createGameBtnF2P, amountPerRound, e.target))
    enableCreateWhenAmountValid(createGameBtnF2P, amountPerRound)
    createGameBtnF2P.addEventListener('click', async () =>
        await createGame(address, amountPerRound.value, newGameModal, mode)
    )

    let fights = (await fetchJSON(`/f2p?chainid=${mode.chainid}`)).fights
    setInterval(async () => {
        try {
            fights = (await fetchJSON(`/f2p?chainid=${mode.chainid}`)).fights
            await renderOpenFights(fights, address, mode)
        } catch (error) {
            console.log(error)
        }
    }, 7500)
    const pastFights = (await fetchJSON(`/f2p/pastfights?player=${address.toLowerCase()}&chainid=${mode.chainid}`)).fights

    await renderOpenFights(fights, address, mode)
    await renderPastFights(pastFights, address)
    setTimeout(() => {
        const infoModal = document.getElementById('info_modal')
        document.querySelectorAll('[data-fight]').forEach((info) => {
            info.addEventListener('click', async (ev) => {
                infoModal.style.display = 'flex'
                localStorage.setItem('fight_id', ev.target.dataset.fight)
                await renderPastFights(pastFights, address)
            })
        })
    }, 300)

    const queryBoard = new URLSearchParams();
    queryBoard.append("username", address)
    queryBoard.append("chainid", mode.chainid)
    queryBoard.append("sign_evm", sign)
    const board = await fetchJSON(`/f2p/board/?` + queryBoard.toString()).catch(err => ({ tokens: 0 }))
    try {
        document.querySelector('#f2p_balance__value').textContent = board.board.tokens
    } catch (error) {}
}

// The desktop lobby has its own open/past tab strip and its own "F2P" menu button;
// index_ton.html has neither, so this is EVM-only. Wired once - the originals rebound
// these on every 7.5s poll.
function wireDesktopTabs(newGameBtnF2P) {
    const showTab = (which) => {
        const opengames = document.getElementById("opengames-f2p-desktop")
        const pastgames = document.getElementById("pastgames-f2p-desktop")
        const open = which === 'open'
        opengames.style.display = open ? '' : 'none'
        opengames.classList.toggle('active', open)
        pastgames.style.display = open ? 'none' : ''
        pastgames.classList.toggle('active', !open)
        document.querySelector('#opengames-f2p-btn-desktop').classList.toggle('active', open)
        document.querySelector('#pastgames-f2p-btn-desktop').classList.toggle('active', !open)

        const listId = open ? 'opengames-list-f2p-desktop' : 'pastgames-list-f2p-desktop'
        const emptyId = open ? 'opengames_empty-f2p-desktop' : 'pastgames_empty-f2p-desktop'
        const empty = barContent(document.getElementById(listId)).children.length === 1
        document.getElementById(emptyId).style.display = empty ? '' : 'none'
        // Both original handlers toggled `empty` on the open-games panel, including the
        // past-games one. Kept as-is: that panel is hidden when past games are showing.
        opengames.classList.toggle("empty", empty)
        if (empty && open) {
            document.querySelector('#opengames_empty-title-f2p-desktop').textContent = 'Empty:( '
            document.querySelector('#opengames_empty-desc-f2p-desktop').textContent = 'At the moment, there are no games available for joining. But you can always start your own by clicking the "New game" button above.'
        }
    }

    document.querySelector('#opengames-f2p-btn-desktop').addEventListener('click', () => showTab('open'))
    document.querySelector('#pastgames-f2p-btn-desktop').addEventListener('click', () => showTab('past'))

    const btnF2PEvmMenu = document.querySelector('#menu-f2p-btn-evm')
    if (btnF2PEvmMenu) {
        btnF2PEvmMenu.addEventListener('click', () => {
            document.querySelector('#amountPerDeath').placeholder = TOKEN
            document.querySelector('#games_checker-desktop').style.display = 'none'
            document.querySelector('#games_checker-f2p-desktop').style.display = ''
            document.getElementById("opengames-desktop").style.display = 'none'
            document.getElementById("pastgames-desktop").style.display = 'none'
            showTab('open')
            newGameBtnF2P.style.display = ''
            document.querySelector('#btn_modal_window').style.display = 'none'
        })
    }
}

function enableCreateWhenAmountValid(createGameBtnF2P, amountPerRound) {
    const check = (value) => {
        createGameBtnF2P.disabled = !(value && !isNaN(value) && value > 0)
    }
    if (amountPerRound.value && !isNaN(amountPerRound.value) && amountPerRound.value > 0) {
        createGameBtnF2P.disabled = false
    }
    amountPerRound.addEventListener('input', (event) => check(event.target.value))
}

async function createGame(address, amountPerRound, newGameModal, mode) {
    try {
        const map = document.querySelector('#map-select-selected').getAttribute('data-value')
        const numberOfRounds = document.querySelector('#rounds-select-selected').getAttribute('data-value')
        const numberOfPlayers = document.querySelector('#players-select-selected').getAttribute('data-value')
        const amountToPlay = BigInt(numberOfRounds) * BigInt(amountPerRound * 10**DECIMALS)

        const res = await postJSON('/f2p/create', {
            owner: address,
            map,
            rounds: numberOfRounds,
            baseAmount: amountToPlay.toString(),
            amountPerRound: (amountPerRound * 10**DECIMALS).toString(),
            players: numberOfPlayers,
            chainid: mode.chainid,
            ...mode.credential
        })
        if (res.status == 200) {
            const fights = (await fetchJSON(`/f2p?chainid=${mode.chainid}`)).fights
            await renderOpenFights(fights, address, mode)
            setTimeout(async () => {
                const fights = (await fetchJSON(`/f2p?chainid=${mode.chainid}`)).fights
                await renderOpenFights(fights, address, mode)
            }, 500)
            newGameModal.style.display = 'none'
        } else {
            showError(await res.text())
        }
    } catch (error) {
        console.log(error)
    }
}

// F2P has no token choice, no prize pool and no deposit, so the modal drops those rows.
function openNewGameModal(modal, createGameBtnF2P, amountPerRound, clickedBtn) {
    showHideBgImages(clickedBtn.id)
    try {
        modal.style.display = "flex";
        const hide = [
            "#tokens-divider-newgame-modal", "#tokens-newgame-modal", "#tokens-divider",
            "#total-prize-pool-element", "#your-deposit-element", "#player-visible-element",
            "#player-visible-mobile-element", "#createGame"
        ]
        hide.forEach(selector => {
            const el = document.querySelector(selector)
            if (el) el.style.display = 'none'
        })
        amountPerRound.placeholder = TOKEN
        createGameBtnF2P.style.display = ''
        enableCreateWhenAmountValid(createGameBtnF2P, amountPerRound)
    } catch (error) {
        console.log(error)
    }
}

function showHideBgImages(id) {
    if (window.innerWidth > 500) {
        document.getElementById('player-visible-element').classList.add('d-none');
        if (id === 'btn_modal_window-f2p') {
            document.querySelector('.my_modal-bg-1').style.display = 'block';
            document.querySelector('.my_modal-bg-2').style.display = 'none';
        }
    }
}
