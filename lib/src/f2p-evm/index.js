async function main(address) {
    address = '0x0000000000000000000000000000000000000000'
    const f2pEVMNetworkChainid = 999998
    const f2pEVMNetworkToken = 'FAIR'
    const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p-evm')
    const newGameModal = document.querySelector("#my_modal");
    const createGameBtnF2P = document.querySelector('#createGame-f2p-evm')
    const amountPerRound = document.querySelector('#amountPerDeath')
    newGameBtnF2P.addEventListener('click', () => openNewGameModal(newGameModal, f2pEVMNetworkToken, createGameBtnF2P, amountPerRound))
    createGameBtnF2P.addEventListener('click', async () => await createGame(address, amountPerRound.value, f2pEVMNetworkChainid, f2pEVMNetworkToken, newGameModal))
}

async function createGame(address, amountPerRound, f2pEVMNetworkChainid, f2pEVMNetworkToken, newGameModal) {
    try {
        //TODO: signature
        const map = document.querySelector('#map').value
        const numberOfRounds = document.querySelector('#amountToPlay').value
        const numberOfPlayers = document.querySelector('#number-of-players').value

        const amountToPlay = BigInt(numberOfRounds) * BigInt(amountPerRound * 10**9)

        const res = await fetch('/f2p/create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: address,
                map,
                rounds: numberOfRounds,
                baseAmount: amountToPlay.toString(),
                amountPerRound: (amountPerRound * 10**9).toString(),
                players: numberOfPlayers,
                chainid: 999998
            })
        })
        const responseStatus = res.status
        if (responseStatus == 200) {
            // let fights = (await (await fetch('/f2p')).json()).fights
            // await openFightsF2P(fights, username)
            newGameModal.style.display = 'none'
        }
        console.log(responseStatus)
    } catch (error) {
        
    }
}

function openNewGameModal(modal, token, createGameBtnF2P, amountPerRound) {
    try {
        const tokensDividerNewgameModal = document.querySelector("#tokens-divider-newgame-modal")
        const tokensNewgameModal = document.querySelector("#tokens-newgame-modal")
        const tokensDivider = document.querySelector("#tokens-divider")
        const totalPrizePool = document.querySelector("#total-prize-pool-element")
        const yourDepositElement = document.querySelector("#your-deposit-element")
        const playerVisibleElement = document.querySelector('#player-visible-element')
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