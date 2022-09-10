import { contractAbi, contractAddress } from './contract.js'

$(document).ready(async function () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(contractAddress, contractAbi, signer)
    const gameID = window.location.search.slice(4)
    await contract.battles(gameID)
    .then(async (battle) => {
        if ((address == battle.player1 || address == battle.player2) && (battle.finished == false)) {
            
        } else {
            document.getElementById("canvas").style.display = "none"
            window.location.href = '/'
        }
    })
    .catch(err => window.location.href = '/')
})