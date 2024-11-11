// require('buffer')
import {TonConnectUI} from '@tonconnect/ui';
import { beginCell, toNano, Address } from '@ton/ton'
import { openFightsTon } from './src/ton/openFights';
import { pastFightsTon } from './src/ton/pastFights';
import { openFightsF2P } from './src/f2p/openFights';
import { pastFightsF2P } from './src/f2p/pastFights';
import { findUniqueNewNftItem, shopTon } from './src/ton/shop';
import { addInventoryItem, getInventory, inventoryTon } from './src/ton/inventory';
import { InventoryTypes, shortFloat } from './src/utils/utils';

const mobileAndTabletCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

const isMobile = mobileAndTabletCheck()

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

    const error_modal = document.getElementById("error_modal")
    const error_modal_text = document.getElementById("error_modal_text")

    opengames_f2p.style.display = ''

    const f2p_text = document.querySelector('#f2p-text')
    document.querySelector('#opengames-f2p-btn').addEventListener('click', () => {
        opengames_f2p.style.display = ''
        pastgames_f2p.style.display = 'none'
    })
    document.querySelector('#pastgames-f2p-btn').addEventListener('click', () => {
        pastgames_f2p.style.display = ''
        opengames_f2p.style.display = 'none'
    })
    f2p_checker.addEventListener('change', (event) => {
        if (f2p_checker.checked == true) {
            f2p_text.textContent = 'free to play'
            games_checker.style.display = 'none'
            // opengames_empty.style.display = 'none'
            opengames.style.display = 'none'
            pastgames.style.display = 'none'
            // btnMobile.style.display = 'none'
            games_checker_f2p.style.display = ''
            // opengames_empty_f2p.style.display = ''
            opengames_f2p.style.display = ''
            pastgames_f2p.style.display = ''
            // btnMobileF2P.style.display = ''
        } else {
            f2p_text.textContent = 'pay to play'
            games_checker.style.display = ''
            // opengames_empty.style.display = ''
            opengames.style.display = ''
            pastgames.style.display = ''
            // btnMobile.style.display = ''
            games_checker_f2p.style.display = 'none'
            // opengames_empty_f2p.style.display = 'none'
            opengames_f2p.style.display = 'none'
            pastgames_f2p.style.display = 'none'
            // btnMobileF2P.style.display = 'none'
        }
    })
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Mycelium-Lab/FairFight/master/lib/tonconnect-manifest.json',
        buttonRootId: 'connect'
    })
    let address
    let username
    let chatid
    // localStorage.setItem('tonwallet', address)
    //elements
    const connectButton = document.querySelector('#connect')
    const newGameModalOpener = document.querySelector('#btn_modal_window')
    const newGameModal = document.querySelector('#my_modal')
    let tgInitData = null
    if (window.Telegram.WebApp.initData) { 
        tgInitData = window.Telegram.WebApp.initData
        const data = await getUsernameFromInitData(window.Telegram.WebApp.initData)
        username = data.username
        chatid = data.chatid

        // btnMobile.textContent = getUsernameFromInitData(window.Telegram.WebApp.initData)
    } else {
        username = localStorage.getItem('telegram_username')
    }
    const numberOfPlayers = document.querySelector('#players-select-selected')
    const amountPerRound = document.querySelector('#amountPerDeath')
    const amountOfRounds = document.querySelector('#rounds-select-selected')
    const createGameBtn = document.querySelector('#createGame')
    const totalPrizePool = document.getElementById("totalPrizePool")
    const yourDeposit = document.getElementById("yourDeposit")

    const observerNumberOfPlayer = new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            if (amountOfRounds.getAttribute('data-value') != '' && amountPerRound.value != '' && numberOfPlayers.getAttribute('data-value') != '') {
                const _amount = parseFloat(amountPerRound.value) * parseFloat(amountOfRounds.getAttribute('data-value'))
                const stringAmount = `${shortFloat(_amount * parseInt(numberOfPlayers.getAttribute('data-value')))} `
                totalPrizePool.textContent = stringAmount
                yourDeposit.textContent = `${shortFloat(_amount)}`
                yourDeposit.dataset.text = `${shortFloat(_amount)}`
                totalPrizePool.dataset.text = stringAmount
            } else {
                totalPrizePool.textContent = '-'
                yourDeposit.textContent = '-'
                yourDeposit.dataset.text = '-'
                totalPrizePool.dataset.text = '-'
            }
          }
        })
    })
    observerNumberOfPlayer.observe(numberOfPlayers, { attributes: true })
    const observerNumberOfRounds = new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            if (amountOfRounds.getAttribute('data-value') != '' && amountPerRound.value != '' && numberOfPlayers.getAttribute('data-value') != '') {
              const _amount = parseFloat(amountPerRound.value) * parseFloat(amountOfRounds.getAttribute('data-value'))
              const stringAmount = `${shortFloat(_amount * parseInt(numberOfPlayers.getAttribute('data-value')))} `
              totalPrizePool.textContent = stringAmount
              yourDeposit.textContent = `${shortFloat(_amount)} `
              yourDeposit.dataset.text = `${shortFloat(_amount)}`
              totalPrizePool.dataset.text = stringAmount
            } else {
              totalPrizePool.textContent = '-'
              yourDeposit.textContent = '-'
              yourDeposit.dataset.text = '-'
              totalPrizePool.dataset.text = '-'
            }
          }
        })
    })
    observerNumberOfRounds.observe(amountOfRounds, { attributes: true })
    amountPerRound.addEventListener('input', async () => {
    if (amountOfRounds.getAttribute('data-value') != '' && amountPerRound.value != '' && numberOfPlayers.getAttribute('data-value') != '') {
        const _amount = parseFloat(amountPerRound.value) * parseFloat(amountOfRounds.getAttribute('data-value'))
        const stringAmount = `${shortFloat(_amount * parseInt(numberOfPlayers.getAttribute('data-value')))} `
        totalPrizePool.textContent = stringAmount
        yourDeposit.textContent = `${shortFloat(_amount)} `
        yourDeposit.dataset.text = `${shortFloat(_amount)}`
        totalPrizePool.dataset.text = stringAmount
    } else {
        totalPrizePool.textContent = '-'
        yourDeposit.textContent = '-'
        yourDeposit.dataset.text = '-'
        totalPrizePool.dataset.text = '-'
    }
    });
    //actions
    createGameBtn.disabled = false;
    connectButton.addEventListener('click', async () => {
        // await connectToWallet().catch(error => { console.error("Error connecting to wallet:", error) })
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
        const numberOfPlayersValue = numberOfPlayers.getAttribute('data-value')
        const amountPerRoundValue = amountPerRound.value
        const amountOfRoundsValue = amountOfRounds.getAttribute('data-value')
        const amountToPlay = BigInt(amountOfRoundsValue) * BigInt(amountPerRoundValue * 10**9)
        const map = document.querySelector('#map-select-selected').getAttribute('data-value')
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
                    initData: tgInitData,
                    chainid: 999999
                })
            })
            const responseStatus = res.status
            if (responseStatus == 200) {
                let fights = (await (await fetch('/f2p')).json()).fights
                await openFightsF2P(fights, username)
                newGameModal.style.display = 'none'
            } else {
                error_modal.style.display = 'flex'
                error_modal_text.textContent = await res.text()
            }
            console.log(responseStatus)
        } 
    })
    let fightInterval
    const tonLoading = async () => {
        try {
            if (address) {
                createGameBtn.addEventListener('click', async () => {
                    const numberOfPlayersValue = numberOfPlayers.getAttribute('data-value')
                    const amountPerRoundValue = amountPerRound.value
                    const amountOfRoundsValue = amountOfRounds.getAttribute('data-value')
                    const amountToPlay = BigInt(amountOfRoundsValue) * BigInt(amountPerRoundValue * 10**9)
                    const map = document.querySelector('#map-select-selected').getAttribute('data-value')
                    if (!f2p_checker.checked) {
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
                                    amount: (amountToPlay + toNano(0.01)).toString(), 
                                    payload: body.toBoc().toString("base64") 
                                }
                            ]
                        }
                        const result = await tonConnectUI.sendTransaction(transaction)
                        await fetch('/ton/map', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({address, map})
                        })
                        if (result) {
                            newGameModal.style.display = 'none'
                            document.getElementById('pending_subtitle').textContent = 'We are checking your transaction, fight will appear in the list of open games. You can close this modal.'
                            document.getElementById('pending_modal').style.display = 'flex'
                        }
                    }
                })
                let fights = (await (await fetch('/ton/fights')).json()).fights
                fightInterval = setInterval(async () => {
                    try {
                        fights = (await (await fetch('/ton/fights')).json()).fights
                        await openFightsTon(fights, address, tonConnectUI, isTest ? contractAddressTest : contractAddress)
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
                await shopTon(address, isMobile, tonConnectUI)
                await inventoryTon(address)
            }
            await fetch('/ton/setaddress', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: tgInitData,
                    username,
                    address,
                    chatid
                })
            })
        } catch (error) {
            console.log(error)   
            clearInterval(fightInterval)
        }
    }
    try {
        address = Address.parse(JSON.parse(localStorage.getItem('ton-connect-storage_bridge-connection')).connectEvent.payload.items[0].address).toString()
        await tonLoading()
    } catch (error) {}
    tonConnectUI.onStatusChange(async (wallet) => {
        try {
            if (!address) {
                address = Address.parse(wallet.account.address).toString()
                window.location.reload()
                await tonLoading()
            }
        } catch (error) {
            console.log(error)
        }
    })
    await shopTon(address, isMobile, tonConnectUI)
    //MOCK DATA
    let fights = [
        {
            "gameid": "2fd327b6-e913-43e2-9e5f-84d95f03b0f81",
            "owner": "test",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 1,
            "createtime": "1730794556769",
            "finishtime": null,
            "players_list": [
                "test"
            ]
        },
        {
            "gameid": "2fd327b6-e913-43e2-9e5f-84d95f03b0f82",
            "owner": "test",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730794556769",
            "finishtime": null,
            "players_list": [
                "test"
            ]
        },
        {
            "gameid": "2fd327b6-e913-43e2-9e5f-84d95f03b0f83",
            "owner": "test",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 3,
            "createtime": "1730794556769",
            "finishtime": null,
            "players_list": [
                "test"
            ]
        },
    ]

    let pastFights = [
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b123177421",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774212",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774213",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774214",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774215",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774216",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774217",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
        {
            "gameid": "f7273a1e-4eb7-45f8-bb33-45b1231774218",
            "owner": "tester1",
            "map": 0,
            "rounds": 1,
            "baseamount": "1000000000",
            "amountperround": "1000000000",
            "players": 2,
            "createtime": "1730546111448",
            "finishtime": "1730546455021",
            "statistics": [
                {
                    "player": "test",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                },
                {
                    "player": "tester1",
                    "amount": "1000000000",
                    "kills": 0,
                    "deaths": 0,
                    "remainingrounds": 1
                }
            ]
        },
    ]

    let pastFightsTonArr = [
        {
            "gameid": 1,
            "player": "eqclaaeqx0zpuxatjuno4o0ysqfmifpck8duooeaeps_ysvu",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "0",
            "kills": 0,
            "deaths": 1,
            "remainingrounds": 0,
            "finishtime": "1730794942850",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 2,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 3,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 4,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 5,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 6,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 7,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 8,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 9,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        },
        {
            "gameid": 10,
            "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
            "token": "",
            "contract": "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
            "chainid": 0,
            "amount": "200000",
            "kills": 1,
            "deaths": 0,
            "remainingrounds": 0,
            "finishtime": "1730794942851",
            "rounds": 1,
            "amountperround": "100000",
            "baseamount": "100000"
        }
    ]
    let fightsTon = [
        {
            "id": "1",
            "owner": "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh",
            "createTime": "1730794782",
            "finishTime": "0",
            "baseAmount": "100000",
            "amountPerRound": "100000",
            "rounds": "1",
            "maxPlayersAmount": "2",
            "players": [
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh"
            ],
            "playersCurrentLength": "1",
            "playersClaimed": {
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh": false
            }
        },
        {
            "id": "2",
            "owner": "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh",
            "createTime": "1730794782",
            "finishTime": "0",
            "baseAmount": "100000",
            "amountPerRound": "100000",
            "rounds": "1",
            "maxPlayersAmount": "2",
            "players": [
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh"
            ],
            "playersCurrentLength": "1",
            "playersClaimed": {
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh": false
            }
        },
        {
            "id": "3",
            "owner": "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh",
            "createTime": "1730794782",
            "finishTime": "0",
            "baseAmount": "100000",
            "amountPerRound": "100000",
            "rounds": "1",
            "maxPlayersAmount": "2",
            "players": [
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh"
            ],
            "playersCurrentLength": "1",
            "playersClaimed": {
                "EQBFhrfdXERvFJUfTQyfSa-4vPftO4lRrJXfcWPysEbXF0uh": false
            }
        },
    ]
    await pastFightsTon(pastFightsTonArr, '')
    await openFightsTon(fightsTon, '', null, isTest ? contractAddressTest : contractAddress)
        // let fights = (await (await fetch('/f2p')).json()).fights
    // setInterval(async () => {
    //     try {
    //         fights = (await (await fetch('/f2p')).json()).fights
    //         await openFightsF2P(fights, username)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, 7500)
    // let pastFights = (await (await fetch('/f2p/pastfights'+`?player=${username}`)).json()).fights
    document.querySelector('#opengames_empty-f2p').style.display = 'none'
    
    await openFightsF2P(fights, 'username')
    await pastFightsF2P(pastFights, 'username')
    setTimeout(() => {
        const infos = document.querySelectorAll('[data-fight]')
        const infoModal = document.getElementById('info_modal')
        infos.forEach((info) => {
          info.addEventListener('click', async (ev) => {
            const fightId =  ev.target.dataset.fight
            infoModal.style.display = 'flex'
            localStorage.setItem('fight_id', fightId)
            await pastFightsF2P(pastFights, 'username')
          })
        })
      }, 300)
    let queryBoard = new URLSearchParams();
    queryBoard.append("initData", tgInitData)
    queryBoard.append("username", username)
    const boardF2P = await fetch(`/f2p/board/?` + queryBoard.toString())
    const board = await boardF2P.json().then((data) => data).catch(err => {tokens: 0})
    document.querySelector('#f2p_balance__value').textContent = board.board.tokens
    const f2pClaimNFTBtn = document.querySelector('#f2p_ton_claim_nft_btn')
    f2pClaimNFTBtn.addEventListener('click', async () => {
        if (!address) {
            error_modal.style.display = 'flex'
            error_modal_text.textContent = 'You need to connect wallet in the main menu to claim NFT'
        } else if (board.board.tokens < 150) {
            error_modal.style.display = 'flex'
            error_modal_text.textContent = 'Not enough FAIR tokens to claim NFT'
        } 
        else {
            document.getElementById('pending_subtitle').textContent = 'We are checking your transaction, NFT will appear in your inventory and wallet. You can close this modal.'
            document.getElementById('pending_modal').style.display = 'flex'
            const result = await fetch('/ton/mintnft', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    initData: tgInitData,
                    username,
                    address
                })
            })
            if (result.status != 200) { 
                document.getElementById('pending_modal').style.display = 'none'
                error_modal.style.display = 'flex'
                error_modal_text.textContent = await result.text() || 'Something went wrong'
            } else {
                const inventory = await getInventory(address)
                let checkerInterval = setInterval(async () => {
                    try {
                        const newInventory = await getInventory(address)
                        let newItem = findUniqueNewNftItem(inventory.nfts, newInventory.nfts)
                        if (newItem) {
                            let listItemId = "#left-inventory-characters-list"
                            if (newItem.collection === InventoryTypes.ARMORS) {
                                listItemId = "#left-inventory-armors-list"
                            }
                            if (newItem.collection === InventoryTypes.WEAPONS) {
                                listItemId = "#left-inventory-weapons-list"
                            }
                            if (newItem.collection === InventoryTypes.BOOTS) {
                                listItemId = "#left-inventory-boots-list"
                            }
                            const listItem = document.querySelector(listItemId)
                            const list = listItem.querySelectorAll('.item-list__slot')
                            const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 4)
                            addInventoryItem(listItemId, newItem, newItem.collection, address, 0, firstEmpty, newItem.address)
                            const successModal = document.querySelector('#new-success-modal')
                            const successModalText = document.querySelector('#new-success-modal-text')
                            const successModalLink = document.querySelector('#new-success-modal-link')
                            const successModalImg = document.querySelector('#new-success-modal-img')
                            successModalText.textContent = 'You have successfully purchased the NFT'
                            successModalLink.href = `#`
                            successModalImg.src = newItem.image
                            successModal.style.display = 'flex'
                            clearInterval(checkerInterval)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }, 20000)
            }
        }
    })
}

main().catch(err => console.log(err))

async function getUsernameFromInitData(initData) {
    // Создаем объект URLSearchParams, чтобы разобрать строку
    const params = new URLSearchParams(initData);

    // Получаем значение параметра "user"
    const userEncoded = params.get('user');
    let username = null
    let chatid = null

    if (userEncoded) {
        // Декодируем JSON-строку
        const userDecoded = decodeURIComponent(userEncoded);

        // Преобразуем строку в объект
        const userObj = JSON.parse(userDecoded);

        // Возвращаем значение username
        username = userObj.username;
        chatid = userObj.id
    }

    if (chatid) {
        try {
            await fetch('/ton/chatid', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatid,
                    username,
                    initData
                })
            })
        } catch (error) {
            console.log(error)
        }
    }

    return {username, chatid}
}