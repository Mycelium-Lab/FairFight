import { contractAbi, contractAddress } from './contract.js'

$(document).ready(async function () {
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
            console.log(data)
            if (data.r.length != 0) throw Error
            return await contract.battles(gameID)
        })
        .then(async (battle) => {
            if ((address == battle.player1 || address == battle.player2) && (battle.finished == false)) {
                const internalWallet = document.getElementById("internalWallet")
                const internalBalance = document.getElementById("internalBalance")
                const enemyBalance = document.getElementById("enemyBalance")
                internalWallet.textContent = `Your wallet: ` + address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
            } else {
                document.getElementById("canvas").style.display = "none"
                window.location.href = '/'
            }
        })
        .catch(err => window.location.href = '/')
})