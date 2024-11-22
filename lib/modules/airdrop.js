import { contractAbi, contractAddress } from "../contract.js"
import { airdropAbi, airdropAddress } from "./airdropContract.js"

const airDropModalOpen = document.getElementById("airdrop-modal-open")
if (airDropModalOpen.style.display !== 'none')  {
    const airDropModal = document.getElementById("airdrop_modal")
    const getFirstAirDropBtn = document.getElementById("get-first")
    const getPrizeAirDropBtn = document.getElementById("get-prize")
    const airDropGetFirstText = document.getElementById("airdrop-getfirst-text")
    const airDropGetPrizeText = document.getElementById("airdrop-getprize-text")
    const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    let signer;
    let airdropContract;
    let gameContract;
    let address;
    try {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner()
        airdropContract = new ethers.Contract(airdropAddress, airdropAbi, signer)
        gameContract = new ethers.Contract(contractAddress, contractAbi, signer)
        address = await signer.getAddress()
        const games = (await gameContract.getUserPastBattles(address)).length
        document.getElementById('airdrop-gamescounter').textContent = games
        const alreadyGetFirstTokens = await airdropContract.alreadyGetFirstTokens(address)
        const alreadyGetPrizeTokens = await airdropContract.alreadyGetTokens(address)
        if (alreadyGetFirstTokens === true) {
            getFirstAirDropBtn.disabled = true
            airDropGetFirstText.textContent = 'Done'
        }
        if (alreadyGetPrizeTokens === true) {
            getPrizeAirDropBtn.disabled = true
            airDropGetPrizeText.textContent = 'Done'
        }
    } catch (error) {
        console.error(error)
    }

    airDropModalOpen.onclick = async () => {
        airDropModal.style.display = "block"
    }

    spanAirDrop.onclick = function () {
        airDropModal.style.display = "none";
    }

    getFirstAirDropBtn.onclick = async () => {
        airDropGetFirstText.textContent = "Wait..."
        getFirstAirDropBtn.disabled = true
        let query = new URLSearchParams();
        query.append("address", address)
        fetch('/api/airdrop_first_sign?' + query.toString(), {method: 'post'})
            .then(async(res) => {
                const text = await res.text()
                if (text === 'Insufficient wallet tx history') {
                    airDropGetFirstText.textContent = 'Insufficient wallet tx history'
                } else if (text.includes('Already get')) {
                    airDropGetFirstText.textContent = 'Already get first tokens'
                } else {
                    airDropGetFirstText.textContent = text === 'Success' ? "Done" : 'Not successful'
                }
            })
            .catch(err => {
                console.log(err.message)
            })
    }

    getPrizeAirDropBtn.onclick = async () => {
        airDropGetPrizeText.textContent = "Wait..."
        getPrizeAirDropBtn.disabled = true
        let query = new URLSearchParams();
        query.append("address", address)
        fetch('/api/airdrop_second_sign?' + query.toString(), {method: 'post'})
            .then(async (res) => {
                const text = await res.text()
                if (text === 'Not enough battles') {
                    airDropGetPrizeText.textContent = 'Not enough battles'
                } else if (text === 'Insufficient wallet tx history') {
                    airDropGetPrizeText.textContent = 'Insufficient wallet tx history'
                } else if (text.includes('Already get')) { 
                    airDropGetPrizeText.textContent = 'Already get prize tokens'
                } else {
                    airDropGetPrizeText.textContent = text === 'Success' ? "Done" : 'Not successful'
                }
            })
            .catch((err) => {
                console.log(err.message)
            })
    }    
}