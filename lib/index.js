// import { contractAbi, contractAddress } from "./contract.js";
import { contractAbi, contractAddress } from './contract.js'
const testnetHardhatID = 31337
const testnetGoerli = 5
$(document).ready(async function () {
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
      if (window.ethereum.networkVersion != testnetGoerli) {
        console.log(ethers.utils.hexlify(testnetGoerli))
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(testnetGoerli) }]
          })
          .then(() => location.reload())
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Goerli',
                  chainId: ethers.utils.hexlify(testnetGoerli),
                  nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                  rpcUrls: ['https://goerli.infura.io/v3']
                }
              ]
            });
          }
        }
    } else {
      //get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // if(!provider){
      //   var modal = document.getElementById("myModal");
      //   modal.style.display = "block";
      //   document.getElementById("myModal").style.color = "black"
      //   document.getElementById("reload").addEventListener("click",()=>{location.reload()})
      // }  
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractAbi, signer)
      const address = await signer.getAddress()
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
      const openBattlesFunc = async () => {
        const openBattles = await contract.getOpenBattles()
        document.getElementById("opengames-list").remove()
        let opengames = document.getElementById("opengames")
        let openGamesList = document.createElement('ul')
        openGamesList.id = "opengames-list"
        let counterForElementEmpty = 0
        openBattles.forEach(v => {
          if (v.player1 != address) {
            let li = document.createElement('li')
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
        })
        let currentBattle = await contract.getCurrentUserGame(address)
        if (currentBattle.battleCreatedTimestamp != 0) {
          let querySignExist = new URLSearchParams();
          querySignExist.append("gameID", currentBattle.ID)
          querySignExist.append("address", address)
          let query = new URLSearchParams();
          query.append("ID", currentBattle.ID)
          let status = '';
          let li = document.createElement('li')
          fetch('/sign?' + querySignExist.toString()).then(async(res) => {
            let button = document.createElement("button")
            const data = await res.json()
            if (data.r.length > 0) {
              button.value = currentBattle.ID.toString()
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
              })
              status = `Status: Game can be finished` 
            }
            if (data.r == '' && currentBattle.player2 != '0x0000000000000000000000000000000000000000') {
              status = `Status: Second user in game\nYou will be auto redirect` 
              window.location.href = "/game?" + query.toString();
            }
            if (data.r == '' && currentBattle.player2 == '0x0000000000000000000000000000000000000000') {
              button.value = currentBattle.ID.toString()
              button.textContent = "Withdraw"
              button.addEventListener('click', async () => {
                modalConfirm.style.display = 'block'
                await contract.withdraw(currentBattle.ID)
                  .then(async (tx) => {
                      modalConfirm.style.display = 'none'
                      modalPending.style.display = 'block'
                      await tx.wait().then(() => {
                        modalPending.style.display = 'none'
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
              status = `Status: No one in game` 
            }
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
            li.appendChild(button)
          })
          btn.style.display = 'none'
          openGamesList.insertBefore(li, openGamesList.firstChild)
        }
        opengames.appendChild(openGamesList)
      }
      const pastBattlesFunc = async () => {
        const pastBattles = await contract.getUserPastBattles(address)
        document.getElementById("pastgames-list").remove()
        let pastgames = document.getElementById("pastgames")
        let pastGamesList = document.createElement('ul')
        pastGamesList.id = "pastgames-list"
        let counterForElementEmpty = 0;
        pastBattles.forEach((v) => {
          if (v.battleCreatedTimestamp != 0) {
            let li = document.createElement('li')
            if (v.player1 == address) {
              const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
              const headerDiv = document.createElement('div')
              headerDiv.textContent = `
              ID: ${v.ID.toString()}
              Creator: ${addressPlayer1}
              Map: Steel plant
              `
              const middleDiv = document.createElement('div')
              middleDiv.textContent = 'Status: Finished'
              const bottomDiv = document.createElement('div')
              bottomDiv.textContent = `
              Bet per round: ${ethers.utils.formatEther(v.amountForOneDeath)} ROSE
              To deposit: ${ethers.utils.formatEther(v.player1Amount)} ROSE
              `
              li.appendChild(headerDiv)
              li.appendChild(middleDiv)
              li.appendChild(bottomDiv)
            } else {
              li.textContent = `ID: ${v.ID} Amount Winned: ${ethers.utils.formatEther(v.player2Amount)} ETH`
            }
            pastGamesList.appendChild(li)
            counterForElementEmpty+=1;
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
