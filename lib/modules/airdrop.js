const airDropModalOpen = document.getElementById("airdrop-modal-open")
const airDropModal = document.getElementById("airdrop_modal")
const getFirstAirDropBtn = document.getElementById("get-first")
const getPrizeAirDropBtn = document.getElementById("get-prize")
const airDropGetFirstText = document.getElementById("airdrop-getfirst-text")
const airDropGetPrizeText = document.getElementById("airdrop-getprize-text")
const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]

airDropModalOpen.onclick = function () {
    airDropModal.style.display = "block"
}

spanAirDrop.onclick = function () {
    airDropModal.style.display = "none";
}

getFirstAirDropBtn.onclick = () => {
    airDropGetFirstText.textContent = "Wait..."
    getFirstAirDropBtn.disabled = true
}