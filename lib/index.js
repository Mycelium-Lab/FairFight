import { contractAbi, ERC20 } from './contract.js'
import { networks } from './modules/networks.js'
import { tokens } from './modules/tokens.js';
import { calcAmountWithDecimals, shortFloat } from './src/utils/utils.js'
import { openFightsFunc } from './src/openFights.js';
import { pastFightsFunc } from './src/pastFights.js';
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { shop } from './src/shop.js';
import { inventory } from './src/inventory.js'

let network = networks.find(n => n.chainid == 42262);
if (window.location.search.includes('network')) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let networkID = params.network
  network = networks.find(n => n.chainid == networkID)
}
let selectedToken = {}
let approved = true;
let amountWithDecimals;
$(document).ready(async function () {
  let tokenListHTML;
  let tokenListHTML2;
  let networkTokens;
  const btn = document.getElementById("btn_modal_window");
  try {
    //Убираем модалку Buy ROSE если сеть не oasis
    if (network.chainid == 42262 || network.chainid == 42261) {
      document.getElementById('howtobuy-show').style.display = 'block'
    } else {
      document.getElementById('howtobuy-show').style.display = 'none'
    }
    const dropDownButton = document.getElementsByClassName('dropdown createGame')[0]
    const dropDownCheck = document.getElementById('dropdown-check')
    dropDownButton.addEventListener("click", (event) => {
      if (event.target !== dropDownCheck) {
        dropDownCheck.checked = dropDownCheck.checked ? false : true
      }
    })
    const modal = document.getElementById("my_modal");
    if (!window.ethereum) {
      document.getElementById("opengames_empty").style.display = ''
      document.getElementById("opengames").classList.add("empty")
      document.getElementById("pastgames_empty").style.display = ''
      document.getElementById("pastgames").classList.add("empty")
    }
    document.getElementById('createGame').textContent = 'Create'
    const networkSelect = document.getElementById('networks').getElementsByClassName('network-deactive')
    for (let i = 0; i < networkSelect.length; i++) {
      if (networkSelect.item(i).id.includes(network.chainid)) {
        networkSelect.item(i).classList.replace('network-deactive','network-active')
      }
    } 
    document.getElementById('network_name').textContent = network.name
    networkTokens = tokens.find(v => v.chaindid == network.chainid)
    tokenListHTML = document.getElementById('select-token-list')
    tokenListHTML2 = document.getElementById('select-token-list2')
    selectedToken = {
      address: networkTokens.list[0].address,
      symbol: networkTokens.list[0].symbol,
      decimals: networkTokens.list[0].decimals
    }
    document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
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
    let __provider;
    //SAPPHIRE
    if (network.chainid == 23294) {
      __provider = sapphire.wrap(new ethers.providers.Web3Provider(window.ethereum))
    } else {
      __provider = new ethers.providers.Web3Provider(window.ethereum)
    }
    await __provider.send("eth_requestAccounts", []).catch(err => console.log(err));
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.reload()
    })
    window.ethereum.on('chainChanged', function (chaindid) {
      if (networks.find(n => n.chainid == chaindid)) {
        if (chaindid == 42262) {
          window.location = `/`
        } else {
          window.location = `/?network=${chaindid.toString()}`
        }
      }
    })
  } catch (error) {
    console.log(error)
  }
  try {
    if (window.ethereum.networkVersion != network.chainid) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(network.chainid) }]
        })
        .then(() => window.location.reload())
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: network.name,
                chainId: ethers.utils.hexlify(network.chainid),
                nativeCurrency: { name: network.currency, decimals: 18, symbol: network.currency},
                rpcUrls: [network.rpc]
              }
            ]
          })
          .then(() => window.location.reload())
        }
      }
    } else {
      //get provider and signer
    let provider;
    //SAPPHIRE
    if (network.chainid == 23294) {
      provider = sapphire.wrap(new ethers.providers.Web3Provider(window.ethereum))
    } else {
      provider = new ethers.providers.Web3Provider(window.ethereum)
    }
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
        // if (network.chainid == 23294) {
        //   signer = sapphire.wrap(await provider.getSigner())
        // } else {
        signer = await provider.getSigner()
        // }
        contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
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
            // if (network.chainid == 23294) {
            //   signer = sapphire.wrap(await provider.getSigner())
            // } else {
              signer = await provider.getSigner()
            // }
            contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
            address = await signer.getAddress()
            connectButton.style.display = 'none'
            window.location.reload()
          } catch (error) {
            console.error(error)
          }
        })
      }
      networkTokens.list.forEach((v, i) => {
        let selectTokenButton = document.createElement('button')
        selectTokenButton.id = v.symbol
        selectTokenButton.classList.add('figure')
        if (selectedToken.symbol == v.symbol) {
          selectTokenButton.classList.add('token-active')
        } else {
          selectTokenButton.classList.add('token-deactive')
        }
        let selectTokenIMG = document.createElement('img')
        selectTokenIMG.src = v.src
        selectTokenIMG.id = v.symbol
        selectTokenIMG.alt = v.symbol
        let selectTokenCaption = document.createElement('div')
        selectTokenCaption.classList.add('caption')
        selectTokenCaption.textContent = v.symbol
        selectTokenCaption.id = v.symbol
        selectTokenButton.appendChild(selectTokenIMG)
        selectTokenButton.appendChild(selectTokenCaption)
        if (i < 2) {
          tokenListHTML.appendChild(selectTokenButton)
        } else {
          tokenListHTML2.appendChild(selectTokenButton)
        }
        selectTokenButton.addEventListener('click', async (event) => {
          const newSelectedToken = networkTokens.list.find(token => token.symbol == event.target.id)
          document.getElementById(selectedToken.symbol).classList.replace('token-active', 'token-deactive')
          selectedToken.address = newSelectedToken.address
          selectedToken.symbol = newSelectedToken.symbol
          document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
          if (!document.getElementById(selectedToken.symbol).classList.replace('token-deactive', 'token-active')) {
            document.getElementById(selectedToken.symbol).classList.add('token-active')
          }
          const amountToPlay = document.getElementById("amountToPlay")
          const amountPerDeath = document.getElementById("amountPerDeath")
          if (amountToPlay.value != '' && amountPerDeath.value != '') {
            const _amount = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
            if (selectedToken.address != ethers.constants.AddressZero) {
              const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
              const allowance = await tokenContract.allowance(address, contract.address)
              amountWithDecimals = (_amount * 10**selectedToken.decimals).toString()
              if (BigInt(allowance) >= BigInt(amountWithDecimals)) {
                approved = true;
                document.getElementById('createGame').textContent = 'Create'
              } else {
                approved = false;
                document.getElementById('createGame').textContent = 'Approve'
              }
            } else {
              approved = true;
              document.getElementById('createGame').textContent = 'Create'
            }
          } 
        })
      })
      if (tokenListHTML2.children.length == 0) {
        tokenListHTML2.style.display = 'none'
      }
      if (network.chainid == 31337 || network.chainid == 503129905) {
        const changeCharacterBtn = document.querySelector("#change-character")
        const shopShow = document.querySelector('#shop-show')
        changeCharacterBtn.style.display = 'block'
        shopShow.style.display = 'block'
        inventory(address, network, signer, sapphire.wrap)
        shop(address, network, signer, sapphire.wrap)
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
      const spanConfirm = document.getElementsByClassName("close_modal_window")[13];
      const spanPending = document.getElementsByClassName("close_modal_window")[14];
      const spanApprove = document.getElementsByClassName("close_modal_window")[10];
      const spanBuy = document.getElementsByClassName("close_modal_window")[11];
      const chooseCharacter = document.getElementsByClassName("close_modal_window")[12];
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
      const approve_modal = document.getElementById("approve_modal")
      const buy_modal = document.getElementById("buy_modal") 
      const chooseCharacterModal = document.getElementById("choose_character_modal")
      
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
      spanApprove.onclick = function () {
        approve_modal.style.display = 'none'
      }
      spanBuy.onclick = function () {
        buy_modal.style.display = 'none'
      }
      chooseCharacter.onclick = function () {
        chooseCharacterModal.style.display = 'none'
      }
      var modal = document.getElementById("myModal");
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
          } else if (event.target == approve_modal) {
            approve_modal.style.display = 'none'
          } else if (event.target == buy_modal) {
            buy_modal.style.display = 'none'
          } else if (event.target == chooseCharacterModal) {
            chooseCharacterModal.style.display = 'none'
          }
      }
      const amountToPlay = document.getElementById("amountToPlay")
      const amountPerDeath = document.getElementById("amountPerDeath")
      const totalPrizePool = document.getElementById("totalPrizePool")
      const yourDeposit = document.getElementById("yourDeposit")
      amountToPlay.addEventListener('input', async () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          const _amount = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
          totalPrizePool.textContent = shortFloat(_amount * 2)
          yourDeposit.textContent = shortFloat(_amount)
          if (selectedToken.address != ethers.constants.AddressZero) {
            const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
            const allowance = await tokenContract.allowance(address, contract.address)
            amountWithDecimals = (_amount * 10**selectedToken.decimals).toString()
            if (BigInt(allowance) >= BigInt(amountWithDecimals)) {
              approved = true;
              document.getElementById('createGame').textContent = 'Create'
            } else {
              approved = false;
              document.getElementById('createGame').textContent = 'Approve'
            }
          }
        } else {
          totalPrizePool.textContent = '-'
          yourDeposit.textContent = '-'
        }
      });
      amountPerDeath.addEventListener('input', async () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          const _amount = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
          totalPrizePool.textContent = shortFloat(_amount * 2)
          yourDeposit.textContent = shortFloat(_amount)
          if (selectedToken.address != ethers.constants.AddressZero) {
            const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
            const allowance = await tokenContract.allowance(address, contract.address)
            amountWithDecimals = (_amount * 10**selectedToken.decimals).toString()
            if (BigInt(allowance) >= BigInt(amountWithDecimals)) {
              approved = true;
              document.getElementById('createGame').textContent = 'Create'
            } else {
              approved = false;
              document.getElementById('createGame').textContent = 'Approve'
            }
          }
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
            let promise;
            if (approved) {
              if (selectedToken.address == ethers.constants.AddressZero) {
                if (network.chainid == 23294) {
                  promise = contract.connect(sapphire.wrap(signer)).create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address, {value: BigInt(Math.round(amountToPlayValue)).toString()})
                } else {
                  promise = contract.create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address, {value: BigInt(Math.round(amountToPlayValue)).toString()})
                }
              } else {
                if (network.chainid == 23294) {
                  promise = contract.connect(sapphire.wrap(signer)).create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address)
                } else {
                  promise = contract.create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address)
                }
              }
            } else {
              const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
              if (network.chainid == 23294) {
                promise = tokenContract.connect(sapphire.wrap(signer)).approve(contract.address, ethers.constants.MaxUint256)
              } else {
                promise = tokenContract.approve(contract.address, ethers.constants.MaxUint256)
              }
            }
            promise 
              .then(async (tx) => {
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'block'
                tx.wait()
                  .then(() => {
                    if (!approved) {
                      approved = true;
                      document.getElementById('createGame').textContent = 'Create'
                      document.getElementById("pending_modal").style.display = 'none'
                      document.getElementById('approved_token').textContent = selectedToken.symbol.length != 0 ? selectedToken.symbol : 'Token'
                      document.getElementById('approved_text').textContent = 'Now you can create a game.'
                      approve_modal.style.display = 'block'
                    } else {
                      amountPerDeath.value = 0
                      amountPerDeath.value = 0
                      document.getElementById("my_modal").style.display = 'none'
                      document.getElementById("pending_modal").style.display = 'none'
                      btn.style.display = 'none'
                      openFightsFunc(address, contract, network, signer, sapphire.wrap).catch(err => console.log(err))
                    }
                  })
              })
              .catch(async (err) => {
                console.log(err)
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'none'
                const msg = err.reason === undefined ? err.data.message : err.reason
                if (msg != undefined) {
                    if (msg.includes("Too little amount per round")) {
                      
                      const _minAmountForOneRound = await contract.minAmountPerRound(selectedToken.address)
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `Bet per round must be higher or equal ${calcAmountWithDecimals(_minAmountForOneRound, selectedToken.decimals)} ${selectedToken.symbol}`
                    }
                    if (msg.includes("must be divided")) {
                      if(amountToPlay.value.includes(',') || amountToPlay.value.includes('.')) {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `The number should be written without a dot or a comma`
                      } else {
                        error_modal.style.display = 'block'
                        error_modal_text.textContent = `Your deposit must be divisible by bet per round without remainder`
                      }
                    }
                    if (msg.includes("have open fight")) {
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `You already have open fight`
                    }
                    if (msg.includes("Wrong rounds amount")) {
                      const _maxRounds = await contract.maxRounds()
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `The maximum number of rounds is ${_maxRounds.toString()}`
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
      // setInterval(() => {
      //   openFightsFunc(address, contract, network, signer).catch(err => console.log(err))
      // }, 3000)
      setInterval(() => {
        pastFightsFunc(address, contract, network, signer).catch(err => console.log(err))
      }, 10000)
      openFightsFunc(address, contract, network, signer, sapphire.wrap).catch(err => console.log(err))
      pastFightsFunc(address, contract, network, signer).catch(err => console.log(err))
    }
    
  } catch (error) {
    console.error(error)
  }
  });
