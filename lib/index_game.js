import { contractAbi } from './contract.js'
import { networks } from './modules/networks.js'

let network = networks[networks.length - 1];
let gameID;
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
network = networks.find(n => n.chainid == params.network)
gameID = params.ID

$(document).ready(async function () {
    window.oncontextmenu = function ()
    {
        return false;     // cancel default menu
    }
    document.onkeydown = function (e) { 
        if (event.keyCode == 123) { 
            return false; 
        } 
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { 
            return false; 
        } 
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { 
            return false; 
        } 
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { 
            return false; 
        } 
        if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { 
            return false; 
        } 
    } 
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
    let querySign = new URLSearchParams();
    querySign.append("gameID", gameID)
    querySign.append("address", address)
    fetch('/sign?' + querySign.toString())
        .then(
            async (res) => {
                return await res.json()
            }
        )
        .then(async (data) => {
            if (data.r.length != 0) {
                throw Error
            } else {
                return await contract.fights(gameID)
            }
        })
        .then(async (battle) => {
            if (
                (address == battle.player1 || address == battle.player2) 
                && (battle.finished == false)
                && (battle.player1 != '0x0000000000000000000000000000000000000000' && battle.player2 != '0x0000000000000000000000000000000000000000')
                ) {let querySign = new URLSearchParams();
                querySign.append("address", address)
                querySign.append("gameID", gameID)
                const yourKills = document.getElementById("yourKills")
                const yourDeaths = document.getElementById("yourDeaths")
                const enemyKills = document.getElementById("enemyKills")
                const enemyDeaths = document.getElementById("enemyDeaths")
                fetch('/balance?' + querySign.toString())
                    .then(async (res) => {
                        const internalBalance = document.getElementById("internalBalance")
                        const data = await res.json()
                        internalBalance.textContent = `${data.balance == null || data.balance.length == 0 ? ethers.utils.formatEther(battle.player1Amount.toString()) : ethers.utils.formatEther(data.balance)} `
                        const rounds = document.getElementById("rounds_amount")
                        const totalDeposit = parseInt(battle.player1Amount.toString()) + parseInt(battle.player2Amount.toString())
                        const _rounds = Math.floor(totalDeposit / parseInt(battle.amountForOneDeath.toString()) / 2)
                        const gameEndedRounds = Math.floor(_rounds - parseInt(data.remainingRounds == null ? _rounds : data.remainingRounds))
                        rounds.textContent =  `${gameEndedRounds}/${_rounds}`
                        yourKills.textContent = data.kills.length == 0 ? 0 : data.kills
                        yourDeaths.textContent = data.deaths.length == 0 ? 0 : data.deaths
                    })
                    .catch((error) => console.log(error))
                let querySignEnemy = new URLSearchParams()
                querySignEnemy.append("address", address == battle.player1 ? battle.player2 : battle.player1);
                querySignEnemy.append("gameID", gameID)
                fetch('/balance?' + querySignEnemy.toString())
                    .then(async (res) => {
                        const enemyBalance = document.getElementById("enemyBalance")
                        const data = await res.json()
                        enemyBalance.textContent = `${data.balance == null || data.balance.length == 0 ? ethers.utils.formatEther(battle.player1Amount.toString()) : ethers.utils.formatEther(data.balance)} `
                        enemyKills.textContent = data.kills.length == 0 ? 0 : data.kills
                        enemyDeaths.textContent = data.deaths.length == 0 ? 0 : data.deaths
                    })
                    // .catch((error) => window.location.href = '/')
                    .catch((error) => console.log(error))
                const canvas = document.getElementById("canvas")
                canvas.addEventListener('click', () => {
                    document.getElementsByClassName("rounds-head__subtitle")[0].scrollIntoView()
                })
                canvas.addEventListener("contextmenu", () => {
                    document.getElementById("confirm_finish").scrollIntoView()
                })
                document.getElementById('full-screen')
                .addEventListener('click',() => {
                    canvas.style.height = '100vh';
                    canvas.scrollIntoView()
                })
                // document.getElementById("loadingStage").style.display = "none"
                const modal = document.getElementById("over_modal");
                const btn = document.getElementById("confirm_finish");
                const span = document.getElementsByClassName("close_modal_window")[0];
                btn.onclick = function () {
                    document.getElementById("sure_want_end").style.display = ''
                    modal.style.display = "block";
                    const _address = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
                    document.getElementById("yourStats").textContent = `
                    ${_address} (you): ${yourKills.textContent} Kills, ${yourDeaths.textContent} Deaths
                    `
                    const _deposit = ethers.utils.formatEther(battle.player1Amount.toString())
                    const _yourWinLose = parseFloat(internalBalance.textContent) - parseFloat(_deposit)
                    const _elemyourAmountWinLose = document.getElementById("yourAmountWinLose")
                    if (_yourWinLose >= 0) {
                        _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ROSE`
                        _elemyourAmountWinLose.className = 'green'
                    } else {
                        _elemyourAmountWinLose.textContent = `Lose ${_yourWinLose * (-1)} ROSE`
                        _elemyourAmountWinLose.className = 'red'
                    }
                    let _enemyAddress = address == battle.player1 ? battle.player2 : battle.player1
                    _enemyAddress = _enemyAddress.slice(0, 6) + '...' + _enemyAddress.slice(_enemyAddress.length - 4, _enemyAddress.length);
                    document.getElementById("enemyStats").textContent = `
                    ${_enemyAddress} (enemy): ${enemyKills.textContent} Kills, ${enemyDeaths.textContent} Deaths
                    `
                    const _enemyWinLose = parseFloat(enemyBalance.textContent) - parseFloat(_deposit)
                    const _elemenemyAmountWinLose = document.getElementById("enemyAmountWinLose")
                    if (_enemyWinLose >= 0) {
                        _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ROSE`
                        _elemenemyAmountWinLose.className = 'green'
                    } else {
                        _elemenemyAmountWinLose.textContent = `Lose ${_enemyWinLose * (-1)} ROSE`
                        _elemenemyAmountWinLose.className = 'red'
                    }
                    // internal_balance_return.textContent = `${document.getElementById("internalBalance").textContent} `
                }
                span.onclick = function () {
                    modal.style.display = "none";
                }
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    } else if (event.target == document.getElementById("wainting_modal")) {
                        document.getElementById("wainting_modal").style.display = 'none'
                    } else if (event.target == document.getElementById("confirm_modal")) {
                        document.getElementById("confirm_modal").style.display = 'none'
                    } else if (event.target == document.getElementById("pending_modal")) {
                        document.getElementById("pending_modal").style.display = 'none'
                    } else if (event.target == document.getElementById("instruction_modal")) {
                        document.getElementById("instruction_modal").style.display = 'none'
                    } else if (event.target == document.getElementById("about_modal")) {
                        document.getElementById("about_modal").style.display = 'none'
                    } else if (event.target == document.getElementById("enemy_finishing_game_modal")) {
                        document.getElementById("enemy_finishing_game_modal").style.display = 'none'
                    }
                }
            } else {
                document.getElementById("canvas").style.display = "none"
                document.getElementById("loadingStage").style.display = ""
            }
        })
        // .catch(err => window.location.href = '/')
})