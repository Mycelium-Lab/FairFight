import { openFightsF2PEvm } from "./openFights";
import { pastFightsF2PEvm } from "./pastFights";

export async function mainF2PEvm(address, network, sign) {
    const f2pEVMNetworkChainid = 999998
    const f2pEVMNetworkToken = 'FAIR'
    // const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p-evm')
    const newGameModal = document.querySelector("#my_modal");
    const createGameBtnF2P = document.querySelector('#createGame-f2p-evm')
    const amountPerRound = document.querySelector('#amountPerDeath')
    // newGameBtnF2P.addEventListener('click', () => openNewGameModal(newGameModal, f2pEVMNetworkToken, createGameBtnF2P, amountPerRound))
    
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
    setInterval(async () => {
        try {
            fights = (await (await fetch(`/f2p?chainid=${f2pEVMNetworkChainid}`)).json()).fights
            await openFightsF2PEvm(fights, address, network, sign)
        } catch (error) {
            console.log(error)
        }
    }, 7500)
    let pastFights = (await (await fetch('/f2p/pastfights'+`?player=${address.toLowerCase()}`+`&chainid=${f2pEVMNetworkChainid}`)).json()).fights
    // document.querySelector('#opengames_empty-f2p').style.display = 'none'
    await openFightsF2PEvm(fights, address, network, sign)
    await pastFightsF2PEvm(pastFights, address)
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
        const map = document.querySelector('#map').value
        const numberOfRounds = document.querySelector('#amountToPlay').value
        const numberOfPlayers = document.querySelector('#number-of-players').value

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
        }
        console.log(responseStatus)
    } catch (error) {
        
    }
}

// function openNewGameModal(modal, token, createGameBtnF2P, amountPerRound) {
//     try {
//         const tokensDividerNewgameModal = document.querySelector("#tokens-divider-newgame-modal")
//         const tokensNewgameModal = document.querySelector("#tokens-newgame-modal")
//         const tokensDivider = document.querySelector("#tokens-divider")
//         const totalPrizePool = document.querySelector("#total-prize-pool-element")
//         const yourDepositElement = document.querySelector("#your-deposit-element")
//         const playerVisibleElement = document.querySelector('#player-visible-element')
//         const playerVisibleElementMobile = document.querySelector('#player-visible-mobile-element')
//         const createGameBtn = document.querySelector('#createGame')
//         modal.style.display = "flex";
//         tokensDividerNewgameModal.style.display = 'none'
//         tokensNewgameModal.style.display = 'none'
//         tokensDivider.style.display = 'none'
//         totalPrizePool.style.display = 'none'
//         yourDepositElement.style.display = 'none'
//         playerVisibleElement.style.display = 'none'
//         playerVisibleElementMobile.style.display = 'none'
//         amountPerRound.placeholder = token
//         createGameBtn.style.display = 'none'
//         createGameBtnF2P.style.display = ''
//         if (amountPerRound.value && !isNaN(amountPerRound.value) && amountPerRound.value > 0) {
//             createGameBtnF2P.disabled = false
//         }
//         amountPerRound.addEventListener('input', (event) => {
//             const value = event.target.value
//             if (value && !isNaN(value) && value > 0) {
//                 createGameBtnF2P.disabled = false
//             } else {
//                 createGameBtnF2P.disabled = true
//             }
//         })
//     } catch (error) {
//         console.log(error)
//     }
// }
