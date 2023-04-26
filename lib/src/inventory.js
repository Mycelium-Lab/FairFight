import { nftAbi } from "../contract"
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import weaponsJsons from '../jsons/weapons.json'

const chooseCharacterButtonId = `inventory-character-choose-`
const chooseArmorButtonId = `inventory-armor-choose-`
const chooseWeaponButtonId = `inventory-weapon-choose-`
const chooseBootsButtonId = `inventory-boots-choose-`

export const inventory = async (address, network, signer, wrap) => {
    const charactersContract = new ethers.Contract(network.charactersAddress, nftAbi, signer)
    const armorsContract = new ethers.Contract(network.armorsAddress, nftAbi, signer)
    const weaponsContract = new ethers.Contract(network.weaponsAddress, nftAbi, signer)
    const inventory = await getInventory(address, network)
    localStorage.setItem('chosenCharacter', inventory.characterid)
    localStorage.setItem('chosenArmor', inventory.armor)
    localStorage.setItem('chosenWeapon', inventory.weapon)
    localStorage.setItem('chosenBoots', inventory.boots)
    setInventoryImage(inventory.characterid)
    setImage('armor-img', inventory.armor == null ? '/media/svg/inventory/armor.svg' : `/media/armors/${inventory.armor}.png`)
    setImage('weapons-img', inventory.weapon == null ? '/media/svg/inventory/weapon.svg' : `/media/weapons/${inventory.weapon}.png`)
    setImage('boots-img', inventory.boots == null ? '/media/svg/inventory/boots.svg' : `/media/armors/${inventory.boots}.png`)
    inventoryModal(address, network, signer, inventory, charactersContract, armorsContract, weaponsContract)
}

const inventoryModal = async (address, network, signer, inventory, charactersContract, armorsContract, weaponsContract) => {
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
                });
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
                if (armorsJsons[i].attributes[0].value == 'Boots') {
                    bootsHave.push({
                        id: i,
                        image: `/media/armors/${i}.png`,
                        name: 'Boots',
                        attributes: data.attributes
                    });
                } else {
                    armorHave.push({
                        id: i,
                        image: `/media/armors/${i}.png`,
                        name: 'Armor',
                        attributes: data.attributes
                    });
                }
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
                });
            }
        } catch (error) {
            console.log(error)
        }
    }
    const charactersList = document.querySelector("#choose-character-modal-list")
    charactersHave.forEach((v, i) => {
        try {
            charactersList.appendChild(createCharacterInInventory(
                address, network, v,
                'chosenCharacter', 'Character', 'setcharacter',
                chooseCharacterButtonId
            ))
        } catch (error) {
            console.log(error)
        }
    })
    const weaponsList = document.querySelector("#choose-weapon-modal-list")
    weaponsHave.forEach((v, i) => {
        try {
            weaponsList.appendChild(createCharacterInInventory(
                address, network, v,
                'chosenWeapon', 'Weapon', 'setweapon',
                chooseWeaponButtonId
            ))
        } catch (error) {
            console.log(error)
        }
    })
    const armorList = document.querySelector("#choose-armor-modal-list")
    armorHave.forEach((v, i) => {
        try {
            armorList.appendChild(createCharacterInInventory(
                address, network, v,
                'chosenArmor', 'Armor', 'setarmor',
                chooseArmorButtonId
            ))
        } catch (error) {
            console.log(error)
        }
    })
    const bootsList = document.querySelector("#choose-boots-modal-list")
    bootsHave.forEach((v, i) => {
        try {
            bootsList.appendChild(createCharacterInInventory(
                address, network, v,
                'chosenBoots', 'Boots', 'setboots',
                chooseArmorButtonId
            ))
        } catch (error) {
            console.log(error)
        }
    })
    const chooseCharacterModal = document.querySelector("#choose_character_modal")
    const chooseWeaponsModal = document.querySelector("#choose_weapon_modal")
    const chooseArmorsModal = document.querySelector("#choose_armor_modal")
    const chooseBootsModal = document.querySelector("#choose_boots_modal")
    const changeCharacterBtn = document.querySelector("#change-character")
    const changeWeaponsBtn = document.querySelector('#weapons-change')
    const changeArmorsBtn = document.querySelector('#armors-change')
    const changeBootsBtn = document.querySelector('#boots-change')
    changeCharacterBtn.addEventListener('click', () => {
        chooseCharacterModal.style.display = 'block'
    })
    changeWeaponsBtn.addEventListener('click', () => {
        chooseWeaponsModal.style.display = 'block'
    })
    changeArmorsBtn.addEventListener('click', () => {
        chooseArmorsModal.style.display = 'block'
    })
    changeBootsBtn.addEventListener('click', () => {
        chooseBootsModal.style.display = 'block'
    })
}

export const createCharacterInInventory = (
    address, network, character,
    chosenName, titleNft, postUrl, buttonIdName
) => {
    const characterFull = document.createElement('div')
    characterFull.classList.add('modal_content')
    const title = document.createElement('h2')
    title.classList.add('about__title')
    title.textContent = titleNft
    characterFull.appendChild(title) 
    const characterImageBox = document.createElement('div')
    characterImageBox.classList.add('characters-modal__box')
    const characterImage = document.createElement('img')
    characterImage.src = character.image
    characterImageBox.appendChild(characterImage) 
    characterFull.appendChild(characterImageBox)
    const characterFeatures = document.createElement('div')
    characterFeatures.classList.add('character-modal-features')
    const characterFeaturesTitle = document.createElement('h5')
    characterFeaturesTitle.textContent = 'Features:'
    characterFeatures.appendChild(characterFeaturesTitle)

    const characterName = document.createElement('div')
    const characterNameType = document.createElement('span')
    characterNameType.classList.add('character-modal-feature-type')
    characterNameType.textContent = 'Name: '
    characterName.appendChild(characterNameType)
    const characterNameValue = document.createElement('span')
    characterNameValue.textContent = character.name
    characterName.appendChild(characterNameValue)
    characterFeatures.appendChild(characterName)

    const characterFeatureAttributes = document.createElement('div')
    character.attributes.forEach(value => {
        const attribute = document.createElement('div')
        const attributeType = document.createElement('span')
        const attributeValue = document.createElement('span')
        attributeType.textContent = `${value.trait_type}: `
        attributeType.classList.add('character-modal-feature-type')
        attributeValue.textContent = value.value
        attribute.appendChild(attributeType)
        attribute.appendChild(attributeValue)
        characterFeatureAttributes.appendChild(attribute)
    })
    characterFeatures.appendChild(characterFeatureAttributes)
    characterFull.appendChild(characterFeatures)

    const button = document.createElement('button')
    button.id = `${buttonIdName}${character.id}`
    button.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
    if (localStorage.getItem(chosenName) == character.id) {
        button.textContent = 'Chosen'
        button.disabled = true
    } else {
        button.textContent = 'Choose'
    }
    let jsonToSet = {address, chainid: network.chainid}
    if (postUrl.includes('character')) {
        jsonToSet.characterid = character.id
    }
    if (postUrl.includes('weapon')) {
        jsonToSet.weapon = character.id
    }
    if (postUrl.includes('armor')) {
        jsonToSet.armor = character.id
    }
    if (postUrl.includes('boots')) {
        jsonToSet.boots = character.id
    }
    button.addEventListener('click', async () => {
        await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonToSet)
        })
        .then(() => {
            if (postUrl.includes('character')) {
                setChosenCharacter(character.id)
                setInventoryImage(character.id)
            }
            if (postUrl.includes('weapon')) {
                setChosenWeapon(character.id)
            }
            if (postUrl.includes('armor')) {
                setChosenArmor(character.id)
            }
            if (postUrl.includes('boots')) {
                setChosenBoots(character.id)
            }
        })
        .catch(err => console.log(err));
    })
    characterFull.appendChild(button)
    return characterFull
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