import { charactersShopAbi } from "../contract"

const chooseCharacterButtonId = `inventory-character-choose-`

export const inventory = async (address, network, signer, wrap) => {
    const characterShopContract = new ethers.Contract(network.charactersShopAddress, charactersShopAbi, signer)
    const inventory = await getInventory(address, network)
    localStorage.setItem('chosenCharacter', inventory.characterid)
    setInventoryImage(inventory.characterid)
    inventoryModal(address, network, signer, inventory, characterShopContract)
}

const inventoryModal = async (address, network, signer, inventory, characterShopContract) => {
    const charactersIds = [0, 1]
    const charactersHave = [{
        id: 0,
        image: "/media/characters/0.svg",
        name: "Coin",
        attributes: [
            {
                "trait_type": "Rarity",
                "value": "Normal"
            },
            {
                "trait_type": "Speed",
                "value": "120"
            }
        ]
    }]
    for (let i = 0; i < charactersIds.length; i++) {
        try {
            const characterBought = await characterShopContract.addressTokenIds(address, charactersIds[i])
            if (characterBought != 0) {
                const characterDataUrl = await characterShopContract.characterURIs(charactersIds[i])
                const characterDataFetched = await fetch(characterDataUrl)
                const characterData = await characterDataFetched.json()
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
    const charactersList = document.querySelector("#choose-character-modal-list")
    charactersHave.forEach((v, i) => {
        try {
            charactersList.appendChild(createCharacterInInventory(address, network, v))
        } catch (error) {
            console.log(error)
        }
    })
    const chooseCharacterModal = document.querySelector("#choose_character_modal")
    const changeCharacterBtn = document.querySelector("#change-character")
    changeCharacterBtn.addEventListener('click', () => {
        chooseCharacterModal.style.display = 'block'
    })
}

export const createCharacterInInventory = (address, network, character) => {
    const characterFull = document.createElement('div')
    characterFull.classList.add('modal_content')
    const title = document.createElement('h2')
    title.classList.add('about__title')
    title.textContent = 'Character'
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
    button.id = `${chooseCharacterButtonId}${character.id}`
    button.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
    if (localStorage.getItem('chosenCharacter') == character.id) {
        button.textContent = 'Chosen'
        button.disabled = true
    } else {
        button.textContent = 'Choose'
    }
    button.addEventListener('click', async () => {
        await fetch('/setcharacter', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({address, chainid: network.chainid, characterid: character.id})
        })
        .then(() => {
            setChosenCharacter(character.id)
            setInventoryImage(character.id)
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

const setInventoryImage = (characterid) => {
    const characterInventoryImage = document.querySelector("#inventory-character-image")
    if (characterid == 0) {
        characterInventoryImage.src = `/media/characters/0.svg`
    } else {
        characterInventoryImage.src = `/media/characters/${characterid}.png`
    }
}