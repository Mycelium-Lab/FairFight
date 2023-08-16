const modal = (function () {
    const _fittingroomModal = document.getElementById('fittingroom-modal')
    _fittingroomModal.addEventListener('click', (ev) => _closeOutside(ev))
    const _inventoryModal = document.getElementById('inventory-modal')
    _inventoryModal.addEventListener('click', (ev) => _closeOutside(ev))

    
    const _fittingroomClose = document.getElementById('fittingroom-close')
    _fittingroomClose.addEventListener('click', _closeInside)
    const _inventoryClose = document.getElementById('inventory-close')
    _inventoryClose.addEventListener('click', _closeInside)

    function _closeOutside (ev) {
        ev.target.classList.remove('modal-overlay_active')
        _fittingroomModal.removeEventListener('click', _closeOutside)
    }
    function _closeInside (ev) {
        const closeButton = ev.target
        const activeModalContent = closeButton.parentElement
        const activeModalOverlay = activeModalContent.parentElement
        activeModalOverlay.classList.remove('modal-overlay_active')
        _fittingroomModal.removeEventListener('click', _closeInside)
    }
})()


export { modal }