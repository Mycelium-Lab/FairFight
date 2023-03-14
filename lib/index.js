// import { contractAbi, contractAddress } from "./contract.js";
import { contractAbi, contractAddress } from './contract.js'

const testnetHardhatID = 31337
const testnetGoerli = 5
const testnetEmerald = 42261
const mainnetEmerald = 42262
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  let minutes;
  if (min < 10) {
    minutes = `0${min}`
  }
  if (min == 0) {
    minutes = `00`
  }
  if (minutes == undefined) {
    minutes = min
  }
  var time = `${date < 10 ? '0'+ date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year + ' ' + `${hour == 0 ? '0': hour}` + ':' + minutes;
  return time;
}
$(document).ready(async function () {
    const modal = document.getElementById("my_modal");
    const btn = document.getElementById("btn_modal_window");
    if (!window.ethereum) {
      document.getElementById("opengames_empty").style.display = ''
      document.getElementById("opengames").classList.add("empty")
      document.getElementById("pastgames_empty").style.display = ''
      document.getElementById("pastgames").classList.add("empty")
    }
    btn.onclick = function () {
      if (!window.ethereum) {
        const installModal = document.getElementById("install_wallet_modal");
        const spanInstall = document.getElementsByClassName("close_modal_window")[3];
        installModal.style.display = "block";
        spanInstall.onclick = function () {
          installModal.style.display = "none";
        }
        window.onclick = function (event) {
            if (event.target == installModal) {
              installModal.style.display = "none";
            }
        }
      } else {
        modal.style.display = "block";
      }
  }
  try {
    if (window.ethereum.networkVersion != mainnetEmerald) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(mainnetEmerald) }]
        })
        .then(() => location.reload())
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Emerald Main',
                chainId: ethers.utils.hexlify(mainnetEmerald),
                nativeCurrency: { name: 'ROSE', decimals: 18, symbol: 'ROSE' },
                rpcUrls: ['https://emerald.oasis.dev']
              }
            ]
          });
        }
      }
    // if (window.ethereum.networkVersion != testnetEmerald) {
    //   try {
    //     await window.ethereum.request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: ethers.utils.hexlify(testnetEmerald) }]
    //     })
    //     .then(() => location.reload())
    //   } catch (err) {
    //       // This error code indicates that the chain has not been added to MetaMask
    //     if (err.code === 4902) {
    //       await window.ethereum.request({
    //         method: 'wallet_addEthereumChain',
    //         params: [
    //           {
    //             chainName: 'Emerald Test',
    //             chainId: ethers.utils.hexlify(testnetEmerald),
    //             nativeCurrency: { name: 'ROSE', decimals: 18, symbol: 'ROSE' },
    //             rpcUrls: ['https://testnet.emerald.oasis.dev']
    //           }
    //         ]
    //       });
    //     }
    //   }
    // if (window.ethereum.networkVersion != testnetHardhatID) {
    //   try {
    //     await window.ethereum.request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: ethers.utils.hexlify(testnetHardhatID) }]
    //     })
    //     .then(() => location.reload())
    //   } catch (err) {
    //       // This error code indicates that the chain has not been added to MetaMask
    //     if (err.code === 4902) {
    //       await window.ethereum.request({
    //         method: 'wallet_addEthereumChain',
    //         params: [
    //           {
    //             chainName: 'Hardhat Test',
    //             chainId: ethers.utils.hexlify(testnetHardhatID),
    //             nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
    //             rpcUrls: ['http://localhost:8545']
    //           }
    //         ]
    //       });
    //     }
    //   }
      // if (window.ethereum.networkVersion != testnetGoerli) {
      //   console.log(ethers.utils.hexlify(testnetGoerli))
      //   try {
      //     await window.ethereum.request({
      //       method: 'wallet_switchEthereumChain',
      //       params: [{ chainId: ethers.utils.hexValue(testnetGoerli) }]
      //     })
      //     .then(() => location.reload())
      //   } catch (err) {
      //       // This error code indicates that the chain has not been added to MetaMask
      //     if (err.code === 4902) {
      //       await window.ethereum.request({
      //         method: 'wallet_addEthereumChain',
      //         params: [
      //           {
      //             chainName: 'Goerli',
      //             chainId: ethers.utils.hexlify(testnetGoerli),
      //             nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
      //             rpcUrls: ['https://goerli.infura.io/v3']
      //           }
      //         ]
      //       });
      //     }
      //   }
    } else {
      //get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // if(!provider){
      //   var modal = document.getElementById("myModal");
      //   modal.style.display = "block";
      //   document.getElementById("myModal").style.color = "black"
      //   document.getElementById("reload").addEventListener("click",()=>{location.reload()})
      // }
      let signer;
      let contract;
      let address;
      try {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner()
        contract = new ethers.Contract(contractAddress, contractAbi, signer)
        address = await signer.getAddress()
      } catch (error) {
        console.error(error)
      }
      if (address == undefined) {
        let connectButton = document.getElementById('connect')
        connectButton.style.display = ''
        connectButton.addEventListener('click', async () => {
          try {
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner()
            contract = new ethers.Contract(contractAddress, contractAbi, signer)
            address = await signer.getAddress()
            connectButton.style.display = 'none'
            window.location.href = '/'
          } catch (error) {
            console.error(error)
          }
        })
      }
      //just see wallet
      const walletDisconnect = document.getElementById("disconnect")
      document.getElementById("disconnect-address").textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
      walletDisconnect.style.display = ''
      document.getElementById("walletHeader").style.display = "none"
      document.getElementById("createGame").disabled = false;
      const amountToPlayText = document.getElementById("amountToPlayText")
      const amountPerDeathText = document.getElementById("amountPerDeathText")
      amountToPlayText.style.display = ''
      amountPerDeathText.style.display = ''
      const span = document.getElementsByClassName("close_modal_window")[0];
      const spanConfirm = document.getElementsByClassName("close_modal_window")[1];
      const spanPending = document.getElementsByClassName("close_modal_window")[2];
      // const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
      // const airDropModalOpen = document.getElementById("airdrop-modal-open")
      const airDropModal = document.getElementById("airdrop_modal")
      // const getFirstAirDropBtn = document.getElementById("get-first")
      // const getPrizeAirDropBtn = document.getElementById("get-prize")
      // const airDropGetFirstText = document.getElementById("airdrop-getfirst-text")
      // const airDropGetPrizeText = document.getElementById("airdrop-getprize-text")
      const modalConfirm = document.getElementById("confirmation_modal")
      const modalPending = document.getElementById("pending_modal")
      const _installWalletModal = document.getElementById("install_wallet_modal")
      const _error_modal = document.getElementById("error_modal")
      const _about_modal = document.getElementById("about_modal")
      const _connect_modal = document.getElementById("connect_modal")
      const _inventory_block = document.getElementById("inventory-block")
      
      spanConfirm.onclick = function () {
          modalConfirm.style.display = "none";
      }
      spanPending.onclick = function () {
          modalPending.style.display = "none";
      }
      span.onclick = function () {
          modalConfirm.style.display = 'none'
          modalPending.style.display = 'none'
          modal.style.display = "none";
      }
      window.onclick = function (event) {
          if (event.target == modal) {
              modal.style.display = "none";
          } else if (event.target == modalConfirm) {
              modalConfirm.style.display = 'none'
          } else if (event.target == modalPending) {
              modalPending.style.display = 'none'
          } else if (event.target == _installWalletModal) {
            _installWalletModal.style.display = 'none'
          } else if (event.target == _error_modal) {
              _error_modal.style.display = 'none'
          } else if (event.target == _about_modal) {
              _about_modal.style.display = 'none'
          } else if (event.target == _connect_modal) {
              _connect_modal.style.display = 'none'
          } else if (event.target == _inventory_block) {
              _inventory_block.classList.remove("active")
          } else if (event.target == document.getElementById("howtobuy_modal")) {
            document.getElementById("howtobuy_modal").style.display = 'none'
          } else if (event.target == airDropModal) {
            airDropModal.style.display = 'none'
          } else if (event.target == document.getElementById("leaderboard_modal")) {
            document.getElementById("leaderboard_modal").style.display = 'none'
          }
      }
      const amountToPlay = document.getElementById("amountToPlay")
      const amountPerDeath = document.getElementById("amountPerDeath")
      const totalPrizePool = document.getElementById("totalPrizePool")
      const yourDeposit = document.getElementById("yourDeposit")
      amountToPlay.addEventListener('input', () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          totalPrizePool.textContent = (parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value) * 2)
          yourDeposit.textContent = (parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value))
        } else {
          totalPrizePool.textContent = '-'
          yourDeposit.textContent = '-'
        }
      });
      amountPerDeath.addEventListener('input', () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          totalPrizePool.textContent = (parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value) * 2)
          yourDeposit.textContent = (parseFloat(amountPerDeath.value)* parseFloat(amountToPlay.value))
        } else {
          totalPrizePool.textContent = '-'
          yourDeposit.textContent = '-'
        }
      });
      document.getElementById("connect").disabled = true;
      document
        .getElementById("createGame")
        .addEventListener("click", async function () {
          const error_modal = document.getElementById("error_modal")
          const error_modal_text = document.getElementById("error_modal_text")
          try {
            if(isNaN(parseFloat(amountPerDeath.value)) || isNaN(parseFloat(amountToPlay.value))) throw Error('Enter a number')
            if (
              parseFloat(amountPerDeath.value) < 0 
              || 
              parseFloat(amountToPlay.value) < 0
              ||
              parseFloat(amountPerDeath.value) == 0 
              || 
              parseFloat(amountToPlay.value) == 0
              ) throw Error('The number must be greater than 0')
            const amountPerDeathValue = ethers.utils.parseEther(amountPerDeath.value)
            const amountToPlayValue = ethers.utils.parseEther((amountToPlay.value * parseFloat(amountPerDeath.value)).toString())
            document.getElementById("confirmation_modal").style.display = 'block'
            await contract.createBattle(BigInt(Math.round(amountPerDeathValue)).toString(), {value: BigInt(Math.round(amountToPlayValue)).toString()})
              .then(async (tx) => {
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'block'
                tx.wait()
                  .then(() => {
                    amountPerDeath.value = 0
                    amountPerDeath.value = 0
                    document.getElementById("my_modal").style.display = 'none'
                    document.getElementById("pending_modal").style.display = 'none'
                    btn.style.display = 'none'
                  })
              })
              .catch(async (err) => {
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'none'
                if (err.reason != undefined) {
                    if (err.reason.includes("AmountForOneDeath")) {
                      const _minAmountForOneRound = await contract.minAmountForOneRound()
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `Bet per round must be higher or equal ${ethers.utils.formatEther(_minAmountForOneRound.toString())} ROSE`
                    }
                    if (err.reason.includes("must be divided")) {
                      if(amountToPlay.value.includes(',') || amountToPlay.value.includes('.')) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `The number should be written without a dot or a comma`
                      } else {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Your deposit must be divisible by bet per round without remainder`
                      }
                    }
                    if (err.reason.includes("have open battle")) {
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `You already have open battle`
                    }
                    if (err.reason.includes("Exceeded the limit")) {
                      const _maxDeathInARow = await contract.maxDeathInARow()
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `The maximum number of rounds is ${_maxDeathInARow.toString()}`
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
          } catch (error) {
            if(amountPerDeath.value.includes(',')) {
              error_modal.style.display = 'block'
              error_modal_text.textContent = `The number should be written with a dot, not a comma`
            }
            try {
              if (error.message == 'The number must be greater than 0') {
                error_modal.style.display = 'block'
                error_modal_text.textContent = error.message
              }
              if (error.message == 'Enter a number') {
                error_modal.style.display = 'block'
                error_modal_text.textContent = error.message
              }
            } catch (error) {
              console.error(error)
            }
          }
          
        });
      const displayCreateGame = () => {
        document.getElementById("btn_modal_window").style.display = ''
      }
      const openBattlesFunc = async () => {
        // const openBattles = await contract.getOpenBattles()
        let openBattles = await contract.getChunkFinishedBattles(0, 10)
        openBattles = [...openBattles, await contract.getChunkFinishedBattles(1, 10)]
        openBattles = [...openBattles, await contract.getChunkFinishedBattles(2, 10)]
        openBattles = [...openBattles, await contract.getChunkFinishedBattles(3, 10)]
        openBattles = [...openBattles, await contract.getChunkFinishedBattles(4, 10)]
        openBattles = openBattles.filter(v => v.player2 == '0x0000000000000000000000000000000000000000' && v.finished == false)
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
          if (v.player1 != address) {
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
                const amountToPlay = v.player1Amount
                modalConfirm.style.display = 'block'
                await contract.joinBattle(event.target.value, {value: amountToPlay.toString()})
                .then(async (tx) => {
                  modalConfirm.style.display = 'none'
                  modalPending.style.display = 'block'
                  await tx.wait().then(() => {
                    modalPending.style.display = 'none'
                    let query = new URLSearchParams();
                    query.append("ID", event.target.value)
                    window.location.href = "/game?" + query.toString();
                  })
                })
                .catch(err => {
                  modalConfirm.style.display = 'none'
                  modalPending.style.display = 'none'
                  if (err.reason != undefined) {
                    alert(err.reason)
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
              const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
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
              pCreatorData.href = `https://explorer.emerald.oasis.dev/address/${v.player1}`
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
              const totalDeposit = parseInt(v.player1Amount.toString()) + parseInt(v.player1Amount.toString())
              const rounds = totalDeposit / parseInt(v.amountForOneDeath.toString()) / 2
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
              betPerRound.textContent = `${ethers.utils.formatEther(v.amountForOneDeath)} ROSE`
              amountDepositOrClaim.textContent = `${ethers.utils.formatEther(v.player1Amount)} ROSE`
              li.appendChild(headerDiv)
              li.appendChild(middleDiv)
              li.appendChild(bottomDiv)
              li.appendChild(button)
              openGamesList.appendChild(li)
            }
          }
        })
        let currentBattle = await contract.getCurrentUserGame(address)
        try {
          gamesToDelete.forEach((e) => {
            if (e != null & e != currentBattle.ID.toString()) {
              openGamesList.removeChild(document.getElementById(`openbattle_${e.toString()}`))
            }
          })
        } catch (error) {
          console.error(error)
        }
        if (currentBattle.battleCreatedTimestamp != 0) {
          let alreadyExistHere = false
          for (let i = 0; i < openGamesList.children.length; i++) {
            // console.log(openGamesList.children[i].)
            if (currentBattle.ID == openGamesList.children[i].getAttribute("value")) {
              alreadyExistHere = true
              break;
            }
          }
          if (alreadyExistHere == false) {
            let li = document.createElement('div')
            li.className = 'games__row'
            li.id = `openbattle_${currentBattle.ID.toString()}`
            li.value = currentBattle.ID
            li.setAttribute('value', currentBattle.ID.toString())
            const addressPlayer1 = currentBattle.player1.slice(0, 6) + '...' + currentBattle.player1.slice(currentBattle.player1.length - 4, currentBattle.player1.length);
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
            pCreatorData.href = `https://explorer.emerald.oasis.dev/address/${currentBattle.player1}`
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
            currentBattleRoundsElem.className = `current_battle_rounds right active`
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
            betPerRound.textContent = `${ethers.utils.formatEther(currentBattle.amountForOneDeath)} ROSE`
            amountDepositOrClaim.textContent = `${ethers.utils.formatEther(currentBattle.player1Amount)} ROSE`
            li.appendChild(headerDiv)
            li.appendChild(middleDiv)
            li.appendChild(bottomDiv)
            btn.style.display = 'none'
            openGamesList.insertBefore(li, openGamesList.firstChild)
          }
          let querySignExist = new URLSearchParams();
          querySignExist.append("gameID", currentBattle.ID)
          querySignExist.append("address", address)
          let query = new URLSearchParams();
          query.append("ID", currentBattle.ID)
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
                ${currentBattle.player1 == address ? ethers.utils.formatEther(data.player1Amount) : ethers.utils.formatEther(data.player2Amount)} ROSE
                `
                document.getElementById("amount_deposit_or_claim_p").appendChild(amountDepositOrClaim)
                let queryStatsPlayer = new URLSearchParams();
                queryStatsPlayer.append("gameID", currentBattle.ID)
                queryStatsPlayer.append("address", address)
                const currentBattleRounds = document.getElementsByClassName(`current_battle_rounds`)[0]
                const totalDeposit = parseInt(currentBattle.player1Amount.toString()) + parseInt(currentBattle.player1Amount.toString())
                const rounds = totalDeposit / parseInt(currentBattle.amountForOneDeath.toString()) / 2
                fetch('/statistics?' + queryStatsPlayer.toString())
                  .then(async (res) => {
                    const playerStats = await res.json()
                    currentBattleRounds.textContent = ` Current round: ${rounds - parseInt(playerStats.remainingRounds)}/${rounds}`
                  })
                  .catch(err => console.error(err))
              // const amountDepositOrClaim = document.createElement('span')
              // amountDepositOrClaim.id = ``
                button.addEventListener('click' , async () => {
                  try {
                    if (data.r.length == 0) {throw Error('Signature does not exist')}
                    else {
                    const dataToContract = ethers.utils.defaultAbiCoder.encode(
                      [
                          'uint256',
                          'uint256',
                          'uint256',
                          'bytes32',
                          'uint8',
                          'bytes32'
                      ], 
                      [
                          currentBattle.ID, 
                          data.player1Amount, 
                          data.player2Amount,
                          data.r,
                          data.v,
                          data.s
                      ]
                    )

                    modalConfirm.style.display = 'block'
                    await contract.finishBattle(dataToContract)
                      .then(async (tx) => {
                        modalConfirm.style.display = 'none'
                        modalPending.style.display = 'block'
                        await tx.wait().then(() => {
                          modalPending.style.display = 'none'
                          document.getElementById("opengames-list").removeChild(li)
                          displayCreateGame()
                        })
                      })
                      .catch(err => {
                        modalConfirm.style.display = 'none'
                        modalPending.style.display = 'none'
                        if (err.reason != undefined) {
                          alert(err.reason)
                        }
                        try {
                          if (err.data.message.includes("Battle already finished")){
                            const error_modal = document.getElementById("error_modal")
                            const error_modal_text = document.getElementById("error_modal_text")
                            error_modal.style.display = 'block'
                            error_modal_text.textContent = `Battle already finished`
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
            if (data.r == '' && currentBattle.player2 != '0x0000000000000000000000000000000000000000') {
              status = `Status: Seconaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaad user in game\nYou will be auto redirect` 
              window.location.href = "/game?" + query.toString();
            }
            if (data.r == '' && currentBattle.player2 == '0x0000000000000000000000000000000000000000') {
              //thats for check if event was already created
              const buttonValue = 'event_exist'
              if (button.value != buttonValue) {
                button.value = buttonValue
                button.textContent = "Finish and withdraw"
                document.getElementById('mygame_status').textContent = `Your game. Waiting for an opponent`
                document.getElementById(`amount_deposit_or_claim`).textContent = `
                To deposit: ${ethers.utils.formatEther(currentBattle.player1Amount)} ROSE
                `
                const totalDeposit = parseInt(currentBattle.player1Amount.toString()) + parseInt(currentBattle.player1Amount.toString())
                const rounds = totalDeposit / parseInt(currentBattle.amountForOneDeath.toString()) / 2
                document.getElementsByClassName(`current_battle_rounds`)[0].textContent = `Current rounds: ${0}/${rounds}`
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
                    .catch(err => {
                      modalConfirm.style.display = 'none'
                      modalPending.style.display = 'none'
                      if (err.reason != undefined) {
                        alert(err.reason)
                      }
                    })
                })
              }
              
            }})
        } else {
          displayCreateGame()
        }
        
      }
      function compareID(a, b) {
        return a.ID - b.ID;
      }
      const pastBattlesFunc = async () => {
        let pastBattles = await contract.getUserPastBattles(address)
        if (pastBattles.length >= 15) {
          pastBattles = [...pastBattles].sort(compareID)
        } 
        let pastgames = document.getElementById("pastgames")
        let pastGamesList = document.getElementById('pastgames-list')
        let counterForElementEmpty = 0;
        pastBattles.forEach((v) => {
          if (v.battleCreatedTimestamp != 0) {
          let alreadyExistHere = false
          for (let i = 0; i < pastGamesList.children.length; i++) {
            if (v.ID == pastGamesList.children[i].getAttribute('value')) {
              alreadyExistHere = true
              break;
            }
          }
          if (alreadyExistHere == false) {
              let li = document.createElement('div')
              // if (v.player1 == address) {
              li.className = 'games__row'
              li.setAttribute('value', v.ID.toString())
              const headerDiv = document.createElement('div')
              const totalDeposit = parseInt(v.player1Amount.toString()) + parseInt(v.player2Amount.toString())
              const rounds = Math.round(totalDeposit / parseInt(v.amountForOneDeath.toString()) / 2)
              headerDiv.className = 'games__item'
              const pID = document.createElement('p')
              const pIDData = document.createElement('span')
              pID.textContent = 'id: '
              pIDData.textContent = `${v.ID.toString()}`
              pID.appendChild(pIDData)
              const pStatus = document.createElement('p')
              const pStatusData = document.createElement('span')
              pStatus.textContent = 'Status: '
              pStatusData.textContent = `Game over`
              pStatusData.className = 'active'
              pStatus.appendChild(pStatusData)
              const pDate = document.createElement('p')
              const pDateData = document.createElement('span')
              pDate.textContent = 'Date: '
              pDateData.textContent = `${timeConverter(v.battleFinishedTimestamp)}`
              pDate.appendChild(pDateData)
              headerDiv.appendChild(pID)
              headerDiv.appendChild(pStatus)
              headerDiv.appendChild(pDate)
              let roundsElem = document.createElement('p')
              roundsElem.className = 'right'
              headerDiv.appendChild(roundsElem)
              const middleDiv = document.createElement('div')
              middleDiv.className = 'games__item'
              const betPerRoundP = document.createElement('p')
              const betPerRound = document.createElement('span')
              betPerRoundP.textContent = 'Bet per round: '
              betPerRound.textContent = `${ethers.utils.formatEther(v.amountForOneDeath)} ROSE`
              betPerRoundP.appendChild(betPerRound)
              const yourdepositP = document.createElement('p')
              const yourdeposit = document.createElement('span')
              yourdepositP.textContent = 'Your deposit: '
              yourdeposit.textContent = `${ethers.utils.formatEther(`${totalDeposit / 2}`)} ROSE`
              yourdepositP.appendChild(yourdeposit)
              const mapP = document.createElement('p')
              const map = document.createElement('span')
              mapP.textContent = 'Map: '
              mapP.className = 'right'
              map.textContent = 'Steel plant'
              map.className = 'active map-show'
              mapP.appendChild(map)
              middleDiv.appendChild(betPerRoundP)
              middleDiv.appendChild(yourdepositP)
              middleDiv.appendChild(mapP)
              const bottomDiv = document.createElement('div')
              bottomDiv.textContent = 'Players & stats:'
              const players_stats = document.createElement('div')
              players_stats.className = "games__item games__item__footer"
              const youStats = document.createElement('div')
              youStats.className = 'opengames__col'
              const youStatsWinLose = document.createElement('div')
              youStatsWinLose.className = 'opengames__col'
              const enemyStats = document.createElement('div')
              enemyStats.className = 'opengames__col'
              const enemyStatsWinLose = document.createElement('div')
              enemyStatsWinLose.className = 'opengames__col'
              players_stats.appendChild(youStats)
              players_stats.appendChild(youStatsWinLose)
              players_stats.appendChild(enemyStats)
              players_stats.appendChild(enemyStatsWinLose)
              let queryStatsPlayer1 = new URLSearchParams();
              queryStatsPlayer1.append("gameID", v.ID)
              queryStatsPlayer1.append("address", v.player1)
              let queryStatsPlayer2 = new URLSearchParams();
              queryStatsPlayer2.append("gameID", v.ID)
              queryStatsPlayer2.append("address", v.player2)
              if (v.player1 == address) {
                const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
                const addressPlayer2 = v.player2.slice(0, 6) + '...' + v.player2.slice(v.player2.length - 4, v.player2.length);
                fetch('/statistics?' + queryStatsPlayer1.toString())
                  .then(async (res) => {
                    const player1Stats = await res.json()
                    roundsElem.textContent = ` Round: ${rounds - parseInt(player1Stats.remainingRounds)}/${rounds}`
                    const amountLose = totalDeposit / 2 - parseInt(v.player1Amount.toString())
                    let winLoseText = '';
                    if (amountLose > 0) {
                      winLoseText = `Lose: ${amountLose > 0 ? ethers.utils.formatEther(`${amountLose}`) : 0} ROSE`
                    } else {
                      winLoseText = `Win: ${ethers.utils.formatEther((amountLose * (-1)).toString())} ROSE`
                    }
                    const addressP = document.createElement('p')
                    addressP.textContent = `${addressPlayer1} (you)`
                    const killsDeaths = document.createElement('p')
                    killsDeaths.textContent = `${player1Stats.kills} kills, ${player1Stats.deaths} deaths`
                    const winLose = document.createElement('p')
                    winLose.textContent = winLoseText
                    winLose.className = winLoseText.includes('Win') ? "green" : "red"
                    youStats.appendChild(addressP)
                    youStats.appendChild(killsDeaths)
                    youStatsWinLose.appendChild(winLose)
                  })
                  .catch(err => console.error(err))
                fetch('/statistics?' + queryStatsPlayer2.toString())
                  .then(async (res) => {
                    const player2Stats = await res.json()
                    roundsElem.textContent = ` Round: ${rounds - parseInt(player2Stats.remainingRounds)}/${rounds}`
                    const amountLose = totalDeposit / 2 - parseInt(v.player2Amount.toString())
                    let winLoseText;
                    if (amountLose > 0) {
                      winLoseText = `Lose: ${amountLose > 0 ? ethers.utils.formatEther(`${amountLose}`) : 0} ROSE`
                    } else {
                      winLoseText = `Win: ${ethers.utils.formatEther((amountLose * (-1)).toString())} ROSE`
                    }
                    const addressP = document.createElement('p')
                    addressP.textContent = `${addressPlayer2} (enemy)`
                    const killsDeaths = document.createElement('p')
                    killsDeaths.textContent = `${player2Stats.kills} kills, ${player2Stats.deaths} deaths`
                    const winLose = document.createElement('p')
                    winLose.textContent = winLoseText
                    winLose.className = winLoseText.includes('Win') ? "green" : "red"
                    enemyStats.appendChild(addressP)
                    enemyStats.appendChild(killsDeaths)
                    enemyStatsWinLose.appendChild(winLose)
                  })
                  .catch(err => console.error(err))
              } else {
                const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
                const addressPlayer2 = v.player2.slice(0, 6) + '...' + v.player2.slice(v.player2.length - 4, v.player2.length);
                fetch('/statistics?' + queryStatsPlayer1.toString())
                  .then(async (res) => {
                    const player1Stats = await res.json()
                    roundsElem.textContent = ` Round: ${rounds - parseInt(player1Stats.remainingRounds)}/${rounds}`
                    const amountLose = totalDeposit / 2 - parseInt(v.player1Amount.toString())
                    let winLoseText;
                    if (amountLose > 0) {
                      winLoseText = `Lose: ${amountLose > 0 ? ethers.utils.formatEther(`${amountLose}`) : 0} ROSE`
                    } else {
                      winLoseText = `Win: ${ethers.utils.formatEther((amountLose * (-1)).toString())} ROSE`
                    }
                    const addressP = document.createElement('p')
                    addressP.textContent = `${addressPlayer1} (enemy)`
                    const killsDeaths = document.createElement('p')
                    killsDeaths.textContent = `${player1Stats.kills} kills, ${player1Stats.deaths} deaths`
                    const winLose = document.createElement('p')
                    winLose.textContent = winLoseText
                    winLose.className = winLoseText.includes('Win') ? "green" : "red"
                    enemyStats.appendChild(addressP)
                    enemyStats.appendChild(killsDeaths)
                    enemyStatsWinLose.appendChild(winLose)
                  })
                  .catch(err => console.error(err))
                fetch('/statistics?' + queryStatsPlayer2.toString())
                  .then(async (res) => {
                    const player2Stats = await res.json()
                    roundsElem.textContent = ` Round: ${rounds - parseInt(player2Stats.remainingRounds)}/${rounds}`
                    const amountLose = totalDeposit / 2 - parseInt(v.player2Amount.toString())
                    let winLoseText;
                    if (amountLose > 0) {
                      winLoseText = `Lose: ${amountLose > 0 ? ethers.utils.formatEther(`${amountLose}`) : 0} ROSE`
                    } else {
                      winLoseText = `Win: ${ethers.utils.formatEther((amountLose * (-1)).toString())} ROSE`
                    }
                    const addressP = document.createElement('p')
                    addressP.textContent = `${addressPlayer2} (you)`
                    const killsDeaths = document.createElement('p')
                    killsDeaths.textContent = `${player2Stats.kills} kills, ${player2Stats.deaths} deaths`
                    const winLose = document.createElement('p')
                    winLose.textContent = winLoseText
                    winLose.className = winLoseText.includes('Win') ? "green" : "red"
                    youStats.appendChild(addressP)
                    youStats.appendChild(killsDeaths)
                    youStatsWinLose.appendChild(winLose)
                  })
                  .catch(err => console.error(err))
              }
              li.appendChild(headerDiv)
              li.appendChild(middleDiv)
              li.appendChild(bottomDiv)
              li.appendChild(players_stats)
            // } else {
            //   li.textContent = `ID: ${v.ID} Amount Winned: ${ethers.utils.formatEther(v.player2Amount)} ETH`
            // }
            // pastGamesList.appendChild(li)
            pastGamesList.insertBefore(li, pastGamesList.firstChild)
            counterForElementEmpty+=1;
          }
        }
        })
        if (pastGamesList.children.length == 1) {
          document.getElementById("pastgames_empty").style.display = ''
          pastgames.classList.add("empty")

        } else {
          document.getElementById("pastgames_empty").style.display = 'none'
          pastgames.classList.remove("empty")
          pastgames.appendChild(pastGamesList)
        }
      }
      setInterval(() => {
        openBattlesFunc()
      }, 1000)
      setInterval(() => {
        pastBattlesFunc()
      }, 10000)
      openBattlesFunc()
      pastBattlesFunc()
    }
    
  } catch (error) {
    console.error(error)
  }
  });

var roomName = window.location.search;
