// TON past-fight list.
//
// The one genuinely TON-shaped thing left here is the reshaping below:
// /statistics/all returns one row per player, so the rows are folded back into
// one record per gameid. Everything else that used to be hardcoded - the token
// label, the 9 decimals, the explorer host, the address comparison - now comes
// from the adapter (lib/chain/tvm.js).
import { getMap, timeConverter } from "../utils/utils.js"
import { MOBILE_DECOR, renderPastFightRow } from "../fights/rows.js"

const infoClose = document.getElementById('info-close')
    infoClose.addEventListener('click', closeInfo)

export const pastFightsTon = async (chain, pastFights, address) => {
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
        await addToPastFights(chain, pastFights[index], address, isInfoModal, '')
    }
    else {
        for (let i = 0; i < pastFights.length; i++) {
            await addToPastFights(chain, pastFights[i], address, isInfoModal, '')
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

export const addToPastFights = async (chain, fight, address, isInfoModal, from) => {
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
    const asset = chain.nativeAsset
    const stats = fight.stats
    //set ourself to arr[0]
    // The statistics table stores addresses lowercased and a TON account has
    // several textual forms, so this comparison belongs to the adapter.
    stats.sort((a, b) => {
        if (chain.equals(a.player, address)) return -1;
        if (chain.equals(b.player, address)) return 1;
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
        betPerRoundText: ` ${chain.formatAmount(BigInt(fight.amountperround))}`,
        depositText: chain.formatAmount(BigInt(fight.baseamount)),
        map: mapProperties,
        rounds: fight.rounds,
        stats,
        baseAmount: BigInt(fight.baseamount.toString()),
        token: asset.symbol,
        decimals: asset.decimals,
        explorerUrl: (player) => chain.explorerAddressUrl(player),
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