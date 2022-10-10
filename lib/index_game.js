import { contractAbi, contractAddress } from './contract.js'


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
    const contract = new ethers.Contract(contractAddress, contractAbi, signer)
    const gameID = window.location.search.slice(4)
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
                return await contract.battles(gameID)
            }
        })
        .then(async (battle) => {
            if (
                (address == battle.player1 || address == battle.player2) 
                && (battle.finished == false)
                && (battle.player1 != '0x0000000000000000000000000000000000000000' && battle.player2 != '0x0000000000000000000000000000000000000000')
                ) {
                const internalWallet = document.getElementById("internalWallet")
                internalWallet.textContent = `Your wallet: ` + address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
                let querySign = new URLSearchParams();
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
                    if (canvas.style.width == "100vw"){
                        canvas.style.width = "480px"
                        canvas.style.height = "320px"
                    } else {
                        // canvas.style.width = "70%"
                        // canvas.style.height = "70%"
                        canvas.style.width = '100vw';
                        canvas.style.height = '100vh';
                    }
                    canvas.scrollIntoView()
                })
                // document.getElementById("loadingStage").style.display = "none"
                const modal = document.getElementById("confirmation_modal");
                const btn = document.getElementById("confirm_finish");
                const span = document.getElementsByClassName("close_modal_window")[0];
                btn.onclick = function () {
                    modal.style.display = "block";
                    internal_balance_return.textContent = `${document.getElementById("internalBalance").textContent} `
                }
                span.onclick = function () {
                    modal.style.display = "none";
                }
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            } else {
                document.getElementById("canvas").style.display = "none"
                document.getElementById("loadingStage").style.display = ""
            }
        })
        .catch(err => window.location.href = '/')
})