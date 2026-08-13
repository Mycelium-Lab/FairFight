/*
 * The EVM half of the lobby.
 *
 * Loaded by lib/lobby.js only on an EVM page - see the note there for why this
 * is an import() and not an import. Everything chain-shaped goes through the
 * adapter built at the top: wallet session, allowances, create-fight, units and
 * address form. There is no `ethers` in this file.
 */
import { networks } from '../modules/networks.js'
import { getAccountFromLocalStorage, mobileAndTabletCheck } from '../src/utils/utils.js'
import { openFightsFunc } from '../src/openFights.js'
import { pastFightsFunc } from '../src/pastFights.js'
import { renderShop } from '../src/items/shop.js'
import { renderInventory } from '../src/items/inventory.js'
// An IIFE that wires the three dressing-room overlays; the exported binding is
// its return value, i.e. undefined. Imported for the side effect. The name used
// to be misspelled on the export side, so webpack bound nothing at all here.
import { modalWindow } from '../src/modules/modal.js'
import { mainF2PEvm } from '../src/fights/f2p.js'
import { networkFromQuery } from '../chain/index.js'
import { evmChain } from '../chain/evm.js'
import { betForm, isDesktop, showError, wireBetTotals, wireInfoModal } from './chrome.js'

// Chains that ship their own icon in the network pill. Everything else shows
// none, which is what setting `src` to '' did.
const NETWORK_ICONS = {
  42262: 'media/svg/emerald.svg',
  23294: 'media/svg/emerald.svg',
  503129905: 'media/svg/scale.svg',
  56: 'media/svg/bnb.svg',
  204: 'media/svg/bnb.svg',
  97: 'media/svg/bnb.svg',
  137: 'media/svg/polygon.svg',
  355113: 'media/svg/bitfinity.svg'
}

// Chains with a tournaments tab.
const TOURNAMENT_CHAINS = [31337, 97, 42161]

// Close buttons, addressed by their index in the page's `.close_modal_window`
// collection because that is the only handle the markup gives them.
const MODAL_CLOSE_BUTTONS = [
  [10, 'approve_modal'],
  [11, 'buy_modal'],
  [12, 'choose_character_modal'],
  [13, 'confirmation_modal'],
  [14, 'pending_modal']
]

// A click on the backdrop dismisses the modal. Two mechanisms, because the
// page uses two: `display` for the older modals, a class for the three newer
// overlays.
const DISMISS_BY_DISPLAY = [
  'my_modal', 'confirmation_modal', 'pending_modal', 'error_modal', 'about_modal',
  'connect_modal', 'howtobuy_modal', 'airdrop_modal', 'leaderboard_modal',
  'approve_modal', 'buy_modal', 'choose_character_modal'
]
const DISMISS_BY_CLASS = {
  'shop-block': 'wrapper__nft-shop-modal-overlay_active',
  'inventory-block': 'active',
  'inventory-modal': 'wrapper__inventory-modal-overlay_active'
}

const dismissOnBackdropClick = (event) => {
  const id = event.target && event.target.id
  if (DISMISS_BY_DISPLAY.includes(id)) event.target.style.display = 'none'
  else if (DISMISS_BY_CLASS[id]) event.target.classList.remove(DISMISS_BY_CLASS[id])
}

/*
 * What the create-fight failure messages say, in the order the original checked
 * them - which matters, because it checked all of them and the last match won.
 */
const CREATE_ERRORS = [
  ['Too little amount per round', async (chain, asset) =>
    `Bet per round must be higher or equal ${chain.formatAmount(await chain.minAmountPerRound(asset), asset)}`],
  ['must be divided', async () => 'Your deposit must be divisible by bet per round without remainder'],
  ['have open fight', async () => 'You already have open fight.\nYou may not have claimed your prize yet.'],
  ['Wrong rounds amount', async (chain) => `The maximum number of rounds is ${await chain.maxRounds()}`],
  ['transfer amount exceeds balance', async (chain, asset) => `${asset.symbol} transfer amount exceeds balance`],
  ['User rejected the transaction', async () => 'User rejected the transaction'],
  ['execution failed: out of funds', async () => 'Execution failed: out of funds'],
  ['out of fund', async () => 'Out of fund']
]

const domReady = () => new Promise(resolve => $(document).ready(resolve))

export const startEvmLobby = async () => {
  await domReady()

  localStorage.removeItem('setted-armor')
  localStorage.removeItem('setted-weapon')
  localStorage.removeItem('setted-boots')

  // ?network= picks the chain; an id from another family (or none) falls back
  // to this family's default. See lib/chain/index.js.
  const network = networkFromQuery('evm')
  const chain = evmChain({network})

  let selectedToken = {}
  let approved = true

  const vh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  vh()
  window.addEventListener('resize', () => {
    vh()
    document.getElementById('hamburger-overlay').classList.remove('modal-overlay_active')
    document.getElementById('menu-body').classList.remove('menu__box_active')
  })

  let address = getAccountFromLocalStorage()
  //button that opens the wallet selection
  const ConnectButton = document.querySelector('#connect')
  //wallet disconnect
  const ExitButton = document.querySelector('#network-disconnect')
  const DisconnectAddress = document.querySelector('#disconnect-address')
  //wallet selection modal
  const connectModal = document.querySelector('#install_wallet_modal')

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
    DisconnectAddress.textContent = chain.shortAddress(address)
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

  const btn = document.getElementById("btn_modal_window")
  const btnMobile = document.getElementById("btn_modal_window_mobile")
  try {
    //remove the Buy ROSE modal if the network is not oasis
    document.getElementById('howtobuy-show').style.display =
      (network.chainid == 42262 || network.chainid == 42261) ? 'block' : 'none'

    const dropDownMenu = document.getElementById('networks')
    document.getElementById('dropdown-check')
      .addEventListener('click', () => dropDownMenu.classList.toggle('network_open'))
    window.addEventListener("click", (event) => {
      if (!Array.from(event.target.classList).includes('dropdown-element')) {
        dropDownMenu.classList.remove('network_open')
      }
    })

    document.querySelector('#approve_modal_close_btn').addEventListener('click', () => {
      document.querySelector('#approve_modal').style.display = 'none'
    })

    //CREATE GAME MODAL
    const modal = document.getElementById("my_modal")
    //if provider is not connected than when click on NEW GAME btn opens connect wallet modal
    if (!chain.connected) {
      document.getElementById("opengames_empty").style.display = ''
      document.getElementById("opengames").classList.add("empty")
      document.getElementById("pastgames_empty").style.display = ''
      document.getElementById("pastgames").classList.add("empty")
    }

    const hamburgerOverlay = document.getElementById('hamburger-overlay')
    const menuBody = document.getElementById('menu-body')
    document.getElementById('hamburger').onclick = function () {
      menuBody.classList.add('menu__box_active')
      hamburgerOverlay.classList.add('modal-overlay_active')
    }
    const hideMenu = (ev) => {
      ev.stopPropagation()
      hamburgerOverlay.classList.remove('modal-overlay_active')
      menuBody.classList.remove('menu__box_active')
    }
    hamburgerOverlay.addEventListener('click', hideMenu)
    document.getElementById('menu__close').addEventListener('click', hideMenu)

    document.getElementById('network_name').textContent = network.name
    document.getElementById('network_icon').src = NETWORK_ICONS[network.chainid] || ''
    const networkTokensList = chain.listAssets()
    const tokenListHTML = document.getElementById('select-token-list')
    const tokenListHTML2 = document.getElementById('select-token-list2')
    //first token in list is always placeholder for chosen token
    selectedToken = {...networkTokensList[0]}
    document.getElementsByName('amountPerDeath')[0].placeholder = selectedToken.symbol
    const totalPrizePoolToken = document.querySelector('#totalPrizePoolToken')
    const yourDepositToken = document.querySelector('#yourDepositToken')

    function openNewGame() {
      showHideBgImages(this.id)
      if (document.getElementById("disconnect").style.display === 'none') {
        const installModal = document.getElementById("install_wallet_modal")
        const spanInstall = document.getElementsByClassName("close_modal_window")[3]
        installModal.style.display = "flex"
        spanInstall.onclick = function () {
          installModal.style.display = "none"
        }
      } else {
        ConnectButton.style.display = 'none'
      }
    }
    btn.addEventListener('click', openNewGame)
    btnMobile.addEventListener('click', openNewGame)

    function showHideBgImages(id) {
      if (window.innerWidth > 500) {
        document.getElementById('player-visible-element').classList.add('d-none')
        if (id === 'btn_modal_window') {
          document.querySelector('.my_modal-bg-1').style.display = 'block'
          document.querySelector('.my_modal-bg-2').style.display = 'none'
        }
      }
    }

    ConnectButton.onclick = function () {
      const installModal = document.getElementById("install_wallet_modal")
      const spanInstall = document.getElementsByClassName("close_modal_window")[3]
      installModal.style.display = "flex"
      spanInstall.onclick = function () {
        installModal.style.display = "none"
      }
      window.onclick = function (event) {
        if (event.target == installModal) installModal.style.display = "none"
      }
    }

    const changeNetworkModal = document.getElementById('change_netowrk_modal')
    const changeNetworkDropdown = document.getElementById('dropdown-change-network')
    document.getElementById("disconnect").onclick = function () {
      changeNetworkDropdown.style.display =
        changeNetworkDropdown.style.display === 'none' ? 'flex' : 'none'
      const name = document.getElementById('network_name')
      const networkNameWrapper = document.getElementById('network-name-wrapper')
      const addressElem = document.getElementById('disconnect-address')
      window.onclick = function (event) {
        if (event.target == changeNetworkModal) changeNetworkModal.style.display = 'none'
        if (event.target !== name && event.target !== addressElem && event.target !== networkNameWrapper) {
          changeNetworkDropdown.style.display = "none"
        }
      }
    }
    document.getElementById('change-network').onclick = function () {
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
      if (!_network) {
        window.location = '/'
        return
      }
      const newLocation = _network.chainid === 42262 ? `/` : `/?network=${_network.chainid}`
      if (!window.location.href.includes(newLocation)) window.location = newLocation
    })

    //set chosen network on select list
    document.getElementById('createGame').textContent = 'Create'
    const networkSelect = document.getElementById('networks').getElementsByClassName('network-deactive')
    for (let i = 0; i < networkSelect.length; i++) {
      if (networkSelect.item(i).id.includes(network.chainid)) {
        networkSelect.item(i).classList.replace('network-deactive', 'network-active')
      }
    }
    btn.addEventListener('click', openNewGameModal)
    btnMobile.addEventListener('click', openNewGameModal)

    document.getElementById("btn_modal_window_mobile_f2p").addEventListener('click', () => {
      modal.style.display = 'flex'
      const free = document.querySelector('#f2p_checker').checked
      document.querySelector('#createGame-f2p').style.display = free ? '' : 'none'
      document.querySelector('#createGame').style.display = free ? 'none' : ''
    })

    function openNewGameModal () {
      if (modal) modal.style.display = "flex"
      // caps.tokenChoice gates the bet-asset picker: TON bets are TON.
      const tokenChoice = chain.caps.tokenChoice ? '' : 'none'
      const show = {
        "#tokens-divider-newgame-modal": tokenChoice,
        "#tokens-newgame-modal": tokenChoice,
        "#tokens-divider": tokenChoice,
        "#total-prize-pool-element": '',
        "#your-deposit-element": '',
        "#player-visible-element": '',
        "#player-visible-mobile-element": '',
        "#createGame": '',
        "#createGame-f2p": 'none'
      }
      Object.entries(show).forEach(([selector, display]) => {
        const el = document.querySelector(selector)
        if (el) el.style.display = display
      })
      const amountPerRound = document.querySelector('#amountPerDeath')
      if (amountPerRound) amountPerRound.placeholder = selectedToken.symbol
    }

    // caps.chainSwitch: ask the wallet to move to the page's network. A no-op
    // on a family without one, and a swallowed failure when there is no wallet.
    if (chain.caps.chainSwitch) await chain.switchChain(network.chainid)
    // Sapphire reads and writes both go through the confidential provider.
    chain.useConfidentialProvider()
    if (TOURNAMENT_CHAINS.includes(Number(network.chainid))) {
      document.getElementById('tournaments-btn').style.display = ''
      document.getElementById('menu-tournaments-btn').style.display = 'block'
    }

    const form = betForm()
    const createGameButton = document.getElementById("createGame")

    const setTokenLabels = () => {
      totalPrizePoolToken.textContent = selectedToken.symbol
      totalPrizePoolToken.setAttribute('data-text', selectedToken.symbol)
      yourDepositToken.textContent = selectedToken.symbol
      yourDepositToken.setAttribute('data-text', selectedToken.symbol)
    }

    /*
     * The chain-shaped half of the totals: relabel to the chosen token, then
     * re-read the allowance to decide between "Create" and "Approve".
     *
     * There were four near-copies of the arithmetic this hangs off - the token
     * picker, two MutationObservers and the bet input - and they had drifted:
     * two of them had the `textContent = 'Create'` line commented out, so the
     * button could read "Approve" while the code took the create path. The
     * arithmetic now lives once in lobby/chrome.js and this always relabels,
     * which is what the two complete copies did.
     */
    const refreshAllowance = async () => {
      setTokenLabels()
      // caps.requiresApproval is true here; on a family where it is false the
      // adapter answers MAX_UINT256 and this collapses to "approved".
      try {
        const allowance = await chain.getAllowance(address, selectedToken)
        approved = allowance >= chain.toBaseUnits(form.amount.value, selectedToken) * BigInt(form.roundsValue())
      } catch (error) {
        console.log(error)
        return
      }
      createGameButton.textContent = approved ? 'Create' : 'Approve'
    }
    const recompute = wireBetTotals(form, refreshAllowance)

    //create network tokens list on the page
    networkTokensList.forEach((v, i) => {
      const selectTokenButton = document.createElement('button')
      selectTokenButton.id = v.symbol
      selectTokenButton.classList.add('figure')
      selectTokenButton.classList.add(selectedToken.symbol == v.symbol ? 'token-active' : 'token-deactive')
      const selectTokenIMG = document.createElement('img')
      selectTokenIMG.src = v.src
      selectTokenIMG.id = v.symbol
      selectTokenIMG.alt = v.symbol
      const selectTokenCaption = document.createElement('div')
      selectTokenCaption.classList.add('caption')
      selectTokenCaption.textContent = v.symbol
      selectTokenCaption.id = v.symbol
      selectTokenButton.appendChild(selectTokenIMG)
      selectTokenButton.appendChild(selectTokenCaption)
      ;(i < 2 ? tokenListHTML : tokenListHTML2).appendChild(selectTokenButton)
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
    if (!isDesktop) {
      $('#shop-inventory-btns').slick({
        infinite: false,
        vertical: true,
        verticalSwiping: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        prevArrow: '#up-menu',
        nextArrow: '#down-menu',
      })
    }
    document.querySelector("#shop-inventory-btns").style.display = ''
    renderInventory(chain, address).catch(err => console.log(err))
    renderShop(chain, address, mobileAndTabletCheck()).catch(err => console.log(err))

    //just see wallet
    if (address) {
      ConnectButton.style.display = 'none'
    }
    document.getElementById("disconnect-address").textContent = chain.shortAddress(address)
    document.getElementById("disconnect").style.display = ''
    document.getElementById("walletHeader").style.display = "none"
    createGameButton.disabled = false
    document.getElementById("amountToPlayText").style.display = ''
    document.getElementById("amountPerDeathText").style.display = ''

    MODAL_CLOSE_BUTTONS.forEach(([index, modalId]) => {
      document.getElementsByClassName("close_modal_window")[index].onclick = function () {
        document.getElementById(modalId).style.display = 'none'
      }
    })
    window.onclick = dismissOnBackdropClick

    document.getElementById("connect").disabled = true
    createGameButton.addEventListener("click", async function () {
      try {
        window.addEventListener("popstate", () => {})
        try {
          const roundsValue = form.roundsValue()
          const playersValue = form.playersValue()
          if (isNaN(parseFloat(form.amount.value)) || isNaN(parseFloat(roundsValue))) throw Error('Enter a number')
          if (parseFloat(form.amount.value) <= 0 || parseFloat(roundsValue) <= 0) {
            throw Error('The number must be greater than 0')
          }
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
          const amountPerRound = chain.toBaseUnits(form.amount.value, selectedToken)
          const baseAmount = amountPerRound * BigInt(roundsValue)
          document.getElementById("confirmation_modal").style.display = 'flex'
          const promise = approved
            ? chain.createFight({amountPerRound, rounds: roundsValue, players: playersValue, asset: selectedToken})
            : chain.approve(selectedToken)
          const map = form.mapId()
          promise
            .then(async (tx) => {
              document.getElementById("confirmation_modal").style.display = 'none'
              document.getElementById("pending_modal").style.display = 'flex'
              chain.confirm(tx)
                .then(async (_waited) => {
                  if (!approved) {
                    approved = true
                    try {
                      approved = chain.approvedAmountFrom(_waited) >= baseAmount
                    } catch (error) {
                      console.log(error)
                    }
                    document.getElementById("pending_modal").style.display = 'none'
                    document.getElementById('approve_token_img').src = selectedToken.src
                    const label = selectedToken.symbol.length != 0 ? selectedToken.symbol : 'Token'
                    document.getElementById('approved_token').textContent = approved ? label : `${label} not`
                    document.getElementById('approved_text').textContent = approved
                      ? 'Now you can create a game.'
                      : 'Please enter the correct amount for approve.'
                    createGameButton.textContent = approved ? 'Create' : 'Approve'
                    document.getElementById("approve_modal").style.display = 'flex'
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
                      form.amount.value = 0
                      document.getElementById("my_modal").style.display = 'none'
                      document.getElementById("pending_modal").style.display = 'none'
                      const newGameBtn = isDesktop ? btn : btnMobile
                      newGameBtn.style.visibility = ''
                      newGameBtn.style.display = 'block'
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
              // Every match is applied in order, so the last one wins - which is
              // what the original chain of ifs did.
              if (msg) {
                for (const [needle, text] of CREATE_ERRORS) {
                  if (msg.includes(needle)) showError(await text(chain, selectedToken))
                }
              }
            })
        } catch (error) {
          if (form.amount.value.includes(',')) {
            showError('The number should be written with a dot, not a comma')
          }
          if ([
            'The number must be greater than 0',
            'Enter a number',
            'The number should be written without a dot or a comma'
          ].includes(error.message)) {
            showError(error.message)
          }
        }
      } catch (error) {
        console.log(error)
      }
    })

    const {sign_evm: sign} = await chain.getSessionProof()
    openFightsFunc(chain, address, undefined).catch(err => console.log(err))
    await pastFightsFunc(chain, address).catch(err => console.log(err))
    await mainF2PEvm(address, network, sign)

    wireInfoModal('[data-fight]', () => pastFightsFunc(chain, address).catch(err => console.log(err)))
  } catch (error) {
    console.log(error)
  }
}
