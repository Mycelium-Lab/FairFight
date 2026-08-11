// EVM lobby entry.
//
// Everything chain-shaped goes through the adapter built at the top: wallet
// session, allowances, create-fight, units and address form. There is no
// `ethers` in this file.
import { networks } from './modules/networks.js'
import {
  createShortAddress, getAccountFromLocalStorage, getWalletTypeFromLocalStorage,
  mobileAndTabletCheck, shortFloat, WalletTypes
} from './src/utils/utils.js'
import { openFightsFunc } from './src/openFights.js';
import { pastFightsFunc } from './src/pastFights.js';
import { renderShop } from './src/items/shop.js';
import { renderInventory } from './src/items/inventory.js'
import { modalWindow } from './src/modules/modal.js'
import { mainF2PEvm } from './src/fights/f2p.js';
import { networkFromQuery } from './chain/index.js'
import { evmChain } from './chain/evm.js'

export const isDesktop = window.innerWidth > 1024

localStorage.removeItem('setted-armor')
localStorage.removeItem('setted-weapon')
localStorage.removeItem('setted-boots')

// ?network= picks the chain; an id from another family (or none) falls back to
// this family's default. See lib/chain/index.js.
const network = networkFromQuery('evm')
const chain = evmChain({network})

let selectedToken = {}
let approved = true;

$(document).ready(async function () {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.getElementById('hamburger-overlay').classList.remove('modal-overlay_active')
    document.getElementById('menu-body').classList.remove('menu__box_active')
  });

  let isMobile = mobileAndTabletCheck()
  let address = getAccountFromLocalStorage()
  let walletType = getWalletTypeFromLocalStorage()
  //button that opens the wallet selection
  let ConnectButton = document.querySelector('#connect')
  //wallet disconnect
  let ExitButton = document.querySelector('#network-disconnect')
  let DisconnectAddress = document.querySelector('#disconnect-address')
  //wallet selection modal
  let connectModal = document.querySelector('#install_wallet_modal')

  if (window.ethereum) {
    window.ethereum.on('chainChanged', function (chaindid) {
      if (networks.find(n => n.chainid == chaindid)) {
        window.location = `/?network=${chaindid.toString()}`
      }
    })
    window.ethereum.on('accountsChanged', function () {
      window.location.reload()
    })
  }

  //check if we already connected (account stores in localStorage)
  if (address !== null) {
    DisconnectAddress.textContent = createShortAddress(address)
    try {
      // Re-attaches to whichever wallet the last session used. A WalletConnect
      // session that cannot be resumed is answered with a reload, as before.
      address = await chain.resume()
    } catch (error) {
      window.location.reload()
    }
    ExitButton.addEventListener('click', async () => {
      await chain.disconnect()
      window.location.reload()
    })
  } else {
    //if we dont have connected account
    ExitButton.style.display = 'none'
    ConnectButton.addEventListener('click', async () => {
      connectModal.style.display = 'block'
      document.querySelector('#connect-modal-close').addEventListener('click', () => connectModal.style.display = 'none')
    })
    document.querySelector('#metamask').addEventListener('click', async () => {
      try {
        await chain.connect('injected')
        window.location.reload()
      } catch (error) {
        console.log(error)
      }
    })
    document.querySelector('#walletconnect').addEventListener('click', async () => {
      try {
        connectModal.style.display = 'none'
        await chain.connect('walletconnect')
        window.location.reload()
      } catch (error) {
        console.log(error)
      }
    })
  }
  let tokenListHTML;
  let tokenListHTML2;
  let networkTokensList
  const btn = document.getElementById("btn_modal_window");
  const btnMobile = document.getElementById("btn_modal_window_mobile");
  try {
    //remove the Buy ROSE modal if the network is not oasis
    if (network.chainid == 42262 || network.chainid == 42261) {
      document.getElementById('howtobuy-show').style.display = 'block'
    } else {
      document.getElementById('howtobuy-show').style.display = 'none'
    }
    const dropDownCheck = document.getElementById('dropdown-check')
    const dropDownMenu = document.getElementById('networks')
    function openNetwork() {
      dropDownMenu.classList.toggle('network_open')
    }
    window.addEventListener("click", (event) => {
      const classes = Array.from(event.target.classList)
      if (!classes.includes('dropdown-element')) {
        dropDownMenu.classList.remove('network_open');
      }
    })

    document.querySelector('#approve_modal_close_btn').addEventListener('click', () => {
      document.querySelector('#approve_modal').style.display = 'none'
    })

    dropDownCheck.addEventListener("click", () => openNetwork())
    //CREATE GAME MODAL
    const modal = document.getElementById("my_modal");
    //if provider is not connected than when click on NEW GAME btn opens connect wallet modal
    if (!chain.connected) {
      document.getElementById("opengames_empty").style.display = ''
      document.getElementById("opengames").classList.add("empty")
      document.getElementById("pastgames_empty").style.display = ''
      document.getElementById("pastgames").classList.add("empty")
    }

    const hamburger = document.getElementById('hamburger')
    const hamburgerOverlay = document.getElementById('hamburger-overlay')
    const menuBody = document.getElementById('menu-body')
    const menuClose = document.getElementById('menu__close')
    hamburger.onclick = function () {
      menuBody.classList.add('menu__box_active')
      hamburgerOverlay.classList.add('modal-overlay_active')
    }

    function hideMenu (ev) {
      ev.stopPropagation();
      hamburgerOverlay.classList.remove('modal-overlay_active')
      menuBody.classList.remove('menu__box_active')
    }

    hamburgerOverlay.addEventListener('click', hideMenu)
    menuClose.addEventListener('click', hideMenu)

    const networkIcon = document.getElementById('network_icon')
    document.getElementById('network_name').textContent = network.name
    networkTokensList = chain.listAssets()
    networkIcon.src = ''
    if (network.chainid == 42262 || network.chainid == 23294) {
      networkIcon.src = 'media/svg/emerald.svg'
    }
    if(network.chainid == 503129905) {
      networkIcon.src = 'media/svg/scale.svg'
    }
    if(network.chainid == 56 || network.chainid == 204 || network.chainid == 97) {
      networkIcon.src = 'media/svg/bnb.svg'
    }
    if(network.chainid == 137) {
      networkIcon.src = 'media/svg/polygon.svg'
    }
    if (network.chainid == 355113) {
      networkIcon.src = 'media/svg/bitfinity.svg'
    }
    tokenListHTML = document.getElementById('select-token-list')
    tokenListHTML2 = document.getElementById('select-token-list2')
    selectedToken = {...networkTokensList[0]}
    document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
    btn.addEventListener('click', openNewGame)
    btnMobile.addEventListener('click', openNewGame)
    const totalPrizePoolToken = document.querySelector('#totalPrizePoolToken')
    const yourDepositToken = document.querySelector('#yourDepositToken')
    function openNewGame() {
      showHideBgImages(this.id)

      const walletDisconnect = document.getElementById("disconnect")
      if (walletDisconnect.style.display === 'none') {
        const installModal = document.getElementById("install_wallet_modal");
        const spanInstall = document.getElementsByClassName("close_modal_window")[3];
        installModal.style.display = "flex";
        spanInstall.onclick = function () {
          installModal.style.display = "none";
        }
      } else {
        ConnectButton.style.display = 'none'
      }
    }

    function showHideBgImages(id) {
      if (window.innerWidth > 500) {
        const bgImg1 = document.querySelector('.my_modal-bg-1');
        const bgImg2 = document.querySelector('.my_modal-bg-2');
        document.getElementById('player-visible-element').classList.add('d-none');
        if (id === 'btn_modal_window') {
          bgImg1.style.display = 'block';
          bgImg2.style.display = 'none';
        }
      }
    }

    ConnectButton.onclick = function () {
      const installModal = document.getElementById("install_wallet_modal");
      const spanInstall = document.getElementsByClassName("close_modal_window")[3];
      installModal.style.display = "flex";
      spanInstall.onclick = function () {
        installModal.style.display = "none";
      }
      window.onclick = function (event) {
          if (event.target == installModal) {
            installModal.style.display = "none";
          }
      }
    }

    const changeNetworkBtn = document.getElementById("disconnect")
    const changeNetworkModal = document.getElementById('change_netowrk_modal')
    const changeNetworkDropdown  = document.getElementById('dropdown-change-network')
    const changeNetwork = document.getElementById('change-network')
    changeNetworkBtn.onclick = function () {
      if(changeNetworkDropdown.style.display === 'none') {
        changeNetworkDropdown.style.display = 'flex'
      }
        else {
          changeNetworkDropdown.style.display = 'none'
        }
        const name = document.getElementById('network_name')
        const networkNameWrapper = document.getElementById('network-name-wrapper')
        const addressElem = document.getElementById('disconnect-address')
        const _change_netowrk_modal = document.getElementById("change_netowrk_modal")
          window.onclick = function (event) {
            if (event.target == _change_netowrk_modal) {
              _change_netowrk_modal.style.display = 'none'
            }
            if (event.target !== name && event.target !== addressElem && event.target !== networkNameWrapper) {
              changeNetworkDropdown.style.display = "none";
            }
            }
      }

      changeNetwork.onclick = function () {
        changeNetworkModal.style.display = 'flex'
      }
      // A wallet that changes account or chain under us reloads the page onto the
      // right one. Registering through the adapter so the provider stays behind it.
      chain.onAccountChanged((account) => {
        chain.rememberAccount(account)
        window.location.reload()
      })
      chain.onChainChanged((chainid) => {
        const _network = networks.find(n => n.chainid === chainid)
        if (_network) {
          const newLocation = _network.chainid === 42262 ? `/` : `/?network=${_network.chainid}`
          if (!window.location.href.includes(newLocation)) {
            window.location = newLocation
          }
        } else {
          window.location = '/'
        }
      })
      //set chosen network on select list
      document.getElementById('createGame').textContent = 'Create'
      const networkSelect = document.getElementById('networks').getElementsByClassName('network-deactive')
      for (let i = 0; i < networkSelect.length; i++) {
        if (networkSelect.item(i).id.includes(network.chainid)) {
          networkSelect.item(i).classList.replace('network-deactive','network-active')
        }
      }
      networkTokensList = chain.listAssets()
      tokenListHTML = document.getElementById('select-token-list')
      tokenListHTML2 = document.getElementById('select-token-list2')
      selectedToken = {...networkTokensList[0]}
      document.getElementById('network_name').textContent = network.name
      //first token in list is always placeholder for chosen token
      document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
      btn.addEventListener('click', openNewGameModal)
      btnMobile.addEventListener('click', openNewGameModal)

      const btnMobileF2P = document.getElementById("btn_modal_window_mobile_f2p")
      btnMobileF2P.addEventListener('click', () => {
        modal.style.display = 'flex'
        const f2p_checker = document.querySelector('#f2p_checker').checked
        const createGameBtnF2P = document.querySelector('#createGame-f2p')
        const createGameBtn = document.querySelector('#createGame')
        if (f2p_checker) {
          createGameBtnF2P.style.display = ''
          createGameBtn.style.display = 'none'
        } else {
          createGameBtnF2P.style.display = 'none'
          createGameBtn.style.display = ''
        }
      })

      function openNewGameModal () {
        const tokensDividerNewgameModal = document.querySelector("#tokens-divider-newgame-modal")
        const tokensNewgameModal = document.querySelector("#tokens-newgame-modal")
        const tokensDivider = document.querySelector("#tokens-divider")
        const totalPrizePool = document.querySelector("#total-prize-pool-element")
        const yourDepositElement = document.querySelector("#your-deposit-element")
        const playerVisibleElement = document.querySelector('#player-visible-element')
        const playerVisibleElementMobile = document.querySelector('#player-visible-mobile-element')
        const amountPerRound = document.querySelector('#amountPerDeath')
        const createGameBtn = document.querySelector('#createGame')
        const createGameBtnF2P = document.querySelector('#createGame-f2p')
        if (modal) modal.style.display = "flex";
        // caps.tokenChoice gates the bet-asset picker: TON bets are TON.
        const tokenChoice = chain.caps.tokenChoice ? '' : 'none'
        if (tokensDividerNewgameModal) tokensDividerNewgameModal.style.display = tokenChoice
        if (tokensNewgameModal) tokensNewgameModal.style.display = tokenChoice
        if (tokensDivider) tokensDivider.style.display = tokenChoice
        if (totalPrizePool) totalPrizePool.style.display = ''
        if (yourDepositElement) yourDepositElement.style.display = ''
        if (playerVisibleElement) playerVisibleElement.style.display = ''
        if (playerVisibleElementMobile) playerVisibleElementMobile.style.display = ''
        if (amountPerRound) amountPerRound.placeholder = selectedToken.symbol
        if (createGameBtn) createGameBtn.style.display = ''
        if (createGameBtnF2P) createGameBtnF2P.style.display = 'none'
      }
      // caps.chainSwitch: ask the wallet to move to the page's network. A no-op
      // on a family without one, and a swallowed failure when there is no wallet.
      if (chain.caps.chainSwitch) await chain.switchChain(network.chainid)
      // Sapphire reads and writes both go through the confidential provider.
      chain.useConfidentialProvider()
      if (network.chainid == 31337 || network.chainid == 97 || network.chainid == 42161) {
        document.getElementById('tournaments-btn').style.display = ''
        document.getElementById('menu-tournaments-btn').style.display = 'block'
      }

      const numberOfPlayers = document.querySelector('#players-select-selected')
      const amountToPlay = document.querySelector('#rounds-select-selected')
      const amountPerDeath = document.getElementById("amountPerDeath")
      const totalPrizePool = document.getElementById("totalPrizePool")
      const yourDeposit = document.getElementById("yourDeposit")
      const createGameButton = document.getElementById("createGame")

      const inputsFilled = () =>
        amountToPlay.getAttribute('data-value') != ''
        && amountPerDeath.value != ''
        && numberOfPlayers.getAttribute('data-value') != ''

      const setTokenLabels = () => {
        totalPrizePoolToken.textContent = selectedToken.symbol
        totalPrizePoolToken.setAttribute('data-text', selectedToken.symbol)
        yourDepositToken.textContent = selectedToken.symbol
        yourDepositToken.setAttribute('data-text', selectedToken.symbol)
      }

      /*
       * One "recompute the totals and check the allowance" routine.
       *
       * There were four near-copies of this - the token picker, two
       * MutationObservers and the bet input - and they had drifted: two of them
       * had the `textContent = 'Create'` line commented out, so the button could
       * read "Approve" while the code took the create path. This version always
       * relabels, which is the behaviour of the two copies that were complete.
       */
      const recompute = async () => {
        if (!inputsFilled()) {
          totalPrizePool.textContent = '-'
          yourDeposit.textContent = '-'
          totalPrizePool.dataset.text = '-'
          yourDeposit.dataset.text = '-'
          return
        }
        const perRound = parseFloat(amountPerDeath.value)
        const rounds = parseFloat(amountToPlay.getAttribute('data-value'))
        const players = parseInt(numberOfPlayers.getAttribute('data-value'))
        const deposit = perRound * rounds
        const pool = `${shortFloat(deposit * players)} `
        totalPrizePool.textContent = pool
        totalPrizePool.dataset.text = pool
        yourDeposit.textContent = `${shortFloat(deposit)}`
        yourDeposit.dataset.text = `${shortFloat(deposit)}`
        setTokenLabels()
        // caps.requiresApproval is true here; on a family where it is false the
        // adapter answers MAX_UINT256 and this collapses to "approved".
        try {
          const allowance = await chain.getAllowance(address, selectedToken)
          approved = allowance >= chain.toBaseUnits(amountPerDeath.value, selectedToken) * BigInt(amountToPlay.getAttribute('data-value'))
        } catch (error) {
          console.log(error)
          return
        }
        createGameButton.textContent = approved ? 'Create' : 'Approve'
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
          selectedToken = {...newSelectedToken}
          setTokenLabels()
          document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
          if (!document.getElementById(selectedToken.symbol).classList.replace('token-deactive', 'token-active')) {
            document.getElementById(selectedToken.symbol).classList.add('token-active')
          }
          await recompute()
        })
      })
      if (tokenListHTML2.children.length == 0) {
        tokenListHTML2.style.display = 'none'
      }
      document.querySelector('#opengames_empty-title').textContent = 'Empty :('
      document.querySelector('#opengames_empty-desc').textContent = 'At the moment, there are no games available for joining. But you can always start your own by clicking the "New game" button above.'
      document.querySelector('#pastgames_empty-title').textContent = 'Empty :('
      document.querySelector('#pastgames_empty-desc').textContent = `That's where your game history will be listed.`
      document.querySelector('#up-menu').style.display = 'none'
      document.querySelector('#down-menu').style.display = 'none'
      if(!isDesktop) {
        $('#shop-inventory-btns').slick({
          infinite: false,
          vertical: true,
          verticalSwiping: true,
          slidesToShow: 4,
          slidesToScroll: 1,
          initialSlide: 0,
          prevArrow: '#up-menu',
          nextArrow: '#down-menu',
      });
      }
      document.querySelector("#shop-inventory-btns").style.display = ''
      renderInventory(chain, address).catch(err => console.log(err))
      renderShop(chain, address, isMobile).catch(err => console.log(err))

//       //just see wallet
      if (address) {
        ConnectButton.style.display = 'none'
      }
      const walletDisconnect = document.getElementById("disconnect")
      document.getElementById("disconnect-address").textContent = chain.shortAddress(address);
      walletDisconnect.style.display = ''
      document.getElementById("walletHeader").style.display = "none"
      createGameButton.disabled = false;
      const amountToPlayText = document.getElementById("amountToPlayText")
      const amountPerDeathText = document.getElementById("amountPerDeathText")
      amountToPlayText.style.display = ''
      amountPerDeathText.style.display = ''
      const spanConfirm = document.getElementsByClassName("close_modal_window")[13];
      const spanPending = document.getElementsByClassName("close_modal_window")[14];
      const spanApprove = document.getElementsByClassName("close_modal_window")[10];
      const spanBuy = document.getElementsByClassName("close_modal_window")[11];
      const chooseCharacter = document.getElementsByClassName("close_modal_window")[12];
      const airDropModal = document.getElementById("airdrop_modal")
      const modalConfirm = document.getElementById("confirmation_modal")
      const modalPending = document.getElementById("pending_modal")
      const _error_modal = document.getElementById("error_modal")
      const _about_modal = document.getElementById("about_modal")
      const _connect_modal = document.getElementById("connect_modal")
      const _inventory_block = document.getElementById("inventory-block")
      const _shop_block = document.getElementById("shop-block")
      const _inventory_modal = document.getElementById("inventory-modal")
      const approve_modal = document.getElementById("approve_modal")
      const buy_modal = document.getElementById("buy_modal")
      const chooseCharacterModal = document.getElementById("choose_character_modal")

      spanConfirm.onclick = function () {
          modalConfirm.style.display = "none";
      }
      spanPending.onclick = function () {
          modalPending.style.display = "none";
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
          } else if (event.target == _error_modal) {
              _error_modal.style.display = 'none'
          } else if (event.target == _about_modal) {
              _about_modal.style.display = 'none'
          } else if (event.target == _connect_modal) {
              _connect_modal.style.display = 'none'
          } else if (event.target == _shop_block) {
            _shop_block.classList.remove("wrapper__nft-shop-modal-overlay_active")
        }
          else if (event.target == _inventory_block) {
              _inventory_block.classList.remove("active")
          } else if (event.target == _inventory_modal) {
            _inventory_modal.classList.remove('wrapper__inventory-modal-overlay_active')
          }
          else if (event.target == document.getElementById("howtobuy_modal")) {
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

      new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') await recompute()
        })
      }).observe(numberOfPlayers, { attributes: true })
      new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') await recompute()
        })
      }).observe(amountToPlay, { attributes: true })
      amountPerDeath.addEventListener('input', recompute);

      document.getElementById("connect").disabled = true;
      createGameButton.addEventListener("click", async function () {
          try {
            window.addEventListener("popstate", () => {});
            const error_modal = document.getElementById("error_modal")
            const error_modal_text = document.getElementById("error_modal_text")
            try {
              const roundsValue = amountToPlay.getAttribute('data-value')
              const playersValue = numberOfPlayers.getAttribute('data-value')
              if(isNaN(parseFloat(amountPerDeath.value)) || isNaN(parseFloat(roundsValue))) throw Error('Enter a number')
              if (
                parseFloat(amountPerDeath.value) <= 0
                ||
                parseFloat(roundsValue) <= 0
                ) throw Error('The number must be greater than 0')
              if (!/^\d+$/.test(String(roundsValue).trim())) throw Error('The number should be written without a dot or a comma')
              /*
               * Base units in string math, owned by the adapter.
               *
               * This replaces `amountPerDeath.value * 10**decimals` in float
               * followed by BigInt(Math.round(...)). On an 18-decimal token that
               * was lossy - 0.3 became 300000000000000030 - and the number was
               * the one sent on chain. The deposit is now exactly rounds times
               * the per-round bet, so it also cannot fail the contract's
               * "must be divided" check by a rounding unit.
               */
              const amountPerRound = chain.toBaseUnits(amountPerDeath.value, selectedToken)
              const baseAmount = amountPerRound * BigInt(roundsValue)
              document.getElementById("confirmation_modal").style.display = 'flex'
              const promise = approved
                ? chain.createFight({amountPerRound, rounds: roundsValue, players: playersValue, asset: selectedToken})
                : chain.approve(selectedToken)
              const map = document.querySelector('#map-select-selected').getAttribute('data-value')
              promise
                .then(async (tx) => {
                  document.getElementById("confirmation_modal").style.display = 'none'
                  document.getElementById("pending_modal").style.display = 'flex'
                  chain.confirm(tx)
                    .then(async (_waited) => {
                      if (!approved) {
                        approved = true;
                        try {
                          approved = chain.approvedAmountFrom(_waited) >= baseAmount
                        } catch (error) {
                          console.log(error)
                        }
                        document.getElementById("pending_modal").style.display = 'none'
                        document.getElementById('approve_token_img').src = selectedToken.src
                        if (approved) {
                          document.getElementById('approved_token').textContent = selectedToken.symbol.length != 0 ? selectedToken.symbol : 'Token'
                          document.getElementById('approved_text').textContent = 'Now you can create a game.'
                          createGameButton.textContent = 'Create'
                        } else {
                          document.getElementById('approved_token').textContent = selectedToken.symbol.length != 0 ? `${selectedToken.symbol} not` : 'Token not'
                          document.getElementById('approved_text').textContent = 'Please enter the correct amount for approve.'
                          createGameButton.textContent = 'Approve'
                        }
                        approve_modal.style.display = 'flex'
                      } else {
                        setTimeout(async () => {
                          const gameid = await chain.createdFightId(tx, address)
                          await fetch("/setgamesprops", {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({gameid, chainid: network.chainid, map})
                          }).catch(err => console.log(err))
                          amountPerDeath.value = 0
                          document.getElementById("my_modal").style.display = 'none'
                          document.getElementById("pending_modal").style.display = 'none'
                          if (isDesktop) {
                              btn.style.visibility = ''
                              btn.style.display = 'block'
                            }
                            else {
                              btnMobile.style.visibility = ''
                              btnMobile.style.display = 'block'
                          }
                          // The fight the chain has not indexed yet, in the same
                          // normalised shape listOpenFights() returns.
                          openFightsFunc(chain, address, {
                            id: gameid,
                            owner: address,
                            token: selectedToken.address,
                            finishTime: 0,
                            createTime: Math.floor(Date.now() / 1000) + 10,
                            amountPerRound,
                            baseAmount,
                            rounds: parseInt(roundsValue),
                            maxPlayers: parseInt(playersValue),
                            players: [address],
                            claimedBy: {[address]: false}
                          }).catch(err => console.log(err))
                        }, 5000)
                      }
                    })
                    .catch(err => console.log(err))
                })
                .catch(async (err) => {
                  console.log(err)
                  document.getElementById("confirmation_modal").style.display = 'none'
                  document.getElementById("pending_modal").style.display = 'none'
                  let msg = ''
                  if (err.message) msg = err.message
                  if (err.reason) msg = err.reason
                  if (err.data) msg = err.data.message
                  console.log(msg)
                  if (msg != undefined) {
                      if (msg.includes("Too little amount per round")) {
                        const _minAmountForOneRound = await chain.minAmountPerRound(selectedToken)
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `Bet per round must be higher or equal ${chain.formatAmount(_minAmountForOneRound, selectedToken)}`
                      }
                      if (msg.includes("must be divided")) {
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `Your deposit must be divisible by bet per round without remainder`
                      }
                      if (msg.includes("have open fight")) {
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `You already have open fight.\nYou may not have claimed your prize yet.`
                      }
                      if (msg.includes("Wrong rounds amount")) {
                        const _maxRounds = await chain.maxRounds()
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `The maximum number of rounds is ${_maxRounds}`
                      }
                      if (msg.includes("transfer amount exceeds balance")) {
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `${selectedToken.symbol} transfer amount exceeds balance`
                      }
                      if (msg.includes("User rejected the transaction")) {
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `User rejected the transaction`
                      }
                      if (msg.includes("execution failed: out of funds")) {
                        error_modal.style.display = 'flex'
                        error_modal_text.textContent = `Execution failed: out of funds`
                      }
                  }
                  try {
                    if (err.data.message.includes("out of fund")){
                      error_modal.style.display = 'flex'
                      error_modal_text.textContent = `Out of fund`
                    }
                  } catch (error) {
                    console.error(error)
                  }
                })
            } catch (error) {
              if(amountPerDeath.value.includes(',')) {
                error_modal.style.display = 'flex'
                error_modal_text.textContent = `The number should be written with a dot, not a comma`
              }
              try {
                if ([
                  'The number must be greater than 0',
                  'Enter a number',
                  'The number should be written without a dot or a comma'
                ].includes(error.message)) {
                  error_modal.style.display = 'flex'
                  error_modal_text.textContent = error.message
                }
              } catch (error) {
                console.error(error)
              }
            }
          } catch (error) {
            console.log(error)
          }
        });
      const {sign_evm: sign} = await chain.getSessionProof()
      openFightsFunc(chain, address, undefined).catch(err => console.log(err))
      await pastFightsFunc(chain, address).catch(err => console.log(err))
      await mainF2PEvm(address, network, sign)

      setTimeout(() => {
        const infos = document.querySelectorAll('[data-fight]')
        const infoModal = document.getElementById('info_modal')
        infos.forEach((info) => {
          info.addEventListener('click', async (ev) => {
            const fightId =  ev.target.dataset.fight
            infoModal.style.display = 'flex'
            localStorage.setItem('fight_id', fightId)
            await pastFightsFunc(chain, address).catch(err => console.log(err))
          })
        })
      }, 300)
  } catch (error) {
    console.log(error)
  }
});
