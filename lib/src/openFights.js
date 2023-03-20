import {addressMaker} from './pastFights.js'
const displayCreateGame = () => {
    document.getElementById("btn_modal_window").style.display = ''
}
export const openFightsFunc = async (address, contract, network) => {
    let openBattles = []
    openBattles = await contract.getChunkFights(0, 10).then(f => f).catch(err => [])
    // openBattles = [...openBattles, await contract.getChunkFights(10, 10).then(f => f).catch(err => [])]
    // openBattles = [...openBattles, await contract.getChunkFights(20, 10).then(f => f).catch(err => [])]
    // openBattles = [...openBattles, await contract.getChunkFights(30, 10).then(f => f).catch(err => [])]
    // openBattles = [...openBattles, await contract.getChunkFights(40, 10).then(f => f).catch(err => [])]
    openBattles = openBattles.filter(v => v.owner != ethers.constants.AddressZero && v.finishTime == 0)
    const modalConfirm = document.getElementById("confirmation_modal")
    const modalPending = document.getElementById("pending_modal")
    const error_modal = document.getElementById("error_modal")
    const error_modal_text = document.getElementById("error_modal_text")
    let opengames = document.getElementById("opengames")
    let openGamesList = document.getElementById("opengames-list")
    if (openGamesList.children.length == 1) {
      document.getElementById("opengames_empty").style.display = '';
      opengames.classList.add('empty')
    } else {
      document.getElementById("opengames_empty").style.display = 'none';
      opengames.classList.remove('empty')
    }
    //get ids of games in list on site
    const openGamesListArray = [...Array.from(openGamesList.children).map(e => e.value)]
    //get ids of of open games
    const openBattlesIDs = [...openBattles.map(e => parseInt(e.ID.toString()))]
    //check if exist games that still in list on site but not in opengames in contract
    const gamesToDelete = openGamesListArray.filter((v1) => !openBattlesIDs.includes(v1))
    //delete games from site if they not in open games in contract
    openBattles.forEach(v => {
      if (v.owner != address) {
        let alreadyExistHere = false
        for (let i = 0; i < openGamesList.children.length; i++) {
          if (v.ID == openGamesList.children[i].getAttribute("value")) {
            alreadyExistHere = true
            break;
          }
        }
        if (alreadyExistHere == false) {
          let li = document.createElement('div')
          let input = document.createElement('input')
          input.type = 'hidden'
          input.value = v.ID.toString()
          input.className = 'id'
          li.appendChild(input)
          li.className = 'games__row'
          li.id = `openbattle_${v.ID.toString()}`
          li.setAttribute('value', v.ID.toString())
          let button = document.createElement("button")
          button.value = v.ID.toString()
          button.textContent = "Join"
          button.className = 'btn opengames__btn'
          button.addEventListener('click', async (event) => {
            const amountToPlay = v.baseAmount
            modalConfirm.style.display = 'block'
            await contract.join(event.target.value, {value: amountToPlay.toString()})
            .then(async (tx) => {
              modalConfirm.style.display = 'none'
              modalPending.style.display = 'block'
              await tx.wait().then(() => {
                modalPending.style.display = 'none'
                let query = new URLSearchParams();
                query.append("ID", event.target.value)
                query.append("network", network.chainid)
                window.location.href = "/game?" + query.toString();
              })
            })
            .catch(err => {
              modalConfirm.style.display = 'none'
              modalPending.style.display = 'none'
              const msg = err.reason === undefined ? err.data.message : err.reason
              if (msg != undefined) {
                if (msg.includes("Wrong amount")) {
                  error_modal.style.display = 'block'
                  error_modal_text.textContent = `Wrong amount`
                }
                if (msg.includes("You have open fight")) {
                  error_modal.style.display = 'block'
                  error_modal_text.textContent = `You already have open fight`
                }
                if (msg.includes("Fight is over")) {
                  error_modal.style.display = 'block'
                  error_modal_text.textContent = `Fight is over`
                }
                if (msg.includes("Fight is full")) {
                  error_modal.style.display = 'block'
                  error_modal_text.textContent = `Fight is full of players`
                }
              } 
              try {
                if (err.data.message.includes("out of fund")){
                  const error_modal = document.getElementById("error_modal")
                  const error_modal_text = document.getElementById("error_modal_text")
                  error_modal.style.display = 'block'
                  error_modal_text.textContent = `Out of fund`
                }
              } catch (error) {
                console.error(error)
              }
            })
          })
          const addressPlayer1 = addressMaker(v.owner);
          const headerDiv = document.createElement('div')
          headerDiv.className = `games__item`
          const pID = document.createElement('p')
          const pIDData = document.createElement('span')
          pID.textContent = 'id: '
          pIDData.textContent = `${v.ID.toString()}`
          pID.appendChild(pIDData)
          const pCreator = document.createElement('p')
          const pCreatorData = document.createElement('a')
          pCreator.textContent = 'Creator: '
          pCreatorData.target = "_blank"
          pCreatorData.href = `${network.explorer}/address/${v.owner}`
          pCreatorData.textContent = `${addressPlayer1}`
          pCreatorData.className = 'active'
          pCreator.appendChild(pCreatorData)
          const pMap = document.createElement('p')
          const pMapData = document.createElement('span')
          pMap.textContent = 'Map: '
          pMapData.textContent = `Steel plant`
          pMapData.classList.add("active")
          pMapData.classList.add("map-show")
          pMap.appendChild(pMapData)
          headerDiv.appendChild(pID)
          headerDiv.appendChild(pCreator)
          headerDiv.appendChild(pMap)
          const currentBattleRoundsElem = document.createElement('p')
          const rounds = v.rounds
          currentBattleRoundsElem.textContent = `Current round: ${0}/${rounds}`
          currentBattleRoundsElem.className = `right active`
          headerDiv.appendChild(currentBattleRoundsElem)
          const middleDiv = document.createElement('div')
          const middleDivP = document.createElement('p')
          const middleDivSpan = document.createElement('span')
          middleDivP.textContent = 'Status: '
          middleDivSpan.id = `mygame_status`
          middleDivSpan.textContent = `Waiting for an opponent`
          middleDivP.appendChild(middleDivSpan)
          middleDiv.appendChild(middleDivP)
          middleDiv.className = 'games__item'
          const bottomDiv = document.createElement('div')
          bottomDiv.className = 'games__item'
          const betPerRoundP = document.createElement('p')
          betPerRoundP.textContent = 'Bet per round: '
          const betPerRound = document.createElement('span')
          betPerRound.id = `bet_per_round`
          betPerRoundP.appendChild(betPerRound)
          const amountDepositOrClaimP = document.createElement('P')
          amountDepositOrClaimP.textContent = 'To deposit: '
          const amountDepositOrClaim = document.createElement('span')
          amountDepositOrClaim.id = `amount_deposit_or_claim`
          amountDepositOrClaimP.appendChild(amountDepositOrClaim)
          bottomDiv.appendChild(betPerRoundP)
          bottomDiv.appendChild(amountDepositOrClaimP)
          betPerRound.textContent = `${ethers.utils.formatEther(v.amountPerRound)} ROSE`
          amountDepositOrClaim.textContent = `${ethers.utils.formatEther(v.baseAmount)} ROSE`
          li.appendChild(headerDiv)
          li.appendChild(middleDiv)
          li.appendChild(bottomDiv)
          li.appendChild(button)
          openGamesList.appendChild(li)
        }
      }
    })
    let currentBattleID = await contract.lastPlayerFight(address)
    let currentBattle = await contract.fights(currentBattleID)
    let playerClaimed = await contract.playerClaimed(address, currentBattleID)
    let players = await contract.getFightPlayers(currentBattleID)
    let player2 = players[1]
    try {
      gamesToDelete.forEach((e) => {
        if (e != null & e != currentBattle.ID.toString()) {
          openGamesList.removeChild(document.getElementById(`openbattle_${e.toString()}`))
        }
      })
    } catch (error) {
      console.error(error)
    }
    let checker = playerClaimed == false && (currentBattle.owner == address || player2 == address);
    if (player2 === undefined && currentBattle.finishTime != 0) {
      checker = false;
    }
    if (checker) {
        let alreadyExistHere = false;
      for (let i = 0; i < openGamesList.children.length; i++) {
        // console.log(openGamesList.children[i].)
        if (currentBattle.ID == openGamesList.children[i].getAttribute("value")) {
          alreadyExistHere = true
          const games__item = document.getElementsByClassName('games__item')[2]
          games__item.lastChild.id = 'amount_deposit_or_claim_p'
          break;
        }
      }
      if (alreadyExistHere == false) {
        let li = document.createElement('div')
        li.className = 'games__row'
        li.id = `openbattle_${currentBattle.ID.toString()}`
        li.value = currentBattle.ID
        li.setAttribute('value', currentBattle.ID.toString())
        const addressPlayer1 = addressMaker(currentBattle.owner);
        const headerDiv = document.createElement('div')
        headerDiv.className = `games__item`
        const pID = document.createElement('p')
        const pIDData = document.createElement('span')
        pID.textContent = 'id: '
        pIDData.textContent = `${currentBattle.ID.toString()}`
        pID.appendChild(pIDData)
        const pCreator = document.createElement('p')
        const pCreatorData = document.createElement('a')
        pCreator.textContent = 'Creator: '
        pCreatorData.target = "_blank"
        pCreatorData.href = `${network.explorer}/address/${currentBattle.owner}`
        pCreatorData.textContent = `${addressPlayer1}`
        pCreatorData.className = 'active'
        pCreator.appendChild(pCreatorData)
        const pMap = document.createElement('p')
        const pMapData = document.createElement('span')
        pMap.textContent = 'Map: '
        pMapData.textContent = `Steel plant`
        pMapData.classList.add("active")
        pMapData.classList.add("map-show")
        pMap.appendChild(pMapData)
        headerDiv.appendChild(pID)
        headerDiv.appendChild(pCreator)
        headerDiv.appendChild(pMap)
        const currentBattleRoundsElem = document.createElement('p')
        currentBattleRoundsElem.classList.add('current_battle_rounds')
        currentBattleRoundsElem.classList.add('right')
        currentBattleRoundsElem.classList.add('active')
        headerDiv.appendChild(currentBattleRoundsElem)
        const middleDiv = document.createElement('div')
        const middleDivP = document.createElement('p')
        const middleDivSpan = document.createElement('span')
        middleDivP.textContent = 'Status: '
        middleDivSpan.id = `mygame_status`
        middleDivP.appendChild(middleDivSpan)
        middleDiv.appendChild(middleDivP)
        middleDiv.className = 'games__item'
        const bottomDiv = document.createElement('div')
        bottomDiv.className = 'games__item'
        const betPerRoundP = document.createElement('p')
        betPerRoundP.textContent = 'Bet per round: '
        const betPerRound = document.createElement('span')
        betPerRound.id = `bet_per_round`
        betPerRoundP.appendChild(betPerRound)
        const amountDepositOrClaimP = document.createElement('P')
        amountDepositOrClaimP.textContent = 'To deposit: '
        amountDepositOrClaimP.id = 'amount_deposit_or_claim_p'
        const amountDepositOrClaim = document.createElement('span')
        amountDepositOrClaim.id = `amount_deposit_or_claim`
        amountDepositOrClaimP.appendChild(amountDepositOrClaim)
        bottomDiv.appendChild(betPerRoundP)
        bottomDiv.appendChild(amountDepositOrClaimP)
        betPerRound.textContent = `${ethers.utils.formatEther(currentBattle.amountPerRound)} ROSE`
        amountDepositOrClaim.textContent = `${ethers.utils.formatEther(currentBattle.baseAmount)} ROSE`
        li.appendChild(headerDiv)
        li.appendChild(middleDiv)
        li.appendChild(bottomDiv)
        // btn.style.display = 'none'
        let queryStatsPlayer = new URLSearchParams();
        queryStatsPlayer.append("gameID", currentBattle.ID)
        queryStatsPlayer.append("address", address)
        queryStatsPlayer.append("chainid", network.chainid)
        fetch('/statistics?' + queryStatsPlayer.toString())
            .then(async (res) => {
            const playerStats = await res.json()
            currentBattleRoundsElem.textContent = ` Current round: ${parseInt(currentBattle.rounds) - parseInt(playerStats[0].remainingrounds)}/${parseInt(currentBattle.rounds)}`
            })
            .catch(err => console.error(err))
        openGamesList.insertBefore(li, openGamesList.firstChild)
      }
      let querySignExist = new URLSearchParams();
      querySignExist.append("gameID", currentBattle.ID)
      querySignExist.append("address", address)
      querySignExist.append("chainid", network.chainid)
      let query = new URLSearchParams();
      query.append("ID", currentBattle.ID)
      query.append("network", network.chainid)
      fetch('/sign?' + querySignExist.toString()).then(async(res) => {
        let buttonID = `openbattle_btn_${currentBattle.ID.toString()}`
        let button;
        let li = document.getElementById(`openbattle_${currentBattle.ID.toString()}`)
        
        if (document.getElementById(buttonID) == null) {
          button = document.createElement("button")
          button.id = buttonID
          button.className = 'btn opengames__btn'
          li.appendChild(button)
        } else {
          button = document.getElementById(buttonID)
          // li.removeChild(button)
          // button = document.createElement("button")
          // button.id = buttonID
          // li.appendChild(button)
        }
        const data = await res.json()
        if (data.r.length > 0) {
          //thats for check if event was already created
          const buttonValue = 'event_exist'
          if (button.value != buttonValue) {
            button.value = buttonValue
            button.textContent = "Claim"
            document.getElementById('mygame_status').textContent = `Game over. Claim your reward`
            document.getElementById("amount_deposit_or_claim_p").textContent = 'Amount to claim: '
            const amountDepositOrClaim = document.createElement('span')
            amountDepositOrClaim.id = `amount_deposit_or_claim`
            amountDepositOrClaim.textContent = `
            ${ethers.utils.formatEther(data.amount)} ROSE
            `
            document.getElementById("amount_deposit_or_claim_p").appendChild(amountDepositOrClaim)
            let queryStatsPlayer = new URLSearchParams();
            queryStatsPlayer.append("gameID", currentBattle.ID)
            queryStatsPlayer.append("address", address)
            queryStatsPlayer.append("chainid", network.chainid)
            const currentBattleRounds = document.getElementsByClassName(`current_battle_rounds`)[0]
            const rounds = parseInt(currentBattle.rounds)
            fetch('/statistics?' + queryStatsPlayer.toString())
              .then(async (res) => {
                const playerStats = await res.json()
                const currentBattle = document.getElementById(`openbattle_${currentBattleID}`)
                const gamesItem = currentBattle.getElementsByClassName('games__item')
                gamesItem[0].lastChild.lastChild.textContent = `Current round: ${rounds - parseInt(playerStats[0].remainingrounds)}/${rounds}`
              })
              .catch(err => console.error(err))
          // const amountDepositOrClaim = document.createElement('span')
          // amountDepositOrClaim.id = ``
            button.addEventListener('click' , async () => {
              try {
                if (data.r.length == 0) {throw Error('Signature does not exist')}
                else {
                modalConfirm.style.display = 'block'
                await contract.finish(currentBattle.ID, data.amount, data.r, data.v, data.s)
                  .then(async (tx) => {
                    modalConfirm.style.display = 'none'
                    modalPending.style.display = 'block'
                    await tx.wait().then(() => {
                      modalPending.style.display = 'none'
                      document.getElementById("opengames-list").removeChild(li)
                      displayCreateGame()
                    })
                  })
                  .catch(async (err) => {
                    modalConfirm.style.display = 'none'
                    modalPending.style.display = 'none'
                    const msg = err.reason === undefined ? err.data.message : err.reason
                    if (msg != undefined) {
                      if (msg.includes("You dont have access")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `You don't have access.`
                      }
                      if (msg.includes("Already sended")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Already sended`
                      }
                      if (msg.includes("Not success payment")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Not success payment`
                      }
                    } 
                    try {
                      if (err.data.message.includes("out of fund")){
                        const error_modal = document.getElementById("error_modal")
                        const error_modal_text = document.getElementById("error_modal_text")
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Out of fund`
                      }
                    } catch (error) {
                      console.error(error)
                    }
                  })
                }
              } catch(err){
                alert(err)
              }
            }, {passive: true})
          }
        }
        let player2;
        try {
          const players = await contract.getFightPlayers(currentBattle.ID)
          player2 = players[1]
        } catch (error) {
          
        }
        if (data.r == '' && player2 != undefined && currentBattle.finishTime == 0) {
          window.location.href = `/game/?ID=${currentBattleID}&network=${network.chainid}`
        }
        if (data.r == '' && player2 == undefined && currentBattle.finishTime == 0) {
            //thats for check if event was already created
            const buttonValue = 'event_exist'
            const currentBattleRounds = document.getElementsByClassName(`current_battle_rounds`)[0]
            const rounds = parseInt(currentBattle.rounds)
            currentBattleRounds.textContent = ` Current round: 0/${rounds}`
            if (button.value != buttonValue) {
                button.value = buttonValue
                button.textContent = "Finish and withdraw"
                document.getElementById('mygame_status').textContent = `Your game. Waiting for an opponent`
                document.getElementById(`amount_deposit_or_claim`).textContent = `
                ${ethers.utils.formatEther(currentBattle.baseAmount)} ROSE
                `
                // document.getElementsByClassName(`current_battle_rounds`)[0].textContent = `Current rounds: ${0}/${currentBattle.rounds}`
                // button.removeEventListener('click', previousWithdrawEventListener)
                button.addEventListener('click', async (event) => {
                modalConfirm.style.display = 'block'
                await contract.withdraw(currentBattle.ID)
                    .then(async (tx) => {
                        modalConfirm.style.display = 'none'
                        modalPending.style.display = 'block'
                        await tx.wait().then(() => {
                        modalPending.style.display = 'none'
                        document.getElementById("opengames-list").removeChild(li)
                        displayCreateGame()
                        })
                    })
                    .catch(async (err) => {
                    modalConfirm.style.display = 'none'
                    modalPending.style.display = 'none'
                    const msg = err.reason === undefined ? err.data.message : err.reason
                    if (msg != undefined) {
                      if (msg.includes("You're not fight's owner")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `You're not fight's owner`
                      }
                      if (msg.includes("Fight is over")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Fight is over`
                      }
                      if (msg.includes("Fight has players")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Fight has players. Wait for redirect.`
                      }
                      if (msg.includes("Not success payment")) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Not success payment`
                      }
                    } 
                    try {
                      if (err.data.message.includes("out of fund")){
                        const error_modal = document.getElementById("error_modal")
                        const error_modal_text = document.getElementById("error_modal_text")
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Out of fund`
                      }
                    } catch (error) {
                      console.error(error)
                    }
                    })
                })
            }
          
        }})
    } else {
      displayCreateGame()
    }
    
}
