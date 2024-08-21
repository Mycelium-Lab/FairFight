// require('buffer')
import {TonConnectUI} from '@tonconnect/ui';
import { beginCell, toNano, Address } from '@ton/ton'
import { openFightsTon } from './src/ton/openFights';

const main = async () => {
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Mycelium-Lab/FairFight/add_ton/lib/tonconnect-manifest.json',
        buttonRootId: 'connect'
    })
    let connectedWallet
    async function connectToWallet() {
        connectedWallet = await tonConnectUI.connectWallet()
        console.log(connectedWallet)
    }
    await connectToWallet().catch(error => { console.error("Error connecting to wallet:", error) })
    let address = Address.parseRaw(connectedWallet.account.address).toString()

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
    createGameBtn.addEventListener('click', async () => {
        const numberOfPlayersValue = numberOfPlayers.value
        const amountPerRoundValue = amountPerRound.value
        const amountOfRoundsValue = amountOfRounds.value
        const amountToPlay = BigInt(amountOfRoundsValue) * BigInt(amountPerRoundValue * 10**9)
        // transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
        // response_destination:MsgAddress custom_payload:(Maybe ^Cell)
        // forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
        // = InternalMsgBody;
        console.log(BigInt(amountPerRoundValue * 10**9))
        console.log(BigInt(amountOfRoundsValue), 257)
        console.log(BigInt(numberOfPlayersValue), 257)

        //create
        const body = beginCell()
            .storeUint(0x22FC5B29, 32)
            .storeCoins(BigInt(amountPerRoundValue * 10**9))
            .storeInt(BigInt(amountOfRoundsValue), 257)
            .storeInt(BigInt(numberOfPlayersValue), 257)
            .endCell();
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ').toString(),
                    amount: (amountToPlay + toNano(0.05)).toString(), 
                    payload: body.toBoc().toString("base64") 
                }
            ]
        }
        const result = await tonConnectUI.sendTransaction(transaction)
        console.log(result)

        
    })
    let fights = (await (await fetch('/ton/fights')).json()).fights
    console.log(fights)
    await openFightsTon(fights, address, tonConnectUI)
}

main().catch(err => console.log(err))