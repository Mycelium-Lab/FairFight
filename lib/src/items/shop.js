// NFT shop — chain-agnostic.
//
// Was two ~85% identical files (lib/src/shop.js, lib/src/ton/shop.js). The DOM,
// the sorting, the rarity filter and the fitting room were byte-for-byte the
// same. What actually differs is behind the chain object:
//
//   * caps.requiresApproval — the ERC20 allowance two-step (EVM only)
//   * caps.syncReceipt      — EVM awaits a receipt; TVM has no confirmed hash
//                             from sendTransaction, so it polls the inventory
//   * chain.buildPaymentRails — TVM's second rail (Aeon) and its dropdown
//   * chain.priceOf         — `price` vs `priceTon` in the item jsons

import charactersJsons from '../../jsons/characters.json'
import armorsJsons from '../../jsons/armors.json'
import weaponsJsons from '../../jsons/weapons.json'
import bootsJsons from '../../jsons/boots.json'
import { addInventoryItem, showInventoryItemModal, setItemsChain } from './inventory.js'
import { InventoryTypes, changeErrMessage } from '../utils/utils.js'
import { renderLootbox } from './lootbox.js'
import { showGoToInventoryBtn, showPendingModal, setExplorerLink } from './modals.js'

let __allowance
let drawTimeout

const isDesktop = window.innerWidth > 1024

const basicPlayerCharacteristics = {
    health: 3,
    bullets: 3,
    speed: 480,
    jump: 160
}

const listIdFor = {
    characters: "#left-inventory-characters-list",
    armors: "#left-inventory-armors-list",
    weapons: "#left-inventory-weapons-list",
    boots: "#left-inventory-boots-list"
}

const shopListIdFor = {
    characters: '#nft-shop-characters-list',
    weapons: '#nft-shop-weapons-list',
    armors: '#nft-shop-armors-list',
    boots: '#nft-shop-boots-list'
}

const jsonsFor = {
    characters: charactersJsons,
    armors: armorsJsons,
    weapons: weaponsJsons,
    boots: bootsJsons
}

if(!isDesktop) {
    const nftBoxes = document.querySelectorAll('#nft-shop-boxes-list .list-items__item')
    nftBoxes.forEach(box => box.addEventListener('click', () => {
    const infoModal = document.querySelector('#inventory-nftbox-modal')
    infoModal.style.display = 'flex'
    infoModal.style.alignItems = 'center'
}))

document.querySelector('#btn-close-nftbox-detail-modal').addEventListener('click', () => {
    document.querySelector('#inventory-nftbox-modal').style.display = 'none'
})
}

export const renderShop = async (chain, address, isMobile) => {
    // The shop writes into the inventory lists after a purchase, so it must be
    // usable whether or not the inventory panel has been rendered yet.
    setItemsChain(chain)
    ;['approve', 'progress', 'confirm', 'error', 'success'].forEach(kind => {
        document.querySelectorAll(`.new-${kind}-modal-close-button`).forEach(v =>
            v.addEventListener('click', () => document.querySelector(`#new-${kind}-modal`).style.display = 'none'))
    })
    shopSwitcher()
    if (document.querySelector('#nft-shop-2__tab-1').checked) document.querySelector('#rarity-filter').style.display = 'none'
    if (document.querySelector('#nft-shop-2__tab-5').checked) document.querySelector('#rarity-filter').style.display = 'none'
    await _shop(chain, address, isMobile).catch(err => console.log(err))

    Object.values(shopListIdFor).concat('#nft-shop-boxes-list').forEach(selector => {
        new SimpleBar(document.querySelector(selector), {
            autoHide: false,
            forceVisible: true,
        });
    })
}

const _shop = async (chain, address, isMobile) => {
    wirePriceSort()
    if (chain.caps.requiresApproval) __allowance = await chain.loadShopAllowance(address)
    for (const nftTypeName of ['characters', 'armors', 'weapons', 'boots']) {
        await createShopItem(chain, address, nftTypeName, document.querySelector(shopListIdFor[nftTypeName]))
    }
    collectionChange()
    await renderLootbox(chain, address, isMobile)
}

// The two sort arrows. TON added a 200 ms re-entry guard; it is harmless on
// EVM and stops a double tap from re-sorting twice, so both chains get it.
const wirePriceSort = () => {
    const ascending = () => document.querySelector('#ascending-price-svg g')
    const descending = () => document.querySelector('#descending-price-svg g')
    let sorting = false
    const guard = (fn) => () => {
        if (sorting) return
        sorting = true
        fn()
        setTimeout(() => { sorting = false }, 200)
    }
    document.querySelector('#ascending-price-svg').addEventListener('click', guard(() => {
        if (ascending().style.opacity === '1') {
            ascending().style.opacity = '0.4'
            priceSort(_imageSerialSort)
        } else {
            ascending().style.opacity = '1'
            descending().style.opacity = '0.4'
            priceSort(_ascendingPriceSort)
        }
    }))
    document.querySelector('#descending-price-svg').addEventListener('click', guard(() => {
        if (descending().style.opacity === '1') {
            descending().style.opacity = '0.4'
            priceSort(_imageSerialSort)
        } else {
            ascending().style.opacity = '0.4'
            descending().style.opacity = '1'
            priceSort(_descendingPriceSort)
        }
    }))
}

const createShopItem = async (chain, address, nftTypeName, list) => {
    const approveModal = document.querySelector('#new-approve-modal')
    const progressModal = document.querySelector('#new-progress-modal')
    const confirmModal = document.querySelector('#new-confirm-modal')
    const errorModal = document.querySelector('#new-error-modal')
    const errorModalText = document.querySelector('#new-error-modal-text')
    const successModal = document.querySelector('#new-success-modal')
    const successModalImg = document.querySelector('#new-success-modal-img')
    const successModalText = document.querySelector('#new-success-modal-text')
    const successModalLink = document.querySelector('#new-success-modal-link')
    const jsons = jsonsFor[nftTypeName]
    jsons.forEach(async (v, i) => {
        try {
        const nftId = nftTypeName === 'characters' ? i + 1 : i
        const imgSource = `/media/${nftTypeName}/${nftId}.png`
        const collection = nftTypeName === 'characters' ? 'Character' : v.attributes.find(v => v.trait_type === 'Class').value
        let healthBonus
        let speedBonus
        let jumpBonus
        let bulletsBonus
        const listItemId = listIdFor[nftTypeName]
        if (nftTypeName === 'armors') {
            healthBonus = v.attributes[2].value
        }
        if (nftTypeName === 'weapons') {
            bulletsBonus = v.attributes[2].value
        }
        if (nftTypeName === 'boots') {
            speedBonus = v.attributes[2].value
            jumpBonus = v.attributes[3].value
        }
            const price = parseFloat(chain.priceOf(v)).toFixed(2)
            const serail = parseInt(imgSource.match(/\d+/))
            let listItem = document.createElement('div')
            listItem.setAttribute('data-price', price)
            listItem.setAttribute('data-serial', serail)
            listItem.setAttribute('data-collection', collection.toLowerCase())
            listItem.classList.add('list-items__item', `list-items__item_${collection.toLowerCase()}`)
                const itemLeft = document.createElement('div')
                itemLeft.classList.add('item__left')
                    const imgLeft = document.createElement('div')
                    imgLeft.classList.add('left__img-wrap')
                    const priceTableSource = `/media/svg/shop/${collection.toLowerCase()}-collection/price-table.svg`
                    const priceTable =  document.createElement('img')
                    priceTable.src = priceTableSource
                    priceTable.style.position = 'absolute'
                    priceTable.style.width = isDesktop ? '84px' : '64.57px'
                    priceTable.style.bottom = isDesktop ? '-13px' : '-10px'
                    imgLeft.appendChild(priceTable)
                    const priceElelment = document.createElement('p')
                    const priceSymbol = document.createElement('img')
                    priceElelment.style.position = 'absolute'
                    priceElelment.style.bottom = isDesktop ? '-10px' : '-7.4px'
                    priceElelment.style.fontSize = isDesktop ? '12px' : '7.8px'
                    priceElelment.style.right = isDesktop ? '40px' : '32px'
                    priceElelment.style.fontFamily = 'Teletactile'
                    priceElelment.textContent = `${price}`
                    priceSymbol.src = '/media/svg/coin-symbol.svg'
                    priceSymbol.style.position = 'absolute'
                    priceSymbol.style.bottom = isDesktop ? '-6px' : '-5px'
                    priceSymbol.style.right = '20px'
                    priceSymbol.style.width =  isDesktop ?  '14px' : '8.75px'
                    imgLeft.appendChild(priceSymbol)
                    imgLeft.appendChild(priceElelment)
                        for (let corner = 0; corner < 4; corner++) {
                            const edgeBorder =  document.createElement('img')
                            edgeBorder.src = `/media/svg/shop/${collection.toLowerCase()}-collection/edge-border.svg`
                            imgLeft.appendChild(edgeBorder)
                            edgeBorder.style.position = 'absolute'
                            edgeBorder.style.width = isDesktop ? '17.18px' : '11px'
                            edgeBorder.style.height = isDesktop ? '17.18px' : '11px'
                            if (corner > 0) edgeBorder.style.transform = `rotate(${corner * 90}deg)`
                            edgeBorder.style[corner < 2 ? 'top' : 'bottom'] = '-6px'
                            edgeBorder.style[corner === 0 || corner === 3 ? 'left' : 'right'] = '-6px'
                        }
                        const img = document.createElement('img')
                        img.src = imgSource
                        imgLeft.appendChild(img)

                    const infoLeft = document.createElement('div')
                    infoLeft.classList.add('left__info')
                        const infoText = document.createElement('div')
                        infoText.classList.add('info__text')
                            const infoTextTitle = document.createElement('p')
                            infoTextTitle.classList.add('text__title')
                            const infoTextType = document.createElement('p')
                            infoTextType.classList.add('text__type')
                            infoTextTitle.textContent = v.name
                            if (nftTypeName !== 'characters') {
                                infoTextType.textContent = `${collection} collection`
                            }
                            infoText.append(infoTextTitle, infoTextType)
                        const infoPricing = document.createElement('div')
                        infoPricing.classList.add('info__pricing')
                            const tryOn = document.createElement('button')
                            tryOn.textContent = "Try on"
                            tryOn.classList.add(`tryon_collection-${collection.toLowerCase()}`,'tryon')
                            tryOn.setAttribute('id', 'inventory-item-modal-tryon-collection')
                            tryOn.addEventListener('click', () => {
                                toggleDressingModal(nftTypeName, nftId, address, chain.chainid,
                                    healthBonus, bulletsBonus, speedBonus, jumpBonus
                                )
                            })
                            const infoPricingBuyNowButton = document.createElement('button')
                            infoPricingBuyNowButton.classList.add('buy-now-btn')
                            infoPricingBuyNowButton.setAttribute('data-button', 'action')
                            infoPricingBuyNowButton.textContent = chain.caps.requiresApproval && chain.shopItemUnits(v) > __allowance ? 'Approve' : 'Buy now'

                            const buy = async (dropdown) => {
                                if (dropdown) setTimeout(() => dismissBuyChrome(dropdown), 200)
                                else dismissBuyChrome(dropdown)
                                if (chain.caps.requiresApproval && infoPricingBuyNowButton.textContent !== 'Buy now') {
                                    approveModal.style.display = 'flex'
                                    try {
                                        const approval = await chain.approveShopSpend()
                                        approveModal.style.display = 'none'
                                        progressModal.style.display = 'flex'
                                        const receipt = await chain.confirm(approval)
                                        showGoToInventoryBtn(false)
                                        infoPricingBuyNowButton.textContent = `Buy now`
                                        try {
                                            __allowance = chain.approvedAmountFrom(receipt)
                                            updateAllowance(chain)
                                        } catch (error) {
                                            console.log(error)
                                        }
                                        progressModal.style.display = 'none'
                                    } catch (err) {
                                        console.log(err.message)
                                        errorModalText.textContent = changeErrMessage(err.data ? err.data : err)
                                        approveModal.style.display = 'none'
                                        progressModal.style.display = 'none'
                                        errorModal.style.display = 'flex'
                                        return
                                    }
                                }
                                let submitted
                                try {
                                    // TonConnect renders its own confirm/progress UI; the
                                    // chains that hand back a receipt do not.
                                    if (chain.caps.syncReceipt) confirmModal.style.display = 'flex'
                                    submitted = await chain.buyShopItem({nftTypeName, nftId, index: i, json: v})
                                    confirmModal.style.display = 'none'
                                } catch (err) {
                                    console.log(err.message)
                                    errorModalText.textContent = changeErrMessage(err.data ? err.data : err)
                                    confirmModal.style.display = 'none'
                                    approveModal.style.display = 'none'
                                    errorModal.style.display = 'flex'
                                    return
                                }
                                if (!submitted) return
                                successModalImg.src = imgSource
                                sizeSuccessImage(successModalImg, imgSource, nftTypeName)
                                const shopList = document.querySelector(listItemId)
                                const firstEmpty = Array.from(shopList.querySelectorAll('.item-list__slot')).findIndex(slot => slot.childElementCount === 4)
                                let bought
                                if (chain.caps.syncReceipt) {
                                    try {
                                        progressModal.style.display = 'flex'
                                        await chain.confirm(submitted)
                                        progressModal.style.display = 'none'
                                    } catch (err) {
                                        console.log(err.message)
                                        errorModalText.textContent = changeErrMessage(err.data ? err.data : err)
                                        progressModal.style.display = 'none'
                                        errorModal.style.display = 'flex'
                                        return
                                    }
                                    if (chain.caps.requiresApproval) {
                                        __allowance -= chain.shopItemUnits(v)
                                        updateAllowance(chain)
                                    }
                                    showGoToInventoryBtn(true)
                                    infoPricingBuyNowButton.style.color = '#393939'
                                    infoPricingBuyNowButton.disabled = true
                                    infoPricingBuyNowButton.textContent = 'Bought'
                                    infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                    infoPricingBuyNowButton.classList.add('bought-btn')
                                    bought = {
                                        image: imgSource,
                                        id: nftId,
                                        name: v.name ? v.name : 'Name',
                                        attributes: v.attributes,
                                        collection,
                                        description: v.description
                                    }
                                } else {
                                    // No confirmed receipt on this chain: wait until the
                                    // new NFT shows up in the inventory instead.
                                    showPendingModal()
                                    bought = await chain.awaitNewNft(address, submitted)
                                }
                                addInventoryItem(listItemId, bought, nftTypeName, address, chain.chainid, firstEmpty, undefined, bought.nftAddress)
                                successModalText.textContent = 'You have successfully purchased the NFT'
                                setExplorerLink(successModalLink, chain.explorerTxUrl(submitted))
                                successModal.style.display = 'flex'
                            }

                            // EVM buys straight off the button; TVM opens a rail picker.
                            const rails = chain.buildPaymentRails
                                ? chain.buildPaymentRails({buyButton: infoPricingBuyNowButton, buy, nftTypeName, index: i, isDesktop})
                                : null
                            if (!rails) infoPricingBuyNowButton.addEventListener('click', () => buy(null))

                            if(isDesktop) {
                                infoPricing.append(tryOn, infoPricingBuyNowButton)
                            }
                            else {
                                    listItem.addEventListener('click', () =>
                                    showInventoryItemModal(
                                            imgSource,
                                            v.name ? v.name : 'Name',
                                            v.attributes,
                                            v.description,
                                            nftId,
                                            i,
                                            '',
                                            'shop',
                                            {
                                                address,
                                                nftTypeName,
                                                chainid: chain.chainid,
                                                healthBonus,
                                                bulletsBonus,
                                                speedBonus,
                                                jumpBonus,
                                                tryOn,
                                                infoPricingBuyNowButton,
                                                infoPricingBuyNowDropdown: rails ? rails.dropdown : undefined
                                            },
                                            chain.priceOf(v)
                                    ))
                            }
                        infoLeft.append(infoText, infoPricing)
                    itemLeft.append(imgLeft, infoLeft)
                const itemRight = document.createElement('div')
                itemRight.classList.add('item__right')
                    const itemRightProps = document.createElement('div')
                    itemRightProps.classList.add('right__props-wrap')
                    const itemRightDescription = document.createElement('p')
                    if (healthBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/heals.svg', 'Heals', healthBonus))
                    if (speedBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/speed.svg', 'Speed', speedBonus))
                    if (bulletsBonus) itemRightProps.appendChild(nftCharacteristic('media/svg/props-items/ammunition-quantity.svg', 'Bullets', bulletsBonus))
                    if (jumpBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/jump.svg', 'Jump', jumpBonus))
                    itemRightDescription.classList.add('right__description')
                    const descriptionLimit = nftTypeName === 'characters' ? 320 : 180
                    itemRightDescription.textContent = v.description.length > descriptionLimit
                        ? v.description.slice(0, descriptionLimit - 1) + ' ...'
                        : v.description
                    itemRight.append(itemRightProps, itemRightDescription)
                listItem.append(itemLeft, itemRight)
            list.appendChild(listItem)
        } catch (error) {
            console.log(error, nftTypeName, i)
        }
    })
}

const dismissBuyChrome = (dropdown) => {
    window.addEventListener("popstate", () => {});
    document.getElementById('new-approve-modal').style.display = 'none'
    if (dropdown) {
        document.querySelector('#inventory-item-modal').style.display = 'none'
        dropdown.style.cssText = 'display: none !important;'
    }
}

const sizeSuccessImage = (successModalImg, imgSource, nftTypeName) => {
    if (nftTypeName === 'weapons') {
        const _img = document.createElement('img')
        _img.src = imgSource
        if (_img.height > 120 && _img.width > 120 && _img.height === _img.width) {
            _img.height = 120
            _img.width = 120
        }
        successModalImg.height = _img.height
        successModalImg.width = _img.width
    } else {
        successModalImg.height = 100
        successModalImg.width = 100
    }
}

const dressingBtnClose = document.querySelector('.dressing-modal__btn-close')
dressingBtnClose.addEventListener('click', toggleDressingModal)

export async function toggleDressingModal(
    nftTypeName, nftId, address, chainid,
    healthBonus, bulletsBonus, speedBonus, jumpBonus
) {
    try {
        const playerHealth = document.querySelector('#player-health')
        const playerBullets = document.querySelector('#player-bullets')
        const playerSpeed = document.querySelector('#player-speed')
        const playerJump = document.querySelector('#player-jump')
        const tryOnPlayerHealth = document.querySelector('#tryon-player-health')
        const tryOnPlayerBullets = document.querySelector('#tryon-player-bullets')
        const tryOnPlayerSpeed = document.querySelector('#tryon-player-speed')
        const tryOnPlayerJump = document.querySelector('#tryon-player-jump')
        tryOnPlayerHealth.textContent = healthBonus ? basicPlayerCharacteristics.health + parseInt(healthBonus) : playerHealth.textContent
        tryOnPlayerBullets.textContent = bulletsBonus ? basicPlayerCharacteristics.bullets + parseInt(bulletsBonus) : playerBullets.textContent
        tryOnPlayerSpeed.textContent = speedBonus ? basicPlayerCharacteristics.speed + parseInt(speedBonus) : playerSpeed.textContent
        tryOnPlayerJump.textContent = jumpBonus ? basicPlayerCharacteristics.jump + parseInt(jumpBonus) : playerJump.textContent
        const fittingModalOverlay = document.querySelector('#fittingroom-modal')
        fittingModalOverlay.classList.toggle('modal-overlay_active')

        if (!fittingModalOverlay.classList.contains('modal-overlay_active')) {
            document.body.style.overflow = 'auto'
            return
        }
        document.querySelector('#tryon-character-background').style.display = 'none'
        document.querySelector('#tryon-character-slot2').className = 'character-wrap__img-wrap dressing_canvas_container lds-dual-ring-tryon'
        paintTryOnSlot(InventoryTypes.WEAPONS, nftTypeName, nftId)
        paintTryOnSlot(InventoryTypes.ARMORS, nftTypeName, nftId)
        paintTryOnSlot(InventoryTypes.BOOTS, nftTypeName, nftId)
        document.body.style.overflow = 'hidden'
        const res = await fetch('tryon', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address,
                chainid,
                inventory: {
                    [nftTypeName]: nftId
                }
            })
        })
        if (res.status === 200) {
            let tryOnImage = await res.blob()
            if (drawTimeout) clearTimeout(drawTimeout)
            drawCharacterAnimation(tryOnImage)
        }
    } catch (error) {
        console.log(error)
    }
}

const tryOnSlots = {
    [InventoryTypes.WEAPONS]: {slot: '#tryon-weapon-slot', img: '#tryon-weapon-slot-img', storage: 'setted-weapon', className: 'slot-wrap__slot weapon-slot', background: 'weapon__slot-background'},
    [InventoryTypes.ARMORS]: {slot: '#tryon-armor-slot', img: '#tryon-armor-slot-img', storage: 'setted-armor', className: 'slot-wrap__slot armor-slot', background: 'armor__slot-background'},
    [InventoryTypes.BOOTS]: {slot: '#tryon-boots-slot', img: '#tryon-boots-slot-img', storage: 'setted-boots', className: 'slot-wrap__slot boots-slot', background: 'boots__slot-background'}
}

const paintTryOnSlot = (itemType, nftTypeName, nftId) => {
    const spec = tryOnSlots[itemType]
    const slotImg = document.querySelector(spec.img)
    const setted = localStorage.getItem(spec.storage)
    if (!setted && nftTypeName !== itemType) {
        document.querySelector(spec.slot).className = `${spec.className} ${spec.background} dressing_slot`
        slotImg.src = ''
        slotImg.style.display = 'none'
        return
    }
    document.querySelector(spec.slot).className = `${spec.className} dressing_slot`
    slotImg.src = nftTypeName === itemType ? `/media/${itemType}/${nftId}.png` : setted
    if (itemType === InventoryTypes.WEAPONS) {
        slotImg.className = ''
        slotImg.className = (slotImg.width === 293 || slotImg.width === 120 || slotImg.width === 64)
            ? 'slot-wrap__slot-img-wider' : 'slot-wrap__slot-img'
    } else {
        slotImg.className = 'slot-wrap__slot-img'
    }
    slotImg.style.display = ''
}

const drawCharacterAnimation = (imageBlob) => {
    let canvas = document.querySelector('#tryon-character-background')
    let ctx = canvas.getContext('2d');
    let imageUrl = URL.createObjectURL(imageBlob);

    let img = new Image();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = function () {
        // Размеры кадров
        let frameWidth = 456;
        let frameHeight = 456;

        // Проигрываемые кадры
        let numFrames = 12;

        const scale = 0.9;

        canvas.width = frameWidth * 1;
        canvas.height = frameHeight * 1;

        let interval = 150; // Время задержки между кадрами (в миллисекундах)
        let currentFrame = 0;

        function animateFrames() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(
                img, // Исходное изображение
                currentFrame * frameWidth, // X-координата начала текущего кадра
                0, // Y-координата начала текущего кадра
                frameWidth, // Ширина текущего кадра
                frameHeight, // Высота текущего кадра
                -50, // X-координата отрисовки на canvas
                -175, // Y-координата отрисовки на canvas
                frameWidth * scale, // Ширина отрисовываемого кадра на canvas (с учетом масштабирования)
                frameHeight * scale // Высота отрисовываемого кадра на canvas (с учетом масштабирования)
            );

            currentFrame++;

            // Если достигнут последний кадр, перезапустим анимацию
            if (currentFrame >= numFrames) {
                currentFrame = 0;
            }

            drawTimeout = setTimeout(animateFrames, interval);
        }

        animateFrames();
    };

    img.src = imageUrl;
    document.querySelector('#tryon-character-background').style.display = ''
    document.querySelector('#tryon-character-slot2').className = 'character-wrap__img-wrap dressing_canvas_container'
}

const nftCharacteristic = (img, name, bonus) => {
    const itemRightBlock = document.createElement('div')
    itemRightBlock.classList.add('props-wrap__prop-item')
        const itemRightBlockImgWrap = document.createElement('img')
        itemRightBlockImgWrap.src = img
        itemRightBlockImgWrap.classList.add('prop-item__icon-wrap')
        const itemRightBlockTitle = document.createElement('span')
        itemRightBlockTitle.classList.add('prop-item__title')
        itemRightBlockTitle.textContent = name
        const itemRightBlockValue = document.createElement('span')
        itemRightBlockValue.classList.add('prop-item__value')
        itemRightBlockValue.textContent = bonus
        itemRightBlock.append(itemRightBlockImgWrap, itemRightBlockTitle, itemRightBlockValue)
    return itemRightBlock
}

const shopSwitcher = () => {
    const tabs = ['characters', 'weapons', 'armors', 'boots']
        .map(nftTypeName => document.querySelector(shopListIdFor[nftTypeName]))
        .concat(document.querySelector('#nft-shop-boxes-list'))
    const rarityFilter = document.querySelector('#rarity-filter')
    if(!isDesktop) {
        tabs[0].style.display = 'flex'
    }
    tabs.forEach((_, shown) => {
        document.querySelector(`#nft-shop-2__tab-${shown + 1}`).addEventListener('click', () => {
            tabs.forEach((list, i) => list.style.display = i === shown ? (isDesktop ? 'block' : 'flex') : 'none')
            // Rarity only applies to weapons / armors / boots.
            rarityFilter.style.display = (shown === 0 || shown === 4) ? 'none' : ''
        })
    })
}

// SimpleBar moves the list's children into its own .simplebar-content, so the
// sortable container is that when it exists and the list itself otherwise.
const sortContainer = (selector) =>
    document.querySelector(`${selector} .simplebar-content`) || document.querySelector(selector)

const priceSort = (sorter) => {
    Object.values(shopListIdFor).forEach(selector => {
        const container = sortContainer(selector)
        Array.from(container.querySelectorAll('.list-items__item'))
            .sort(sorter)
            .forEach(item => container.appendChild(item))
    })
}

const _imageSerialSort = (a, b) => {
    let imageSerailA = parseFloat(a.getAttribute('data-serial'));
    let imageSerailB = parseFloat(b.getAttribute('data-serial'));
    return imageSerailA - imageSerailB;
}
const _ascendingPriceSort = (a, b) => {
    let priceA = parseFloat(a.getAttribute('data-price'));
    let priceB = parseFloat(b.getAttribute('data-price'));
    return priceA - priceB;
}

const _descendingPriceSort = (a, b) => {
    let priceA = parseFloat(a.getAttribute('data-price'));
    let priceB = parseFloat(b.getAttribute('data-price'));
    return priceB - priceA;
}

// Rarity checkboxes. Characters are deliberately excluded — they have no class.
const collectionChange = () => {
    const collectionCheckboxes = document.querySelectorAll('input[name="collection-check"]');
    const stores = ['weapons', 'armors', 'boots'].map(v => document.querySelector(shopListIdFor[v]))

    const updateDisplay = () => {
        const selectedCollections = Array.from(collectionCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        stores.forEach(store => {
            Array.from(store.getElementsByClassName('list-items__item')).forEach(item => {
                const shown = selectedCollections.length === 0 || selectedCollections.includes(item.getAttribute('data-collection'))
                item.style.display = shown ? (isDesktop ? 'flex' : 'block') : 'none'
            })
        })
    }

    collectionCheckboxes.forEach(checkbox => checkbox.addEventListener('change', updateDisplay))
    updateDisplay();
}

const updateAllowance = (chain) => {
    Object.values(shopListIdFor).forEach(selector => {
        document.querySelector(selector).querySelectorAll('.list-items__item').forEach(item => {
            try {
                const button = item.querySelector('[data-button="action"]')
                button.textContent = chain.allowanceCovers(__allowance, item.getAttribute('data-price')) ? 'Buy now' : 'Approve'
                if (button.disabled) {
                    button.textContent = 'Bought'
                }
            } catch (error) {
                console.log(error)
            }
        })
    })
}
