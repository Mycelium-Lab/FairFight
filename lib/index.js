// import { contractAbi, contractAddress } from "./contract.js";
import { contractAbi, contractAddress } from './contract.js'
const testnetHardhatID = 31337
const testnetGoerli = 5
const testnetEmerald = 42261
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = `${date < 10 ? '0'+ date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year + ' ' + `${hour == 0 ? '0': hour}` + ':' + `${min == 0 ? '00': min}`;
  return time;
}
$(document).ready(async function () {
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
      document.getElementById("reload_button").addEventListener('click', () => {
        window.location.href = '/'
      })
    }
    if (window.ethereum.networkVersion != testnetEmerald) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(testnetEmerald) }]
        })
        .then(() => location.reload())
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Emerald Test',
                chainId: ethers.utils.hexlify(testnetEmerald),
                nativeCurrency: { name: 'ROSE', decimals: 18, symbol: 'ROSE' },
                rpcUrls: ['https://testnet.emerald.oasis.dev']
              }
            ]
          });
        }
      }
    // if (window.ethereum.networkVersion != testnetHardhatID) {
    //   console.log(window.ethereum.networkVersion!= testnetHardhatID)
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
      walletDisconnect.textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
      walletDisconnect.style.display = ''
      document.getElementById("walletHeader").style.display = "none"
      document.getElementById("createGame").disabled = false;
      const amountToPlayText = document.getElementById("amountToPlayText")
      const amountPerDeathText = document.getElementById("amountPerDeathText")
      amountToPlayText.style.display = ''
      amountPerDeathText.style.display = ''
      const modal = document.getElementById("my_modal");
      const btn = document.getElementById("btn_modal_window");
      const span = document.getElementsByClassName("close_modal_window")[0];
      const spanConfirm = document.getElementsByClassName("close_modal_window")[1];
      const spanPending = document.getElementsByClassName("close_modal_window")[2];
      const modalConfirm = document.getElementById("confirmation_modal")
      const modalPending = document.getElementById("pending_modal")
      btn.onclick = function () {
          modal.style.display = "block";
      }
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
          }
      }
      const amountToPlay = document.getElementById("amountToPlay")
      const amountPerDeath = document.getElementById("amountPerDeath")
      const totalPrizePool = document.getElementById("totalPrizePool")
      const yourDeposit = document.getElementById("yourDeposit")
      amountToPlay.addEventListener('input', () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          totalPrizePool.textContent = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value) * 2
          yourDeposit.textContent = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
        } else {
          totalPrizePool.textContent = 'None'
          yourDeposit.textContent = 'None'
        }
      });
      amountPerDeath.addEventListener('input', () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          totalPrizePool.textContent = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value) * 2
          yourDeposit.textContent = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
        } else {
          totalPrizePool.textContent = 'None'
          yourDeposit.textContent = 'None'
        }
      });
      document.getElementById("connect").disabled = true;
      document
        .getElementById("createGame")
        .addEventListener("click", async function () {
          const amountPerDeathValue = ethers.utils.parseEther(amountPerDeath.value)
          const amountToPlayValue = amountToPlay.value * amountPerDeathValue
          document.getElementById("confirmation_modal").style.display = 'block'
          await contract.createBattle(amountPerDeathValue, {value: amountToPlayValue.toString()})
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
            .catch(err => {
              document.getElementById("confirmation_modal").style.display = 'none'
              document.getElementById("pending_modal").style.display = 'none'
              if (err.reason != undefined) {
                alert(err.reason)
              } 
            })
        });
      const displayCreateGame = () => {
        document.getElementById("btn_modal_window").style.display = ''
      }
      let previousFinishEventListener;
      let previousWithdrawEventListener;
      const openBattlesFunc = async () => {
        const openBattles = await contract.getOpenBattles()
        let opengames = document.getElementById("opengames")
        let openGamesList = document.getElementById("opengames-list")
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
              if (v.ID == openGamesList.children[i].value) {
                alreadyExistHere = true
                break;
              }
            }
            if (alreadyExistHere == false) {
              let li = document.createElement('li')
              li.value = v.ID
              li.id = `openbattle_${v.ID.toString()}`
              let button = document.createElement("button")
              button.value = v.ID.toString()
              button.textContent = "Join"
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
                })
              })
              const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
              const headerDiv = document.createElement('div')
              headerDiv.textContent = `
              ID: ${v.ID.toString()}
              Creator: ${addressPlayer1}
              Map: Steel plant
              `
              const middleDiv = document.createElement('div')
              middleDiv.textContent = 'Status: Waiting for an opponent'
              const bottomDiv = document.createElement('div')
              bottomDiv.textContent = `
              Bet per round: ${ethers.utils.formatEther(v.amountForOneDeath)} ROSE
              To deposit: ${ethers.utils.formatEther(v.player1Amount)} ROSE
              `
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
            if (e != currentBattle.ID.toString()) {
              openGamesList.removeChild(document.getElementById(`openbattle_${e.toString()}`))
            }
          })
        } catch (error) {
          console.error(error)
        }
        if (currentBattle.battleCreatedTimestamp != 0) {
          let alreadyExistHere = false
          for (let i = 0; i < openGamesList.children.length; i++) {
            if (currentBattle.ID == openGamesList.children[i].value) {
              alreadyExistHere = true
              break;
            }
          }
          if (alreadyExistHere == false) {
            let status = '';
            let li = document.createElement('li')
            li.id = `openbattle_${currentBattle.ID.toString()}`
            li.value = currentBattle.ID
            const addressPlayer1 = currentBattle.player1.slice(0, 6) + '...' + currentBattle.player1.slice(currentBattle.player1.length - 4, currentBattle.player1.length);
            const headerDiv = document.createElement('div')
            headerDiv.textContent = `
            ID: ${currentBattle.ID.toString()}
            Creator: ${addressPlayer1}
            Map: Steel plant
            `
            const middleDiv = document.createElement('div')
            middleDiv.textContent = status
            const bottomDiv = document.createElement('div')
            bottomDiv.textContent = `
            Bet per round: ${ethers.utils.formatEther(currentBattle.amountForOneDeath)} ROSE
            To deposit: ${ethers.utils.formatEther(currentBattle.player1Amount)} ROSE
            `
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
                button.textContent = "Withdraw"
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
      const pastBattlesFunc = async () => {
        const pastBattles = await contract.getUserPastBattles(address)
        let pastgames = document.getElementById("pastgames")
        let pastGamesList = document.getElementById('pastgames-list')
        let counterForElementEmpty = 0;
        pastBattles.forEach((v) => {
          if (v.battleCreatedTimestamp != 0) {
          let alreadyExistHere = false
          for (let i = 0; i < pastGamesList.children.length; i++) {
            if (v.ID == pastGamesList.children[i].value) {
              alreadyExistHere = true
              break;
            }
          }
          if (alreadyExistHere == false) {
            let li = document.createElement('li')
            // if (v.player1 == address) {
              li.value = v.ID.toString()
              const headerDiv = document.createElement('div')
              const totalDeposit = parseInt(v.player1Amount.toString()) + parseInt(v.player2Amount.toString())
              const rounds = totalDeposit / parseInt(v.amountForOneDeath.toString()) / 2
              headerDiv.textContent = `
              ID: ${v.ID.toString()}
              Status: Game over
              Date: ${timeConverter(v.battleFinishedTimestamp)}
              `
              let roundsElem = document.createElement('span')
              headerDiv.appendChild(roundsElem)
              const middleDiv = document.createElement('div')
              middleDiv.textContent = `
              Bet per round: ${ethers.utils.formatEther(v.amountForOneDeath)} ROSE
              Your deposit: ${ethers.utils.formatEther(`${totalDeposit / 2}`)} ROSE
              Map: Steel plant
              `
              const bottomDiv = document.createElement('div')
              bottomDiv.textContent = 'Players & stats:'
              const players_stats = document.createElement('div')
              const youStats = document.createElement('div')
              const enemyStats = document.createElement('div')
              players_stats.appendChild(youStats)
              players_stats.appendChild(enemyStats)
              let queryStatsPlayer1 = new URLSearchParams();
              queryStatsPlayer1.append("gameID", v.ID)
              queryStatsPlayer1.append("address", v.player1)
              let queryStatsPlayer2 = new URLSearchParams();
              queryStatsPlayer2.append("gameID", v.ID)
              queryStatsPlayer2.append("address", v.player2)
              if (v.player1 == address) {
                const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
                const addressPlayer2 = v.player2.slice(0, 6) + '...' + v.player1.slice(v.player2.length - 4, v.player2.length);
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
                    youStats.textContent = `
                      ${addressPlayer1}(you)
                      Kills: ${player1Stats.kills}
                      Deaths: ${player1Stats.deaths}
                      ${winLoseText}
                    `
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
                    enemyStats.textContent = `
                      ${addressPlayer2}(enemy)
                      Kills: ${player2Stats.kills}
                      Deaths: ${player2Stats.deaths}
                      ${winLoseText}
                    `
                  })
                  .catch(err => console.error(err))
              } else {
                const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
                const addressPlayer2 = v.player2.slice(0, 6) + '...' + v.player1.slice(v.player2.length - 4, v.player2.length);
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
                    enemyStats.textContent = `
                      ${addressPlayer1}(enemy)
                      Kills: ${player1Stats.kills}
                      Deaths: ${player1Stats.deaths}
                      ${winLoseText}
                    `
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
                    youStats.textContent = `
                      ${addressPlayer2}(you)
                      Kills: ${player2Stats.kills}
                      Deaths: ${player2Stats.deaths}
                      ${winLoseText}
                    `
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
            pastGamesList.appendChild(li)
            counterForElementEmpty+=1;
          }
        }
        })
        if (counterForElementEmpty == 0) {
          document.getElementById("pastgames-empty").style.display = ''
        } else {
          document.getElementById("pastgames-empty").style.display = 'none'
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
  });

var roomName = window.location.search;
