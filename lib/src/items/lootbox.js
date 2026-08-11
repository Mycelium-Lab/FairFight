// Lootbox — chain-agnostic.
//
// Was lib/src/modules/lootbox.js (EVM) and lib/src/ton/lootbox.js (TVM). The
// modal handles and the reward rendering were the same; what differs is:
//
//   * caps.requiresApproval — the ERC20 allowance step before buying
//   * caps.syncReceipt      — EVM decodes the reward out of the receipt and
//                             plays the reveal video; TVM has no receipt, so it
//                             polls the inventory and shows the success modal
//
// The TVM file used to import addInventoryItem / showInventoryItemModal from
// lib/src/inventory.js — the *EVM* module — which dragged ethers and the whole
// ABI file into main_ton.js and passed arguments against the wrong signature.
// Both files now go through this one, so that cross-import cannot recur.

import { addInventoryItem, showInventoryItemModal } from './inventory.js'
import { changeErrMessage } from '../utils/utils.js'
import { showGoToInventoryBtn, showPendingModal, setExplorerLink } from './modals.js'

let timeoutID

const approveModal = document.querySelector('#new-approve-modal')
const progressModal = document.querySelector('#new-progress-modal')
const confirmModal = document.querySelector('#new-confirm-modal')
const errorModal = document.querySelector('#new-error-modal')
const errorModalText = document.querySelector('#new-error-modal-text')
const splashScreen = document.querySelector('#splash-modal')

const listIdFor = {
    characters: "#left-inventory-characters-list",
    armors: "#left-inventory-armors-list",
    weapons: "#left-inventory-weapons-list",
    boots: "#left-inventory-boots-list"
}

export async function renderLootbox(chain, address, isMobile) {
    const buyButton = document.querySelector(isMobile ? '#lootbox-buy-btn-mobile' : '#lootbox-buy-btn')
    try {
        if (!chain.lootbox.available) {
            buyButton.disabled = true
            return
        }
        let {price, allowance} = await chain.lootbox.loadPricing(address)
        const needsApproval = () => chain.caps.requiresApproval && allowance < price
        buyButton.textContent = needsApproval() ? 'Approve' : 'buy now'
        buyButton.addEventListener('click', async () => {
            try {
                window.addEventListener("popstate", () => {});
                document.querySelector('#inventory-nftbox-modal').style.display = 'none'
                if (needsApproval()) {
                    approveModal.style.display = 'flex'
                    const approval = await chain.lootbox.approve()
                    approveModal.style.display = 'none'
                    progressModal.style.display = 'flex'
                    allowance = chain.approvedAmountFrom(await chain.confirm(approval))
                    if (allowance < price) {
                        showError({message: 'insufficient allowance'})
                        return
                    }
                    buyButton.textContent = 'Buy now'
                    showGoToInventoryBtn(false)
                    progressModal.style.display = 'none'
                }
                // TonConnect renders its own confirm/progress UI; the chains that
                // hand back a receipt do not, so we render it for them.
                if (chain.caps.syncReceipt) confirmModal.style.display = 'flex'
                const submitted = await chain.lootbox.buy(price)
                confirmModal.style.display = 'none'
                if (!submitted) return
                if (chain.caps.syncReceipt) {
                    progressModal.style.display = 'flex'
                    const receipt = await chain.confirm(submitted)
                    showGoToInventoryBtn(true)
                    progressModal.style.display = 'none'
                    allowance = await chain.lootbox.readAllowance(address)
                    buyButton.textContent = needsApproval() ? 'Approve' : 'Buy now'
                    revealWithSplash(chain, chain.lootbox.lootedItemFrom(receipt), address)
                } else {
                    showPendingModal()
                    const item = await chain.awaitNewNft(address, submitted)
                    addReward(chain, item, address)
                    const successModal = document.querySelector('#new-success-modal')
                    document.querySelector('#new-success-modal-text').textContent = 'You have successfully purchased the NFT'
                    setExplorerLink(document.querySelector('#new-success-modal-link'), chain.explorerTxUrl(submitted))
                    document.querySelector('#new-success-modal-img').src = item.image
                    successModal.style.display = 'flex'
                }
            } catch (error) {
                showError(error)
            }
        })
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

// EVM knows the reward the moment the receipt lands, so it plays the reveal
// video and shows the item once the animation has had time to run.
const revealWithSplash = (chain, item, address) => {
    splashScreen.style.display = 'flex'
    document.querySelector('#btn-close-splash').addEventListener('click', () => {
        splashScreen.style.display = 'none'
    })
    document.querySelector('#splash-video').play()
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => {
        showInventoryItemModal(
            item.image, item.name, item.attributes, item.description ? item.description : 'Description',
            item.type, item.id, '', 'loot'
        )
        splashScreen.style.display = 'none'
        addReward(chain, item, address)
    }, 3600)
}

const addReward = (chain, item, address) => {
    const listItemId = listIdFor[item.type]
    const list = document.querySelector(listItemId).querySelectorAll('.item-list__slot')
    const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 4)
    addInventoryItem(listItemId, item, item.type, address, chain.chainid, firstEmpty, undefined, item.nftAddress)
}

function showError(error) {
    error.message = changeErrMessage(error.data ? error.data : error)
    errorModalText.textContent = error.message
    approveModal.style.display = 'none'
    progressModal.style.display = 'none'
    confirmModal.style.display = 'none'
    errorModal.style.display = 'flex'
}
