// require('buffer')
import {TonConnectUI} from '@tonconnect/ui';
import { beginCell, toNano, Address } from '@ton/ton'
import { openFightsTon } from './src/ton/openFights';
import { pastFightsTon } from './src/ton/pastFights';
import { openFightsF2P } from './src/f2p/openFights';

const contractAddressTest = 'EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ'
const contractAddress =  'EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ'
const isTest = false

const main = async () => {
    const btnMobile = document.getElementById("btn_modal_window_mobile");
    const btnMobileF2P = document.getElementById("btn_modal_window_mobile_f2p");

    const f2p_checker = document.querySelector('#f2p_checker')
    const games_checker = document.querySelector('#games_checker')
    const opengames_empty = document.querySelector('#opengames-empty')
    const opengames = document.querySelector('#opengames')
    const pastgames = document.querySelector('#pastgames')

    const games_checker_f2p = document.querySelector('#games_checker-f2p')
    const opengames_empty_f2p = document.querySelector('#opengames-empty-f2p')
    const opengames_f2p = document.querySelector('#opengames-f2p')
    const pastgames_f2p = document.querySelector('#pastgames-f2p')

    const f2p_text = document.querySelector('#f2p-text')
    f2p_checker.addEventListener('change', (event) => {
        if (f2p_checker.checked == true) {
            f2p_text.textContent = 'free to play'
            games_checker.style.display = 'none'
            // opengames_empty.style.display = 'none'
            opengames.style.display = 'none'
            pastgames.style.display = 'none'
            btnMobile.style.display = 'none'
            games_checker_f2p.style.display = ''
            // opengames_empty_f2p.style.display = ''
            opengames_f2p.style.display = ''
            pastgames_f2p.style.display = ''
            btnMobileF2P.style.display = ''
        } else {
            f2p_text.textContent = 'pay to play'
            games_checker.style.display = ''
            // opengames_empty.style.display = ''
            opengames.style.display = ''
            pastgames.style.display = ''
            btnMobile.style.display = ''
            games_checker_f2p.style.display = 'none'
            // opengames_empty_f2p.style.display = 'none'
            opengames_f2p.style.display = 'none'
            pastgames_f2p.style.display = 'none'
            btnMobileF2P.style.display = 'none'
        }
    })
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Mycelium-Lab/FairFight/add_ton/lib/tonconnect-manifest.json',
        buttonRootId: 'connect'
    })
    let address
    let username = 'test'
    // let connectedWallet
    // async function connectToWallet() {
    //     connectedWallet = await tonConnectUI.connectWallet()
    //     console.log(connectedWallet)
    // }
    // await connectToWallet().catch(error => { console.error("Error connecting to wallet:", error) })
    // let address = Address.parseRaw(connectedWallet.account.address).toString()
    // localStorage.setItem('tonwallet', address)
    //elements
    const connectButton = document.querySelector('#connect')
    const newGameModalOpener = document.querySelector('#btn_modal_window')
    const newGameModal = document.querySelector('#my_modal')
    if (window.Telegram.WebApp.initData) { 
        username = getUsernameFromInitData(window.Telegram.WebApp.initData)
        // btnMobile.textContent = getUsernameFromInitData(window.Telegram.WebApp.initData)
    }
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
    btnMobile.addEventListener('click', () => {
        newGameModal.style.display = 'flex'
    })
    btnMobileF2P.addEventListener('click', () => {
        newGameModal.style.display = 'flex'
    })
    createGameBtn.addEventListener('click', async () => {
        const numberOfPlayersValue = numberOfPlayers.value
        const amountPerRoundValue = amountPerRound.value
        const amountOfRoundsValue = amountOfRounds.value
        const amountToPlay = BigInt(amountOfRoundsValue) * BigInt(amountPerRoundValue * 10**9)
        const map = document.querySelector('#map').value
        if (f2p_checker.checked) {
            const res = await fetch('/f2p/create', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    owner: username,
                    map,
                    rounds: amountOfRoundsValue,
                    baseAmount: amountToPlay.toString(),
                    amountPerRound: (amountPerRoundValue * 10**9).toString(),
                    players: numberOfPlayersValue,
                })
            })
            const responseStatus = res.status
            console.log(responseStatus)
        } else {
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
                        address: Address.parse(isTest ? contractAddressTest : contractAddress).toString(),
                        amount: (amountToPlay + toNano(0.05)).toString(), 
                        payload: body.toBoc().toString("base64") 
                    }
                ]
            }
            const result = await tonConnectUI.sendTransaction(transaction)
        }
    })
    if (address) {
        let fights = (await (await fetch('/ton/fights')).json()).fights
        setInterval(async () => {
            try {
                fights = (await (await fetch('/ton/fights')).json()).fights
                await openFightsTon(fights, address, tonConnectUI)
            } catch (error) {
                console.log(error)
            }
        }, 7500)
        let queryStats = new URLSearchParams();
        queryStats.append("address", address)
        queryStats.append("chainid", 0)
        let pastFights = (await (await fetch('/statistics/all/?' + queryStats.toString())).json())
        await pastFightsTon(pastFights, address)
        await openFightsTon(fights, address, tonConnectUI, isTest ? contractAddressTest : contractAddress)
    } else {
        let fights = (await (await fetch('/f2p')).json()).fights
        await openFightsF2P(fights, username)
    }
}

main().catch(err => console.log(err))

function getUsernameFromInitData(initData) {
    // Создаем объект URLSearchParams, чтобы разобрать строку
    const params = new URLSearchParams(initData);

    // Получаем значение параметра "user"
    const userEncoded = params.get('user');
    
    if (userEncoded) {
        // Декодируем JSON-строку
        const userDecoded = decodeURIComponent(userEncoded);

        // Преобразуем строку в объект
        const userObj = JSON.parse(userDecoded);

        // Возвращаем значение username
        return userObj.username;
    }

    return null; // Если username не найден
}