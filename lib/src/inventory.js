import { charactersShopAbi } from "../contract"

export const inventory = async (address, network, signer, wrap) => {
    const characterShopContract = new ethers.Contract(network.charactersShopAddress, charactersShopAbi, signer)
    const inventory = await getInventory(address, network)
    const characterInventoryImage = document.querySelector("#inventory-character-image")
    if (inventory.characterid == 0) {
        characterInventoryImage.src = `/media/svg/inventory/monetka.svg`
    }
    if (inventory.characterid == 1) {
        characterInventoryImage.src = `/media/characters/0.png`
    }
    if (inventory.characterid == 2) {
        characterInventoryImage.src = `/media/characters/1.png`
    }
    inventoryModal(address, network, signer, inventory, characterShopContract)
}

const inventoryModal = async (address, network, signer, inventory, characterShopContract) => {
    const charactersIds = [0, 1]
    const charactersHave = [{
        id: 0,
        image: "/media/svg/inventory/monetka.svg",
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
        const characterBought = await characterShopContract.addressTokenIds(address, charactersIds[i])
        if (characterBought != 0) {
            const characterDataUrl = await characterShopContract.characterURIs(charactersIds[i])
            const characterDataFetched = await fetch(characterDataUrl)
            const characterData = await characterDataFetched.json()
            charactersHave.push({
                id: charactersIds[i]+1,
                image: `/media/characters/${i}.png`,
                name: characterData.name,
                attributes: characterData.attributes
            });
        }
    }
    const charactersList = document.querySelector("#choose-character-modal-list")
    charactersHave.forEach((v, i) => {
        const characterFull = document.createElement('div')
        characterFull.classList.add('modal_content')
        const title = document.createElement('h2')
        title.classList.add('about__title')
        title.textContent = 'Character'
        characterFull.appendChild(title) 
        const characterImageBox = document.createElement('div')
        characterImageBox.classList.add('characters-modal__box')
        const characterImage = document.createElement('img')
        characterImage.src = v.image
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
        characterNameValue.textContent = v.name
        characterName.appendChild(characterNameValue)
        characterFeatures.appendChild(characterName)

        const characterFeatureAttributes = document.createElement('div')
        v.attributes.forEach(value => {
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
        button.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
        if (inventory.characterid == v.id) {
            button.textContent = 'Chosen'
            button.disabled = true
        } else {
            button.textContent = 'Choose'
            button.addEventListener('click', async () => {
                await fetch('/setcharacter', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({address, chainid: network.chainid, characterid: v.id})
                });
            })
        }
        characterFull.appendChild(button)

        charactersList.appendChild(characterFull)
    })
    const chooseCharacterModal = document.querySelector("#choose_character_modal")
    const changeCharacterBtn = document.querySelector("#change-character")
    changeCharacterBtn.addEventListener('click', () => {
        chooseCharacterModal.style.display = 'block'
    })
}

const getInventory = async (address, network) => {
    const rawResponse = await fetch('/getinventory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({address, chainid: network.chainid})
    });
    return await rawResponse.json();
}