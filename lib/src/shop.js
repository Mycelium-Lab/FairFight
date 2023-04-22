import { shopAbi, nftAbi, ERC20 } from '../contract.js'
import { tokens } from '../modules/tokens.js'
import { createCharacterInInventory } from './inventory.js'

export const shop = async (address, network, signer, wrap) => {
    const shopContract = new ethers.Contract(network.shopAddress, shopAbi, signer)
    const characters = new ethers.Contract(network.charactersAddress, nftAbi, signer)
    const armors = new ethers.Contract(network.armorsAddress, nftAbi, signer)
    const weapons = new ethers.Contract(network.weaponsAddress, nftAbi, signer)
    shopSwitcher()
    await _shop(address, shopContract, characters, armors, weapons, network, signer, wrap).catch(err => console.log(err))
}

const _shop = async (address, shopContract, characters, armors, weapons, network, signer, wrap) => {
    const confirmModal = document.querySelector("#confirmation_modal")
    const buyModal = document.querySelector("#buy_modal")
    const pendingModal = document.querySelector("#pending_modal")
    const approveModal = document.querySelector("#approve_modal")
    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    const usdt = _tokens.list.find(v => v.symbol == 'USDT')
    const usdtContract = new ethers.Contract(usdt.address, ERC20, signer)
    const charactersBlockBox = document.querySelectorAll('.characters-block__box')
    const armorsBlockBox = document.querySelectorAll('.armors-block__box')
    const weaponsBlockBox = document.querySelectorAll('.weapons-block__box')
    const characterModal = document.querySelector('#character-modal')
    const characterModalContent = document.querySelector('#character-modal-content')
    const characterModalImg = document.querySelector('#character-modal-img')
    const characterFeatureName = document.querySelector('#character-modal-features-name')
    const characterFeatureAttributes = document.querySelector('#character-modal-features-attributes')
    const charactersList = document.querySelector("#choose-character-modal-list")
    await createShopItem(
        characters, 'characters', charactersBlockBox, 
        characterModal, characterModalContent, characterModalImg, 
        characterFeatureName, characterFeatureAttributes, charactersList,
        confirmModal, buyModal, pendingModal, approveModal,
        usdtContract, shopContract, address, wrap, network
    )
    await createShopItem(
        armors, 'armors', armorsBlockBox, 
        characterModal, characterModalContent, characterModalImg, 
        characterFeatureName, characterFeatureAttributes, charactersList,
        confirmModal, buyModal, pendingModal, approveModal,
        usdtContract, shopContract, address, wrap, network
    )
    await createShopItem(
        weapons, 'weapons', weaponsBlockBox, 
        characterModal, characterModalContent, characterModalImg, 
        characterFeatureName, characterFeatureAttributes, charactersList,
        confirmModal, buyModal, pendingModal, approveModal,
        usdtContract, shopContract, address, wrap, network
    )
}

const createShopItem = async (
    nft, nftTypeName, blockBox, 
    modal, modalContent, modalImg,
    featureName, featureAttributes, list,
    confirmModal, buyModal, pendingModal, approveModal,
    usdtContract, shopContract, address, wrap, network
) => {
    const baseURI = await nft.baseURI().catch(err => {
        console.log(err)
        return ''
    })
    let all = []
    for (let i = 0; i < blockBox.length; i++) {
        const item = blockBox.item(i)
        if (item.id.includes(nftTypeName.split('-')[0].slice(0, nftTypeName.length - 1))) {
            const itemId = item.id.split('-')
            const characterID = itemId[1]
            const characterBought = await nft.propertyToken(address, characterID).catch(err => {
                console.log(err)
                return 0
            })
            if (characterBought != 0) {
                item.classList.add('bought')
            } else {
                const characterPrice = await shopContract.prices(nft.address, usdtContract.address, characterID).catch(err => {
                    console.log(err)
                    return 0
                })
                console.log(`${baseURI}${characterID}.json`)
                
                const characterDataFetched  = await fetch(`${baseURI}${characterID}.json`).catch(err => {
                    console.log(err)
                    return ''
                })
                console.log(await characterDataFetched.json())
                const characterData = {
                    attributes: []
                }
                //  = await characterDataFetched.json().catch(err => {
                //     console.log(err)
                //     return {}
                // })
                // characterData.attributes.push(
                //     {
                //         "trait_type": "Price",
                //         "value" : `${ethers.utils.formatEther(characterPrice)} USDT`
                //     }
                // )
                // characterData.id = parseInt(characterID) + 1
                item.addEventListener('click', async () => {
                    console.log(characterID)
                    const allowance = await usdtContract.allowance(address, shopContract.address).catch(err => {
                        console.log(err)
                        return 0
                    })
                    modalImg.src = `/media/${nftTypeName}/${parseInt(characterID)+nftTypeName === 'characters' ? 1 : 0}.png`
                    // featureName.textContent = characterData.name
                    featureAttributes.innerHTML = '';
                    characterData.attributes.forEach(v => {
                        const attribute = document.createElement('div')
                        const attributeType = document.createElement('span')
                        const attributeValue = document.createElement('span')
                        attributeType.textContent = `${v.trait_type}: `
                        attributeType.classList.add('character-modal-feature-type')
                        attributeValue.textContent = v.value
                        attribute.appendChild(attributeType)
                        attribute.appendChild(attributeValue)
                        featureAttributes.appendChild(attribute)
                    })
                    const buttonExist = modalContent.getElementsByTagName(`button`).item(0)
                    if (buttonExist) {
                        modalContent.removeChild(buttonExist)
                    }
                    const buyButton = document.createElement('button')
                    if (BigInt(allowance) >= BigInt(characterPrice)) {
                        buyButton.textContent = `Buy`
                    } else {
                        buyButton.textContent = `Approve`
                    }
                    buyButton.id = `buy-${nftTypeName}-${characterID}`
                    buyButton.classList.add(...['createGame', 'btn', 'btn-white', 'btn-big'])
                    buyButton.addEventListener('click', async () => {
                        if (network.chainid == 23294) {
                            if (buyButton.textContent === `Buy`) {
                                confirmModal.style.display = 'block'
                                shopContract.connect(wrap(signer)).buy(nft.address, usdtContract.address, characterID)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                characterData.attributes.pop()
                                                characterData.attributes.pop()
                                                // list.appendChild(
                                                //     createCharacterInInventory(address, network, characterData) 
                                                // )
                                                pendingModal.style.display = 'none'
                                                buyModal.style.display = 'block'
                                                buyButton.style.color = '#393939'
                                                buyButton.disabled = true
                                                item.classList.add('bought')
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            } else {
                                confirmModal.style.display = 'block'
                                usdtContract.connect(wrap(signer)).approve(shopContract.address, ethers.constants.MaxUint256)
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
                                shopContract.buy(nft.address, usdtContract.address, characterID)
                                    .then(async (tx) => {
                                        confirmModal.style.display = 'none'
                                        pendingModal.style.display = 'block'
                                        tx.wait()
                                            .then(() => {
                                                characterData.attributes.pop()
                                                characterData.attributes.pop()
                                                // list.appendChild(
                                                //     createCharacterInInventory(address, network, characterData) 
                                                // )
                                                pendingModal.style.display = 'none'
                                                buyModal.style.display = 'block'
                                                buyButton.style.color = '#393939'
                                                buyButton.disabled = true
                                                item.classList.add('bought')
                                            }) 
                                    })
                                    .catch(err => console.log(err))
                            } else {
                                confirmModal.style.display = 'block'
                                usdtContract.approve(shopContract.address, ethers.constants.MaxUint256)
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
                    modalContent.appendChild(buyButton)
                    modal.style.display = 'block'
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