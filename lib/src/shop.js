import { charactersShopAbi } from '../contract.js'
import { tokens } from '../modules/tokens.js'

export const shop = async (address, network, signer, wrap) => {
    const characterShopContract = new ethers.Contract(network.charactersShopAddress, charactersShopAbi, signer)
    shopSwitcher()
    charactersShop(characterShopContract, network)
}

const charactersShop = async (characterShopContract, network) => {
    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    const usdt = _tokens.list.find(v => v.symbol == 'USDT')
    const charactersBlockBox = document.querySelectorAll('.characters-block__box')
    const characterModal = document.querySelector('#character-modal')
    const characterModalContent = document.querySelector('#character-modal-content')
    const characterModalImg = document.querySelector('#character-modal-img')
    const characterFeatureName = document.querySelector('#character-modal-features-name')
    const characterFeatureAttributes = document.querySelector('#character-modal-features-attributes')
    for (let i = 0; i < charactersBlockBox.length; i++) {
        const item = charactersBlockBox.item(i)
        if (item.id.includes('character')) {
            const itemId = item.id.split('-')
            const characterID = itemId[1]
            const characterDataUrl = await characterShopContract.characterURIs(characterID)
            const characterPrice = await characterShopContract.allowedTokens(usdt.address, characterID)
            const characterDataFetched = await fetch(characterDataUrl)
            const characterData = await characterDataFetched.json()
            characterData.attributes.push(
                {
                    "trait_type": "Description",
                    "value" :
                    characterData.name === 'Piky' 
                    ? 
                    `Piky is like a knife in the foot, formidable and stylish, he finds the weaknesses of opponents and accurately hits the heart of players.`
                    :
                    `Butter is a character who seems weak and cowardly, but once you get past him, he's sure to grease your wings and wrap you in a merciless chase!`
                }
            )
            characterData.attributes.push(
                {
                    "trait_type": "Price",
                    "value" : `${ethers.utils.formatEther(characterPrice)} USDT`
                }
            )
            item.addEventListener('click', () => {
                characterModalImg.src = `/media/characters/${characterID}.png`
                characterFeatureName.textContent = characterData.name
                characterFeatureAttributes.innerHTML = '';
                characterData.attributes.forEach(v => {
                    const attribute = document.createElement('div')
                    const attributeType = document.createElement('span')
                    const attributeValue = document.createElement('span')
                    attributeType.textContent = `${v.trait_type}: `
                    attributeType.classList.add('character-modal-feature-type')
                    attributeValue.textContent = v.value
                    attribute.appendChild(attributeType)
                    attribute.appendChild(attributeValue)
                    characterFeatureAttributes.appendChild(attribute)
                })
                const buyButton = document.createElement('button')
                buyButton.textContent = `BUY`
                buyButton.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
                characterModalContent.appendChild(buyButton)
                characterModal.style.display = 'block'
            })
        }
    }
}

const shopSwitcher = () => {
    const charactersBtn = document.querySelector('#characters-btn')
    const armorBtn = document.querySelector('#armor-btn')
    const weaponsBtn = document.querySelector('#weapons-btn')
    const charactersBox = document.querySelector('#characters-box')
    const armorBox = document.querySelector('#armor-box')
    const weaponsBox = document.querySelector('#weapons-box')
    charactersBtn.addEventListener('click', () => {
        if (!charactersBtn.classList.contains('active')) {
            charactersBox.style.display = 'block'
            armorBox.style.display = 'none'
            weaponsBox.style.display = 'none'
        }
    })
    armorBtn.addEventListener('click', () => {
        if (!armorBtn.classList.contains('active')) {
            charactersBox.style.display = 'none'
            armorBox.style.display = 'block'
            weaponsBox.style.display = 'none'
        }
    })
    weaponsBtn.addEventListener('click', () => {
        if (!weaponsBtn.classList.contains('active')) {
            charactersBox.style.display = 'none'
            armorBox.style.display = 'none'
            weaponsBox.style.display = 'block'
        }
    })
}