// Inventory panel — chain-agnostic.
//
// Was two ~95% identical files (lib/src/inventory.js, lib/src/ton/inventory.js).
// Everything here is shared; the three real differences live behind the chain
// object built by items/evm.js or items/tvm.js:
//
//   1. NFT enumeration      -> chain.listOwnedNfts()
//   2. Per-item NFT address -> chain.caps.perItemNftAddress (TVM only)
//   3. Endpoint prefix      -> chain.route()  ('' vs 'ton/')
//
// The chain object is module-level state, like the __address it sits next to:
// a page loads exactly one lobby bundle, so exactly one chain is ever active.

import armorsJsons from '../../jsons/armors.json'
import bootsJsons from '../../jsons/boots.json'
import weaponsJsons from '../../jsons/weapons.json'
import { ActionTypes, InventoryTypes, mobileAndTabletCheck } from '../utils/utils'

const regexForImageID = /\/(\d+)\.png$/

const listIdFor = {
    [InventoryTypes.CHARACTERS]: '#left-inventory-characters-list',
    [InventoryTypes.WEAPONS]: '#left-inventory-weapons-list',
    [InventoryTypes.ARMORS]: '#left-inventory-armors-list',
    [InventoryTypes.BOOTS]: '#left-inventory-boots-list'
}

// The three wearable slots. Characters are not in here: they live in a fixed
// image element rather than a droppable slot, and have no take-off.
const wearableSlots = {
    [InventoryTypes.WEAPONS]: {id: 'weapon-slot', selector: '#weapon-slot', field: 'weapon', background: 'weapon__slot-background', route: 'setweapon'},
    [InventoryTypes.ARMORS]: {id: 'armor-slot', selector: '#armor-slot', field: 'armor', background: 'armor__slot-background', route: 'setarmor'},
    [InventoryTypes.BOOTS]: {id: 'boots-slot', selector: '#boots-slot', field: 'boots', background: 'boots__slot-background', route: 'setboots'}
}

const playerHealth = document.querySelector('#player-health')
const playerBullets = document.querySelector('#player-bullets')
const playerSpeed = document.querySelector('#player-speed')
const playerJump = document.querySelector('#player-jump')

let __address
let __chain
let drawTimeout

const basicPlayerCharacteristics = {
    health: 3,
    bullets: 3,
    speed: 480,
    jump: 160
}

let playerCharacteristics = {...basicPlayerCharacteristics}

const isMobile = mobileAndTabletCheck()

export const setItemsChain = (chain) => {
    __chain = chain
}

export const renderInventory = async (chain, address) => {
    if (!address) return
    setItemsChain(chain)
    __address = address
    const inventory = await chain.fetchInventory(address)
    let __character = new URLSearchParams();
    __character.append("address", address)
    __character.append("chainid", chain.chainid)
    __character.append("typeofimage", 'preview')
    const rawResponse3 = await fetch('/getcharacterimage?' + __character)
    let player1Image = await rawResponse3.blob().catch(err => console.log(err))
    if (!isNaN(parseInt(inventory.health_bonus))) playerCharacteristics.health += inventory.health_bonus
    if (!isNaN(parseInt(inventory.bullets_bonus))) playerCharacteristics.bullets += inventory.bullets_bonus
    if (!isNaN(parseInt(inventory.speed_bonus))) playerCharacteristics.speed += inventory.speed_bonus
    if (!isNaN(parseInt(inventory.jump_bonus))) playerCharacteristics.jump += inventory.jump_bonus
    updatePlayerCharacteristics()
    localStorage.setItem('chosenCharacter', inventory.characterid)
    localStorage.setItem('chosenArmor', inventory.armor)
    localStorage.setItem('chosenWeapon', inventory.weapon)
    localStorage.setItem('chosenBoots', inventory.boots)
    await inventoryModal(address, inventory)
    if (!isNaN(parseInt(inventory.characterid))) {
        const img = document.querySelector('#character-slot3')
        try {
            drawCharacterAnimation(player1Image)
        } catch (error) {
            console.log(error)
        }
        img.src =  `/media/characters/${inventory.characterid}.png`
        rmSettedItemFromList(inventory.characterid, InventoryTypes.CHARACTERS)
    }
    paintWornSlot(InventoryTypes.ARMORS, inventory, address)
    paintWornSlot(InventoryTypes.BOOTS, inventory, address)
    paintWornSlot(InventoryTypes.WEAPONS, inventory, address)
    setInventoryImage(inventory.characterid)
    inventorySwitcher()
    document.getElementById('btn-close-item-detail-modal').addEventListener('click', closeInventoryItemModal)
    setImage('armor-img', inventory.armor == null ? '/media/svg/inventory/armor.svg' : `/media/armors/${inventory.armor}.png`)
    setImage('weapons-img', inventory.weapon == null ? '/media/svg/inventory/weapon.svg' : `/media/weapons/${inventory.weapon}.png`)
    setImage('boots-img', inventory.boots == null ? '/media/svg/inventory/boots.svg' : `/media/boots/${inventory.boots}.png`)
    Object.keys(wearableSlots).forEach(itemType => {
        document.querySelector(wearableSlots[itemType].selector)
            .addEventListener('click', async () => await showInventoryItemModalForSettedItem(itemType))
    })
}

// Paints an armor / boots / weapon slot with whatever the server says is worn.
// The three blocks this replaces were identical apart from the folder name and,
// on weapons, the extra width class.
const paintWornSlot = (itemType, inventory, address) => {
    const spec = wearableSlots[itemType]
    const itemId = inventory[spec.field]
    const storageKey = `setted-${spec.field}`
    if (isNaN(parseInt(itemId))) {
        localStorage.setItem(storageKey, '')
        return
    }
    const image = `/media/${itemType}/${itemId}.png`
    const img = document.createElement('img')
    img.src = image
    if (itemType !== InventoryTypes.WEAPONS) img.className = 'slot-wrap__slot-img'
    localStorage.setItem(storageKey, img.src)
    const slot = document.querySelector(spec.selector)
    slot.appendChild(img)
    slot.classList.remove(spec.background)
    slot.classList.add('slot-wrap__slot_active')
    slot.setAttribute('data-address', address)
    slot.setAttribute('data-chainid', __chain.chainid)
    slot.setAttribute('data-type', itemType)
    slot.setAttribute('data-image', image)
    slot.setAttribute('data-id', itemId)
    slot.setAttribute('data-action', ActionTypes.TAKEOFF)
    setNftAddressAttribute(slot, __chain.equippedNftAddress(inventory, itemType, itemId))
    slot.draggable = true
    slot.addEventListener('dragstart', dragStartExistedElement)
    rmSettedItemFromList(itemId, itemType)
    if (itemType === InventoryTypes.WEAPONS) {
        img.classList.add(isWideWeaponImage(img) ? 'slot-wrap__slot-img-wider' : 'slot-wrap__slot-img')
    }
}

const isWideWeaponImage = (img) => img.width === 293 || img.width === 120 || img.width === 64

// EVM items have no address of their own — identity is (collection, tokenId) —
// so the attribute is only written when the chain actually carries one.
const setNftAddressAttribute = (element, nftAddress) => {
    if (__chain.caps.perItemNftAddress && nftAddress != null) {
        element.setAttribute('data-nftaddress', nftAddress)
    }
}

const inventoryModal = async (address, inventory) => {
    const characterHave = {
        id: 0,
        image: "/media/characters/0.png",
        name: "Fair Person",
        attributes: [
            {
                "trait_type": "Type",
                "value": "Character"
            }
        ],
        description: "Classic character with his own charm and charm. Available by default."
    }
    addInventoryItem(listIdFor[InventoryTypes.CHARACTERS], characterHave, InventoryTypes.CHARACTERS, address, __chain.chainid, 0, inventory.characterid, inventory.address)
    const settedIdFor = {
        [InventoryTypes.CHARACTERS]: inventory.characterid,
        [InventoryTypes.WEAPONS]: inventory.weapon,
        [InventoryTypes.ARMORS]: inventory.armor,
        [InventoryTypes.BOOTS]: inventory.boots
    }
    // The default character above already occupies slot 0 of the characters list.
    const counters = {
        [InventoryTypes.CHARACTERS]: 1,
        [InventoryTypes.WEAPONS]: 0,
        [InventoryTypes.ARMORS]: 0,
        [InventoryTypes.BOOTS]: 0
    }
    const owned = await __chain.listOwnedNfts(address, inventory)
    owned.forEach(item => {
        const listId = listIdFor[item.type]
        if (!listId) return
        addInventoryItem(listId, item, item.type, address, __chain.chainid, counters[item.type], settedIdFor[item.type], item.nftAddress)
        counters[item.type] += 1
    })
    Object.keys(listIdFor).forEach(itemType => {
        const list = document.querySelector(listIdFor[itemType])
        list.addEventListener('dragover', (event) => event.preventDefault())
        list.addEventListener('drop', dropExistedElement)
    })
    const dropTargets = ['#character-slot1', ...Object.values(wearableSlots).map(v => v.selector)]
    dropTargets.forEach(selector => {
        const target = document.querySelector(selector)
        target.addEventListener('dragover', (event) => event.preventDefault())
        target.addEventListener('drop', drop)
    })
}

export const addInventoryItem = (itemListId, item, itemType, address, chainid, i, settedId, nftAddress) => {
    const lowerCollection = item.collection ? item.collection.toLowerCase() : 'character'
    const listItem = document.querySelector(itemListId)
    let list = listItem.querySelectorAll('.item-list__slot')
    const img = document.createElement('img')
    img.src = item.image
    img.classList.add((img.width === 293 || img.width === 120) ? 'inventory-items-wider' : 'inventory-items', `list-items__item_${lowerCollection}`)
    img.draggable = true
    img.setAttribute('data-address', address)
    img.setAttribute('data-chainid', chainid)
    img.setAttribute('data-type', itemType)
    img.setAttribute('data-image', item.image)
    img.setAttribute('data-id', item.id)
    img.setAttribute('data-action', ActionTypes.TAKEON)
    setNftAddressAttribute(img, nftAddress)
    img.addEventListener('dragstart', dragStart)
    img.addEventListener('dragend', dropStartElement)
    img.addEventListener('click', () =>
        showInventoryItemModal(
            item.image, item.name, item.attributes, item.description ? item.description : 'Description',
            itemType, item.id, '', undefined, undefined, item.price, nftAddress
        )
    )

    let collectionClass = `item-list__slot_green`
    if (itemType === InventoryTypes.CHARACTERS) {
        collectionClass = `item-list__slot_silver`
    }
    if (lowerCollection === 'epic') {
        collectionClass = `item-list__slot_purple`
    }
    if (lowerCollection === `legendary`) {
        collectionClass = `item-list__slot_orange`
    }
    if (lowerCollection === `basic`) {
        collectionClass = `item-list__slot_silver`
    }
    if (lowerCollection === `rare`) {
        collectionClass = `item-list__slot_blue`
    }
    if (!list.item(i)) {
        const _slot = document.createElement('div')
        _slot.classList.add('item-list__slot')
            for (let corner = 0; corner < 4; corner++) {
                const cornerImage = document.createElement('img')
                cornerImage.className = 'board-edge_sm  modal-content__corner'
                cornerImage.src = 'media/svg/inventory/basic-edge-slot.svg'
                _slot.appendChild(cornerImage)
            }
        listItem.querySelector('.list-wrap__item-list').appendChild(_slot)
        _slot.classList.add(collectionClass)
        _slot.appendChild(img)
        if (settedId === i) {
            _slot.style.display = 'none'
        }
    } else {
        list.item(i).classList.add(collectionClass)
        list.item(i).appendChild(img)
        if (settedId === i) {
            list.item(i).style.display = 'none'
        }
    }

    try {
        Array.from(list.item(i).children).forEach((child) => {
            if(lowerCollection === 'character') {
                return
            }
            if(child.className.includes('board-edge')) {
                child.src = `media/svg/inventory/${lowerCollection}-edge-slot.svg`
            }
        })
    } catch (error) {
    }
}

const showInventoryItemModalForSettedItem = async (itemType) => {
    //получаем id по картинке которая на установленном item'e
    const element = document.querySelector(wearableSlots[itemType].selector)
    if (element.firstElementChild) {
        const nftAddress = element.getAttribute('data-nftaddress')
        const itemId = element.firstElementChild.src.match(regexForImageID)[1]
        const itemImage = `/media/${itemType}/${itemId}.png`
        let jsonData = weaponsJsons[itemId]
        if (itemType === InventoryTypes.ARMORS) {
            jsonData = armorsJsons[itemId]
        }
        if (itemType === InventoryTypes.BOOTS) {
            jsonData = bootsJsons[itemId]
        }
        await showInventoryItemModal(
            itemImage,
            jsonData.name,
            jsonData.attributes,
            jsonData.description,
            itemType,
            itemId,
            '',
            undefined,
            undefined,
            undefined,
            nftAddress
        )
    }
}

export const showInventoryItemModal = async (
    itemImage, itemName, itemFeatures, itemDescription,
    itemType, itemId, currentItemIdOfThisType, from, payload, itemPrice, itemNftAddress
    ) => {
    let current;
    if (itemType === InventoryTypes.CHARACTERS) {
        let elementToCheckCurrent = document.querySelector('#character-slot3')
        const match = elementToCheckCurrent.src.match(regexForImageID)
        if (match) current = match[1]
    }
    if (wearableSlots[itemType]) {
        let elementToCheckCurrent = document.querySelector(wearableSlots[itemType].selector)
        if (elementToCheckCurrent.firstElementChild && elementToCheckCurrent.firstElementChild.src) {
            const match = elementToCheckCurrent.firstElementChild.src.match(regexForImageID)
            if (match) current = match[1]
        }
    }
    const itemCollection = itemType === InventoryTypes.CHARACTERS || payload?.nftTypeName === InventoryTypes.CHARACTERS ? 'Character' :  itemFeatures.find(v => v.trait_type === 'Class').value
    const itemFeaturesSlice = itemFeatures.slice(2)
    const name = document.querySelector('#inventory-item-modal-name')
    const collection = document.querySelector('#inventory-item-modal-collection')
    const features = document.querySelector('#inventory-item-modal-features')
    const description = document.querySelector('#inventory-item-modal-description')
    const image = document.querySelector('#inventory-item-modal-image')
    const edges = document.querySelectorAll('[data-edge="inventory-item"]')
    const useButton = document.querySelector('#inventory-item-modal-use')
    const tryonButton = document.querySelector('#inventory-item-modal-tryon')
     ? document.querySelector('#inventory-item-modal-tryon') : document.querySelector('#inventory-item-modal-tryon-collection')
    const takeoffButton = document.querySelector('#inventory-item-modal-takeitoff')
    const inventoryItemModal= document.querySelector('#inventory-item-modal')
    const actionButton = document.querySelectorAll('[data-button="action"]')

    // On TVM the modal hosts the buy-rail dropdown, so a click anywhere in it
    // must not dismiss the modal out from under the dropdown.
    if (__chain.caps.dismissItemModalOnBackdropClick) {
        inventoryItemModal.onclick = function() {
            closeInventoryItemModal()
        }
    }

    const inventoryItemBody = document.getElementById('inventory-item-body')
    inventoryItemBody.className = `inventory-item-body_${itemCollection.toLowerCase()}`

    edges.forEach(el => {
        if(itemType === InventoryTypes.CHARACTERS || payload?.nftTypeName === InventoryTypes.CHARACTERS) {
            el.src = `media/svg/inventory-modal/inventory-item-edge-basic.svg`
            return
        }
        el.src = `media/svg/inventory-modal/inventory-item-edge-${itemCollection.toLowerCase()}.svg`
    })

    name.textContent = itemName
    name.className = `text-item__${itemCollection.toLowerCase()}`
    collection.textContent = itemCollection
    description.textContent = itemDescription
    image.src = itemImage
    setModalPrice(from === 'shop' ? {price: itemPrice, collection: itemCollection} : null)
    itemFeaturesSlice.forEach(v => {
        const featureElement = document.createElement('div')
        featureElement.classList.add('props-item__prop')
            const featureElementImgWrap = document.createElement('img')
            featureElementImgWrap.classList.add('prop__img-wrap')
                if (v.trait_type.includes('Bullets')) {
                    featureElementImgWrap.src = `media/svg/props-items/ammunition-quantity.svg`
                }
                if (v.trait_type.includes('Health')) {
                    featureElementImgWrap.src = `media/svg/props-items/heals.svg`
                }
                if (v.trait_type.includes('Speed')) {
                    featureElementImgWrap.src = `media/svg/props-items/speed.svg`
                }
                if (v.trait_type.includes('Jump')) {
                    featureElementImgWrap.src = `media/svg/props-items/jump.svg`
                }
            featureElement.appendChild(featureElementImgWrap)
            const featureElementName = document.createElement('span')
            featureElementName.classList.add('prop__title')
            featureElementName.textContent = v.trait_type
            const featureElementValue = document.createElement('span')
            featureElementValue.classList.add('prop__value')
            featureElementValue.textContent = `+${v.value}`
            featureElement.append(featureElementName, featureElementValue)
        features.appendChild(featureElement)
    })
    inventoryItemModal.style.display = 'flex'

    if (from === 'shop'){
        if(actionButton) {
            actionButton.forEach(button => {
                button.style.display = 'block'
            })
        }

        payload.tryOn.style.display = 'block'

        const parent = document.querySelector('#inventory-item-body')
        const oldButtonsWrap = document.querySelector('.detail-buttons')
        const newButtonsWrap = document.createElement('div')
        newButtonsWrap.classList.add('detail-buttons', 'item-detail__btns-wrap')

        const takeitoff = document.createElement('button')
        takeitoff.setAttribute('id', 'inventory-item-modal-takeitoff')
        takeitoff.textContent = 'Take it off'
        takeitoff.style.display = 'none'
        const use = document.createElement('button')
        use.setAttribute('id', 'inventory-item-modal-use')
        use.textContent = 'Use'
        use.style.display = 'none'
        const gToInventory = document.createElement('button')
        gToInventory.setAttribute('id', 'go-to-inventory-btn-from-loot')
        gToInventory.textContent = 'Go to inventory'
        gToInventory.style.display = 'none'
        gToInventory.classList.add('go-inventory_from-loot', 'go-inventory')

        newButtonsWrap.append(takeitoff, use, gToInventory, payload.tryOn, payload.infoPricingBuyNowButton)
        // Only TVM builds a dropdown — it has a second payment rail (Aeon).
        if (payload.infoPricingBuyNowDropdown) {
            inventoryItemModal.querySelector('.body__item-detail').appendChild(payload.infoPricingBuyNowDropdown)
        }

        parent.replaceChild(newButtonsWrap, oldButtonsWrap);
    }
    else if(from === 'loot') {
        useButton.style.display = 'none'
        tryonButton.style.display = 'none'
        if(actionButton) {
            actionButton.forEach(button => {
                button.style.display = 'none'
            })
        }
        document.querySelector('#inventory-item-modal-takeitoff').style.display = 'none'
        const goToInventoryBtn = document.querySelector('#go-to-inventory-btn-from-loot')

        goToInventoryBtn.style.display = 'block'
        goToInventoryBtn.addEventListener('click', () => {
            const inventoryModalOverlay = document.getElementById('inventory-modal')
            inventoryModalOverlay.classList.toggle('modal-overlay_active')

            if (inventoryModalOverlay.classList.contains('modal-overlay_active')) {
              document.body.style.overflow = 'hidden'
            }
            else {
              document.body.style.overflow = 'auto'
            }
            const shopModal = document.querySelector('#shop-block')
            shopModal.classList.remove('wrapper__nft-shop-modal-overlay_active')
            document.querySelector('#inventory-item-modal').style.display = 'none'
          })

    }
    else {
        tryonButton.style.display = 'none'
        if(actionButton) {
            actionButton.forEach(button => {
                button.style.display = 'none'
            })
        }
        document.querySelector('#go-to-inventory-btn-from-loot').style.display = 'none'
        if (current) {
            if (itemType !== InventoryTypes.CHARACTERS) {
                if (current.toString() === itemId.toString()) {
                    useButton.style.display = 'none'
                    replaceWithAction(takeoffButton, () => useItemFromModal(itemType, null, itemImage, itemNftAddress))
                } else {
                    takeoffButton.style.display = 'none'
                    replaceWithAction(useButton, () => useItemFromModal(itemType, itemId, itemImage, itemNftAddress))
                }
            } else {
                if (current.toString() === itemId.toString()) {
                    takeoffButton.style.display = 'none'
                    useButton.style.display = 'none'
                } else {
                    takeoffButton.style.display = 'none'
                    replaceWithAction(useButton, () => useItemFromModal(itemType, itemId, itemImage, itemNftAddress))
                }
            }
        } else {
            takeoffButton.style.display = 'none'
            replaceWithAction(useButton, () => useItemFromModal(itemType, itemId, itemImage, itemNftAddress))
        }
    }
}

// Clone-and-swap so the previous modal's click handler cannot fire again.
const replaceWithAction = (button, action) => {
    const clonedButton = button.cloneNode(true);
    button.parentNode.replaceChild(clonedButton, button);
    clonedButton.style.display = ''
    clonedButton.addEventListener('click', async () => await action())
}

// The price row only exists on the EVM lobby page; index_ton.html has no
// #inventor-info-price* nodes, so this is a no-op there.
const setModalPrice = (priced) => {
    const table = document.querySelector('#inventor-info-price-table')
    const value = document.querySelector('#inventor-info-price')
    const symbol = document.querySelector('#inventor-info-price-symbol')
    if (!table || !value || !symbol) return
    if (priced) {
        table.style.display = ''
        value.style.display = ''
        symbol.style.display = ''
        table.src = `media/svg/shop/${priced.collection.toLowerCase()}-collection/price-table.svg`
        value.textContent = parseFloat(priced.price).toFixed(2)
    } else {
        table.style.display = 'none'
        value.style.display = 'none'
        symbol.style.display = 'none'
    }
}

const useItemFromModal = async (itemType, itemId, itemImage, itemNftAddress) => {
    try {
        const spec = wearableSlots[itemType]
        let element
        let url
        if (itemType === InventoryTypes.CHARACTERS) {
            element = document.querySelector("#character-slot3")
            url = __chain.route('setcharacter')
            addBigLoaderToInventoryItem(element.parentElement)
        } else {
            element = document.querySelector(spec.selector)
            element.classList.remove(spec.background)
            url = __chain.route(spec.route)
            if (element.firstElementChild) element.firstElementChild.style.display = 'none'
            addLoaderToInventoryItem(element)
        }
        closeInventoryItemModal()
        const status = await setInventory(__address, __chain.chainid, url, itemId, itemNftAddress)
        if (itemType === InventoryTypes.CHARACTERS) {
            removeBigLoaderToInventoryItem(element.parentElement)
        } else {
            removeLoaderToInventoryItem(element)
            if (element.firstElementChild) element.firstElementChild.style.display = ''
        }
        if (status !== 200) {
            showInventoryError()
            return
        }
        if (itemType === InventoryTypes.CHARACTERS) {
            const previousId = element.src.match(regexForImageID)[1]
            showSettedItemFromList(previousId, itemType)
            element.src = itemImage
            rmSettedItemFromList(itemId, itemType)
        } else if (itemId !== null) {
            if (element.firstElementChild) {
                showSettedItemFromList(element.getAttribute('data-id'), itemType)
                element.firstElementChild.src = itemImage
            } else {
                const img = document.createElement('img')
                img.src = itemImage
                element.appendChild(img)
                element.classList.add('slot-wrap__slot_active')
                Object.values(wearableSlots).forEach(v => element.classList.remove(v.background))
                showSettedItemFromList(itemId, itemType)
            }
            element.setAttribute('data-address', __address)
            element.setAttribute('data-chainid', __chain.chainid)
            element.setAttribute('data-type', itemType)
            element.setAttribute('data-image', itemImage)
            element.setAttribute('data-id', itemId)
            element.setAttribute('data-action', ActionTypes.TAKEOFF)
            setNftAddressAttribute(element, itemNftAddress)
            element.draggable = true
            element.addEventListener('dragstart', dragStartExistedElement)
            applyEquippedBonuses(element, itemType, itemId, itemImage)
            rmSettedItemFromList(itemId, itemType)
            updatePlayerCharacteristics()
        } else {
            if (element.firstElementChild) {
                showSettedItemFromList(element.getAttribute('data-id'), itemType)
                element.firstElementChild.remove()
            }
            element.classList.remove('slot-wrap__slot_active')
            element.classList.add(spec.background)
            clearEquippedBonuses(itemType)
            updatePlayerCharacteristics()
        }
    } catch (error) {

    }
}

// Sizing class + stat bonuses for a freshly equipped item. Was pasted four
// times across the two files (modal "Use", and one drop handler per slot).
const applyEquippedBonuses = (element, itemType, itemId, itemImage) => {
    if (itemType === InventoryTypes.WEAPONS) {
        const _img = document.createElement('img')
        _img.src = itemImage
        element.firstElementChild.classList.remove(...element.firstElementChild.classList)
        element.firstElementChild.classList.add(isWideWeaponImage(_img) ? 'slot-wrap__slot-img-wider' : 'slot-wrap__slot-img')
        playerCharacteristics.bullets = basicPlayerCharacteristics.bullets + parseInt(weaponsJsons[itemId].attributes[2].value)
    }
    if (itemType === InventoryTypes.ARMORS) {
        element.firstElementChild.className = 'slot-wrap__slot-img'
        playerCharacteristics.health = basicPlayerCharacteristics.health + parseInt(armorsJsons[itemId].attributes[2].value)
    }
    if (itemType === InventoryTypes.BOOTS) {
        element.firstElementChild.className = 'slot-wrap__slot-img'
        playerCharacteristics.speed = basicPlayerCharacteristics.speed + parseInt(bootsJsons[itemId].attributes[2].value)
        playerCharacteristics.jump = basicPlayerCharacteristics.jump + parseInt(bootsJsons[itemId].attributes[3].value)
    }
}

const clearEquippedBonuses = (itemType) => {
    if (itemType === InventoryTypes.WEAPONS) {
        playerCharacteristics.bullets = basicPlayerCharacteristics.bullets
    }
    if (itemType === InventoryTypes.ARMORS) {
        playerCharacteristics.health = basicPlayerCharacteristics.health
    }
    if (itemType === InventoryTypes.BOOTS) {
        playerCharacteristics.speed = basicPlayerCharacteristics.speed
        playerCharacteristics.jump = basicPlayerCharacteristics.jump
    }
}

const showInventoryError = () => {
    const errorModal = document.querySelector('#new-error-modal')
    const errorModalText = document.querySelector('#new-error-modal-text')
    errorModal.style.display = 'flex'
    errorModalText.textContent = "The player has the open game or does not have the item"
}

const closeInventoryItemModal = () => {
    document.querySelector('#inventory-item-modal-use').style.display = 'block'
    document.querySelector('#inventory-item-modal-tryon') ?
    document.querySelector('#inventory-item-modal-tryon').style.display = 'block'
    : document.querySelector('#inventory-item-modal-tryon-collection').style.display = 'block'
    document.querySelector('#inventory-item-modal-takeitoff').style.display = 'block'
    document.querySelector('#go-to-inventory-btn-from-loot').style.display = 'block'
    const actionButton = document.querySelectorAll('[data-button="action"]')
    actionButton.forEach(button => {
        button.style.display = 'block'
    })
    const features = document.querySelector('#inventory-item-modal-features')
    features.replaceChildren()
    document.querySelector('#inventory-item-modal').style.display = 'none'
    document.querySelectorAll('.buy-now-btn__wrapper-dropdown').forEach(element => element.style.cssText = 'display: none !important;')
}

const dragStart = (event) => {
    try {
        const slot = event.target;
        const itemType = slot.getAttribute('data-type')
        const highlight = {
            [InventoryTypes.CHARACTERS]: document.querySelector('#character-slot2'),
            [InventoryTypes.WEAPONS]: document.querySelector('#weapon-slot'),
            [InventoryTypes.ARMORS]: document.querySelector('#armor-slot'),
            [InventoryTypes.BOOTS]: document.querySelector('#boots-slot')
        }
        if (highlight[itemType]) {
            Object.keys(highlight).forEach(k => {
                highlight[k].classList.add(k === itemType ? 'available-slot' : 'dont-available-slot')
            })
        }
        event.dataTransfer.setData('text/plain', JSON.stringify(dragPayload(slot)));
    } catch (error) {

    }
}

const dragStartExistedElement = (event) => {
    try {
        event.target.classList.add('slot-wrap__slot_active')
        event.dataTransfer.setData('text/plain', JSON.stringify(dragPayload(event.target)));
    } catch (error) {

    }
}

const dragPayload = (slot) => ({
    action: slot.getAttribute('data-action'),
    type: slot.getAttribute('data-type'),
    id: slot.getAttribute('data-id'),
    image: slot.getAttribute('data-image'),
    address: slot.getAttribute('data-address'),
    chainid: slot.getAttribute('data-chainid'),
    nftAddress: slot.getAttribute('data-nftaddress')
})

// Equip by dragging a list item onto a slot. The four per-slot blocks this
// replaces differed only in the target id, the setter route and the stat.
const drop = async (event) => {
    try {
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const characterTargets = ['character-slot1', 'character-slot2', 'character-slot3', 'character-background']
        const spec = wearableSlots[data.type]
        if (data.action === ActionTypes.TAKEON && data.type === InventoryTypes.CHARACTERS && characterTargets.includes(event.target.id)) {
            const img = document.querySelector('#character-slot3')
            addBigLoaderToInventoryItem(img.parentElement)
            img.style.display = 'none'
            const status = await setInventory(data.address, data.chainid, __chain.route('setcharacter'), data.id, data.nftAddress)
            removeBigLoaderToInventoryItem(img.parentElement)
            if (status === 200) {
                showSettedItemFromList(img.src.match(regexForImageID)[1], data.type)
                img.src = data.image
                rmSettedItemFromList(data.id, InventoryTypes.CHARACTERS)
            } else {
                showInventoryError()
            }
        }
        if (data.action === ActionTypes.TAKEON && spec && event.target.id === spec.id) {
            event.target.classList.remove(spec.background)
            addLoaderToInventoryItem(event.target)
            if (event.target.firstElementChild) event.target.firstElementChild.style.display = 'none'
            const status = await setInventory(data.address, data.chainid, __chain.route(spec.route), data.id, data.nftAddress)
            removeLoaderToInventoryItem(event.target)
            if (event.target.firstElementChild) event.target.firstElementChild.style.display = ''
            if (status === 200) {
                rmSettedItemFromList(data.id, data.type)
                if (event.target.firstElementChild) {
                    showSettedItemFromList(event.target.getAttribute('data-id'), data.type)
                    event.target.firstElementChild.src = data.image
                } else {
                    const img = document.createElement('img')
                    img.src = data.image
                    event.target.appendChild(img)
                }
                event.target.setAttribute('data-address', data.address)
                event.target.setAttribute('data-chainid', data.chainid)
                event.target.setAttribute('data-type', data.type)
                event.target.setAttribute('data-image', data.image)
                event.target.setAttribute('data-id', data.id)
                event.target.setAttribute('data-action', ActionTypes.TAKEOFF)
                setNftAddressAttribute(event.target, data.nftAddress)
                event.target.draggable = true
                event.target.addEventListener('dragstart', dragStartExistedElement)
                applyEquippedBonuses(event.target, data.type, data.id, data.image)
                updatePlayerCharacteristics()
                event.target.classList.add('slot-wrap__slot_active')
                event.target.classList.remove(spec.background)
            } else {
                showInventoryError()
            }
        }
        dropStartElement()
    } catch (error) {
        console.log(error)
    }
}

const dropStartElement = () => {
    document.querySelector('#character-slot2').classList.remove('available-slot', 'dont-available-slot')
    Object.values(wearableSlots).forEach(v => {
        document.querySelector(v.selector).classList.remove('available-slot', 'dont-available-slot')
    })
}

// Unequip by dragging a worn item back onto its list.
const dropExistedElement = async (event) => {
    try {
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const onList = event.target.classList.contains('item-list__slot') || event.target.classList.contains('list-wrap__item-list')
        const spec = wearableSlots[data.type]
        if (data.action === ActionTypes.TAKEOFF && onList && spec) {
            const slot = document.querySelector(spec.selector)
            slot.classList.remove('slot-wrap__slot_active')
            addLoaderToInventoryItem(slot)
            slot.firstElementChild.style.display = 'none'
            const status = await setInventory(data.address, data.chainid, __chain.route(spec.route), null, null)
            removeLoaderToInventoryItem(slot)
            slot.firstElementChild.style.display = ''
            if (status === 200) {
                slot.classList.add(spec.background)
                slot.firstElementChild.remove()
                clearEquippedBonuses(data.type)
                showSettedItemFromList(data.id, data.type)
            }
        }
        updatePlayerCharacteristics()
    } catch (error) {

    }
}

const setInventory = async (address, chainid, url, itemId, itemNftAddress) => {
    try {
        let jsonToSet = {address, chainid}
        if (__chain.caps.perItemNftAddress) jsonToSet.nftAddress = itemNftAddress
        if (url.includes('character')) {
            jsonToSet.characterid= itemId
        }
        if (url.includes('weapon')) {
            jsonToSet.weapon = itemId
            localStorage.setItem('setted-weapon', itemId === null ? '' : `/media/weapons/${itemId}.png`)
        }
        if (url.includes('armor')) {
            jsonToSet.armor = itemId
            localStorage.setItem('setted-armor', itemId === null ? '' :  `/media/armors/${itemId}.png`)
        }
        if (url.includes(InventoryTypes.BOOTS)) {
            jsonToSet.boots = itemId
            localStorage.setItem('setted-boots', itemId === null ? '' :  `/media/boots/${itemId}.png`)
        }
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonToSet)
        })
        if (res.status === 200) {
            let playerImage = await res.blob()
            try {
                clearTimeout(drawTimeout)
                drawCharacterAnimation(playerImage)
            } catch (error) {
                console.log(error)
            }
        } else {
            showInventoryError()
        }
        return res.status
    } catch (error) {
        console.log(error)
        showInventoryError()
    }
}

const setInventoryImage = (characterid) => {
    const characterInventoryImage = document.querySelector("#inventory-character-image")
    if (characterid == 0) {
        characterInventoryImage.src = `/media/characters/0.svg`
    } else {
        characterInventoryImage.src = `/media/characters/${characterid}.png`
    }
}

const setImage = (queryID, pic) => {
    const image = document.querySelector(`#${queryID}`)
    image.src = pic
}

const inventorySwitcher = () => {
    const lists = [InventoryTypes.CHARACTERS, InventoryTypes.WEAPONS, InventoryTypes.ARMORS, InventoryTypes.BOOTS]
        .map(itemType => document.querySelector(listIdFor[itemType]))
    lists.forEach((_, shown) => {
        document.querySelector(`#inventory__tab-${shown + 1}`).addEventListener('click', () => {
            lists.forEach((list, i) => list.style.display = i === shown ? 'block' : 'none')
        })
    })
}

const updatePlayerCharacteristics = () => {
    playerHealth.textContent = playerCharacteristics.health
    playerBullets.textContent = playerCharacteristics.bullets
    playerSpeed.textContent = playerCharacteristics.speed
    playerJump.textContent = playerCharacteristics.jump
}

const rmSettedItemFromList = (itemId, itemType) => setListItemVisibility(itemId, itemType, 'none')

const showSettedItemFromList = (itemId, itemType) => setListItemVisibility(itemId, itemType, '')

const setListItemVisibility = (itemId, itemType, display) => {
    const listId = listIdFor[itemType]
    if (!listId) return
    document.querySelector(listId).querySelectorAll('.item-list__slot').forEach(v => {
        if (v.lastElementChild && v.lastElementChild.getAttribute('data-id') === itemId.toString()) {
            v.style.display = display
        }
    })
}

const addLoaderToInventoryItem = (itemDocument) => {
    itemDocument.classList.add('lds-dual-ring')
}

const removeLoaderToInventoryItem = (itemDocument) => {
    itemDocument.classList.remove('lds-dual-ring')
}

const addBigLoaderToInventoryItem = (itemDocument) => {
    document.querySelector('#character-background').style.display = 'none'
    itemDocument.classList.add('lds-dual-ring-big')
}

const removeBigLoaderToInventoryItem = (itemDocument) => {
    itemDocument.classList.remove('lds-dual-ring-big')
    document.querySelector('#character-background').style.display = ''
}

const drawCharacterAnimation = (imageBlob) => {
    let canvas = document.querySelector('#character-background')
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

        const scale = 1.1;

        canvas.width = frameWidth * 1;
        canvas.height = frameHeight * 0.8;

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
                isMobile ? -25 : -45, // X-координата отрисовки на canvas
                -165, // Y-координата отрисовки на canvas
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
}
