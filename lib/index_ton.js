import {TonConnectUI} from '@tonconnect/ui';

const main = async () => {
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Mycelium-Lab/FairFight/add_ton/lib/tonconnect-manifest.json',
        buttonRootId: 'connect'
    })
    async function connectToWallet() {
        const connectedWallet = await tonConnectUI.connectWallet()
        console.log(connectedWallet)
    }
    if (tonConnectUI.connected) {
        await connectToWallet().catch(error => { console.error("Error connecting to wallet:", error) })
    }

    //elements
    const connectButton = document.querySelector('#connect')
    const newGameModalOpener = document.querySelector('#btn_modal_window')
    const newGameModal = document.querySelector('#my_modal')
    const map = document.querySelector('#map')
    const numberOfPlayers = document.querySelector('#number-of-players')
    const amountPerRound = document.querySelector('#amountPerDeath')
    const amountOfRounds = document.querySelector('#amountToPlay')
    const createGameBtn = document.querySelector('#createGame')

    //actions
    createGameBtn.disabled = false
    connectButton.addEventListener('click', async () => {
        await connectToWallet().catch(error => { console.error("Error connecting to wallet:", error) })
    })
    newGameModalOpener.addEventListener('click', () => {
        newGameModal.style.display = 'flex'
    })
    createGameBtn.addEventListener('click', () => {
        const numberOfPlayersValue = numberOfPlayers.value
        const amountPerRoundValue = amountPerRound.value
        const amountOfRoundsValue = amountOfRounds.value
        const amountToPlay = BigInt(amountOfRoundsValue) * BigInt(amountPerRoundValue * 10**9)
        console.log(amountToPlay)
    })
}

main().catch(err => console.log(err))