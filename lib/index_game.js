import { contractAbi, contractAddress } from './contract.js'

$(document).ready(async function () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(contractAddress, contractAbi, signer)
    const gameID = window.location.search.slice(4)
    const battle = await contract.battles(gameID)
    if (address == battle.player1 || address == battle.player2) {
        document.getElementById("finishGame").addEventListener('click', async () => {
            await contract.finishBattle()
        })
    } else {
        document.getElementById("canvas").style.display = "none"
        alert("You not player of this game")
    }
    
})