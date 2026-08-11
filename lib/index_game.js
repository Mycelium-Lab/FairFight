import { contractAbi } from './contract.js'
import { networks, rpcMapFor } from './modules/networks.js'
import { WalletTypes, addressMaker, calcAmountWithDecimals, getWalletTypeFromLocalStorage, mobileAndTabletCheck, shortFloat } from './src/utils/utils.js';
import { tokens } from './modules/tokens.js';
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { fullScreen, installJoystick, wireFullscreenButtons } from './game/ui-chrome.js';

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// Same predicate as lib/net/room-connection.js:32,40 - chain 0 is TON and
// 999999/999998 are the free-to-play pseudo-chains. Only the remaining ids have
// a wallet, a contract and an on-chain fight to read, so everything below that
// touches ethers is gated on this.
const isOnchainEvm = params.network != 0 && params.network != 999999 && params.network != 999998

const isMobile = mobileAndTabletCheck()

// main.js:339 binds the F key to window.fullScreen, and the engine can boot
// before $(document).ready runs, so publish it at module scope.
window.fullScreen = fullScreen

if (!isOnchainEvm) {
    // Telegram Mini App only: the TON build refuses to render in landscape.
    const checkOrientation = () => {
        if (isMobile && window.innerWidth > 500) {
            document.querySelector('.tg-rotate-popup').style.display = 'flex';
        } else {
            document.querySelector('.tg-rotate-popup').style.display = 'none';
        }
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
}

$(document).ready(async function () {
    try {
        try {
            document.querySelector('#pause_modal').style.display = 'none'
            document.querySelector('#ton_pause_modal').style.display = 'none'
            const closePauseModal = document.querySelector('#pause_modal_close')
            closePauseModal.addEventListener('click', () => {
                document.querySelector('#ton_pause_modal').style.display = 'none'
            })
        } catch (error) {
            console.log(error)
        }
        const canvas = document.getElementById("canvas")
        function disableTouchScroll(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        canvas.addEventListener('touchmove',disableTouchScroll)
        wireFullscreenButtons()
        if (isMobile) {
            // The TON build enters fullscreen unprompted; the EVM one waits for
            // the button. Preserved as-is.
            if (!isOnchainEvm) fullScreen()
            installJoystick()
        }

        const modal = document.getElementById("over_modal");
        const span = document.getElementsByClassName("close_modal_window")[0];
        const spanConfirm = document.getElementsByClassName("close_modal_window")[3];
        const spanPending = document.getElementsByClassName("close_modal_window")[4];
        const spanEnemyFinishing = document.getElementsByClassName("close_modal_window")[5];
        const spanInstruction = document.getElementsByClassName("close_modal_window")[6];
        const pauseModal = document.querySelector('#pause_modal')
        const controlKeyMobile = document.querySelector('#control_keys_mobile_modal')

        span.onclick = function () {
            modal.style.display = "none";
        }
        document.querySelector('#open_control_keys').addEventListener('click', () => {
            controlKeyMobile.style.display = 'flex'
            pauseModal.style.display = 'none'
        })
        document.querySelector("#close_control_keys_mobile_modal").addEventListener('click', () => {
            controlKeyMobile.style.display = 'none'
        })
        document.querySelector('#back_menu').addEventListener('click', () => {
            controlKeyMobile.style.display = 'none'
            pauseModal.style.display = 'flex'
        })
        document.querySelector('#rotate_modal_close').addEventListener('click', () => {
            document.getElementById('rotate_modal').style.display = 'none'
        })
        document.querySelector('#about_modal_close').addEventListener('click', () => {
            document.getElementById('about_modal').style.display = 'none'
        })
        document.querySelector('#instruction_modal_close').onclick = () => {
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
        document.querySelector('#openMap-btn').onclick = () => {
            window.showMinimap = !window.showMinimap
        }
        // Wire the minimap toggles exactly once each: two listeners on the same
        // button would toggle the flag twice per click and cancel out.
        document.querySelector('#map_ton_btn').addEventListener('click', () => {
            window.showMinimap = !window.showMinimap
        })
        document.querySelector('#pause-btn').onclick = () => {
            pauseModal.style.display = 'flex'
        }
        document.querySelector('#close_pause_modal').addEventListener('click', () => {
            pauseModal.style.display = 'none'
        })
        document.querySelector('#close_confirm_finish').onclick = () => {
            document.getElementById('confirm_finishgame_modal').style.display = 'none'
        }
        document.getElementById("confirm_finish").onclick = function () {
            pauseModal.style.display = 'none'
            document.getElementById('confirm_finishgame_modal').style.display = 'flex'
        }
        document.querySelector('#no_btn').onclick = function () {
            pauseModal.style.display = 'flex'
            document.getElementById('confirm_finishgame_modal').style.display = 'none'
        }
        document.querySelector('#wainting_modal_close_btn').addEventListener('click', () => {
            document.getElementById('wainting_modal').style.display = 'none'
        })
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

        if (!isOnchainEvm) return

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

        const network = networks.find(n => n.chainid == params.network)
        const gameID = params.ID
        const token = params.token
        const decimals = params.decimals
        const tokensList = tokens.find(v => v.chaindid == network.chainid)
        const tokenObject = tokensList.list.find(v => v.symbol === token)
        const walletType = getWalletTypeFromLocalStorage()

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
                rpcMap: rpcMapFor([503129905, 42262, 23294, 56]),
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
                // This HTTP seeding is NOT redundant with the socket update_balance
                // path: main.js:599 reads localStorage 'amountPerRound' and this is
                // its only writer on the EVM path (the TON and F2P lobbies write it
                // before navigating). Nothing in room-connection.js or main.js ever
                // sets it, and main.js:600 does BigInt(null) on a miss, which throws
                // out of playerDied before it can respawn the player.
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
            } else {
                document.getElementById("canvas").style.display = "none"
                window.location.href = `/?network=${network.chainid}`
                document.getElementById("loadingStage").style.display = ""
            }
        })
    } catch (error) {
        console.log(error)
    }
})
