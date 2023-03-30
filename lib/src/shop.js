import { charactersShopAbi, ERC20 } from '../contract.js'
import { tokens } from '../modules/tokens.js'

export const shop = async (address, network, signer, wrap) => {
    const characterShopContract = new ethers.Contract(network.charactersShopAddress, charactersShopAbi, signer)
    shopSwitcher()
    charactersShop(address, characterShopContract, network, signer, wrap)
}

const charactersShop = async (address, characterShopContract, network, signer, wrap) => {
    const confirmModal = document.querySelector("#confirmation_modal")
    const buyModal = document.querySelector("#buy_modal")
    const pendingModal = document.querySelector("#pending_modal")
    const approveModal = document.querySelector("#approve_modal")
    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    const usdt = _tokens.list.find(v => v.symbol == 'USDT')
    const usdtContract = new ethers.Contract(usdt.address, ERC20, signer)
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
            const characterBought = await characterShopContract.addressTokenIds(address, characterID)
            if (characterBought != 0) {
                item.classList.add('bought')
            } else {
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
                item.addEventListener('click', async () => {
                    const allowance = await usdtContract.allowance(address, characterShopContract.address)
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
                    const buttonExist = characterModalContent.getElementsByTagName(`button`).item(0)
                    if (buttonExist) {
                        characterModalContent.removeChild(buttonExist)
                    }
                    const buyButton = document.createElement('button')
                    if (BigInt(allowance) >= BigInt(characterPrice)) {
                        buyButton.textContent = `Buy`
                    } else {
                        buyButton.textContent = `Approve`
                    }
                    buyButton.id = `buy-character-${characterID}`
                    buyButton.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
                    buyButton.addEventListener('click', async () => {
                        if (network.chainid == 23294) {
                            if (buyButton.textContent === `Buy`) {
                                confirmModal.style.display = 'block'
                                characterShopContract.connect(wrap(signer)).buy(usdt.address, characterID)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                pendingModal.style.display = 'none'
                                                buyModal.style.display = 'block'
                                                buyButton.style.color('#393939')
                                                buyButton.disabled = true
                                                item.classList.add('bought')
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            } else {
                                confirmModal.style.display = 'block'
                                usdtContract.connect(wrap(signer)).approve(characterShopContract.address, ethers.constants.MaxUint256)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                pendingModal.style.display = 'none'
                                                approveModal.style.display = 'block'
                                                buyButton.textContent = `Buy`
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            }
                        } else {
                            if (buyButton.textContent === `Buy`) {
                                confirmModal.style.display = 'block'
                                characterShopContract.buy(usdt.address, characterID)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                pendingModal.style.display = 'none'
                                                buyModal.style.display = 'block'
                                                buyButton.style.color('#393939')
                                                buyButton.disabled = true
                                                item.classList.add('bought')
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            } else {
                                confirmModal.style.display = 'block'
                                usdtContract.approve(characterShopContract.address, ethers.constants.MaxUint256)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                pendingModal.style.display = 'none'
                                                approveModal.style.display = 'block'
                                                buyButton.textContent = `Buy`
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            }
                        }
                    })
                    characterModalContent.appendChild(buyButton)
                    characterModal.style.display = 'block'
                })
            }
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