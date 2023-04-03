import { ERC20 } from "../contract.js"
import { addressMaker, compareID, timeConverter } from "./utils/utils.js"

export const pastFightsFunc = async (address, contract, network, signer) => {
    let pastFights = await contract.getPlayerFullFights(address, 30).then(fights => fights).catch(err => [])
    pastFights = pastFights.filter(v => v.owner != ethers.constants.AddressZero && v.finishTime != 0)
    pastFights = [...pastFights].sort(compareID)
    let pastgames = document.getElementById("pastgames")
    let pastGamesList = document.getElementById('pastgames-list')
    for (let i = 0; i < pastFights.length; i++) {
        let alreadyExistHere = false
        for (let j = 0; j < pastGamesList.children.length; j++) {
          if (pastFights[i].ID == pastGamesList.children[j].getAttribute('value')) {
            alreadyExistHere = true
            break;
          }
        }
        if (alreadyExistHere == false) {
            let token = network.currency
            let decimals = 18
            if (pastFights[i].token != ethers.constants.AddressZero) {
                const currentTokenContract = new ethers.Contract(pastFights[i].token, ERC20, signer)
                token = await currentTokenContract.symbol()
                decimals = await currentTokenContract.decimals()
            }
            let li = document.createElement('div')
            li.className = 'games__row'
            li.setAttribute('value', pastFights[i].ID.toString())
            const headerDiv = document.createElement('div')
            const rounds = pastFights[i].rounds
            headerDiv.className = 'games__item'
            const pID = document.createElement('p')
            const pIDData = document.createElement('span')
            pID.textContent = 'id: '
            pIDData.textContent = `${pastFights[i].ID.toString()}`
            pID.appendChild(pIDData)
            const pStatus = document.createElement('p')
            const pStatusData = document.createElement('span')
            pStatus.textContent = 'Status: '
            pStatusData.textContent = `Game over`
            pStatusData.className = 'active'
            pStatus.appendChild(pStatusData)
            const pDate = document.createElement('p')
            const pDateData = document.createElement('span')
            pDate.textContent = 'Date: '
            pDateData.textContent = `${timeConverter(pastFights[i].finishTime)}`
            pDate.appendChild(pDateData)
            headerDiv.appendChild(pID)
            headerDiv.appendChild(pStatus)
            headerDiv.appendChild(pDate)
            let roundsElem = document.createElement('p')
            roundsElem.className = 'right'
            headerDiv.appendChild(roundsElem)
            const middleDiv = document.createElement('div')
            middleDiv.className = 'games__item'
            const betPerRoundP = document.createElement('p')
            const betPerRound = document.createElement('span')
            betPerRoundP.textContent = 'Bet per round: '
            betPerRound.textContent = `${pastFights[i].amountPerRound / 10**decimals} ${token}`
            betPerRoundP.appendChild(betPerRound)
            const yourdepositP = document.createElement('p')
            const yourdeposit = document.createElement('span')
            yourdepositP.textContent = 'Your deposit: '
            yourdeposit.textContent = `${pastFights[i].baseAmount / 10**decimals} ${token}`
            yourdepositP.appendChild(yourdeposit)
            const mapP = document.createElement('p')
            const map = document.createElement('span')
            mapP.textContent = 'Map: '
            mapP.className = 'right'
            map.textContent = 'Steel plant'
            map.className = 'active map-show'
            mapP.appendChild(map)
            middleDiv.appendChild(betPerRoundP)
            middleDiv.appendChild(yourdepositP)
            middleDiv.appendChild(mapP)
            const bottomDiv = document.createElement('div')
            const bottomDivText = document.createElement('p')
            bottomDivText.textContent = 'Players & stats:'
            bottomDiv.className = 'games__item'
            bottomDiv.appendChild(bottomDivText)
            const players_stats = document.createElement('div')
            players_stats.className = "games__item games__item__footer"
            const youStats = document.createElement('div')
            youStats.className = 'opengames__col'
            const youStatsWinLose = document.createElement('div')
            youStatsWinLose.className = 'opengames__col'
            const enemyStats = document.createElement('div')
            enemyStats.className = 'opengames__col'
            const enemyStatsWinLose = document.createElement('div')
            enemyStatsWinLose.className = 'opengames__col'
            players_stats.appendChild(youStats)
            players_stats.appendChild(youStatsWinLose)
            players_stats.appendChild(enemyStats)
            players_stats.appendChild(enemyStatsWinLose)
            let queryStatsPlayer1 = new URLSearchParams();
            queryStatsPlayer1.append("gameID", pastFights[i].ID)
            queryStatsPlayer1.append("chainid", network.chainid)
            fetch('/statistics?' + queryStatsPlayer1.toString())
                .then(async (res) => {
                    const stats = await res.json()
                    const player1Stats = stats.find(s => s.player == address)
                    const player2Stats = stats.find(s => s.player != address)
                    const addressPlayer1 = addressMaker(address)
                    const addressPlayer2 = addressMaker(player2Stats.player)  
                    roundsElem.textContent = ` Round: ${parseInt(rounds) - parseInt(player1Stats.remainingrounds)}/${parseInt(rounds)}`
                    //PLAYER 1 (YOU)
                    const amountLose1 = BigInt(pastFights[i].baseAmount.toString()) - BigInt(player1Stats.amount.toString())
                    const amountLose2 = BigInt(pastFights[i].baseAmount.toString()) - BigInt(player2Stats.amount.toString())
                    console.log(pastFights[i].baseAmount.toString(), player1Stats.amount.toString())
                    let winLoseText = '';
                    let classNameWinLose = 'green'
                    if (amountLose1 < amountLose2) {
                        winLoseText = `Lose: ${(amountLose1 * BigInt(-1)).toString() / (10**decimals).toString()} ${token}`
                        classNameWinLose = "red"
                    } else if (amountLose1 > amountLose2) {
                        winLoseText = `Win: ${amountLose1.toString() / (10**decimals).toString()} ${token}`
                    } else {
                        winLoseText = `Win: 0 ${token}`
                        classNameWinLose = `active`
                    }
                    const addressP = document.createElement('p')
                    addressP.textContent = `${addressPlayer1} (you)`
                    const killsDeaths = document.createElement('p')
                    killsDeaths.textContent = `${player1Stats.kills} kills, ${player1Stats.deaths} deaths`
                    const winLose = document.createElement('p')
                    winLose.textContent = winLoseText
                    winLose.className = classNameWinLose
                    youStats.appendChild(addressP)
                    youStats.appendChild(killsDeaths)
                    youStatsWinLose.appendChild(winLose)
                    //PLAYER 2 (ENEMY)
                    let classNameWinLose2 = 'green'
                    let winLoseText2;
                    if (amountLose2 < amountLose1) {
                        winLoseText2 = `Lose: ${(amountLose2 * BigInt(-1)).toString() / (10**decimals).toString()} ${token}`
                        classNameWinLose2 = "red"
                    } else if (amountLose2 > amountLose1) {
                        winLoseText2 = `Win: ${amountLose2.toString() / (10**decimals).toString()} ${token}`
                    } else {
                        winLoseText2 = `Win: 0 ${token}`
                        classNameWinLose2 = `active`
                    }
                    const addressP2 = document.createElement('p')
                    addressP2.textContent = `${addressPlayer2} (enemy)`
                    const killsDeaths2 = document.createElement('p')
                    killsDeaths2.textContent = `${player2Stats.kills} kills, ${player2Stats.deaths} deaths`
                    const winLose2 = document.createElement('p')
                    winLose2.textContent = winLoseText2
                    winLose2.className = classNameWinLose2
                    enemyStats.appendChild(addressP2)
                    enemyStats.appendChild(killsDeaths2)
                    enemyStatsWinLose.appendChild(winLose2)
                })
                .catch(err => console.error(err))
            li.appendChild(headerDiv)
            li.appendChild(middleDiv)
            li.appendChild(bottomDiv)
            li.appendChild(players_stats)
            pastGamesList.insertBefore(li, pastGamesList.firstChild)
        }
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