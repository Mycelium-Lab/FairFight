// The three modal helpers the shop and the lootbox both need. They live here
// rather than in shop.js so that lootbox.js does not have to import from the
// module that imports it.

export const showGoToInventoryBtn = (buy) => {
    const btn = document.querySelector('#go-to-inventory-btn')
    btn.style.display = buy ? '' : 'none'
}

export const showPendingModal = () => {
    document.getElementById('pending_subtitle').textContent = 'We are checking your transaction, NFT will appear in your inventory and wallet. You can close this modal.'
    document.getElementById('pending_modal').style.display = 'flex'
}

// A chain with no synchronous receipt has no tx ref to link to, so the link is
// hidden rather than pointed at `${explorer}/tx/undefined`.
export const setExplorerLink = (anchor, url) => {
    if (url) {
        anchor.href = url
        anchor.style.display = ''
    } else {
        anchor.removeAttribute('href')
        anchor.style.display = 'none'
    }
}
