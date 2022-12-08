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
} catch (error) {
    console.error(error)
}

// await signer.sendTransaction({from: address, to: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', value: '100000000000000000000'})

airDropModalOpen.onclick = function () {
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
    fetch('/airdrop_first_sign?' + query.toString())
        .then(async(res) => {
            const sign = await res.json()
            await airdropContract.withdrawFirstTime(sign.r, sign.v, sign.s)
                .then(async (tx) => {
                    return await tx.wait()
                })
                .then((wait) => {
                    airDropGetFirstText.textContent = "Done"
                })
                .catch((err) => {
                    alert(err.message)
                })
        })
        .catch(err => {
            alert(err.message)
        })
}