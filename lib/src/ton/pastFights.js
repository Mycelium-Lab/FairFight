import { getMap, timeConverter } from "../utils/utils.js"
import { MOBILE_DECOR, renderPastFightRow } from "../fights/rows.js"

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
    const stats = fight.stats
    //set ourself to arr[0]
    stats.sort((a, b) => {
        if (a.player.toLowerCase() === address.toLowerCase()) return -1;
        if (b.player.toLowerCase() === address.toLowerCase()) return 1;
        return 0;
    });

    renderPastFightRow({
        isDesktop,
        isInfoModal,
        rowClass: 'games__row border-style',
        decor: MOBILE_DECOR,
        value: fight.gameid.toString(),
        idText: ` ${fight.gameid.toString()}`,
        dateText: ` ${timeConverter(Math.floor(finishTime / 1000))}`,
        betPerRoundText: ` ${(BigInt(fight.amountperround) / BigInt(10**decimals)).toString()} ${token}`,
        depositText: `${fight.baseamount / 10**decimals} ${token}`,
        map: mapProperties,
        rounds: fight.rounds,
        stats,
        baseAmount: BigInt(fight.baseamount.toString()),
        token,
        decimals,
        explorerUrl: (player) => `https://tonscan.org/address/${player}`,
        statsColTitle: { kind: 'img', src: '../media/svg/players_and_stats.svg' },
        enemyModalAddressCol: 'last',
        list: pastGamesList,
        tableId: 'pastgames-table'
    })

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