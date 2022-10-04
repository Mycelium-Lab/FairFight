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
                console.log(battle.player1)
                console.log(battle.player2)
                const internalWallet = document.getElementById("internalWallet")
                internalWallet.textContent = `Your wallet: ` + address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
                let querySign = new URLSearchParams();
                querySign.append("address", address)
                fetch('/balance?' + querySign.toString())
                    .then(async (res) => {
                        const internalBalance = document.getElementById("internalBalance")
                        const data = await res.json()
                        internalBalance.textContent = `Your in-game balance: ${ethers.utils.formatEther(data.toString())} ETH`
                    })
                let querySignEnemy = new URLSearchParams()
                querySignEnemy.append("address", address == battle.player1 ? battle.player2 : battle.player1);
                fetch('/balance?' + querySignEnemy.toString())
                    .then(async (res) => {
                        const enemyBalance = document.getElementById("enemyBalance")
                        const data = await res.json()
                        enemyBalance.textContent = `Your enemy in-game balance: ${ethers.utils.formatEther(data.toString())} ETH`
                    })
                    // .catch((error) => window.location.href = '/')
                    .catch((error) => console.log(error))
                const canvas = document.getElementById("canvas")
                canvas.addEventListener('click', () => {
                    if (canvas.style.width == "70%"){
                        canvas.style.width = "480px"
                        canvas.style.height = "320px"
                    } else {
                        canvas.style.width = "70%"
                        canvas.style.height = "70%"
                    }
                    canvas.scrollIntoView()
                })
                document.getElementById("canvasLoad").style.display = "none"
            } else {
                document.getElementById("canvas").style.display = "none"
                document.getElementById("canvasLoad").style.display = ""
            }
        })
        .catch(err => window.location.href = '/')
})