import { contractAbi, ERC20 } from './contract.js'
import { networks } from './modules/networks.js'
import { tokens } from './modules/tokens.js';
import { openFightsFunc } from './src/openFights.js';
import { pastFightsFunc } from './src/pastFights.js';

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
    const dropDownButton = document.getElementsByClassName('dropdown createGame')[0]
    const dropDownCheck = document.getElementById('dropdown-check')
    dropDownButton.addEventListener("click", (event) => {
      if (event.target !== dropDownCheck) {
        dropDownCheck.checked = dropDownCheck.checked ? false : true
      }
    })
    const modal = document.getElementById("my_modal");
    const btn = document.getElementById("btn_modal_window");
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
    document.getElementById('network_name').textContent = network.name.includes('Emerald') ? 'Oasis' : 'Skale'
    const networkTokens = tokens.find(v => v.chaindid == network.chainid)
    let tokenListHTML = document.getElementById('select-token-list')
    selectedToken = {
      address: networkTokens.list[0].address,
      symbol: networkTokens.list[0].symbol
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
  const __provider = new ethers.providers.Web3Provider(window.ethereum)
  await __provider.send("eth_requestAccounts", []).catch(err => console.log(err));
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload()
  })
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
            signer = await provider.getSigner()
            contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
            address = await signer.getAddress()
            connectButton.style.display = 'none'
            window.location.href = '/'
          } catch (error) {
            console.error(error)
          }
        })
      }
      networkTokens.list.forEach(v => {
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
        tokenListHTML.appendChild(selectTokenButton)
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
              const decimals = await tokenContract.decimals()
              const allowance = await tokenContract.allowance(address, contract.address)
              amountWithDecimals = (_amount * 10**decimals).toString()
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
      amountToPlay.addEventListener('input', async () => {
        if (amountToPlay.value != '' && amountPerDeath.value != '') {
          const _amount = parseFloat(amountPerDeath.value) * parseFloat(amountToPlay.value)
          totalPrizePool.textContent = _amount * 2
          yourDeposit.textContent = _amount
          if (selectedToken.address != ethers.constants.AddressZero) {
            const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
            const decimals = await tokenContract.decimals()
            const allowance = await tokenContract.allowance(address, contract.address)
            amountWithDecimals = (_amount * 10**decimals).toString()
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
          totalPrizePool.textContent = _amount * 2
          yourDeposit.textContent = _amount
          if (selectedToken.address != ethers.constants.AddressZero) {
            const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
            const decimals = await tokenContract.decimals()
            const allowance = await tokenContract.allowance(address, contract.address)
            amountWithDecimals = (_amount * 10**decimals).toString()
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
                promise = contract.create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address, {value: BigInt(Math.round(amountToPlayValue)).toString()})
              } else {
                promise = contract.create(BigInt(Math.round(amountPerDeathValue)).toString(),amountToPlay.value,2, selectedToken.address)
              }
            } else {
              const tokenContract = new ethers.Contract(selectedToken.address, ERC20, signer)
              promise = tokenContract.approve(contract.address, ethers.constants.MaxUint256)
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
                    } else {
                      amountPerDeath.value = 0
                      amountPerDeath.value = 0
                      document.getElementById("my_modal").style.display = 'none'
                      document.getElementById("pending_modal").style.display = 'none'
                      btn.style.display = 'none'
                    }
                  })
              })
              .catch(async (err) => {
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'none'
                const msg = err.reason === undefined ? err.data.message : err.reason
                if (msg != undefined) {
                    if (msg.includes("Too little amount per round")) {
                      const _minAmountForOneRound = await contract.minAmountPerRound()
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `Bet per round must be higher or equal ${ethers.utils.formatEther(_minAmountForOneRound.toString())} ROSE`
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
      setInterval(() => {
        openFightsFunc(address, contract, network, signer).catch(err => console.log(err))
      }, 1000)
      setInterval(() => {
        pastFightsFunc(address, contract, network, signer).catch(err => console.log(err))
      }, 10000)
      openFightsFunc(address, contract, network, signer).catch(err => console.log(err))
      pastFightsFunc(address, contract, network, signer).catch(err => console.log(err))
    }
    
  } catch (error) {
    console.error(error)
  }
  });
