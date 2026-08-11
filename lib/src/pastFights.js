import { ERC20 } from "../contract.js"
import { compareID, getMap, timeConverter } from "./utils/utils.js"
import { DESKTOP_DECOR, renderPastFightRow } from "./fights/rows.js"

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
            renderPastFightRow({
                isDesktop,
                isInfoModal,
                rowClass: 'games__row border-style desktop',
                decor: DESKTOP_DECOR,
                value: fight.ID.toString(),
                idText: ` ${fight.ID.toString()}`,
                dateText: ` ${timeConverter(finishTime)}`,
                betPerRoundText: ` ${fight.amountPerRound / 10**decimals} ${token}`,
                depositText: `${fight.baseAmount / 10**decimals} ${token}`,
                map: mapProperties,
                rounds: fight.rounds,
                stats,
                baseAmount: BigInt(fight.baseAmount.toString()),
                token,
                decimals,
                explorerUrl: (player) => `${network.explorer}/address/${player}`,
                statsColTitle: { kind: 'span', text: 'Players and stats' },
                enemyModalAddressCol: 'last',
                list: pastGamesList,
                tableId: 'pastgames-table'
            })
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