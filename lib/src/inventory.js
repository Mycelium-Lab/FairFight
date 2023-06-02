import { nftAbi } from "../contract"
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import bootsJsons from '../jsons/boots.json'
import weaponsJsons from '../jsons/weapons.json'

const chooseCharacterButtonId = `inventory-character-choose-`
const chooseArmorButtonId = `inventory-armor-choose-`
const chooseWeaponButtonId = `inventory-weapon-choose-`
const chooseBootsButtonId = `inventory-boots-choose-`

const actionTypes = {
    TAKEOFF: 'TAKEOFF',
    TAKEON: 'TAKEON'
}

export const inventory = async (address, network, signer, wrap) => {
    const charactersContract = new ethers.Contract(network.charactersAddress, nftAbi, signer)
    const armorsContract = new ethers.Contract(network.armorsAddress, nftAbi, signer)
    const bootsContract = new ethers.Contract(network.bootsAddress, nftAbi, signer)
    const weaponsContract = new ethers.Contract(network.weaponsAddress, nftAbi, signer)
    const inventory = await getInventory(address, network)
    localStorage.setItem('chosenCharacter', inventory.characterid)
    localStorage.setItem('chosenArmor', inventory.armor)
    localStorage.setItem('chosenWeapon', inventory.weapon)
    localStorage.setItem('chosenBoots', inventory.boots)
    if (!isNaN(parseInt(inventory.characterid))) {
        const img = document.querySelector('#character-slot3')
        img.src =  `/media/characters/${inventory.characterid}.png`
    }
    if (!isNaN(parseInt(inventory.armor))) {
        const img = document.createElement('img')
        img.src = `/media/armors/${inventory.armor}.png`
        const armorSlot = document.querySelector('#armor-slot')
        armorSlot.appendChild(img)
        armorSlot.classList.remove('armor__slot-background')
        armorSlot.setAttribute('data-address', address)
        armorSlot.setAttribute('data-chainid', network.chainid)
        armorSlot.setAttribute('data-type', 'armors')
        armorSlot.setAttribute('data-image', `/media/armors/${inventory.armor}.png`)
        armorSlot.setAttribute('data-id', inventory.armor)
        armorSlot.setAttribute('data-action', actionTypes.TAKEOFF)
        armorSlot.draggable = true
        armorSlot.addEventListener('dragstart', dragStartExistedElement)
    }
    if (!isNaN(parseInt(inventory.boots))) {
        const img = document.createElement('img')
        img.src = `/media/boots/${inventory.boots}.png`
        const bootsSlot = document.querySelector('#boots-slot')
        bootsSlot.appendChild(img)
        bootsSlot.classList.remove('boots__slot-background')
        bootsSlot.setAttribute('data-address', address)
        bootsSlot.setAttribute('data-chainid', network.chainid)
        bootsSlot.setAttribute('data-type', 'boots')
        bootsSlot.setAttribute('data-image', `/media/boots/${inventory.boots}.png`)
        bootsSlot.setAttribute('data-id', inventory.boots)
        bootsSlot.setAttribute('data-action', actionTypes.TAKEOFF)
        bootsSlot.draggable = true
        bootsSlot.addEventListener('dragstart', dragStartExistedElement)
    }
    if (!isNaN(parseInt(inventory.weapon))) {
        const img = document.createElement('img')
        img.src = `/media/weapons/${inventory.weapon}.png`
        const weaponSlot = document.querySelector('#weapon-slot')
        weaponSlot.appendChild(img)
        weaponSlot.classList.remove('weapon__slot-background')
        weaponSlot.setAttribute('data-address', address)
        weaponSlot.setAttribute('data-chainid', network.chainid)
        weaponSlot.setAttribute('data-type', 'weapons')
        weaponSlot.setAttribute('data-image', `/media/weapons/${inventory.weapon}.png`)
        weaponSlot.setAttribute('data-id', inventory.weapon)
        weaponSlot.setAttribute('data-action', actionTypes.TAKEOFF)
        weaponSlot.draggable = true
        weaponSlot.addEventListener('dragstart', dragStartExistedElement)
    }
    setInventoryImage(inventory.characterid)
    inventorySwitcher()
    document.getElementById('btn-close-item-detail-modal').addEventListener('click', closeInventoryItemModal)
    setImage('armor-img', inventory.armor == null ? '/media/svg/inventory/armor.svg' : `/media/armors/${inventory.armor}.png`)
    setImage('weapons-img', inventory.weapon == null ? '/media/svg/inventory/weapon.svg' : `/media/weapons/${inventory.weapon}.png`)
    setImage('boots-img', inventory.boots == null ? '/media/svg/inventory/boots.svg' : `/media/boots/${inventory.boots}.png`)
    inventoryModal(address, network, signer, inventory, charactersContract, armorsContract, bootsContract, weaponsContract)
}

const inventoryModal = async (address, network, signer, inventory, charactersContract, armorsContract, bootsContract, weaponsContract) => {
    const charactersIds = [0, 1]
    const charactersHave = [{
        id: 0,
        image: "/media/characters/0.png",
        name: "Coin",
        attributes: [
            {
                "trait_type": "Type",
                "value": "Character"
            },
            {
                "trait_type": "Rarity",
                "value": "Normal"
            }
        ]
    }]
    const armorHave = []
    const weaponsHave = []
    const bootsHave = []
    const characterBoughtArray = await Promise.all(charactersIds.map(v => charactersContract.propertyToken(address, v).catch(() => 0)))
    const weaponBoughtArray = await Promise.all(weaponsJsons.map((v, i) => weaponsContract.propertyToken(address, i).catch(() => 0)))
    const armorBoughtArray = await Promise.all(armorsJsons.map((v, i) => armorsContract.propertyToken(address, i).catch(() => 0)))
    const bootsBoughtArray = await Promise.all(bootsJsons.map((v, i) => bootsContract.propertyToken(address, i).catch(() => 0)))
    for (let i = 0; i < charactersIds.length; i++) {
        try {
            const characterBought = characterBoughtArray[i] 
            if (characterBought != 0) {
                const characterData = charactersJsons[i]
                //i+1 потому что уже есть персонаж базовый
                charactersHave.push({
                    id: charactersIds[i]+1,
                    image: `/media/characters/${i+1}.png`,
                    name: characterData.name,
                    attributes: characterData.attributes
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
    for (let i = 0; i < armorsJsons.length; i++) {
        try {
            const bought = armorBoughtArray[i]
            if (bought != 0) {
                const data = armorsJsons[i]
                armorHave.push({
                    id: i,
                    image: `/media/armors/${i}.png`,
                    name: 'Armor',
                    attributes: data.attributes
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
    for (let i = 0; i < bootsJsons.length; i++) {
        try {
            const bought = bootsBoughtArray[i]
            if (bought != 0) {
                const data = bootsJsons[i]
                bootsHave.push({
                    id: i,
                    image: `/media/boots/${i}.png`,
                    name: 'Boots',
                    attributes: data.attributes
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
    for (let i = 0; i < weaponsJsons.length; i++) {
        try {
            const bought = weaponBoughtArray[i]
            if (bought != 0) {
                const data = weaponsJsons[i]
                weaponsHave.push({
                    id: i,
                    image: `/media/weapons/${i}.png`,
                    name: 'Weapon',
                    attributes: data.attributes
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
    const charactersListItem = document.querySelector("#left-inventory-characters-list")
    const charactersList = charactersListItem.querySelectorAll('.item-list__slot')
    charactersHave.forEach((v, i) => {
        try {
            addInventoryItem("#left-inventory-characters-list", v, 'characters', address, network, i)
        } catch (error) {
            console.log(error)
        }
    })
    const weaponsListItem = document.querySelector("#left-inventory-weapons-list")
    weaponsHave.forEach((v, i) => {
        try {
            addInventoryItem("#left-inventory-weapons-list", v, 'weapons', address, network, i)
        } catch (error) {
            console.log(error)
        }
    })
    const armorListItem = document.querySelector("#left-inventory-armors-list")
    armorHave.forEach((v, i) => {
        try {
            addInventoryItem("#left-inventory-armors-list", v, 'armors', address, network, i)
        } catch (error) {
            console.log(error)
        }
    })
    const bootsListItem = document.querySelector("#left-inventory-boots-list")
    bootsHave.forEach((v, i) => {
        try {
            addInventoryItem("#left-inventory-boots-list", v, 'boots', address, network, i)
        } catch (error) {
            console.log(error)
        }
    })
    document.querySelector('#character-slot1').addEventListener('dragover', (event) => event.preventDefault())
    document.querySelector('#character-slot1').addEventListener('drop', drop)
    document.querySelector('#armor-slot').addEventListener('dragover', (event) => event.preventDefault())
    document.querySelector('#armor-slot').addEventListener('drop', drop)
    document.querySelector('#boots-slot').addEventListener('dragover', (event) => event.preventDefault())
    document.querySelector('#boots-slot').addEventListener('drop', drop)
    document.querySelector('#weapon-slot').addEventListener('dragover', (event) => event.preventDefault())
    document.querySelector('#weapon-slot').addEventListener('drop', drop)
    charactersListItem.addEventListener('dragover', (event) => event.preventDefault())
    charactersListItem.addEventListener('drop', dropExistedElement)
    weaponsListItem.addEventListener('dragover', (event) => event.preventDefault())
    weaponsListItem.addEventListener('drop', dropExistedElement)
    armorListItem.addEventListener('dragover', (event) => event.preventDefault())
    armorListItem.addEventListener('drop', dropExistedElement)
    bootsListItem.addEventListener('dragover', (event) => event.preventDefault())
    bootsListItem.addEventListener('drop', dropExistedElement)
}

export const addInventoryItem = (itemListId, item, itemType, address, network, i) => {
    const listItem = document.querySelector(itemListId)
    const list = listItem.querySelectorAll('.item-list__slot')
    const img = document.createElement('img')
    img.classList.add('inventory-items')
    img.src = item.image
    img.draggable = true
    img.setAttribute('data-address', address)
    img.setAttribute('data-chainid', network.chainid)
    img.setAttribute('data-type', itemType)
    img.setAttribute('data-image', item.image)
    img.setAttribute('data-id', item.id)
    img.setAttribute('data-action', actionTypes.TAKEON)
    img.addEventListener('dragstart', dragStart)
    img.addEventListener('dragend', dropStartElement)
    img.addEventListener('click', () => 
        showInventoryItemModal(
            item.image, item.name, item.attributes, 'Description', itemType, item.id, ''
        )
    )
    list.item(i).appendChild(img)
}

const dragStart = (event) => {
    try {
        const slot = event.target;
        const itemType = slot.getAttribute('data-type')
        const itemId = slot.getAttribute('data-id')
        const itemImage = slot.getAttribute('data-image')
        const itemAddress = slot.getAttribute('data-address')
        const itemChainid = slot.getAttribute('data-chainid')
        const itemAction = slot.getAttribute('data-action')
        const characterSlot = document.querySelector('#character-slot2')
        const weaponSlot = document.querySelector('#weapon-slot')
        const armorSlot = document.querySelector('#armor-slot')
        const bootsSlot = document.querySelector('#boots-slot')
        if (itemType === 'characters') {
            characterSlot.classList.add('available-slot')
            weaponSlot.classList.add('dont-available-slot')
            armorSlot.classList.add('dont-available-slot')
            bootsSlot.classList.add('dont-available-slot')
        }
        if (itemType === 'weapons') {
            characterSlot.classList.add('dont-available-slot')
            weaponSlot.classList.add('available-slot')
            armorSlot.classList.add('dont-available-slot')
            bootsSlot.classList.add('dont-available-slot')
        }
        if (itemType === 'armors') {
            characterSlot.classList.add('dont-available-slot')
            weaponSlot.classList.add('dont-available-slot')
            armorSlot.classList.add('available-slot')
            bootsSlot.classList.add('dont-available-slot')
        }
        if (itemType === 'boots') {
            characterSlot.classList.add('dont-available-slot')
            weaponSlot.classList.add('dont-available-slot')
            armorSlot.classList.add('dont-available-slot')
            bootsSlot.classList.add('available-slot')
        }
        event.dataTransfer.setData('text/plain', JSON.stringify({ action: itemAction, type: itemType, id: itemId, image: itemImage, address: itemAddress, chainid: itemChainid }));    
    } catch (error) {
        
    }
}

const drop = async (event) => {
    try {
        const errorModal = document.querySelector('#new-error-modal')
        const errorModalText = document.querySelector('#new-error-modal-text')
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const itemType = data.type; 
        const itemId = data.id;
        const itemImage = data.image;
        const itemAddress = data.address;
        const itemChainid = data.chainid;
        const itemAction = data.action;
        if (itemAction === actionTypes.TAKEON && (event.target.id === 'character-slot1' || event.target.id === 'character-slot2' || event.target.id === 'character-slot3') && itemType === 'characters') {
            const status = await setInventory(itemAddress, itemChainid, 'setcharacter', itemId)
            const img = document.querySelector('#character-slot3')
            if (status === 200) {
                img.src = itemImage
            } else {
                errorModal.style.display = 'flex'
                errorModalText.textContent = "The player has the open game or does not have the item"
            }
        }
        if (itemAction === actionTypes.TAKEON && event.target.id === 'weapon-slot' && itemType === 'weapons') {
            const status = await setInventory(itemAddress, itemChainid, 'setweapon', itemId)
            if (status === 200) {
                if (event.target.firstChild) {
                    event.target.firstChild.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.draggable = true
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                } else {
                    const img = document.createElement('img')
                    img.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.draggable = true
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                    event.target.appendChild(img)
                }
                event.target.classList.remove('weapon__slot-background')
            } else {
                errorModal.style.display = 'flex'
                errorModalText.textContent = "The player has the open game or does not have the item"
            }
        }
        if (itemAction === actionTypes.TAKEON && event.target.id === 'armor-slot' && itemType === 'armors') {
            const status = await setInventory(itemAddress, itemChainid, 'setarmor', itemId)
            if (status === 200) {
                if (event.target.firstChild) {
                    event.target.firstChild.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.draggable = true
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                } else {
                    const img = document.createElement('img')
                    img.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.draggable = true
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                    event.target.appendChild(img)
                }
                event.target.classList.remove('armor__slot-background')
            } else {
                errorModal.style.display = 'flex'
                errorModalText.textContent = "The player has the open game or does not have the item"
            }
        }
        if (itemAction === actionTypes.TAKEON && event.target.id === 'boots-slot' && itemType === 'boots') {
            const status = await setInventory(itemAddress, itemChainid, 'setboots', itemId)
            if (status === 200) {
                if (event.target.firstChild) {
                    event.target.firstChild.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.draggable = true
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                } else {
                    const img = document.createElement('img')
                    img.src = itemImage
                    event.target.setAttribute('data-address', itemAddress)
                    event.target.setAttribute('data-chainid', itemChainid)
                    event.target.setAttribute('data-type', itemType)
                    event.target.setAttribute('data-image', itemImage)
                    event.target.setAttribute('data-id', itemId)
                    event.target.setAttribute('data-action', actionTypes.TAKEOFF)
                    event.target.draggable = true
                    event.target.addEventListener('dragstart', dragStartExistedElement)
                    event.target.appendChild(img)
                }
                event.target.classList.remove('boots__slot-background')
            } else {
                errorModal.style.display = 'flex'
                errorModalText.textContent = "The player has the open game or does not have the item"
            }
        }
        dropStartElement()
    } catch (error) {
        
    }
}

const dropStartElement = () => {
    document.querySelector('#character-slot2').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#weapon-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#armor-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#boots-slot').classList.remove('available-slot', 'dont-available-slot')
}

const dragStartExistedElement = (event) => {
    try {
        const slot = event.target
        const itemType = slot.getAttribute('data-type')
        const itemId = slot.getAttribute('data-id')
        const itemImage = slot.getAttribute('data-image')
        const itemAddress = slot.getAttribute('data-address')
        const itemChainid = slot.getAttribute('data-chainid')
        const itemAction = slot.getAttribute('data-action')
        event.dataTransfer.setData('text/plain', JSON.stringify({ action: itemAction, type: itemType, id: itemId, image: itemImage, address: itemAddress, chainid: itemChainid }));    
    } catch (error) {
        
    }
}

const dropExistedElement = async (event) => {
    try {
        //ДОБАВИТЬ В DATA TAKEOFF ELEM
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const itemType = data.type; 
        const itemId = data.id;
        const itemImage = data.image;
        const itemAddress = data.address;
        const itemChainid = data.chainid;
        const itemAction = data.action;
        if (itemAction === actionTypes.TAKEOFF && (event.target.classList.contains('item-list__slot') || event.target.classList.contains('list-wrap__item-list')) && itemType === 'weapons') {
            const status = await setInventory(itemAddress, itemChainid, 'setweapon', null)
            if (status === 200) {
                const weaponSlot = document.querySelector('#weapon-slot')
                weaponSlot.classList.add('weapon__slot-background')
                weaponSlot.firstChild.remove()
            }
        }
        if (itemAction === actionTypes.TAKEOFF && (event.target.classList.contains('item-list__slot') || event.target.classList.contains('list-wrap__item-list')) && itemType === 'armors') {
            const status = await setInventory(itemAddress, itemChainid, 'setarmor', null)
            if (status === 200) {
                const armorSlot = document.querySelector('#armor-slot')
                armorSlot.classList.add('armor__slot-background')
                armorSlot.firstChild.remove()
            }
        }
        if (itemAction === actionTypes.TAKEOFF && (event.target.classList.contains('item-list__slot') || event.target.classList.contains('list-wrap__item-list')) && itemType === 'boots') {
            const status = await setInventory(itemAddress, itemChainid, 'setboots', null)
            if (status === 200) {
                const bootsSlot = document.querySelector('#boots-slot')
                bootsSlot.classList.add('boots__slot-background')
                bootsSlot.firstChild.remove()
            }
        }
    } catch (error) {
        
    }
}

const setInventory = async (address, chainid, url, itemId) => {
    try {
        let jsonToSet = {address, chainid}
        if (url.includes('character')) {
            jsonToSet.characterid= itemId
        }
        if (url.includes('weapon')) {
            jsonToSet.weapon = itemId
        }
        if (url.includes('armor')) {
            jsonToSet.armor = itemId
        }
        if (url.includes('boots')) {
            jsonToSet.boots = itemId
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
            // if (url.includes('character')) {
            //     setChosenCharacter(itemId)
            //     setInventoryImage(itemId)
            // }
            // if (url.includes('weapon')) {
            //     setChosenWeapon(itemId)
            // }
            // if (url.includes('armor')) {
            //     setChosenArmor(itemId)
            // }
            // if (url.includes('boots')) {
            //     setChosenBoots(itemId)
            // }
        } 
        return res.status
    } catch (error) {
        console.log(error)
    }
}

const getInventory = async (address, network) => {
    const rawResponse = await fetch('/getinventory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({address, chainid: network.chainid})
    }).catch(err => {
        console.log(err)
        return {}
    });
    return await rawResponse.json();
}

const showInventoryItemModal = async (
    itemImage, itemName, itemFeatures, itemDescription,
    itemType, itemId, currentItemIdOfThisType
    ) => {
    const itemCollection = itemFeatures.find(v => v.trait_type === 'Rarity').value
    itemFeatures = itemFeatures.splice(2)
    const name = document.querySelector('#inventory-item-modal-name')
    const collection = document.querySelector('#inventory-item-modal-collection')
    const features = document.querySelector('#inventory-item-modal-features')
    const description = document.querySelector('#inventory-item-modal-description')
    const image = document.querySelector('#inventory-item-modal-image')
    name.textContent = itemName
    collection.textContent = itemCollection
    description.textContent = itemDescription
    image.src = itemImage
    itemFeatures.forEach(v => {
        const featureElement = document.createElement('div')
        featureElement.classList.add('props-item__prop')
            const featureElementImgWrap = document.createElement('div')
            featureElementImgWrap.classList.add('prop__img-wrap')
                const featureElementImg = document.createElement('img')
                // if (v.trait_type === 'Bullets') {
                    featureElementImg.src = `media/svg/props-items/ammunition-quantity.svg`
                // }
                featureElementImgWrap.appendChild(featureElementImg)
            featureElement.appendChild(featureElementImgWrap)
            const featureElementName = document.createElement('p')
            featureElementName.classList.add('prop__title')
            featureElementName.textContent = v.trait_type
            const featureElementValue = document.createElement('p')
            featureElementValue.classList.add('prop__value')
            featureElementValue.textContent = v.value
            featureElement.append(featureElementName, featureElementValue)
        features.appendChild(featureElement)
    })
    document.querySelector('#inventory-item-modal').style.display = 'flex'
}

const closeInventoryItemModal = () => {
    const features = document.querySelector('#inventory-item-modal-features')
    features.replaceChildren()
    document.querySelector('#inventory-item-modal').style.display = 'none'
}

const setChosenCharacter = (newCharacterId) => {
    const previousCharacter = localStorage.getItem('chosenCharacter')
    const previousButton = document.querySelector(`#${chooseCharacterButtonId}${previousCharacter}`)
    previousButton.disabled = false
    previousButton.textContent = 'Choose'
    localStorage.setItem('chosenCharacter', newCharacterId)
    const newButton = document.querySelector(`#${chooseCharacterButtonId}${newCharacterId}`)
    newButton.disabled = true
    newButton.textContent = 'Chosen'
}
const setChosenArmor = (newID) => {
    const previous = localStorage.getItem('chosenArmor')
    const previousButton = document.querySelector(`#${chooseArmorButtonId}${previous}`)
    try {
        previousButton.disabled = false
        previousButton.textContent = 'Choose'
    } catch (error) {
        
    }
    localStorage.setItem('chosenArmor', newID)
    const newButton = document.querySelector(`#${chooseArmorButtonId}${newID}`)
    newButton.disabled = true
    newButton.textContent = 'Chosen'
}
const setChosenWeapon = (newID) => {
    const previous = localStorage.getItem('chosenWeapon')
    const previousButton = document.querySelector(`#${chooseWeaponButtonId}${previous}`)
    try {
        previousButton.disabled = false
        previousButton.textContent = 'Choose'
    } catch (error) {
        
    }
    localStorage.setItem('chosenWeapon', newID)
    const newButton = document.querySelector(`#${chooseWeaponButtonId}${newID}`)
    newButton.disabled = true
    newButton.textContent = 'Chosen'
}
const setChosenBoots = (newID) => {
    const previous = localStorage.getItem('chosenBoots')
    const previousButton = document.querySelector(`#${chooseBootsButtonId}${previous}`)
    try {
        previousButton.disabled = false
        previousButton.textContent = 'Choose'
    } catch (error) {
        
    }
    localStorage.setItem('chosenBoots', newID)
    const newButton = document.querySelector(`#${chooseBootsButtonId}${newID}`)
    newButton.disabled = true
    newButton.textContent = 'Chosen'
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
    const inventoryCharactersList = document.querySelector('#left-inventory-characters-list')
    const inventoryWeaponsList = document.querySelector('#left-inventory-weapons-list')
    const inventoryArmorsList = document.querySelector('#left-inventory-armors-list')
    const inventoryBootsList = document.querySelector('#left-inventory-boots-list')
    document.querySelector('#inventory__tab-1').addEventListener('click', () => {
        inventoryCharactersList.style.display = 'block'
        inventoryWeaponsList.style.display = 'none'
        inventoryArmorsList.style.display = 'none'
        inventoryBootsList.style.display = 'none'
    })
    document.querySelector('#inventory__tab-2').addEventListener('click', () => {
        inventoryCharactersList.style.display = 'none'
        inventoryWeaponsList.style.display = 'block'
        inventoryArmorsList.style.display = 'none'
        inventoryBootsList.style.display = 'none'
    })
    document.querySelector('#inventory__tab-3').addEventListener('click', () => {
        inventoryCharactersList.style.display = 'none'
        inventoryWeaponsList.style.display = 'none'
        inventoryArmorsList.style.display = 'block'
        inventoryBootsList.style.display = 'none'
    })
    document.querySelector('#inventory__tab-4').addEventListener('click', () => {
        inventoryCharactersList.style.display = 'none'
        inventoryWeaponsList.style.display = 'none'
        inventoryArmorsList.style.display = 'none'
        inventoryBootsList.style.display = 'block'
    })
}