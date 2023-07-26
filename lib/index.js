import { contractAbi, ERC20 } from './contract.js'
import { networks } from './modules/networks.js'
import { tokens } from './modules/tokens.js';
import { addWalletToLocalStorage, calcAmountWithDecimals, createShortAddress, getAccountFromLocalStorage, getWalletTypeFromLocalStorage, removeWalletFromLocalStorage, shortFloat, WalletTypes } from './src/utils/utils.js'
import { openFightsFunc } from './src/openFights.js';
import { pastFightsFunc } from './src/pastFights.js';
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { shop } from './src/shop.js';
import { inventory } from './src/inventory.js'
import { EthereumProvider } from "@walletconnect/ethereum-provider";

const mobileAndTabletCheck = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
  let isMobile = mobileAndTabletCheck()
  let address = getAccountFromLocalStorage()
  let walletType = getWalletTypeFromLocalStorage() 
  //baseProvider is either window.ethereum or EthereumClient from walletconnect
  let baseProvider
  //provider is ethers.Web3Provider
  let provider
  let contract
  let signer
  //button that opens the wallet selection
  let ConnectButton = document.querySelector('#connect')
  //wallet disconnect
  let ExitButton = document.querySelector('#exit')
  //wallet selection modal
  let connectModal = document.querySelector('#new-connect-modal')
  //TODO: оборачивать в sapphire.wrap() если сеть сапфир
  //TODO: смена сети

//     window.ethereum.on('chainChanged', function (chaindid) {
//       if (networks.find(n => n.chainid == chaindid)) {
//         if (chaindid == 42262) {
//           window.location = `/`
//         } else {
//           window.location = `/?network=${chaindid.toString()}`
//         }
//       }
//     })

  //create walletconnectV2 connection
  const walletConnectFunction = async () => {
    try {
      connectModal.style.display = 'none'
      const _provider = await EthereumProvider.init({
          projectId:'5b7fc1b6253c0650987fa946f2085162', // REQUIRED your projectId
          chains: [42262], // REQUIRED chain ids
          optionalChains: [23294, 503129905, 56],
          showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal,
          rpcMap: {
            '503129905': 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
            '42262': 'https://emerald.oasis.dev',
            '23294': 'https://sapphire.oasis.io',
            '56': 'https://bsc-dataseed.binance.org'
          },
          optionalMethods: ['wallet_switchEthereumChain'],
          optionalEvents: ['accountsChanged'],
          qrModalOptions: {
            "themeVariables": {
              "--w3m-overlay-background-color": '#FF7C06',
              "--w3m-accent-color": '#FF7C06',
              "--w3m-accent-fill-color": '#FF7C06',
              "--w3m-background-color": '#FF7C06'
            }
          }
      })
      await _provider.enable()
      provider = new ethers.providers.Web3Provider(_provider)
      signer = await provider.getSigner()
      contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
      address = await signer.getAddress()
      addWalletToLocalStorage(address, WalletTypes.WALLET_CONNECT)
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }
  //check if we already connected (account stores in localStorage)
  if (address !== null) {
    //update info about chain, account, provider, contract, signer
    //WalletTypes.INJECTED is metamask usually
    if (walletType === WalletTypes.INJECTED) {
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner()
        contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
        address = await signer.getAddress()
        addWalletToLocalStorage(address, WalletTypes.INJECTED)
        baseProvider = window.ethereum
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', async (accounts) => {
            console.log(accounts)
          })
          window.ethereum.on('chainChanged', (data) => {
            console.log(data)
          })
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      const _provider = await EthereumProvider.init({
        projectId:'5b7fc1b6253c0650987fa946f2085162', // REQUIRED your projectId
        chains: [42262], // REQUIRED chain ids
        optionalChains: [23294, 503129905, 56],
        showQrModal: false, // REQUIRED set to "true" to use @walletconnect/modal,
        rpcMap: {
          '503129905': 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
          '42262': 'https://emerald.oasis.dev',
          '23294': 'https://sapphire.oasis.io',
          '56': 'https://bsc-dataseed.binance.org'
        },
        optionalMethods: ['wallet_switchEthereumChain'],
        optionalEvents: ['accountsChanged']
      })
      await _provider.enable()
      baseProvider = _provider
      _provider.on('accountsChanged', async (accounts) => {
        console.log(accounts)
      })
      _provider.on('chainChanged', (data) => {
        console.log(data)
      })
      provider = new ethers.providers.Web3Provider(_provider)
      signer = await provider.getSigner()
      contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
      address = await signer.getAddress()
      addWalletToLocalStorage(address, WalletTypes.WALLET_CONNECT)
    }
    ConnectButton.textContent = createShortAddress(address)
    ExitButton.addEventListener('click', async () => {
      removeWalletFromLocalStorage()
      if (walletType === WalletTypes.WALLET_CONNECT) {
        const _provider = await EthereumProvider.init({
          projectId:'5b7fc1b6253c0650987fa946f2085162', // REQUIRED your projectId
          chains: [42262], // REQUIRED chain ids
          optionalChains: [23294, 503129905, 56],
          showQrModal: false, // REQUIRED set to "true" to use @walletconnect/modal,
          rpcMap: {
            '503129905': 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
            '42262': 'https://emerald.oasis.dev',
            '23294': 'https://sapphire.oasis.io',
            '56': 'https://bsc-dataseed.binance.org'
          }
        })
        await _provider.enable()
        await _provider.disconnect()
      }
      window.location.reload()
    })
  } else {
    //if we dont have connected account
    ExitButton.style.display = 'none'
    //if mobile then just walletconnect
    ConnectButton.addEventListener('click', async () => {
      if (!isMobile) {
        connectModal.style.display = 'block'
        document.querySelector('#connect-modal-close').addEventListener('click', () => connectModal.style.display = 'none')
      } else {
        await walletConnectFunction()
      }
    })
    let metamaskConnect = document.querySelector('#metamask-connect')
    if (isMobile) metamaskConnect.style.display = 'none'
    let walletConnect = document.querySelector('#walletconnect-connect')
    metamaskConnect.addEventListener('click', async () => {
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner()
        contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
        let address = await signer.getAddress()
        addWalletToLocalStorage(address, WalletTypes.INJECTED)
        window.location.reload()
      } catch (error) {
        console.log(error)
      }
    })
    walletConnect.addEventListener('click', walletConnectFunction)
  }
  let tokenListHTML;
  let tokenListHTML2;
  let networkTokens;
  let networkTokensList
  const btn = document.getElementById("btn_modal_window");
  try {
    //remove the Buy ROSE modal if the network is not oasis
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
    //CREATE GAME MODAL
    const modal = document.getElementById("my_modal");
    //if provider is not connected than when click on NEW GAME btn opens connect wallet modal
    if (!provider) {
      document.getElementById("opengames_empty").style.display = ''
      document.getElementById("opengames").classList.add("empty")
      document.getElementById("pastgames_empty").style.display = ''
      document.getElementById("pastgames").classList.add("empty")
      btn.addEventListener('click', async () => {
        if (!isMobile) {
          connectModal.style.display = 'block'
          document.querySelector('#connect-modal-close').addEventListener('click', () => connectModal.style.display = 'none')
        } else {
          await walletConnectFunction()
        }
      })
    } else {
      //set chosen network on select list
      document.getElementById('createGame').textContent = 'Create'
      const networkSelect = document.getElementById('networks').getElementsByClassName('network-deactive')
      for (let i = 0; i < networkSelect.length; i++) {
        if (networkSelect.item(i).id.includes(network.chainid)) {
          networkSelect.item(i).classList.replace('network-deactive','network-active')
        }
      } 
      networkTokens = tokens.find(v => v.chaindid == network.chainid)
      //in game we can use different tokens
      //here we take tokens depending on the network
      networkTokensList =  [...networkTokens.list]
      if (network.chainid == 42262 || network.chainid == 23294) networkTokensList.pop()
      tokenListHTML = document.getElementById('select-token-list')
      tokenListHTML2 = document.getElementById('select-token-list2')
      selectedToken = {
        address: networkTokensList[0].address,
        symbol: networkTokensList[0].symbol,
        decimals: networkTokensList[0].decimals
      }
      document.getElementById('network_name').textContent = network.name
      //first token in list is always placeholder for chosen token
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
      //network is not right - change or add than change
      if (baseProvider.networkVersion ? (baseProvider.networkVersion != network.chainid) : (baseProvider.chainId != network.chainid)) {
        try {
          await baseProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(network.chainid) }]
          })
          .then(() => window.location.reload())
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await baseProvider.request({
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
      }
      //if network is sapphire
      //wrap provider to sapphire network wrapper
      if (network.chainid == 23294) {
        provider = sapphire.wrap(provider)
      }
      //create network tokens list on the page
      networkTokensList.forEach((v, i) => {
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
          const newSelectedToken = networkTokensList.find(token => token.symbol == event.target.id)
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
      if (network.chainid == 31337 || network.chainid == 503129905 || network.chainid == 23294 || network.chainid == 42262) {
        document.querySelector("#shop-inventory-btns").style.display = ''
        inventory(address, network, signer, sapphire.wrap).catch(err => console.log(err))
        shop(address, network, signer, sapphire.wrap).catch(err => console.log(err))
      }
//       //just see wallet
//       const walletDisconnect = document.getElementById("disconnect")
//       document.getElementById("disconnect-address").textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
//       walletDisconnect.style.display = ''
//       document.getElementById("walletHeader").style.display = "none"
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
            const map = document.getElementById('map').value
            promise 
              .then(async (tx) => {
                document.getElementById("confirmation_modal").style.display = 'none'
                document.getElementById("pending_modal").style.display = 'block'
                tx.wait()
                  .then(async (_waited) => {
                    if (!approved) {
                      approved = true;
                      try {
                        const approveEvent = _waited.events.find(v => v.event === 'Approval')
                        const approvedAmount = BigInt((approveEvent.args.value).toString())
                        approved = approvedAmount >= BigInt(Math.round(amountToPlayValue)) ? true : false
                      } catch (error) {
                        console.log(error)
                      }
                      if (approved) {
                        document.getElementById('createGame').textContent = 'Create'
                        document.getElementById("pending_modal").style.display = 'none'
                        document.getElementById('approved_token').textContent = selectedToken.symbol.length != 0 ? selectedToken.symbol : 'Token'
                        document.getElementById('approved_text').textContent = 'Now you can create a game.'
                        approve_modal.style.display = 'block'
                      } else {
                        document.getElementById("pending_modal").style.display = 'none'
                        document.getElementById('approved_token').textContent = selectedToken.symbol.length != 0 ? `${selectedToken.symbol} not` : 'Token not'
                        document.getElementById('approved_text').textContent = 'Please enter the correct amount for approve.'
                        approve_modal.style.display = 'block'
                      }
                    } else {
                      const gameid = (await contract.lastPlayerFight(address)).toString()
                      await fetch("/setgamesprops", {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({gameid, chainid: network.chainid, map})
                      })
                      amountPerDeath.value = 0
                      amountPerDeath.value = 0
                      document.getElementById("my_modal").style.display = 'none'
                      document.getElementById("pending_modal").style.display = 'none'
                      btn.style.display = 'none'
                      openFightsFunc(address, contract, network, signer, sapphire.wrap).catch(err => console.log(err))
                    }
                  })
                  .catch(err => console.log(err))
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
                    if (msg.includes("transfer amount exceeds balance")) {
                      error_modal.style.display = 'block'
                      error_modal_text.textContent = `${selectedToken.symbol} transfer amount exceeds balance`
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
      openFightsFunc(address, contract, network, signer, sapphire.wrap).catch(err => console.log(err))
      pastFightsFunc(address, contract, network, signer).catch(err => console.log(err))
//     }
    
//   } catch (error) {
//     console.error(error)
//   }
    }
  
  } catch (error) {
    console.log(error)
  }
});
