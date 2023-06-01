import { nftAbi } from "../contract"
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import bootsJsons from '../jsons/boots.json'
import weaponsJsons from '../jsons/weapons.json'

const chooseCharacterButtonId = `inventory-character-choose-`
const chooseArmorButtonId = `inventory-armor-choose-`
const chooseWeaponButtonId = `inventory-weapon-choose-`
const chooseBootsButtonId = `inventory-boots-choose-`

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
    setInventoryImage(inventory.characterid)
    inventorySwitcher()
    setImage('armor-img', inventory.armor == null ? '/media/svg/inventory/armor.svg' : `/media/armors/${inventory.armor}.png`)
    setImage('weapons-img', inventory.weapon == null ? '/media/svg/inventory/weapon.svg' : `/media/weapons/${inventory.weapon}.png`)
    setImage('boots-img', inventory.boots == null ? '/media/svg/inventory/boots.svg' : `/media/boots/${inventory.boots}.png`)
    inventoryModal(address, network, signer, inventory, charactersContract, armorsContract, bootsContract, weaponsContract)
}

const inventoryModal = async (address, network, signer, inventory, charactersContract, armorsContract, bootsContract, weaponsContract) => {
    const charactersIds = [0, 1]
    const charactersHave = [{
        id: 0,
        image: "/media/characters/0.svg",
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
    const charactersList = document.querySelector("#left-inventory-characters-list").querySelectorAll('.item-list__slot')
    charactersHave.forEach((v, i) => {
        try {
            const img = document.createElement('img')
            img.classList.add('inventory-items')
            img.src = v.image
            img.draggable = true
            img.setAttribute('data-type', 'characters')
            img.setAttribute('data-image', v.image)
            img.setAttribute('data-id', v.id)
            img.addEventListener('dragstart', dragStart)
            img.addEventListener('dragend', dropStartElement)
            charactersList.item(i).appendChild(img)
        } catch (error) {
            console.log(error)
        }
    })
    const weaponsList = document.querySelector("#left-inventory-weapons-list").querySelectorAll('.item-list__slot')
    weaponsHave.forEach((v, i) => {
        try {
            const img = document.createElement('img')
            img.classList.add('inventory-items')
            img.src = v.image
            img.draggable = true
            img.setAttribute('data-type', 'weapons')
            img.setAttribute('data-image', v.image)
            img.setAttribute('data-id', v.id)
            img.addEventListener('dragstart', dragStart)
            img.addEventListener('dragend', dropStartElement)
            weaponsList.item(i).appendChild(img)
        } catch (error) {
            console.log(error)
        }
    })
    const armorList = document.querySelector("#left-inventory-armors-list").querySelectorAll('.item-list__slot')
    armorHave.forEach((v, i) => {
        try {
            const img = document.createElement('img')
            img.classList.add('inventory-items')
            img.src = v.image
            img.draggable = true
            img.setAttribute('data-type', 'armors')
            img.setAttribute('data-image', v.image)
            img.setAttribute('data-id', v.id)
            img.addEventListener('dragstart', dragStart)
            img.addEventListener('dragend', dropStartElement)
            armorList.item(i).appendChild(img)
        } catch (error) {
            console.log(error)
        }
    })
    const bootsList = document.querySelector("#left-inventory-boots-list").querySelectorAll('.item-list__slot')
    bootsHave.forEach((v, i) => {
        try {
            const img = document.createElement('img')
            img.classList.add('inventory-items')
            img.src = v.image
            img.draggable = true
            img.setAttribute('data-type', 'boots')
            img.setAttribute('data-image', v.image)
            img.setAttribute('data-id', v.id)
            img.addEventListener('dragstart', dragStart)
            img.addEventListener('dragend', dropStartElement)
            bootsList.item(i).appendChild(img)
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
}

const dragStart = (event) => {
    const slot = event.target;
    const itemType = slot.getAttribute('data-type')
    const itemId = slot.getAttribute('data-id')
    const itemImage = slot.getAttribute('data-image')
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
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: itemType, id: itemId, image: itemImage }));
}

const drop = (event) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const itemType = data.type; 
    const itemId = data.id;
    const itemImage = data.image;
    if ((event.target.id === 'character-slot1' || event.target.id === 'character-slot2' || event.target.id === 'character-slot3') && itemType === 'characters') {
        if (event.target.firstChild) {
            event.target.firstChild.src = itemImage
        } else {
            const img = document.createElement('img')
            img.src = itemImage
            event.target.appendChild(img)
        }    }
    if (event.target.id === 'weapon-slot' && itemType === 'weapons') {
        if (event.target.firstChild) {
            event.target.firstChild.src = itemImage
        } else {
            const img = document.createElement('img')
            img.src = itemImage
            event.target.appendChild(img)
        }
    }
    if (event.target.id === 'armor-slot' && itemType === 'armors') {
        if (event.target.firstChild) {
            event.target.firstChild.src = itemImage
        } else {
            const img = document.createElement('img')
            img.src = itemImage
            event.target.appendChild(img)
        }
    }
    if (event.target.id === 'boots-slot' && itemType === 'boots') {
        if (event.target.firstChild) {
            event.target.firstChild.src = itemImage
        } else {
            const img = document.createElement('img')
            img.src = itemImage
            event.target.appendChild(img)
        }
    }
    document.querySelector('#character-slot2').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#weapon-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#armor-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#boots-slot').classList.remove('available-slot', 'dont-available-slot')
}

const dropStartElement = () => {
    document.querySelector('#character-slot2').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#weapon-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#armor-slot').classList.remove('available-slot', 'dont-available-slot')
    document.querySelector('#boots-slot').classList.remove('available-slot', 'dont-available-slot')
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