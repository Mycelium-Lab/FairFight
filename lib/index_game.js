import { contractAbi } from './contract.js'
import { networks } from './modules/networks.js'
import { addressMaker, calcAmountWithDecimals, shortFloat } from './src/utils/utils.js';
import { tokens } from './modules/tokens.js';

$(document).ready(async function () {
    try {
        // Получаем нужный элемент
        let element = document.getElementById('top_stats');
        // Запускаем функцию при прокрутке страницы
        window.addEventListener('scroll', function() {
            Visible (element);
        });

        // А также запустим функцию сразу. А то вдруг, элемент изначально видно
        Visible (element);
        let network = networks[networks.length - 1];
        let gameID;
        let token;
        let decimals;
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        network = networks.find(n => n.chainid == params.network)
        gameID = params.ID
        token = params.token
        const tokensList = tokens.find(v => v.chaindid == network.chainid)
        const tokenObject = tokensList.list.find(v => v.symbol === token)
        decimals = params.decimals

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
        document.getElementById('enemy_finishing_game_href').href = network.chainid == 42262 ? '/' : `/?network=${network.chainid}`
        let querySign = new URLSearchParams();
        querySign.append("gameID", gameID)
        querySign.append("address", address)
        querySign.append("chainid", network.chainid)
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
        .then(async (fight) => {
            const players = await contract.getFightPlayers(gameID)
            const player2 = players[1]
            let player1Image = '../media/sprites/characters/Player.png'
            let player2Image = '../media/sprites/characters/Player2.png'
            if (network.chainid == 31337 || network.chainid == 503129905) {
                const rawResponse = await fetch('/getinventory', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({address, chainid: network.chainid})
                });
                const inventory = await rawResponse.json();
                if (inventory.characterid == 0) {
                    player1Image = '../media/sprites/characters/Player.png'
                }
                if (inventory.characterid == 1) {
                    player1Image = '../media/sprites/characters/Piky.png'
                }
                if (inventory.characterid == 2) {
                    player1Image = '../media/sprites/characters/Butter.png'
                }
                const rawResponse1 = await fetch('/getinventory', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({address: address == fight.owner ? player2 : fight.owner, chainid: network.chainid})
                });
                const inventory1 = await rawResponse1.json();
                if (inventory1.characterid == 0) {
                    player2Image = '../media/sprites/characters/Player2.png'
                }
                if (inventory1.characterid == 1) {
                    player2Image = '../media/sprites/characters/Piky2.png'
                }
                if (inventory1.characterid == 2) {
                    player2Image = '../media/sprites/characters/Butter3.png'
                }
            }
            localStorage.setItem('playerimage', player1Image)
            localStorage.setItem('player2image', player2Image)
            if (
                (address == fight.owner || address == player2) 
                && (fight.finishTime == 0)
                && (fight.owner != ethers.constants.AddressZero && player2 != ethers.constants.AddressZero)
                ) {let querySign = new URLSearchParams();
                querySign.append("address", address)
                querySign.append("gameID", gameID)
                querySign.append("chainid", network.chainid)
                const yourKills = document.getElementsByClassName("yourKills")
                const yourDeaths = document.getElementsByClassName("yourDeaths")
                const enemyKills = document.getElementsByClassName("enemyKills")
                const enemyDeaths = document.getElementsByClassName("enemyDeaths")
                const internalBalance = document.getElementsByClassName("internalBalance")
                const enemyBalance = document.getElementsByClassName("enemyBalance")
                const coinImg = document.getElementsByClassName('balance_coin')
                for (let i = 0; i < coinImg.length; i++) {
                    coinImg.item(i).src = tokenObject.srcBlack
                }
                fetch('/balance?' + querySign.toString())
                    .then(async (res) => {
                        const data = await res.json()
                        for (let i = 0; i < 3; i++) {
                            try {
                                internalBalance.item(i).textContent = `${data.balance == null || data.balance.length == 0 ? calcAmountWithDecimals(fight.baseAmount, decimals) : calcAmountWithDecimals(data.balance, decimals)} ${token}`    
                            } catch (error) {
                                
                            }}
                        const rounds = document.getElementById("rounds_amount")
                        const _rounds = fight.rounds
                        const gameEndedRounds = Math.floor(_rounds - parseInt(data.remainingRounds == null ? _rounds : data.remainingRounds))
                        rounds.textContent =  `${gameEndedRounds}/${_rounds}`
                        for (let i = 0; i < 3; i++) {
                            yourKills.item(i).textContent = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                            yourDeaths.item(i).textContent = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                        }
                    })
                    .catch((error) => console.log(error))
                let querySignEnemy = new URLSearchParams()
                querySignEnemy.append("address", address == fight.owner ? player2 : fight.owner);
                querySignEnemy.append("gameID", gameID)
                querySignEnemy.append("chainid", network.chainid)
                fetch('/balance?' + querySignEnemy.toString())
                    .then(async (res) => {
                        const data = await res.json()
                        for (let i = 0; i < 3; i++) {
                            try {
                                enemyBalance.item(i).textContent = `${data.balance == null || data.balance.length == 0 ? calcAmountWithDecimals(fight.baseAmount, decimals) : calcAmountWithDecimals(data.balance, decimals)} ${token}`    
                            } catch (error) {
                                
                            }}
                        for (let i = 0; i < 3; i++) {
                            enemyKills.item(i).textContent = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                            enemyDeaths.item(i).textContent = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                        }
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
                const spanAbout = document.getElementsByClassName("close_modal_window")[1];
                const spanWaiting = document.getElementsByClassName("close_modal_window")[2];
                const spanConfirm = document.getElementsByClassName("close_modal_window")[3];
                const spanPending = document.getElementsByClassName("close_modal_window")[4];
                const spanEnemyFinishing = document.getElementsByClassName("close_modal_window")[5];
                const spanInstruction = document.getElementsByClassName("close_modal_window")[6];
                span.onclick = function () {
                    modal.style.display = "none";
                }
                spanAbout.onclick = () => {
                    document.getElementById('about_modal').style.display = 'none'
                }
                spanWaiting.onclick = () => {
                    document.getElementById('wainting_modal').style.display = 'none'
                }
                spanConfirm.onclick = () => {
                    document.getElementById('confirm_modal').style.display = 'none'
                }
                spanPending.onclick = () => {
                    document.getElementById('pending_modal').style.display = 'none'
                }
                spanEnemyFinishing.onclick = () => {
                    document.getElementById('enemy_finishing_game_modal').style.display = 'none'
                }
                spanInstruction.onclick = () => {
                    document.getElementById('instruction_modal').style.display = 'none'
                }
                btn.onclick = function () {
                    document.getElementById("sure_want_end").style.display = ''
                    modal.style.display = "block";
                    const _address = addressMaker(address)
                    document.getElementById('finish_modal_your_address').textContent = `${_address} `
                    // document.getElementById("yourStats").textContent = `
                    // ${_address} (you): ${yourKills.textContent} Kills, ${yourDeaths.textContent} Deaths
                    // `
                    const _deposit = calcAmountWithDecimals(fight.baseAmount, decimals)
                    const _yourWinLose = shortFloat(parseFloat(internalBalance.item(0).textContent) - parseFloat(_deposit))
                    const _elemyourAmountWinLose = document.getElementById("yourAmountWinLose")
                    if (_yourWinLose > 0) {
                        _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ${token}`
                        _elemyourAmountWinLose.className = 'green'
                    } else if (_yourWinLose == 0) {
                        _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ${token}`
                        _elemyourAmountWinLose.className = 'orange'
                    } else {
                        _elemyourAmountWinLose.textContent = `Lose ${_yourWinLose * (-1)} ${token}`
                        _elemyourAmountWinLose.className = 'red'
                    }
                    let _enemyAddress = address == fight.owner ? player2 : fight.owner
                    _enemyAddress = addressMaker(_enemyAddress);
                    document.getElementById('finish_modal_enemy_address').textContent = `${_enemyAddress} `
                    // document.getElementById("enemyStats").textContent = `
                    // ${_enemyAddress} (enemy): ${enemyKills.textContent} Kills, ${enemyDeaths.textContent} Deaths
                    // `
                    const _enemyWinLose = shortFloat(parseFloat(enemyBalance.item(0).textContent) - parseFloat(_deposit))
                    const _elemenemyAmountWinLose = document.getElementById("enemyAmountWinLose")
                    if (_enemyWinLose > 0) {
                        _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ${token}`
                        _elemenemyAmountWinLose.className = 'green'
                    } else if (_enemyWinLose == 0) {
                        _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ${token}`
                        _elemenemyAmountWinLose.className = 'orange'
                    } else {
                        _elemenemyAmountWinLose.textContent = `Lose ${_enemyWinLose * (-1)} ${token}`
                        _elemenemyAmountWinLose.className = 'red'
                    }
                    // internal_balance_return.textContent = `${document.getElementById("internalBalance").textContent} `
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
                window.location.href = `/?network=${network.chainid}`
                document.getElementById("loadingStage").style.display = ""
            }
        })
        .catch(err => window.location.href = `/?network=${network.chainid}`)
    } catch (error) {
        console.log(error)
    }
})

const Visible = function (target) {
    // Все позиции элемента
    let targetPosition = {
        top: window.pageYOffset + target.getBoundingClientRect().top,
        left: window.pageXOffset + target.getBoundingClientRect().left,
        right: window.pageXOffset + target.getBoundingClientRect().right,
        bottom: window.pageYOffset + target.getBoundingClientRect().bottom
        },
        // Получаем позиции окна
        windowPosition = {
        top: window.pageYOffset,
        left: window.pageXOffset,
        right: window.pageXOffset + document.documentElement.clientWidth,
        bottom: window.pageYOffset + document.documentElement.clientHeight
        };

    if (targetPosition.bottom > windowPosition.top && // Если позиция нижней части элемента больше позиции верхней чайти окна, то элемент виден сверху
        targetPosition.top < windowPosition.bottom && // Если позиция верхней части элемента меньше позиции нижней чайти окна, то элемент виден снизу
        targetPosition.right > windowPosition.left && // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
        targetPosition.left < windowPosition.right) { // Если позиция левой стороны элемента меньше позиции правой чайти окна, то элемент виден справа
        // Если элемент полностью видно, то запускаем следующий код
        document.getElementById('middle_your_stats').style.display = 'none'
        document.getElementById('middle_enemy_stats').style.display = 'none'
    } else {
        // Если элемент не видно, то запускаем этот код
        document.getElementById('middle_your_stats').style.display = ''
        document.getElementById('middle_enemy_stats').style.display = ''
    };
};
