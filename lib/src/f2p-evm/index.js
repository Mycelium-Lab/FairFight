import { openFightsF2PEvm } from "./openFights";
import { pastFightsF2PEvm } from "./pastFights";

export async function mainF2PEvm(address, network, sign) {
    const f2pEVMNetworkChainid = 999998
    const f2pEVMNetworkToken = 'FAIR'
    const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p-evm')
    const newGameModal = document.querySelector("#my_modal");
    const createGameBtnF2P = document.querySelector('#createGame-f2p-evm')
    const amountPerRound = document.querySelector('#amountPerDeath')
    newGameBtnF2P.addEventListener('click', () => openNewGameModal(newGameModal, f2pEVMNetworkToken, createGameBtnF2P, amountPerRound))
    
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
    createGameBtnF2P.addEventListener('click', async () => await createGame(address, amountPerRound.value, f2pEVMNetworkChainid, f2pEVMNetworkToken, newGameModal, network, sign))
    
    let fights = (await (await fetch(`/f2p?chainid=${f2pEVMNetworkChainid}`)).json()).fights
    // console.log(fights)
    // let fights = [
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c1",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": null,
    //         "players_list": [
    //             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c12",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": null,
    //         "players_list": [
    //             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c13",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": null,
    //         "players_list": [
    //             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    //         ]
    //     }
    // ]
    setInterval(async () => {
        try {
            fights = (await (await fetch(`/f2p?chainid=${f2pEVMNetworkChainid}`)).json()).fights
            await openFightsF2PEvm(fights, address, network, sign)
        } catch (error) {
            console.log(error)
        }
    }, 7500)
    let pastFights = (await (await fetch('/f2p/pastfights'+`?player=${address.toLowerCase()}`+`&chainid=${f2pEVMNetworkChainid}`)).json()).fights
    // let pastFights = [
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c1",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c12",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c13",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c14",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c15",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c16",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     },
    //     {
    //         "gameid": "f2f27885-13ca-4c25-9217-a3aab19f45c17",
    //         "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //         "map": 0,
    //         "rounds": 1,
    //         "baseamount": "1000000000",
    //         "amountperround": "1000000000",
    //         "players": 2,
    //         "createtime": "1730841862861",
    //         "finishtime": "1730841992189",
    //         "statistics": [
    //             {
    //                 "player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    //                 "amount": "0",
    //                 "kills": 0,
    //                 "deaths": 1,
    //                 "remainingrounds": 0
    //             },
    //             {
    //                 "player": "0x71be63f3384f5fb98995898a86b02fb2426c5788",
    //                 "amount": "2000000000",
    //                 "kills": 1,
    //                 "deaths": 0,
    //                 "remainingrounds": 0
    //             }
    //         ]
    //     }
    // ]
    // document.querySelector('#opengames_empty-f2p').style.display = 'none'
    await openFightsF2PEvm(fights, address, network, sign)
    await pastFightsF2PEvm(pastFights, address)
    setTimeout(() => {
        const infos = document.querySelectorAll('[data-fight]')
        const infoModal = document.getElementById('info_modal')
        infos.forEach((info) => {
            info.addEventListener('click', async (ev) => {
            const fightId =  ev.target.dataset.fight
            infoModal.style.display = 'flex'
            localStorage.setItem('fight_id', fightId)
            await pastFightsF2PEvm(pastFights, address)
          })
        })
      }, 300)
    let queryBoard = new URLSearchParams();
    // queryBoard.append("initData", tgInitData)
    queryBoard.append("username", address)
    queryBoard.append("chainid", f2pEVMNetworkChainid)
    queryBoard.append("sign_evm", sign)
    const boardF2P = await fetch(`/f2p/board/?` + queryBoard.toString())
    const board = await boardF2P.json().then((data) => data).catch(err => {tokens: 0})
    try {
        document.querySelector('#f2p_balance__value').textContent = board.board.tokens
    } catch (error) {}
}

async function createGame(address, amountPerRound, f2pEVMNetworkChainid, f2pEVMNetworkToken, newGameModal, network, sign) {
    try {
        //TODO: signature
        const error_modal = document.getElementById("error_modal")
        const error_modal_text = document.getElementById("error_modal_text")
        const map = document.querySelector('#map-select-selecter').getAttribute('data-value')
        const numberOfRounds = document.querySelector('#rounds-select-selecter').getAttribute('data-value')
        const numberOfPlayers = document.querySelector('#players-select-selecter').getAttribute('data-value')

        const amountToPlay = BigInt(numberOfRounds) * BigInt(amountPerRound * 10**9)
        console.log(map, numberOfPlayers, numberOfRounds, amountToPlay)

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
                chainid: 999998,
                sign_evm: sign
            })
        })
        const responseStatus = res.status
        if (responseStatus == 200) {
            let fights = (await (await fetch('/f2p')).json()).fights
            await openFightsF2PEvm(fights, address)
            newGameModal.style.display = 'none'
        } else {
            error_modal.style.display = 'flex'
            error_modal_text.textContent = await res.text()
        }
        console.log(responseStatus)
    } catch (error) {
        console.log(error)
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
        const playerVisibleElementMobile = document.querySelector('#player-visible-mobile-element')
        const createGameBtn = document.querySelector('#createGame')
        modal.style.display = "flex";
        if (tokensDividerNewgameModal) tokensDividerNewgameModal.style.display = 'none';
        if (tokensNewgameModal) tokensNewgameModal.style.display = 'none';
        if (tokensDivider) tokensDivider.style.display = 'none';
        if (totalPrizePool) totalPrizePool.style.display = 'none';
        if (yourDepositElement) yourDepositElement.style.display = 'none';
        if (playerVisibleElement) playerVisibleElement.style.display = 'none';
        if (playerVisibleElementMobile) playerVisibleElementMobile.style.display = 'none';
        if (createGameBtn) createGameBtn.style.display = 'none';
        amountPerRound.placeholder = token
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
