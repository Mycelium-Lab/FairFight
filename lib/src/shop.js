import { shopAbi, nftAbi, ERC20 } from '../contract.js'
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import weaponsJsons from '../jsons/weapons.json'
import bootsJsons from '../jsons/boots.json'
import { tokens } from '../modules/tokens.js'
import { createCharacterInInventory } from './inventory.js'

export const shop = async (address, network, signer, wrap) => {
    const shopContract = new ethers.Contract(network.shopAddress, shopAbi, signer)
    const characters = new ethers.Contract(network.charactersAddress, nftAbi, signer)
    const armors = new ethers.Contract(network.armorsAddress, nftAbi, signer)
    const boots = new ethers.Contract(network.bootsAddress, nftAbi, signer)
    const weapons = new ethers.Contract(network.weaponsAddress, nftAbi, signer)
    shopSwitcher()
    await _shop(address, shopContract, characters, armors, weapons, boots, network, signer, wrap).catch(err => console.log(err))
}

const _shop = async (address, shopContract, characters, armors, weapons, boots, network, signer, wrap) => {
    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    const usdt = _tokens.list.find(v => v.symbol == 'USDT')
    const usdtContract = new ethers.Contract(usdt.address, ERC20, signer)
    document.querySelector('#ascending-price').addEventListener('click', () => priceSort(_ascendingPriceSort))
    document.querySelector('#descending-price').addEventListener('click', () => priceSort(_descendingPriceSort))
    await createShopItem(
        shopContract, usdtContract, 'USDT', characters, 'characters', charactersJsons, document.querySelector('#nft-shop-characters-list')
    )
    await createShopItem(
        shopContract, usdtContract, 'USDT', armors, 'armors', armorsJsons, document.querySelector('#nft-shop-armors-list')
    )
    await createShopItem(
        shopContract, usdtContract, 'USDT', weapons, 'weapons', weaponsJsons, document.querySelector('#nft-shop-weapons-list')
    )
    await createShopItem(
        shopContract, usdtContract, 'USDT', boots, 'boots', bootsJsons, document.querySelector('#nft-shop-boots-list')
    )
}

const createShopItem = async (
    shopContract, usdtContract, symbol, nftContract, nftTypeName, jsons, list
) => {
    const pricePromises = jsons.map((v, i) => shopContract.prices(nftContract.address, usdtContract.address, i))
    const prices = await Promise.all(pricePromises)
    //shift means where it is nested in html
    for (let i = 0; i < jsons.length; i++) {
        const collection = jsons[i].attributes.find(v => v.trait_type === 'Rarity').value
        const price = parseFloat(ethers.utils.formatEther(prices[i].toString())).toFixed(2)
        const listItem = document.createElement('div')
        listItem.setAttribute('data-price', price)
        listItem.setAttribute('data-collection', collection.toLowerCase())
        listItem.classList.add('list-items__item', `list-items__item_epic`)
            const itemLeft = document.createElement('div')
            itemLeft.classList.add('item__left')
                const imgLeft = document.createElement('div')
                imgLeft.classList.add('left__img-wrap')
                    const img = document.createElement('img')
                    img.src = `/media/${nftTypeName}/${nftTypeName === 'characters' ? i + 1 : i}.png`
                    imgLeft.appendChild(img)
                const infoLeft = document.createElement('div')
                infoLeft.classList.add('left__info')
                    const infoText = document.createElement('div')
                    infoText.classList.add('info__text')
                        const infoTextTitle = document.createElement('p')
                        infoTextTitle.classList.add('text__title')
                        const infoTextType = document.createElement('p')
                        infoTextType.classList.add('text__type')
                        infoTextTitle.textContent = jsons[i].name
                        infoTextType.textContent = `${collection} collection`
                        infoText.append(infoTextTitle, infoTextType)
                    const infoPricing = document.createElement('div')
                    infoPricing.classList.add('info__pricing')
                        const infoPricingTitle = document.createElement('p')
                        infoPricingTitle.classList.add('pricing__title')
                        infoPricingTitle.textContent = `${price} `
                            const infoPricingSymbol = document.createElement('span')
                            infoPricingSymbol.textContent = `  ${symbol}`
                            infoPricingTitle.appendChild(infoPricingSymbol)
                        const infoPricingBuyNowButton = document.createElement('button')
                        infoPricingBuyNowButton.classList.add('buy-now-btn')
                        infoPricingBuyNowButton.textContent = 'Buy now'
                        infoPricing.append(infoPricingTitle, infoPricingBuyNowButton)
                    infoLeft.append(infoText, infoPricing)
                itemLeft.append(imgLeft, infoLeft)
            const itemRight = document.createElement('div')
            itemRight.classList.add('item__right')
                const itemRightProps = document.createElement('div')
                itemRightProps.classList.add('right__props-wrap')
                const itemRightDescription = document.createElement('p')
                itemRightDescription.classList.add('right__description')
                itemRight.append(itemRightProps, itemRightDescription)
            listItem.append(itemLeft, itemRight)
        list.appendChild(listItem)
    }  
}

const shopSwitcher = () => {
    const nftShopCharactersList = document.querySelector('#nft-shop-characters-list')
    const nftShopWeaponsList = document.querySelector('#nft-shop-weapons-list')
    const nftShopArmorsList = document.querySelector('#nft-shop-armors-list')
    const nftShopBootsList = document.querySelector('#nft-shop-boots-list')
    document.querySelector('#nft-shop-2__tab-1').addEventListener('click', () => {
        nftShopCharactersList.style.display = 'block'
        nftShopWeaponsList.style.display = 'none'
        nftShopArmorsList.style.display = 'none'
        nftShopBootsList.style.display = 'none'
    })
    document.querySelector('#nft-shop-2__tab-2').addEventListener('click', () => {
        nftShopCharactersList.style.display = 'none'
        nftShopWeaponsList.style.display = 'block'
        nftShopArmorsList.style.display = 'none'
        nftShopBootsList.style.display = 'none'
    })
    document.querySelector('#nft-shop-2__tab-3').addEventListener('click', () => {
        nftShopCharactersList.style.display = 'none'
        nftShopWeaponsList.style.display = 'none'
        nftShopArmorsList.style.display = 'block'
        nftShopBootsList.style.display = 'none'
    })
    document.querySelector('#nft-shop-2__tab-4').addEventListener('click', () => {
        nftShopCharactersList.style.display = 'none'
        nftShopWeaponsList.style.display = 'none'
        nftShopArmorsList.style.display = 'none'
        nftShopBootsList.style.display = 'block'
    })
}

const buy = async (shopContract, nft, usdtContract, network, characterID, wrap, signer) => {
    if (network.chainid == 23294) {
        if (buyButton.textContent === `Buy now`) {
            confirmModal.style.display = 'block'
            shopContract.connect(wrap(signer)).buy(nft.address, usdtContract.address, characterID)
                .then(async (tx) => {
                    confirmModal.style.display = 'none'
                    pendingModal.style.display = 'block'
                    tx.wait()
                        .then(() => {
                            data[i].attributes.pop()
                            data[i].attributes.pop()
                            // list.appendChild(
                            //     createCharacterInInventory(address, network, characterData) 
                            // )
                            pendingModal.style.display = 'none'
                            buyModal.style.display = 'block'
                            buyButton.style.color = '#393939'
                            buyButton.disabled = true
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
                            buyButton.textContent = `Buy now`
                        }) 
                })
                .catch(err => console.log(err))
        }
    } else {
        if (buyButton.textContent === `Buy now`) {
            confirmModal.style.display = 'block'
            shopContract.buy(nft.address, usdtContract.address, characterID)
                .then(async (tx) => {
                    confirmModal.style.display = 'none'
                    pendingModal.style.display = 'block'
                    tx.wait()
                        .then(() => {
                            data[i].attributes.pop()
                            data[i].attributes.pop()
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
                            buyButton.textContent = `Buy now`
                        }) 
                })
                .catch(err => console.log(err))
        }
    }
}


const priceSort = (sorter) => {
    const characters = document.querySelector('#nft-shop-characters-list')
    const weapons = document.querySelector('#nft-shop-weapons-list')
    const armors = document.querySelector('#nft-shop-armors-list')
    const boots = document.querySelector('#nft-shop-boots-list')
    let charactersItems = Array.from(characters.querySelectorAll('.list-items__item'))
    let weaponsItems = Array.from(weapons.querySelectorAll('.list-items__item'))
    let armorsItems = Array.from(armors.querySelectorAll('.list-items__item'))
    let bootsItems = Array.from(boots.querySelectorAll('.list-items__item'))
    charactersItems.sort(sorter)
    weaponsItems.sort(sorter)
    armorsItems.sort(sorter)
    bootsItems.sort(sorter)
    charactersItems.forEach((item) => characters.appendChild(item))
    weaponsItems.forEach((item) => weapons.appendChild(item))
    armorsItems.forEach((item) => armors.appendChild(item))
    bootsItems.forEach((item) => boots.appendChild(item))
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