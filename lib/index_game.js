import { contractAbi } from './contract.js'
import { networks } from './modules/networks.js'
import { WalletTypes, addressMaker, calcAmountWithDecimals, getAccountFromLocalStorage, getWalletTypeFromLocalStorage, shortFloat } from './src/utils/utils.js';
import { tokens } from './modules/tokens.js';
import { characters } from './modules/characters.js';
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { JoyStick } from './game/joystick.js';

const mobileAndTabletCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };
let fullScreenOpen = false;
const closeFullScreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}
const openFullScreen = () => {
    var element = document.querySelector('#canvas'); // например, весь документ
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // для Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // для Chrome, Safari и Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // для Internet Explorer
            element.msRequestFullscreen();
        }
    } catch (error) {
        console.log(error)
    }
}
const fullScreen = () => {
    if (!fullScreenOpen) {
        openFullScreen()
        fullScreenOpen = true
    } else {
        closeFullScreen()
        fullScreenOpen = false
    }
}
let network = networks[networks.length - 1];
$(document).ready(async function () {
    try {
        const fullScreenBtn = document.querySelector('#fullscreen-btn')
        fullScreenBtn.addEventListener('click', fullScreen)
        let isMobile = mobileAndTabletCheck()
        const btnJump = document.querySelector('#jump-btn')
        const btnAttack = document.querySelector('#attack-btn')
        const btnLeft = document.querySelector('#left-btn')
        const btnRight = document.querySelector('#right-btn')
        if (isMobile) {
            btnAttack.style.display = ''
            const joystick = new JoyStick({
                radius: 40,
                x: 156,
                y: 335,
                inner_radius: 20,
                mouse_support: isMobile ? false : true
            })
            var touchstartEvent = new TouchEvent("touchstart", {
                bubbles: true,
                cancelable: true,
                view: window
            })
            var touchendEvent = new TouchEvent("touchend", {
                bubbles: true,
                cancelable: true,
                view: window
            })           
            function check() {
                try {
                    requestAnimationFrame( check )
                    
                    if ( joystick.up ) {       
                        btnJump.dispatchEvent(touchstartEvent)
                        btnLeft.dispatchEvent(touchendEvent)
                        btnRight.dispatchEvent(touchendEvent)
                    }
                    if ( joystick.left ) {
                        btnJump.dispatchEvent(touchendEvent)
                        btnLeft.dispatchEvent(touchstartEvent)
                        btnRight.dispatchEvent(touchendEvent)
                    }
                    if ( joystick.right ) {
                        btnJump.dispatchEvent(touchendEvent)
                        btnLeft.dispatchEvent(touchendEvent)
                        btnRight.dispatchEvent(touchstartEvent)
                    }
                    if ( joystick.base ) {
                        btnJump.dispatchEvent(touchendEvent)
                        btnLeft.dispatchEvent(touchendEvent)
                        btnRight.dispatchEvent(touchendEvent)
                    }
                } catch (error) {
                    
                }
            }
            check()
        }
        // if (!isMobile) {
        //     document.querySelector('#jump-btn').style.display = 'none'
        //     document.querySelector('#left-btn').style.display = 'none'
        //     document.querySelector('#shoot-btn').style.display = 'none'
        //     document.querySelector('#right-btn').style.display = 'none'
        // }
        // Получаем нужный элемент
        // let element = document.getElementById('top_stats');
        // // Запускаем функцию при прокрутке страницы
        // window.addEventListener('scroll', function() {
        //     Visible (element);
        // });

        // // А также запустим функцию сразу. А то вдруг, элемент изначально видно
        // Visible (element);
        let gameID;
        let token;
        let decimals;
        let walletType = getWalletTypeFromLocalStorage() 
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
        let provider
        let signer
        if (walletType === WalletTypes.INJECTED) {
            provider = new ethers.providers.Web3Provider(window.ethereum)
            window._provider = window.ethereum
        } else {
            const _provider = await EthereumProvider.init({
                projectId:'5b7fc1b6253c0650987fa946f2085162', // REQUIRED your projectId
                chains: [42262], // REQUIRED chain ids
                optionalChains: [23294, 503129905, 56],
                showQrModal: false, // REQUIRED set to "true" to use @walletconnect/modal,
                rpcMap: {
                  '503129905': 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
                  '42262': 'https://emerald.oasis.dev',
                  '23294': 'https://sapphire.oasis.io',
                  '56': 'https://bsc-dataseed.binance.org'
                },
                optionalMethods: ['wallet_switchEthereumChain'],
                optionalEvents: ['accountsChanged']
              })
            await _provider.enable()
            window._provider = _provider
            provider = new ethers.providers.Web3Provider(_provider)
        }
        signer = await provider.getSigner()
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
            // let player1Image = characters['0'].main
            // let player2Image = characters['0'].rival
            // if (network.chainid == 31337 || network.chainid == 503129905) {
            //     // const rawResponse = await fetch('/getinventory', {
            //     //     method: 'POST',
            //     //     headers: {
            //     //         'Accept': 'application/json',
            //     //         'Content-Type': 'application/json'
            //     //     },
            //     //     body: JSON.stringify({address, chainid: network.chainid})
            //     // });
            //     // const inventory = await rawResponse.json();
            //     // player1Image = characters[inventory.characterid.toString()].main
            //     // const rawResponse1 = await fetch('/getinventory', {
            //     //     method: 'POST',
            //     //     headers: {
            //     //         'Accept': 'application/json',
            //     //         'Content-Type': 'application/json'
            //     //     },
            //     //     body: JSON.stringify({address: address == fight.owner ? player2 : fight.owner, chainid: network.chainid})
            //     // });
            //     try { 
            //         // let queryCharacterImage = new URLSearchParams();
            //         // queryCharacterImage.append("address", address)
            //         // queryCharacterImage.append("chainid", network.chainid)
            //         // const rawResponse3 = await fetch('/getcharacterimage?' + queryCharacterImage)
            //         // player1Image = await rawResponse3.blob()
            //         // let queryCharacterImage2 = new URLSearchParams();
            //         // queryCharacterImage2.append("address", address == fight.owner ? player2 : fight.owner)
            //         // queryCharacterImage2.append("chainid", network.chainid)
            //         // const rawResponse4 = await fetch('/getcharacterimage?' + queryCharacterImage2)
            //         // player2Image = await rawResponse4.blob()

            //     } catch (error) {
            //         console.log(error)
            //     }
            //     // const inventory1 = await rawResponse1.json();
            //     // player2Image = characters[inventory1.characterid.toString()].rival
            // }
            // localStorage.setItem('rivaladdress', address == fight.owner ? player2 : fight.owner)
            // localStorage.setItem('playerimage', player1Image)
            // localStorage.setItem('player2image', player2Image)
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
                const yourDep = document.getElementById('yourDep')
                const enemyDep = document.getElementById('enemyDep')
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
                            try {
                                yourKills.item(i).textContent = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                                yourDeaths.item(i).textContent = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                                const _deposit = calcAmountWithDecimals(fight.baseAmount, decimals)
                                yourDep.textContent = `${_deposit} ${token}`
                                enemyDep.textContent =  `${_deposit} ${token}`
                            } catch (error) {
                                
                            }
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
                            try {
                                enemyKills.item(i).textContent = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                                enemyDeaths.item(i).textContent = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                            } catch (error) {
                                
                            }
                        }
                    })
                    // .catch((error) => window.location.href = '/')
                    .catch((error) => console.log(error))
                const canvas = document.getElementById("canvas")
                canvas.addEventListener('click', () => {
                    document.getElementsByClassName("rounds-head__subtitle")[0].scrollIntoView()
                })
                // canvas.addEventListener("contextmenu", () => {
                //     document.getElementById("confirm_finish").scrollIntoView()
                // })
                document.getElementById('full-screen')
                .addEventListener('click',() => {
                    canvas.style.height = '100vh';
                    canvas.scrollIntoView()
                })
                // document.getElementById("loadingStage").style.display = "none"
                const modal = document.getElementById("over_modal");
                // const btn = document.getElementById("confirm_finish");
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
                // btn.onclick = function () {
                //     document.getElementById("over_modal").style.display = 'flex'
                //     modal.style.display = "flex";
                //     const _address = addressMaker(address)
                //     document.getElementById('finish_modal_your_address').textContent = `${_address} `
                //     // document.getElementById("yourStats").textContent = `
                //     // ${_address} (you): ${yourKills.textContent} Kills, ${yourDeaths.textContent} Deaths
                //     // `
                //     const _deposit = calcAmountWithDecimals(fight.baseAmount, decimals)
                //     const _yourWinLose = shortFloat(parseFloat(internalBalance.item(0).textContent) - parseFloat(_deposit))
                //     const _elemyourAmountWinLose = document.getElementById("yourAmountWinLose")
                //     if (_yourWinLose > 0) {
                //         _elemyourAmountWinLose.textContent = `Win: ${_yourWinLose} ${token}`
                //         _elemyourAmountWinLose.className = 'green'
                //     } else if (_yourWinLose == 0) {
                //         _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ${token}`
                //         _elemyourAmountWinLose.className = 'orange'
                //     } else {
                //         _elemyourAmountWinLose.textContent = `Lose: ${_yourWinLose * (-1)} ${token}`
                //         _elemyourAmountWinLose.className = 'red'
                //     }
                //     let _enemyAddress = address == fight.owner ? player2 : fight.owner
                //     _enemyAddress = addressMaker(_enemyAddress);
                //     document.getElementById('finish_modal_enemy_address').textContent = `${_enemyAddress} `
                //     // document.getElementById("enemyStats").textContent = `
                //     // ${_enemyAddress} (enemy): ${enemyKills.textContent} Kills, ${enemyDeaths.textContent} Deaths
                //     // `
                //     const _enemyWinLose = shortFloat(parseFloat(enemyBalance.item(0).textContent) - parseFloat(_deposit))
                //     const _elemenemyAmountWinLose = document.getElementById("enemyAmountWinLose")
                //     if (_enemyWinLose > 0) {
                //         _elemenemyAmountWinLose.textContent = `Win: ${_enemyWinLose} ${token}`
                //         _elemenemyAmountWinLose.className = 'green'
                //     } else if (_enemyWinLose == 0) {
                //         _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ${token}`
                //         _elemenemyAmountWinLose.className = 'orange'
                //     } else {
                //         _elemenemyAmountWinLose.textContent = `Lose: ${_enemyWinLose * (-1)} ${token}`
                //         _elemenemyAmountWinLose.className = 'red'
                //     }
                //     // internal_balance_return.textContent = `${document.getElementById("internalBalance").textContent} `
                // }
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
        // .catch(err => window.location.href = `/?network=${network.chainid}`)
    } catch (error) {
        console.log(error)
        // window.location.href = `/?network=${network.chainid}`
    }
})

// const Visible = function (target) {
//     // Все позиции элемента
//     let targetPosition = {
//         top: window.pageYOffset + target.getBoundingClientRect().top,
//         left: window.pageXOffset + target.getBoundingClientRect().left,
//         right: window.pageXOffset + target.getBoundingClientRect().right,
//         bottom: window.pageYOffset + target.getBoundingClientRect().bottom
//         },
//         // Получаем позиции окна
//         windowPosition = {
//         top: window.pageYOffset,
//         left: window.pageXOffset,
//         right: window.pageXOffset + document.documentElement.clientWidth,
//         bottom: window.pageYOffset + document.documentElement.clientHeight
//         };

//     if (targetPosition.bottom > windowPosition.top && // Если позиция нижней части элемента больше позиции верхней чайти окна, то элемент виден сверху
//         targetPosition.top < windowPosition.bottom && // Если позиция верхней части элемента меньше позиции нижней чайти окна, то элемент виден снизу
//         targetPosition.right > windowPosition.left && // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
//         targetPosition.left < windowPosition.right) { // Если позиция левой стороны элемента меньше позиции правой чайти окна, то элемент виден справа
//         // Если элемент полностью видно, то запускаем следующий код
//         document.getElementById('middle_your_stats').style.display = 'none'
//         document.getElementById('middle_enemy_stats').style.display = 'none'
//     } else {
//         // Если элемент не видно, то запускаем этот код
//         document.getElementById('middle_your_stats').style.display = ''
//         document.getElementById('middle_enemy_stats').style.display = ''
//     };
// };
