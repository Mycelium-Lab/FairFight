import { airdropAbi, airdropAddress } from "./airdropContract.js"

const airDropModalOpen = document.getElementById("airdrop-modal-open")
const airDropModal = document.getElementById("airdrop_modal")
const getFirstAirDropBtn = document.getElementById("get-first")
const getPrizeAirDropBtn = document.getElementById("get-prize")
const airDropGetFirstText = document.getElementById("airdrop-getfirst-text")
const airDropGetPrizeText = document.getElementById("airdrop-getprize-text")
const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
const provider = new ethers.providers.Web3Provider(window.ethereum)
let signer;
let airdropContract;
let address;
try {
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner()
    airdropContract = new ethers.Contract(airdropAddress, airdropAbi, signer)
    address = await signer.getAddress()
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
    fetch('/airdrop_first_sign?' + query.toString(), {method: 'post'})
        .then(async(res) => {
            const text = await res.text()
            airDropGetFirstText.textContent = text === 'Success' ? "Done" : 'Not successful'
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
    fetch('/airdrop_second_sign?' + query.toString(), {method: 'post'})
        .then(async (res) => {
            const text = await res.text()
            airDropGetPrizeText.textContent = text === 'Success' ? "Done" : 'Not successful'
        })
        .catch((err) => {
            console.log(err.message)
        })
}