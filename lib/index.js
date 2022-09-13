// import { contractAbi, contractAddress } from "./contract.js";
import { contractAbi, contractAddress } from './contract.js'
const testnestHardhatID = 31337
$(document).ready(async function () {
    if (window.ethereum.networkVersion != testnestHardhatID) {
      console.log(window.ethereum.networkVersion!= testnestHardhatID)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(testnestHardhatID) }]
        })
        .then(() => location.reload())
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Hardhat Test',
                chainId: ethers.utils.hexlify(testnestHardhatID),
                nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                rpcUrls: ['http://localhost:8545']
              }
            ]
          });
        }
      }
    } else {
      //get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      if(!provider){
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
        document.getElementById("myModal").style.color = "black"
        document.getElementById("reload").addEventListener("click",()=>{location.reload()})
      }  
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractAbi, signer)
      const address = await signer.getAddress()
      //just see wallet
      const walletDisconnect = document.getElementById("disconnect")
      walletDisconnect.textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
      walletDisconnect.style.display = ''
      //see balance on site
      const balanceA = ethers.utils.formatEther((await provider.getBalance(address)).toString())
      document.getElementById("walletHeader").style.display = "none"
      const internalNumBalance = parseFloat(balanceA)
      const text = "Your balance: " + internalNumBalance.toString() + " ETH"
      document.getElementById("startInternalBalance").style.display = 'inline-block'  
      document.getElementById("startInternalBalance").innerText = text  
      // document.getElementById("room").style.display = "flex"
      // document.getElementById("name").disabled = false;
      // document.getElementById("inputName").disabled = false;
      document.getElementById("createGame").disabled = false;
      const amountToPlayText = document.getElementById("amountToPlayText")
      const amountPerDeathText = document.getElementById("amountPerDeathText")
      const deathInARow = document.getElementById("deathInARow")
      deathInARow.style.display = ''
      const maxDeathInARow = await contract.maxDeathInARow()
      deathInARow.textContent = `Max death in a row ${maxDeathInARow.toString()}`
      amountToPlayText.style.display = ''
      amountPerDeathText.style.display = ''
      document.getElementById("connect").disabled = true;
      document
        .getElementById("createGame")
        .addEventListener("click", async function () {
          const amountToPlay = document.getElementById("amountToPlay")
          const amountPerDeath = document.getElementById("amountPerDeath")
          const amountToPlayValue = ethers.utils.parseEther(amountToPlay.value)
          const amountPerDeathValue = ethers.utils.parseEther(amountPerDeath.value)
          await contract.createBattle(amountPerDeathValue, {value: amountToPlayValue.toString()})
            .then(async (tx) => {
              await tx.wait()
              currentBattleFunc()
          })
          .catch(err => {
            if (err.reason != undefined) {
              alert(err.reason)
            }
          })
        });
      const currentBattleFunc = async () => {
        let currentBattle = await contract.getCurrentUserGame(address)
        if (currentBattle.battleCreatedTimestamp == 0) {
          document.getElementById("currentgame").style.display = 'none'
        } else {
          document.getElementById("currentgame-empty").style.display = 'none'
          document.getElementById("createGame").disabled = true;
          document.getElementById("createGame").style.display = 'none';
          document.getElementById("amountToPlayText").style.display = 'none'
          document.getElementById("amountPerDeathText").style.display = 'none'
          document.getElementById("deathInARow").style.display = 'none'
          document.getElementById("currentgame").style.display = ''
          document.getElementById("currentgame-ID").textContent = `ID: ${currentBattle.ID}`
          let link = document.getElementById("currentGame-Link")
          let query = new URLSearchParams();
          query.append("ID", currentBattle.ID)
          link.href = "/game?" + query.toString();
          let querySignExist = new URLSearchParams();
          querySignExist.append("gameID", currentBattle.ID)
          querySignExist.append("address", address)
          const currentBattleInterval = setInterval(() => {
            fetch('/sign?' + querySignExist.toString()).then(async(res) => {
              currentBattle = await contract.getCurrentUserGame(address)
              if (currentBattle.player1Amount.toString() == '0') {
                document.getElementById("currentgame").style.display = 'none'
                document.getElementById("createGame").disabled = false;
                document.getElementById("createGame").style.display = '';
                document.getElementById("amountToPlayText").style.display = ''
                document.getElementById("amountPerDeathText").style.display = ''
                document.getElementById("deathInARow").style.display = ''
                document.getElementById("currentgame-empty").style.display = ''
                clearInterval(currentBattleInterval);
              }
              const data = await res.json()
              if (data.r == '' && currentBattle.player2 != '0x0000000000000000000000000000000000000000') {
                window.location.href = "/game?" + query.toString();
              }
            })
          }, 3000)
          const finishButton = document.getElementById("currentgame-Finish")
          let querySign = new URLSearchParams();
          querySign.append("gameID", currentBattle.ID)
          querySign.append("address", address)
          finishButton.addEventListener('click' , async () => {
            fetch('/sign?' + querySign.toString())
            .then(async(res) => {
              const data = await res.json()
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
              await contract.finishBattle(dataToContract)
                .then(async (tx) => {
                  await tx.wait()
                  document.getElementById("currentgame").style.display = 'none'
                  document.getElementById("currentgame-empty").style.display = ''
                  document.getElementById("createGame").disabled = false;
                  document.getElementById("createGame").style.display = '';
                  document.getElementById("amountToPlayText").style.display = ''
                  document.getElementById("amountPerDeathText").style.display = ''
                  document.getElementById("deathInARow").style.display = ''
                })
                .catch(err => {
                  if (err.reason != undefined) {
                    alert(err.reason)
                  }
                })
              }
            })
            .catch(err => {
              alert(err)
            })
          })
          const withdrawButton = document.getElementById("currentgame-Withdraw")
          withdrawButton.addEventListener('click', async () => {
            await contract.withdraw(currentBattle.ID)
              .then(async (tx) => {
                  await tx.wait()
                  document.getElementById("currentgame").style.display = 'none'
                  document.getElementById("currentgame-empty").style.display = ''
                  document.getElementById("createGame").disabled = false;
                  document.getElementById("createGame").style.display = '';
                  document.getElementById("amountToPlayText").style.display = ''
                  document.getElementById("amountPerDeathText").style.display = ''
                  document.getElementById("deathInARow").style.display = ''
              })
              .catch(err => {
                if (err.reason != undefined) {
                  alert(err.reason)
                }
              })
          })
        }
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
              await contract.joinBattle(event.target.value, {value: amountToPlay.toString()})
              .then(async (tx) => {
                await tx.wait()
                let query = new URLSearchParams();
                query.append("ID", event.target.value)
                window.location.href = "/game?" + query.toString();
              })
              .catch(err => {
                if (err.reason != undefined) {
                  alert(err.reason)
                }
              })
            })
            const addressPlayer1 = v.player1.slice(0, 6) + '...' + v.player1.slice(v.player1.length - 4, v.player1.length);
            li.textContent = `Amount to play: ${ethers.utils.formatEther(v.player1Amount)} ETH; Creator: ${addressPlayer1} `
            li.appendChild(button)
            openGamesList.appendChild(li)
            counterForElementEmpty+=1;
          }
        })
        if (counterForElementEmpty == 0) {
          document.getElementById("opengames-empty").style.display = ''
        } else {            
          document.getElementById("opengames-empty").style.display = 'none'
        }
        opengames.appendChild(openGamesList)
      }
      setInterval(() => {
        openBattlesFunc()
      }, 1000)
      currentBattleFunc()
    }
  });

var roomName = window.location.search;
