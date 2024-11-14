const modalWidnow = (function () {
    const _fittingroomModal = document.getElementById('fittingroom-modal')
    _fittingroomModal.addEventListener('click', (ev) => _closeOutside(ev))
    const _inventoryModal = document.getElementById('inventory-modal')
    _inventoryModal.addEventListener('click', (ev) => _closeOutside(ev))
    const _shopModal = document.getElementById('shop-block')
    _shopModal.addEventListener('click', (ev) => _closeOutside(ev))

    
    const _fittingroomClose = document.getElementById('fittingroom-close')
    _fittingroomClose.addEventListener('click', _closeInside)
    // const _inventoryClose = document.getElementById('inventory-close')
    // if (_inventoryClose) _inventoryClose.addEventListener('click', _closeInside);
    

    function _closeOutside (ev) {
        ev.target.classList.remove('modal-overlay_active')
        _fittingroomModal.removeEventListener('click', _closeOutside)
        _inventoryModal.removeEventListener('click', _closeOutside)
        _shopModal.removeEventListener('click', _closeOutside)
        document.querySelector('body').style.overflow = 'auto'
    }
    function _closeInside (ev) {
        const closeButton = ev.target
        const activeModalContent = closeButton.parentElement
        const activeModalOverlay = activeModalContent.parentElement
        console.log("activeModalOverlay ", activeModalOverlay)
        activeModalOverlay.classList.remove('modal-overlay_active')
        _fittingroomClose.removeEventListener('click', _closeInside)
       // _inventoryModal.removeEventListener('click', _closeInside)
    }
})()


export { modalWidnow }