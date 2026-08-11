// EVM open-fight list.
//
// All chain access goes through the adapter (lib/chain/evm.js): no `ethers`, no
// ABI, no contract object, no signer. What is left here is DOM and the button
// state machine.
import { addToPastFights } from './pastFights.js'
import { addressMaker, getMap } from './utils/utils.js'
import { DESKTOP_DECOR, MOBILE_DECOR, renderFightRow } from './fights/rows.js'

const isDesktop = window.innerWidth > 1024

const displayCreateGame = (display) => {
    document.getElementById("btn_modal_window").style.visibility = display
}

const modalConfirm = document.getElementById("confirmation_modal")
const modalPending = document.getElementById("pending_modal")
const error_modal = document.getElementById("error_modal")
const error_modal_text = document.getElementById("error_modal_text")
const approve_modal = document.getElementById("approve_modal")

const JOIN_WINDOW_MS = 3 * 60 * 1000

/*
 * The >2-player join countdown, previously pasted three times in this file.
 * Ticks a timer span once a second and runs `onExpire` when it reaches zero.
 */
const startCountdown = (timerSelector, endTime, onExpire) => {
    const tick = () => {
        const timerSpan = document.querySelector(timerSelector)
        const timeLeft = Math.max(0, (endTime - Date.now()) / 1000)
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
        const seconds = String(Math.floor(timeLeft % 60)).padStart(2, '0')
        if (timerSpan) timerSpan.textContent = `${minutes}:${seconds}`
        if (timeLeft > 0) setTimeout(tick, 1000)
        else onExpire()
    }
    tick()
}

const matchUrl = (chain, id, asset) =>
    `/game/?ID=${id}&network=${chain.wireChainId}&token=${asset.symbol}&decimals=${asset.decimals}`

export const openFightsFunc = async (chain, address, createdBattle) => {
    const opengamesBtn = isDesktop ? document.querySelector('#opengames-btn-desktop') : document.querySelector('#opengames-btn')
    const openOpenFights = () => {
      document.querySelector('#amountPerDeath').placeholder = document.querySelector('#yourDepositToken').textContent
      const opengames = isDesktop ? document.getElementById("opengames-desktop") : document.getElementById("opengames")
      const openGamesList = isDesktop ? document.getElementById('opengames-list-desktop') : document.getElementById('opengames-list').querySelector('.simplebar-content')
      const pastgames = isDesktop ? document.getElementById("pastgames-desktop") : document.getElementById("pastgames")
      opengames.classList.add('active')
      opengames.style.display = ''
      pastgames.style.display = 'none'
      pastgames.classList.remove('active')
      const children = Array.from(openGamesList.children);

      if (children.length === 1) {
          isDesktop ? document.getElementById("opengames_empty-desktop").style.display = '' : document.getElementById("opengames_empty").style.display = '';
          opengames.classList.add("empty")
      }
      else {
          isDesktop ? document.getElementById("opengames_empty-desktop").style.display = 'none' : document.getElementById("opengames_empty").style.display = 'none'
          opengames.classList.remove("empty")
      }
      document.querySelector('#opengames-btn-desktop').classList.add('active')
      document.querySelector('#pastgames-btn-desktop').classList.remove('active')
    }
    const btnP2PEvmMenu = document.querySelector('#menu-p2p-btn-evm')
    const openGamesF2PEvmDesktop = document.querySelector('#opengames-f2p-desktop')
    const pastGamesF2PEvmDesktop = document.querySelector('#pastgames-f2p-desktop')
    const openGamesEmptyF2PEvmDesktop = document.querySelector('#opengames-empty-f2p-desktop')
    opengamesBtn.addEventListener('click', () => {
      openOpenFights()
    })
    if (btnP2PEvmMenu) {
      btnP2PEvmMenu.addEventListener('click', () => {
        openOpenFights()
        document.querySelector('#games_checker-desktop').style.display = ''
        document.querySelector('#games_checker-f2p-desktop').style.display = 'none'
        openGamesF2PEvmDesktop.style.display = 'none'
        pastGamesF2PEvmDesktop.style.display = 'none'
        openGamesEmptyF2PEvmDesktop.style.display = 'none'
        document.querySelector('#btn_modal_window').style.display = ''
        document.querySelector('#btn_modal_window-f2p').style.display = 'none'
      })
    }
    const fights = await chain.listOpenFights()
    let opengames = document.getElementById("opengames")
    let openGamesListBar = document.getElementById("opengames-list")
    let openGamesDesktop = document.querySelector('#opengames-desktop')
    let openGamesDesktopListBarList = document.querySelector('#opengames-list-desktop')
    if (!SimpleBar.instances.get(openGamesListBar)) {
      new SimpleBar(openGamesListBar, { });
    }
    if (!SimpleBar.instances.get(openGamesDesktopListBarList)) {
      new SimpleBar(openGamesDesktopListBarList, { });
    }
    let openGamesDesktopListBar = openGamesDesktopListBarList.querySelector('.simplebar-content')
    let openGamesList = openGamesListBar.querySelector('.simplebar-content')
    if (fights.length === 0) {
      document.getElementById("opengames_empty").style.display = '';
      document.getElementById("opengames_empty-desktop").style.display = '';
      document.querySelector('#opengames_empty-title-desktop').textContent = 'Empty:(';
      document.querySelector('#opengames_empty-desc-desktop').textContent = 'At the moment, there are no games available for joining. But you can always start your own by clicking the "New game" button above.'
      opengames.classList.add('empty')
      openGamesDesktop.classList.add('empty')
    } else {
      document.getElementById("opengames_empty").style.display = 'none';
      document.getElementById("opengames_empty-desktop").style.display = 'none';
      opengames.classList.remove('empty')
      openGamesDesktop.classList.remove('empty')
    }
    let fightsIDs = [...fights.map(e => e.id)]

    /*
     * Push discovery. caps.liveEvents is true on this family, so the adapter
     * feeds per-fight events straight from contract.on. The TVM lobby polls and
     * gets one 'refresh' instead - the interface is the same, the mechanism is
     * not, and neither pretends to be the other.
     */
    chain.watchFights(async (ev) => {
      try {
        if (ev.kind === 'created') {
          if (localStorage.getItem('lastAddedID') == ev.id) return
          localStorage.setItem('lastAddedID', ev.id)
          const fight = await chain.getFight(ev.id)
          if (!fight) return
          if (fight.finishTime !== 0 || chain.isHiddenAccount(fight.owner)) return
          if (chain.isPlayer(fight, address)) return
          if (fightsIDs.includes(ev.id)) return
          fightsIDs.push(ev.id)
          if (chain.equals(ev.owner, address)) return
          const child = await appendOpenFight(chain, address, fight)
          if (isDesktop) {
            document.getElementById("opengames_empty-desktop").style.display = 'none';
            openGamesDesktop.classList.remove('empty')
            openGamesDesktopListBar.appendChild(child)
          } else {
            document.getElementById("opengames_empty").style.display = 'none';
            opengames.classList.remove('empty')
            openGamesList.appendChild(child)
          }
          return
        }
        if (ev.kind === 'withdrawn') {
          const row = document.getElementById(`openbattle_${ev.id}`)
          if (isDesktop) {
            openGamesDesktopListBar.removeChild(row)
            if (openGamesDesktopListBar.children.length === 1) {
              document.getElementById("opengames_empty-desktop").style.display = '';
              openGamesDesktop.classList.add('empty')
            }
          } else {
            openGamesList.removeChild(row)
            if (openGamesList.children.length === 1) {
              document.getElementById("opengames_empty").style.display = '';
              opengames.classList.add('empty')
            }
          }
          return
        }
        if (ev.kind === 'joined') {
          const fight = await chain.getFight(ev.id)
          if (!fight) return
          const voucher = await fetchVoucher(chain, ev.id, address)
          if (!chain.equals(fight.owner, address) || fight.finishTime !== 0 || voucher.r.length !== 0) return
          const asset = await chain.assetFor(ev.token)
          const go = () => { window.location.href = matchUrl(chain, ev.id, asset) }
          // caps.multiplayerTimer: >2-player fights wait out the join window
          // before the owner is sent into the match.
          if (fight.maxPlayers === 2 || !chain.caps.multiplayerTimer) go()
          else startCountdown('#mygame_timer', fight.createTime * 1000 + JOIN_WINDOW_MS, go)
        }
      } catch (error) {
        console.log(error)
      }
    })

    fights.forEach(async (v) => {
      if (chain.equals(v.owner, address)) return
      const players = await chain.getPlayers(v.id)
      if (players.some(p => chain.equals(p, address))) return
      const list = isDesktop ? openGamesDesktopListBar : openGamesList
      for (let i = 0; i < list.children.length; i++) {
        if (v.id == list.children[i].getAttribute("value")) return
      }
      const child = await appendOpenFight(chain, address, v)
      list.appendChild(child)
    })

    const currentBattle = createdBattle || await chain.getMyLastFight(address)
    if (!currentBattle) {
      displayCreateGame('')
      return
    }
    const currentBattleID = currentBattle.id
    const asset = await chain.assetFor(currentBattle.token)
    const player2 = currentBattle.players[1]
    let checker = !chain.hasClaimed(currentBattle, address) && chain.isPlayer(currentBattle, address)
    if (player2 === undefined && currentBattle.finishTime != 0) {
      checker = false;
    }
    if (checker) {
      displayCreateGame('')
      document.getElementById("opengames_empty").style.display = 'none';
      opengames.classList.remove('empty')
      let alreadyExistHere = false;
      const list = isDesktop ? openGamesDesktopListBar : openGamesList
      for (let i = 0; i < list.children.length; i++) {
        if (currentBattleID == list.children[i].getAttribute("value")) {
          alreadyExistHere = true
          break;
        }
      }
      if (alreadyExistHere == false) {
        const map = getMap(await fetchMapId(chain, currentBattleID))
        const { li, roundsElem: currentBattleRoundsElem } = renderFightRow({
          rowClass: 'games__row border-style',
          decor: MOBILE_DECOR,
          id: currentBattleID,
          creator: {
            text: addressMaker(currentBattle.owner),
            href: chain.explorerAddressUrl(currentBattle.owner)
          },
          map,
          // filled in below, once /statistics says how many rounds are left
          rounds: { className: 'current_battle_rounds right' },
          status: { id: `mygame_status_${currentBattleID}` },
          timer: (currentBattle.maxPlayers > 2 && chain.caps.multiplayerTimer) ? { id: 'mygame_timer' } : null,
          players: { text: `Players: ${currentBattle.maxPlayers}` },
          bet: {
            id: `bet_per_round`,
            text: chain.formatAmount(currentBattle.amountPerRound, asset)
          },
          deposit: {
            label: 'To deposit: ',
            spanId: `amount_deposit_or_claim`,
            text: chain.formatAmount(currentBattle.baseAmount, asset),
            pId: `amount_deposit_or_claim_p_${currentBattleID}`
          }
        })
        li.value = currentBattleID
        fetchPlayerStats(chain, currentBattleID, address)
            .then((playerOneStats) => {
              currentBattleRoundsElem.textContent = createdBattle
                ? ` Current round: 0/${currentBattle.rounds}`
                : ` Current round: ${currentBattle.rounds - parseInt(playerOneStats.remainingrounds)}/${currentBattle.rounds}`
            })
            .catch(err => console.error(err))
        try { list.insertBefore(li, list.firstChild) } catch (error) {}
      }
      const currentBattleInList = Array.from(openGamesList.children).find(v => v.getAttribute('value') === currentBattleID)
      try { list.removeChild(currentBattleInList) } catch (error) {};
      try { list.insertBefore(currentBattleInList, list.firstChild) } catch (error) {};

      const data = await fetchVoucher(chain, currentBattleID, address)
      let buttonID = `openbattle_btn_${currentBattleID}`
      let button;
      let li = document.getElementById(`openbattle_${currentBattleID}`)
      if (document.getElementById(buttonID) == null) {
        button = document.createElement("button")
        button.id = buttonID
        button.className = 'btn opengames__btn'
        li.appendChild(button)
      } else {
        button = document.getElementById(buttonID)
      }
      // caps.explorerTxLinks/syncReceipt aside, the claimable test is per family:
      // EVM waits for r, TVM for s.
      if (chain.voucherIsClaimable(data)) {
        document.getElementById("opengames_empty").style.display = 'none';
        //thats for check if event was already created
        const buttonValue = 'event_exist'
        if (button.value != buttonValue) {
          button.value = buttonValue
          button.textContent = "Claim"
          button.className = 'close-button opengames__btn claim-button'
          document.getElementById(`mygame_status_${currentBattleID}`).textContent = `Game over. Claim your reward`
          document.getElementById(`amount_deposit_or_claim_p_${currentBattleID}`).textContent = 'Amount to claim: '
          const amountDepositOrClaim = document.createElement('span')
          amountDepositOrClaim.textContent = `
          ${chain.formatAmount(BigInt(data.amount), asset)}
          `
          document.getElementById(`amount_deposit_or_claim_p_${currentBattleID}`).appendChild(amountDepositOrClaim)
          fetchPlayerStats(chain, currentBattleID, address)
            .then((playerOneStats) => {
              const row = document.getElementById(`openbattle_${currentBattleID}`)
              const gamesItem = row.getElementsByClassName('games__item')
              gamesItem[0].lastChild.lastChild.textContent =
                `Current round: ${currentBattle.rounds - parseInt(playerOneStats.remainingrounds)}/${currentBattle.rounds}`
            })
            .catch(err => console.error(err))
          button.addEventListener('click' , async () => {
            try {
              window.addEventListener("popstate", () => {});
              if (!chain.voucherIsClaimable(data)) throw Error('Signature does not exist')
              modalConfirm.style.display = 'flex'
              chain.claimPayout(currentBattleID, data)
                .then(async (tx) => {
                  modalConfirm.style.display = 'none'
                  modalPending.style.display = 'flex'
                  await chain.confirm(tx)
                    .then(async () => {
                      modalPending.style.display = 'none'
                      try {
                        document.querySelector('#opengames-list .simplebar-content').removeChild(li)
                      } catch (error) {}
                      try {
                        document.querySelector('#opengames-list').removeChild(li)
                      } catch (error) {}
                      displayCreateGame('')
                      if (document.querySelector('#opengames-list .simplebar-content').children.length === 1) {
                        document.getElementById("opengames_empty").style.display = '';
                        opengames.classList.add('empty')
                      }
                      else {
                        document.getElementById("opengames_empty").style.display = 'none';
                      }
                      await addToPastFights(chain, currentBattle, address, 'fromOpenFights')
                    })
                })
                .catch(async (err) => {
                  console.log(err)
                  modalConfirm.style.display = 'none'
                  modalPending.style.display = 'none'
                  showRevertMessage(err, [
                    ["You dont have access", `You don't have access.`],
                    ["Already sended", `Already sended`],
                    ["Not success payment", `Not success payment`]
                  ])
                })
            } catch(err){
            }
          }, {passive: true})
        }
      }
      if (!chain.voucherIsClaimable(data) && player2 != undefined && currentBattle.finishTime == 0) {
        window.location.href = matchUrl(chain, currentBattleID, asset)
      }
      if (!chain.voucherIsClaimable(data) && player2 == undefined && currentBattle.finishTime == 0) {
          if (currentBattle.maxPlayers > 2 && chain.caps.multiplayerTimer) {
            setInterval(async () => {
              try {
                const players = await chain.getPlayers(currentBattleID)
                if (players[1]) {
                  startCountdown(
                    '#mygame_timer',
                    currentBattle.createTime * 1000 + JOIN_WINDOW_MS,
                    () => { window.location.href = matchUrl(chain, currentBattleID, asset) }
                  )
                }
              } catch (error) {
                console.log(error)
              }
            }, 10000)
          }
          //thats for check if event was already created
          const buttonValue = 'event_exist'
          try {
            document.querySelector('.current_battle_rounds.right').textContent = `Current round: 0/${currentBattle.rounds}`
          } catch (error) {}
          if (button.value != buttonValue) {
              button.value = buttonValue
              button.textContent = "Withdraw"
              button.className = 'close-button_big close-button withdraw-button'
              document.getElementById(`mygame_status_${currentBattleID}`).textContent = `Your game. Waiting for an opponent or timer`
              document.getElementById(`amount_deposit_or_claim`).textContent = `
              ${chain.formatAmount(currentBattle.baseAmount, asset)}
              `
              button.addEventListener('click', async () => {
              window.addEventListener("popstate", () => {});
              modalConfirm.style.display = 'flex'
              chain.withdrawFight(currentBattleID)
                  .then(async (tx) => {
                      modalConfirm.style.display = 'none'
                      modalPending.style.display = 'flex'
                      await chain.confirm(tx).then(() => {
                      modalPending.style.display = 'none'
                      const _openGamesList = document.getElementById("opengames-list")
                      _openGamesList.removeChild(li)
                      displayCreateGame('')
                      document.getElementById("opengames_empty").style.display = 'none';
                      if (_openGamesList.children.length === 1) {
                        document.getElementById("opengames_empty").style.display = '';
                        opengames.classList.add('empty')
                      }
                      else {
                        document.getElementById("opengames_empty").style.display = 'none';
                      }
                      })
                  })
                  .catch(async (err) => {
                  modalConfirm.style.display = 'none'
                  modalPending.style.display = 'none'
                  showRevertMessage(err, [
                    ["You're not fight's owner", `You're not fight's owner`],
                    ["Fight is over", `Fight is over`],
                    ["Fight has players", `Fight has players. Wait for redirect.`],
                    ["Not success payment", `Not success payment`]
                  ])
                  })
              })
          }
      }
    } else {
      displayCreateGame('')
    }
}

/*
 * The /sign envelope. The server returns one shape for both families - EVM fills
 * r/s/v, TON fills only s - so this fetch is chain-blind and the adapter decides
 * which fields it reads.
 */
const fetchVoucher = async (chain, gameID, address) => {
    const query = new URLSearchParams()
    query.append("gameID", gameID)
    query.append("address", address)
    query.append("chainid", chain.wireChainId)
    return (await fetch('/sign?' + query.toString())).json()
}

const fetchMapId = (chain, gameid) => {
    const query = new URLSearchParams()
    query.append("gameid", gameid)
    query.append("chainid", chain.wireChainId)
    return fetch('/getgamesprops?' + query).then(async (res) => (await res.json()).map).catch(err => {
        console.log(err)
        return 0
    })
}

const fetchPlayerStats = async (chain, gameID, address) => {
    const query = new URLSearchParams()
    query.append("gameID", gameID)
    query.append("address", address)
    query.append("chainid", chain.wireChainId)
    const stats = await (await fetch('/statistics?' + query.toString())).json()
    // The statistics table stores addresses lowercased, so this comparison must
    // go through the adapter rather than lowercasing here.
    return stats.find(v => chain.equals(v.player, address))
}

// The revert-reason -> user message tables were four inline if-ladders.
const showRevertMessage = (err, table) => {
    let msg
    try {
        msg = err.reason === undefined ? err.data.message : err.reason
    } catch (error) {
        msg = err.reason
    }
    if (msg == undefined) return false
    for (const [needle, text] of table) {
        if (msg.includes(needle)) {
            error_modal.style.display = 'flex'
            error_modal_text.textContent = text
            return true
        }
    }
    if (msg.includes("out of fund")) {
        error_modal.style.display = 'flex'
        error_modal_text.textContent = `Out of fund`
        return true
    }
    return false
}

async function appendOpenFight(chain, address, fight) {
  let button = document.createElement("button")
  button.value = fight.id
  const asset = await chain.assetFor(fight.token)
  // caps.requiresApproval: on a family without allowances getAllowance answers
  // MAX_UINT256, so this always lands on 'Join' with no branch here.
  let allowance
  let buttonText = 'Join'
  try {
    allowance = await chain.getAllowance(address, asset)
    if (allowance < fight.baseAmount) buttonText = 'Approve'
  } catch (error) {
    console.log(error)
  }
  button.textContent = buttonText
  button.className = 'close-button join-button opengames__btn'
  button.addEventListener('click', async () => {
    window.addEventListener("popstate", () => {});
    modalConfirm.style.display = 'flex'
    const promise = buttonText === 'Join'
      ? chain.joinFight({id: fight.id, stake: fight.baseAmount, asset})
      : chain.approve(asset)
    promise
    .then(async (tx) => {
      modalConfirm.style.display = 'none'
      modalPending.style.display = 'flex'
      await chain.confirm(tx).then(async () => {
        modalPending.style.display = 'none'
        if (buttonText === 'Join') {
          if (fight.maxPlayers > 2 && chain.caps.multiplayerTimer) {
            startCountdown(
              `#game_timer_${fight.id}`,
              fight.createTime * 1000 + JOIN_WINDOW_MS,
              () => { window.location.href = matchUrl(chain, fight.id, asset) }
            )
            button.style.display = 'none'
          } else {
            window.location.href = matchUrl(chain, fight.id, asset)
          }
        } else {
          allowance = await chain.getAllowance(address, asset)
          if (allowance < fight.baseAmount) {
            document.getElementById('approved_token').textContent = asset.symbol.length != 0 ? asset.symbol : 'Token'
            document.getElementById('approved_token').textContent = `${document.getElementById('approved_token').textContent} not`
            document.getElementById('approved_text').textContent = 'Please enter the correct amount for approve.'
            approve_modal.style.display = 'flex'
          } else {
            button.style.backgroundImage = "url('../media/svg/join-button.svg')"
            button.style.width = "175px"
            button.style.height = "48px"
            button.style.backgroundRepeat = 'no-repeat'
            buttonText = 'Join'
            button.textContent = 'Join'
            document.getElementById('approved_token').textContent = asset.symbol.length != 0 ? asset.symbol : 'Token'
            document.getElementById('approved_text').textContent = 'Now you can join a game.'
            approve_modal.style.display = 'flex'
          }
        }
      })
    })
    .catch(err => {
      modalConfirm.style.display = 'none'
      modalPending.style.display = 'none'
      const handled = showRevertMessage(err, [
        ["Wrong amount", `Wrong amount`],
        ["You have open fight", `You already have open fight`],
        ["Fight is over", `Fight is over`],
        ["Fight is full", `Fight is full of players`],
        ["insufficient allowance", `Insufficient allowance`],
        ["transfer amount exceeds balance", `Transfer amount exceeds balance`]
      ])
      if (!handled) {
        error_modal.style.display = 'flex'
        error_modal_text.textContent = `Something went wrong`
      }
    })
  })
  const map = getMap(await fetchMapId(chain, fight.id))
  return renderFightRow({
    rowClass: `games__row border-style ${isDesktop ? 'desktop' : '' }`,
    decor: isDesktop ? DESKTOP_DECOR : null,
    hiddenInput: true,
    id: fight.id,
    creator: { text: addressMaker(fight.owner), href: chain.explorerAddressUrl(fight.owner) },
    map,
    rounds: { html: `Current round: <span>${0}/${fight.rounds}</span>`, className: `right` },
    status: { id: `mygame_status_${fight.id}`, text: `Waiting for an opponent or timer` },
    timer: (fight.maxPlayers > 2 && chain.caps.multiplayerTimer) ? { id: `game_timer_${fight.id}` } : null,
    players: { html: `Players: <span>${fight.maxPlayers}</span>` },
    bet: { text: chain.formatAmount(fight.amountPerRound, asset) },
    deposit: {
      label: 'To deposit: ',
      text: chain.formatAmount(fight.baseAmount, asset),
      pId: `amount_deposit_or_claim_p_${fight.id}`
    },
    button
  }).li
}
