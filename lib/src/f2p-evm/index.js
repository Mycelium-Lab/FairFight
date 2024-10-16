async function main() {
    const f2pEVMNetworkChainid = 999998
    const f2pEVMNetworkToken = 'FAIR'
    const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p-evm')
    const newGameModal = document.querySelector("#my_modal");
    const createGameBtnF2P = document.querySelector('#createGame-f2p-evm')
    newGameBtnF2P.addEventListener('click', () => openNewGameModal(newGameModal, f2pEVMNetworkToken, createGameBtnF2P))
    
}

function openNewGameModal(modal, token, createGameBtnF2P) {
    try {
        const tokensDividerNewgameModal = document.querySelector("#tokens-divider-newgame-modal")
        const tokensNewgameModal = document.querySelector("#tokens-newgame-modal")
        const tokensDivider = document.querySelector("#tokens-divider")
        const totalPrizePool = document.querySelector("#total-prize-pool-element")
        const yourDepositElement = document.querySelector("#your-deposit-element")
        const playerVisibleElement = document.querySelector('#player-visible-element')
        const amountPerRound = document.querySelector('#amountPerDeath')
        const createGameBtn = document.querySelector('#createGame')
        modal.style.display = "flex";
        tokensDividerNewgameModal.style.display = 'none'
        tokensNewgameModal.style.display = 'none'
        tokensDivider.style.display = 'none'
        totalPrizePool.style.display = 'none'
        yourDepositElement.style.display = 'none'
        playerVisibleElement.style.display = 'none'
        amountPerRound.placeholder = token
        createGameBtn.style.display = 'none'
        createGameBtnF2P.style.display = ''
        if (amountPerRound.value && !isNaN(amountPerRound.value) && amountPerRound.value > 0) {
            createGameBtnF2P.disabled = false
        }
        amountPerRound.addEventListener('input', (event) => {
            const value = event.target.value
            if (value && !isNaN(value) && value > 0) {
                createGameBtnF2P.disabled = false
            } else {
                createGameBtnF2P.disabled = true
            }
        })
    } catch (error) {
        console.log(error)
    }
}

main().catch(err => console.log(err))