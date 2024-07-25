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

  const accessToGame = () => {
    if(window.innerHeight > window.innerWidth && mobileAndTabletCheck()) {
        document.querySelector('#rotate_modal').style.display = 'flex'
        document.querySelector('#canvas-parent').style.display = 'none'
    }
    else if(window.innerHeight < window.innerWidth && mobileAndTabletCheck()){
        document.querySelector('#rotate_modal').style.display = 'none'
        document.querySelector('#canvas-parent').style.display = 'block'
    }
  }

  accessToGame()

window.addEventListener('resize', accessToGame)


let fullScreenOpen = false;
const closeFullScreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    } else if (window.webkitCancelFullScreen) {
        window.webkitCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } 
}
const openFullScreen = () => {
    var element = document.documentElement; // например, весь документ
    try {
        console.log(`requestFullscreen: ${element.requestFullscreen}`)
        console.log(`mozRequestFullScreen: ${element.mozRequestFullScreen}`)
        console.log(`webkitRequestFullscreen: ${element.webkitRequestFullscreen}`)
        console.log(`msRequestFullscreen: ${element.msRequestFullscreen}`)
        console.log(`window.webkitRequestFullscreen: ${window.webkitRequestFullscreen}`)
        console.log(`webkitEnterFullscreen: ${element.webkitEnterFullscreen}`)
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // для Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // для Chrome, Safari и Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // для Internet Explorer
            element.msRequestFullscreen();
        } else if (window.webkitRequestFullscreen) {
            window.webkitRequestFullscreen(element);
        } else if (element.webkitEnterFullscreen) {
            element.webkitEnterFullscreen()
        }
    } catch (error) {
        console.log(error)
    }
}
const fullScreen = () => {
    if (!fullScreenOpen) {
        openFullScreen()
        fullScreenOpen = true
        document.querySelector('#open-fullscreen-btn').style.display = 'none'
        document.querySelector('#close-fullscreen-btn').style.display = 'block'
    } else {
        closeFullScreen()
        fullScreenOpen = false
        document.querySelector('#open-fullscreen-btn').style.display = 'block'
        document.querySelector('#close-fullscreen-btn').style.display = 'none'
    }
}
let network = networks[networks.length - 1];
window.fullScreen = fullScreen
$(document).ready(async function () {
    try {
        const openFullScreenBtn = document.querySelector('#open-fullscreen-btn')
        openFullScreenBtn.addEventListener('click', fullScreen)
        const closeFullScreenBtn = document.querySelector('#close-fullscreen-btn')
        closeFullScreenBtn.addEventListener('click', fullScreen)
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
            const body = document.querySelector('body');
            const joystickBase = document.querySelector('#joystick-base')
            const joystickControl = document.querySelector('#joystick-control')
            // Flexible moving of joystick
            body.addEventListener('touchstart', function(event) {
                let touches = event.touches;
    
                if (touches.length > 0) {
                    let touch = touches[0];
                    let x = touch.clientX;
                    let y = touch.clientY;
                    if (touch.clientX < window.innerWidth / 2) {
                        joystickBase.style.left = `${parseInt(x) + joystick.radius}px`
                        joystickBase.style.top = `${parseInt(y)}px`
                        joystick.x = parseInt(x) + joystick.radius * 2
                        joystick.y = parseInt(y) + joystick.radius
                        joystickControl.style.left = `${parseInt(x) + joystick.inner_radius*3}px`
                        joystickControl.style.top = `${parseInt(y) + joystick.inner_radius}px`
                    }
                }
            });
        }
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
            if (e.keyCode == 123) { 
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
            let players = await contract.getFightPlayers(gameID)
            if (fight.playersAmount <= 2) {
                document.querySelector('#enemy-character__btn-prev').style.display = 'none'
                document.querySelector('#enemy-character__btn-next').style.display = 'none'
            }
            const player2 = players[1]
            const player3 = players[2]
            localStorage.setItem(`deposit_${network.chainid}_${gameID}`, fight.baseAmount.toString())
            localStorage.setItem('rounds', fight.rounds)
            if (
                players.includes(address)
                && 
                (fight.finishTime == 0)
                && 
                (fight.owner != ethers.constants.AddressZero && player2 != ethers.constants.AddressZero)
            ) {
                let querySign = new URLSearchParams();
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
                const yourDepTopBar = document.getElementById('yourDepTopBar')
                const enemyDepTopBar = document.getElementById('enemyDepTopBar')
                const yourDep = document.getElementById('yourDep')
                const enemyDep = document.getElementById('enemyDep')
                for (let i = 0; i < coinImg.length; i++) {
                    coinImg.item(i).src = tokenObject.srcBlack
                }
                fetch('/balance?' + querySign.toString())
                    .then(async (res) => {
                        const data = await res.json()
                        const realBalance = data.balance == null || data.balance.length == 0 ? fight.baseAmount : data.balance
                        localStorage.setItem('realBalance', realBalance)
                        localStorage.setItem('amountPerRound', fight.amountPerRound)
                        const balance = `${calcAmountWithDecimals(realBalance, decimals)} ${token}`  
                        const winLoseAmount = BigInt(realBalance.toString()) - BigInt(fight.baseAmount.toString())
                        const winLoseFloatAmount = shortFloat(calcAmountWithDecimals(winLoseAmount, decimals))
                        const winLoseElement = document.getElementById('yourAmountWinLose')
                        if (winLoseAmount > 0) {
                            winLoseElement.textContent = `Win: ${winLoseFloatAmount} ${token}`
                            winLoseElement.className = 'green'
                        } else if (winLoseAmount < 0) {
                            winLoseElement.textContent = `Lose: ${winLoseFloatAmount} ${token}`
                            winLoseElement.className = 'red'
                        } else {
                            winLoseElement.textContent = `Win: ${winLoseFloatAmount} ${token}`
                            winLoseElement.className = 'orange'
                        }
                        for (let i = 0; i < 3; i++) {
                            try {
                                internalBalance.item(i).textContent = balance
                            } catch (error) {
                                
                            }}
                        const rounds = document.getElementById("rounds_amount")
                        const _rounds = fight.rounds
                        const gameEndedRounds = Math.floor(_rounds - parseInt(data.remainingRounds == null ? _rounds : data.remainingRounds))
                        rounds.textContent =  `${gameEndedRounds}/${_rounds}`
                        console.log(`${gameEndedRounds}/${_rounds}`)
                        yourDepTopBar.textContent = balance
                        document.getElementById('finish_modal_your_address').textContent = addressMaker(address)
                        for (let i = 0; i < 3; i++) {
                            try {
                                yourKills.item(i).textContent = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                                yourDeaths.item(i).textContent = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                                const _deposit = calcAmountWithDecimals(fight.baseAmount, decimals)
                                yourDep.textContent = ` ${_deposit} ${token}`
                                enemyDep.textContent =  ` ${_deposit} ${token}`
                                yourDepTopBar.textContent = balance
                            } catch (error) {
                            }
                        }
                    })
                    .catch((error) => console.log(error))
                players = players.filter(v => v.toLowerCase() != address.toLowerCase())
                players.forEach(async (player) => {
                    let querySignEnemy = new URLSearchParams()
                    querySignEnemy.append("address", player);
                    querySignEnemy.append("gameID", gameID)
                    querySignEnemy.append("chainid", network.chainid)
                    fetch('/balance?' + querySignEnemy.toString())
                        .then(async (res) => {
                            const data = await res.json()
                            const balance = data.balance == null || data.balance.length == 0 ? calcAmountWithDecimals(fight.baseAmount, decimals) : calcAmountWithDecimals(data.balance, decimals)
                            const kills = data.kills == null || data.kills.length == 0 ? 0 : data.kills
                            const deaths = data.deaths == null || data.deaths.length == 0 ? 0 : data.deaths
                            const balanceNameEnemyWithAddress = `${player.toLowerCase()}_balance_${network.chainid}_${gameID}`
                            const killsNameEnemyWithAddress = `${player.toLowerCase()}_kills_${network.chainid}_${gameID}`
                            const deathsNameEnemyWithAddress = `${player.toLowerCase()}_deaths_${network.chainid}_${gameID}`
                            localStorage.setItem(balanceNameEnemyWithAddress, `${balance} ${token}`)
                            localStorage.setItem(killsNameEnemyWithAddress, kills)
                            localStorage.setItem(deathsNameEnemyWithAddress, deaths)
                            for (let i = 0; i < 3; i++) {
                                try {
                                    enemyBalance.item(i).textContent = `${balance} ${token}`    
                                    enemyDepTopBar.textContent =  `${balance} ${token}`
                                } catch (error) {}
                            }
                            for (let i = 0; i < 3; i++) {
                                try {
                                    enemyKills.item(i).textContent = kills
                                    enemyDeaths.item(i).textContent = deaths
                                } catch (error) {}
                            }
                        })
                        .catch((error) => console.log(error))
                })
                const modal = document.getElementById("over_modal");
                const finishGame = document.getElementById("confirm_finish");
                //const finishGameDesktop = document.getElementById('confirm_finish_desktop')
                const span = document.getElementsByClassName("close_modal_window")[0];
                //const spanAbout = document.getElementsByClassName("close_modal_window")[1];
                const spanWaiting = document.getElementsByClassName("close_modal_window")[2];
                const spanConfirm = document.getElementsByClassName("close_modal_window")[3];
                const spanPending = document.getElementsByClassName("close_modal_window")[4];
                const spanEnemyFinishing = document.getElementsByClassName("close_modal_window")[5];
                const spanInstruction = document.getElementsByClassName("close_modal_window")[6];
                const pauseBtn = document.querySelector('#pause-btn')
                const pauseModal = document.querySelector('#pause_modal')
                const openControlKeyMobile = document.querySelector('#open_control_keys')
                const controlKeyMobile = document.querySelector('#control_keys_mobile_modal')
                const openMapBtn = document.querySelector('#openMap-btn')
                const closeConfirmFinish = document.querySelector('#close_confirm_finish')
                //const closeConfirmFinishDesktop = document.querySelector('#close_confirm_finish_desktop')
                const closeInstructionModal = document.querySelector('#instruction_modal_close')
                const closeAboutModal = document.querySelector('#about_modal_close')
                const closeRotateModal = document.querySelector('#rotate_modal_close')
                const closeControlKeyMobile = document.querySelector("#close_control_keys_mobile_modal")
                const backMenu = document.querySelector('#back_menu')
                const noFinish = document.querySelector('#no_btn')

                span.onclick = function () {
                    modal.style.display = "none";
                    pauseModal.style.display = "close";
                }
                /*spanAbout.onclick = () => {
                    document.getElementById('about_modal').style.display = 'none'
                }*/
                // spanWaiting.onclick = () => {
                //     document.getElementById('wainting_modal').style.display = 'none'
                // }
                openControlKeyMobile.addEventListener('click', () => {
                    controlKeyMobile.style.display = 'flex'
                    pauseModal.style.display = 'none'
                })
                closeControlKeyMobile.addEventListener('click', () => {
                    controlKeyMobile.style.display = 'none'
                })
                backMenu.addEventListener('click', () => {
                    controlKeyMobile.style.display = 'none'
                    pauseModal.style.display = 'flex'
                })
               /* closeConfirmFinishDesktop.addEventListener('click', () => {
                    document.getElementById('confirm_finishgame_modal_desktop').style.display = 'none'
                })*/
                closeRotateModal.addEventListener('click', () => {
                    document.getElementById('rotate_modal').style.display = 'none'
                })
                closeAboutModal.addEventListener('click', () => {
                    document.getElementById('about_modal').style.display = 'none'
                }) 
                closeInstructionModal.onclick = () => {
                    document.getElementById('instruction_modal').style.display = 'none'
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
                openMapBtn.onclick = () => {
                    window.showMinimap = !window.showMinimap
                //     if( window.showMinimap) 
                //     {
                //       document.querySelector('#top_stats').style.visibility = 'hidden'
                //     }
                //     else {
                //       document.querySelector('#top_stats').style.visibility = 'visible'
                //     }
                }
                pauseBtn.onclick = () => {
                    pauseModal.style.display = 'flex'
                }
                document.querySelector('#close_pause_modal').addEventListener('click', () => {
                    pauseModal.style.display = 'none'
                })
                closeConfirmFinish.onclick = () => {
                    document.getElementById('confirm_finishgame_modal').style.display = 'none'
                }
                finishGame.onclick = function () {
                    pauseModal.style.display = 'none'
                    //const balance = document.querySelector('#balance-value')
                    //balance.textContent = `${internalBalance.item(0).textContent} (your in-game balance) will return to your wallet` 
                    document.getElementById('confirm_finishgame_modal').style.display = 'flex'
                }
                noFinish.onclick = function () {
                    pauseModal.style.display = 'flex'
                      document.getElementById('confirm_finishgame_modal').style.display = 'none'
                }
                document.querySelector('#wainting_modal_close_btn').addEventListener('click', () => {
                    document.getElementById('wainting_modal').style.display = 'none'
                })
                /*finishGameDesktop.onclick = function () {
                    const balance = document.querySelector('#balance-value')
                    balance.textContent = `${internalBalance.item(0).textContent} (your in-game balance) will return to your wallet` 
                    document.getElementById('confirm_finishgame_modal_desktop').style.display = 'flex'
                }*/
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    } else if (event.target == document.getElementById("wainting_modal")) {
                        // document.getElementById("wainting_modal").style.display = 'none'
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
        window.location.href = `/?network=${network.chainid}`
    }
})
