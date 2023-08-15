import { shopAbi, nftAbi, ERC20 } from '../contract.js'
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import weaponsJsons from '../jsons/weapons.json'
import bootsJsons from '../jsons/boots.json'
import { tokens } from '../modules/tokens.js'
import { addInventoryItem, createCharacterInInventory } from './inventory.js'
import { InventoryTypes } from './utils/utils.js'

let __allowance
let drawTimeout

const basicPlayerCharacteristics = {
    health: 3,
    bullets: 3,
    speed: 480,
    jump: 160
}

export const shop = async (address, network, signer, wrap) => {
    document.querySelectorAll('.new-approve-modal-close-button').forEach(v => v.addEventListener('click', () => document.querySelector('#new-approve-modal').style.display = 'none'))
    document.querySelectorAll('.new-progress-modal-close-button').forEach(v => v.addEventListener('click', () => document.querySelector('#new-progress-modal').style.display = 'none'))
    document.querySelectorAll('.new-confirm-modal-close-button').forEach(v => v.addEventListener('click', () => document.querySelector('#new-confirm-modal').style.display = 'none'))
    document.querySelectorAll('.new-error-modal-close-button').forEach(v => v.addEventListener('click', () => document.querySelector('#new-error-modal').style.display = 'none'))
    document.querySelectorAll('.new-success-modal-close-button').forEach(v => v.addEventListener('click', () => document.querySelector('#new-success-modal').style.display = 'none'))
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
    const usdt = _tokens.list.find(v => v.symbol == 'USDT' || v.symbol == 'weUSDT')
    const usdtContract = new ethers.Contract(usdt.address, ERC20, signer)
    document.querySelector('#ascending-price').addEventListener('click', () => priceSort(_ascendingPriceSort))
    document.querySelector('#descending-price').addEventListener('click', () => priceSort(_descendingPriceSort))
    const allowance = await usdtContract.allowance(address, shopContract.address)
    __allowance = BigInt(allowance.toString())
    await createShopItem(
        address, allowance, shopContract, usdtContract, usdt.symbol, characters, 'characters', charactersJsons, document.querySelector('#nft-shop-characters-list'), network, signer, wrap, usdt
    )
    await createShopItem(
        address, allowance, shopContract, usdtContract, usdt.symbol, armors, 'armors', armorsJsons, document.querySelector('#nft-shop-armors-list'), network, signer, wrap, usdt
    )
    await createShopItem(
        address, allowance, shopContract, usdtContract, usdt.symbol, weapons, 'weapons', weaponsJsons, document.querySelector('#nft-shop-weapons-list'), network, signer, wrap, usdt
    )
    await createShopItem(
        address, allowance, shopContract, usdtContract, usdt.symbol, boots, 'boots', bootsJsons, document.querySelector('#nft-shop-boots-list'), network, signer, wrap, usdt
    )
    collectionChange()
}

const createShopItem = async (
    address, allowance, shopContract, usdtContract, symbol, nftContract, nftTypeName, jsons, list, network, signer, wrap, usdt
) => {
    console.log(jsons)
    const boughtPromises = jsons.map((v, i) => nftContract.propertyToken(address, i))
    const bought = await Promise.all(boughtPromises)
    const approveModal = document.querySelector('#new-approve-modal')
    const progressModal = document.querySelector('#new-progress-modal')
    const confirmModal = document.querySelector('#new-confirm-modal')
    const errorModal = document.querySelector('#new-error-modal')
    const errorModalText = document.querySelector('#new-error-modal-text')
    const successModal = document.querySelector('#new-success-modal')
    const successModalImg = document.querySelector('#new-success-modal-img')
    const successModalText = document.querySelector('#new-success-modal-text')
    const successModalLink = document.querySelector('#new-success-modal-link')
    //shift means where it is nested in html
    jsons.forEach(async (v, i) => {
        try {
        const imgSource = `/media/${nftTypeName}/${nftTypeName === 'characters' ? i + 1 : i}.png`
        const collection = nftTypeName === 'characters' ? 'Character' : v.attributes.find(v => v.trait_type === 'Class').value
        let healthBonus
        let speedBonus
        let jumpBonus
        let bulletsBonus
        let listItemId = "#left-inventory-characters-list"
        if (nftTypeName === 'armors') {
            healthBonus = v.attributes[2].value
            listItemId = "#left-inventory-armors-list"
        }
        if (nftTypeName === 'weapons') {
            bulletsBonus = v.attributes[2].value
            listItemId = "#left-inventory-weapons-list"
        }
        if (nftTypeName === 'boots') {
            speedBonus = v.attributes[2].value
            jumpBonus = v.attributes[3].value
            listItemId = "#left-inventory-boots-list"
        }
            const price = parseFloat(v.price).toFixed(2)
            const listItem = document.createElement('div')
            let hash = ''
            listItem.setAttribute('data-price', price)
            listItem.setAttribute('data-collection', collection.toLowerCase())
            listItem.classList.add('list-items__item', `list-items__item_${collection.toLowerCase()}`)
                const itemLeft = document.createElement('div')
                itemLeft.classList.add('item__left')
                    const imgLeft = document.createElement('div')
                    imgLeft.classList.add('left__img-wrap')
                    const priceTableSource = `/media/svg/shop/${collection.toLowerCase()}-collection/price-table.svg`
                    const priceTable =  document.createElement('img')
                    priceTable.src = priceTableSource
                    priceTable.style.position = 'absolute'
                    priceTable.style.bottom = '-15px'
                    priceTable.style.width = '104px'
                    imgLeft.appendChild(priceTable)
                    const priceElelment = document.createElement('p')
                    const priceSymbol = document.createElement('img')
                    priceElelment.style.position = 'absolute'
                    priceElelment.style.bottom = '-10px'
                    priceElelment.style.fontSize = '12px'
                    priceElelment.style.right = '48px'
                    priceElelment.style.fontFamily = 'Teletactile'
                    priceElelment.textContent = `${price}`
                    priceSymbol.src = '/media/svg/coin-symbol.svg'
                    priceSymbol.style.position = 'absolute'
                    priceSymbol.style.bottom = '-6px'
                    priceSymbol.style.right = '25px'
                    priceSymbol.style.width = '14px'
                    imgLeft.appendChild(priceSymbol)
                    imgLeft.appendChild(priceElelment)
                        for (let i = 0; i < 4; i++) {
                            const edgeBorderSource = `/media/svg/shop/${collection.toLowerCase()}-collection/edge-border.svg`
                            const edgeBorder =  document.createElement('img')
                            edgeBorder.src = edgeBorderSource
                            imgLeft.appendChild(edgeBorder)
                            edgeBorder.style.position = 'absolute'
                            edgeBorder.style.width = '17.18px'
                            edgeBorder.style.height = '17.18px'
                            if(i === 0) {
                                edgeBorder.style.top = '-8px'
                                edgeBorder.style.left = '-8px'
                            }
                            if(i === 1) {
                                edgeBorder.style.transform = 'rotate(90deg)';
                                edgeBorder.style.top = '-8px'
                                edgeBorder.style.right = '-8px'
                            } 
                            if(i === 2) {
                                edgeBorder.style.transform = 'rotate(180deg)';
                                edgeBorder.style.bottom = '-8px'
                                edgeBorder.style.right = '-8px'
                            }
                            if(i === 3) {
                                edgeBorder.style.transform = 'rotate(270deg)';
                                edgeBorder.style.bottom = '-8px'
                                edgeBorder.style.left = '-8px'
                            }
                        }
                        const img = document.createElement('img')
                        img.src = imgSource
                        imgLeft.appendChild(img)

                    const infoLeft = document.createElement('div')
                    infoLeft.classList.add('left__info')
                        const infoText = document.createElement('div')
                        infoText.classList.add('info__text')
                            const infoTextTitle = document.createElement('p')
                            infoTextTitle.classList.add('text__title')
                            const infoTextType = document.createElement('p')
                            infoTextType.classList.add('text__type')
                            infoTextTitle.textContent = v.name
                            if (nftTypeName !== 'characters') {
                                infoTextType.textContent = `${collection} collection`
                            }
                            infoText.append(infoTextTitle, infoTextType)
                        const infoPricing = document.createElement('div')
                        infoPricing.classList.add('info__pricing')
                           // const infoPricingTitle = document.createElement('p')
                             const tryOn = document.createElement('button')
                             tryOn.textContent = "Try on"
                                tryOn.classList.add(`tryon_collection-${collection.toLowerCase()}`,'tryon')

                                tryOn.addEventListener('click', () => {
                                    toggleDressingModal(nftTypeName, nftTypeName === 'characters' ? i + 1 : i, address, network.chainid,
                                    healthBonus, bulletsBonus, speedBonus, jumpBonus
                                )
                            })
                            /*infoPricingTitle.classList.add('pricing__title')
                            infoPricingTitle.textContent = `${price} `
                                const infoPricingSymbol = document.createElement('span')
                                infoPricingSymbol.textContent = `  ${symbol}`
                                infoPricingTitle.appendChild(infoPricingSymbol)*/
                            const infoPricingBuyNowButton = document.createElement('button')
                            infoPricingBuyNowButton.classList.add('buy-now-btn')
                            infoPricingBuyNowButton.textContent = BigInt((v.price * 10**usdt.decimals).toString()) > BigInt(allowance) ? 'Approve' : 'Buy now'
                            if (bought[i] != 0) {
                                infoPricingBuyNowButton.style.color = '#393939'
                                infoPricingBuyNowButton.disabled = true
                                infoPricingBuyNowButton.textContent = 'Bought'
                                infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                infoPricingBuyNowButton.classList.add('bought-btn')
                            }
                            infoPricingBuyNowButton.addEventListener('click', () => {
                                document.getElementById('new-approve-modal').style.display = 'none'
                                if (network.chainid == 23294) {
                                    if (infoPricingBuyNowButton.textContent === `Buy now`) {
                                        confirmModal.style.display = 'flex'
                                        shopContract.connect(wrap(signer)).buy(nftContract.address, usdtContract.address, i)
                                            .then(async (tx) => {
                                                confirmModal.style.display = 'none'
                                                progressModal.style.display = 'flex'
                                                tx.wait()
                                                    .then(() => {
                                                        __allowance -= BigInt((v.price * 10**usdt.decimals).toString())
                                                        updateAllowance(usdt)
                                                        showGoToInventoryBtn(true)
                                                        progressModal.style.display = 'none'
                                                        infoPricingBuyNowButton.style.color = '#393939'
                                                        infoPricingBuyNowButton.disabled = true
                                                        infoPricingBuyNowButton.textContent = 'Bought'
                                                        infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                                        infoPricingBuyNowButton.classList.add('bought-btn')
                                                        const _img = document.createElement('img')
                                                        _img.src = imgSource
                                                        successModalImg.src = imgSource
                                                        if (nftTypeName === 'weapons') {
                                                            if (_img.height > 120 && _img.width > 120 && _img.height === _img.width) {
                                                                _img.height = 120
                                                                _img.width = 120
                                                            }
                                                            successModalImg.height = _img.height
                                                            successModalImg.width = _img.width
                                                        } else {
                                                            successModalImg.height = 100
                                                            successModalImg.width = 100
                                                        }
                                                        successModalText.textContent = 'You have successfully purchased the NFT'
                                                        successModalLink.href = `${network.explorer}/tx/${hash}`
                                                        successModal.style.display = 'flex'
                                                        const listItem = document.querySelector(listItemId)
                                                        const list = listItem.querySelectorAll('.item-list__slot')
                                                        const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 0)
                                                        addInventoryItem(listItemId, {
                                                            image: imgSource,
                                                            id: nftTypeName === 'characters' ? i + 1 : i,
                                                            name: v.name ? v.name : 'Name',
                                                            attributes: v.attributes,
                                                            collection,
                                                            description: v.description,
                                                            height: successModalImg.height,
                                                            width: successModalImg.width
                                                        }, nftTypeName, address, network, firstEmpty)
                                                    }) 
                                            })
                                            .catch(err => {
                                                console.log(err.message)
                                                err.message = changeErrMessage(err)
                                                errorModalText.textContent = err.message
                                                approveModal.style.display = 'none'
                                                errorModal.style.display = 'flex'
                                            })
                                    } else {
                                        approveModal.style.display = 'flex'
                                        usdtContract.connect(wrap(signer))
                                            .approve(shopContract.address, ethers.constants.MaxUint256)
                                            .then((tx) => {
                                                approveModal.style.display = 'none'
                                                progressModal.style.display = 'flex'
                                                hash = tx.hash
                                                tx.wait()
                                                    .then(() => {
                                                        showGoToInventoryBtn(false)
                                                        infoPricingBuyNowButton.textContent = `Buy now`
                                                        try {
                                                            const approveEvent = _waited.events.find(v => v.event === 'Approval')
                                                            const approvedAmount = BigInt((approveEvent.args.value).toString())
                                                            __allowance = approvedAmount
                                                            updateAllowance(usdt)
                                                        } catch (error) {
                                                            console.log(error)
                                                        }
                                                        progressModal.style.display = 'none'
                                                        confirmModal.style.display = 'flex'
                                                        shopContract.connect(wrap(signer)).buy(nftContract.address, usdtContract.address, i)
                                                            .then(async (tx) => {
                                                                confirmModal.style.display = 'none'
                                                                progressModal.style.display = 'flex'
                                                                tx.wait()
                                                                    .then(() => {
                                                                        __allowance -= BigInt((v.price * 10**usdt.decimals).toString())
                                                                        updateAllowance(usdt)
                                                                        showGoToInventoryBtn(true)
                                                                        progressModal.style.display = 'none'
                                                                        infoPricingBuyNowButton.style.color = '#393939'
                                                                        infoPricingBuyNowButton.disabled = true
                                                                        infoPricingBuyNowButton.textContent = 'Bought'
                                                                        infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                                                        infoPricingBuyNowButton.classList.add('bought-btn')
                                                                        successModalImg.src = imgSource
                                                                        successModalText.textContent = 'You have successfully purchased the NFT'
                                                                        successModalLink.href = `${network.explorer}/tx/${hash}`
                                                                        successModal.style.display = 'flex'
                                                                        const listItem = document.querySelector(listItemId)
                                                                        const list = listItem.querySelectorAll('.item-list__slot')
                                                                        const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 0)
                                                                        addInventoryItem(listItemId, {
                                                                            image: imgSource,
                                                                            id: nftTypeName === 'characters' ? i + 1 : i,
                                                                            name: v.name ? v.name : 'Name',
                                                                            attributes: v.attributes,
                                                                            collection,
                                                                            description: v.description
                                                                        }, nftTypeName, address, network, firstEmpty)
                                                                    }) 
                                                            })
                                                            .catch(err => {
                                                                console.log(err.message)
                                                                err.message = changeErrMessage(err)
                                                                errorModalText.textContent = err.message
                                                                approveModal.style.display = 'none'
                                                                errorModal.style.display = 'flex'
                                                            })
                                                    }) 
                                            })
                                            .catch(err => {
                                                console.log(err.message)
                                                err.message = changeErrMessage(err)
                                                errorModalText.textContent = err.message
                                                approveModal.style.display = 'none'
                                                errorModal.style.display = 'flex'
                                            })
                                    }
                                } else {
                                    if (infoPricingBuyNowButton.textContent === `Buy now`) {
                                        confirmModal.style.display = 'flex'
                                        shopContract.buy(nftContract.address, usdtContract.address, i)
                                            .then(async (tx) => {
                                                confirmModal.style.display = 'none'
                                                progressModal.style.display = 'flex'
                                                tx.wait()
                                                    .then(() => {
                                                        __allowance -= BigInt((v.price * 10**usdt.decimals).toString())
                                                        updateAllowance(usdt)
                                                        showGoToInventoryBtn(true)
                                                        progressModal.style.display = 'none'
                                                        infoPricingBuyNowButton.style.color = '#393939'
                                                        infoPricingBuyNowButton.disabled = true
                                                        infoPricingBuyNowButton.textContent = 'Bought'
                                                        infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                                        infoPricingBuyNowButton.classList.add('bought-btn')
                                                        const _img = document.createElement('img')
                                                        _img.src = imgSource
                                                        successModalImg.src = imgSource
                                                        if (nftTypeName === 'weapons') {
                                                            if (_img.height > 120 && _img.width > 120 && _img.height === _img.width) {
                                                                _img.height = 120
                                                                _img.width = 120
                                                            }
                                                            successModalImg.height = _img.height
                                                            successModalImg.width = _img.width
                                                        } else {
                                                            successModalImg.height = 100
                                                            successModalImg.width = 100
                                                        }
                                                        const listItem = document.querySelector(listItemId)
                                                        const list = listItem.querySelectorAll('.item-list__slot')
                                                        const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 0)
                                                        addInventoryItem(listItemId, {
                                                            image: imgSource,
                                                            id: nftTypeName === 'characters' ? i + 1 : i,
                                                            name: v.name ? v.name : 'Name',
                                                            attributes: v.attributes,
                                                            collection,
                                                            description: v.description,
                                                            height: successModalImg.height,
                                                            width: successModalImg.width
                                                        }, nftTypeName, address, network, firstEmpty)
                                                        successModalText.textContent = 'You have successfully purchased the NFT'
                                                        successModalLink.href = `${network.explorer}/tx/${hash}`
                                                        successModal.style.display = 'flex'
                                                    }) 
                                            })
                                            .catch(err => {
                                                console.log(err.message)
                                                err.message = changeErrMessage(err)
                                                errorModalText.textContent = err.message
                                                confirmModal.style.display = 'none'
                                                approveModal.style.display = 'none'
                                                errorModal.style.display = 'flex'
                                            })
                                    } else {
                                        approveModal.style.display = 'flex'
                                        usdtContract
                                            .approve(shopContract.address, ethers.constants.MaxUint256)
                                            .then((tx) => {
                                                approveModal.style.display = 'none'
                                                progressModal.style.display = 'flex'
                                                hash = tx.hash
                                                tx.wait()
                                                    .then((_waited) => {
                                                        showGoToInventoryBtn(false)
                                                        infoPricingBuyNowButton.textContent = `Buy now`
                                                        try {
                                                            const approveEvent = _waited.events.find(v => v.event === 'Approval')
                                                            const approvedAmount = BigInt((approveEvent.args.value).toString())
                                                            __allowance = approvedAmount
                                                            updateAllowance(usdt)
                                                        } catch (error) {
                                                            console.log(error)
                                                        }
                                                        progressModal.style.display = 'none'
                                                        confirmModal.style.display = 'flex'
                                                            shopContract.buy(nftContract.address, usdtContract.address, i)
                                                                .then(async (tx) => {
                                                                    confirmModal.style.display = 'none'
                                                                    progressModal.style.display = 'flex'
                                                                    tx.wait()
                                                                        .then(() => {
                                                                            __allowance -= BigInt((v.price * 10**usdt.decimals).toString())
                                                                            updateAllowance(usdt)
                                                                            showGoToInventoryBtn(true)
                                                                            progressModal.style.display = 'none'
                                                                            infoPricingBuyNowButton.style.color = '#393939'
                                                                            infoPricingBuyNowButton.disabled = true
                                                                            infoPricingBuyNowButton.textContent = 'Bought'
                                                                            infoPricingBuyNowButton.classList.remove('buy-now-btn')
                                                                            infoPricingBuyNowButton.classList.add('bought-btn')
                                                                            successModalImg.src = imgSource
                                                                            const listItem = document.querySelector(listItemId)
                                                                            const list = listItem.querySelectorAll('.item-list__slot')
                                                                            const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 0)
                                                                            addInventoryItem(listItemId, {
                                                                                image: imgSource,
                                                                                id: nftTypeName === 'characters' ? i + 1 : i,
                                                                                name: v.name ? v.name : 'Name',
                                                                                attributes: v.attributes,
                                                                                collection,
                                                                                description: v.description
                                                                            }, nftTypeName, address, network, firstEmpty)
                                                                            successModalText.textContent = 'You have successfully purchased the NFT'
                                                                            successModalLink.href = `${network.explorer}/tx/${hash}`
                                                                            successModal.style.display = 'flex'
                                                                        }) 
                                                                })
                                                                .catch(err => {
                                                                    console.log(err.message)
                                                                    err.message = changeErrMessage(err)
                                                                    errorModalText.textContent = err.message
                                                                    confirmModal.style.display = 'none'
                                                                    approveModal.style.display = 'none'
                                                                    errorModal.style.display = 'flex'
                                                                })
                                                                    // successModalImg.src = `/media/tokens/orange/usdt.png`
                                                        // successModalText.textContent = 'You have successfully given permission to use USDT'
                                                        // successModalLink.href = `${network.explorer}/tx/${hash}`
                                                        // successModal.style.display = 'flex'
                                                    }) 
                                            })
                                            .catch(err => {
                                                console.log(err.message)
                                                err.message = changeErrMessage(err)
                                                errorModalText.textContent = err.message
                                                approveModal.style.display = 'none'
                                                errorModal.style.display = 'flex'
                                            })
                                    }
                                }
                            })
                            infoPricing.append(tryOn, infoPricingBuyNowButton)
                        infoLeft.append(infoText, infoPricing)
                    itemLeft.append(imgLeft, infoLeft)
                const itemRight = document.createElement('div')
                itemRight.classList.add('item__right')
                    const itemRightProps = document.createElement('div')
                    itemRightProps.classList.add('right__props-wrap')
                    const itemRightDescription = document.createElement('p')
                    if (healthBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/heals.svg', 'Heals', healthBonus))
                    if (speedBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/speed.svg', 'Speed', speedBonus))
                    if (bulletsBonus) itemRightProps.appendChild(nftCharacteristic('media/svg/props-items/ammunition-quantity.svg', 'Bullets', bulletsBonus))
                    if (jumpBonus) itemRightProps.appendChild(nftCharacteristic('/media/svg/props-items/jump.svg', 'Jump', jumpBonus))
                    itemRightDescription.classList.add('right__description')
                    if(nftTypeName === 'characters') {
                        itemRightDescription.textContent = v.description.length > 320 ? v.description.slice(0, 319) + ' ...' :  v.description
                    }
                    if(nftTypeName !== 'characters') {
                        itemRightDescription.textContent = v.description.length > 180 ? v.description.slice(0, 179) + ' ...' :  v.description
                    }
                   
                    itemRight.append(itemRightProps, itemRightDescription)
                listItem.append(itemLeft, itemRight)
            list.appendChild(listItem)
        } catch (error) {
            console.log(error, nftTypeName, i)
        }
    })
    
}

const dressingBtnClose = document.querySelector('.dressing-modal__btn-close')
dressingBtnClose.addEventListener('click', toggleDressingModal)

async function toggleDressingModal(
    nftTypeName, nftId, address, chainid,
    healthBonus, bulletsBonus, speedBonus, jumpBonus
) {
    try {
        const playerHealth = document.querySelector('#player-health')
        const playerBullets = document.querySelector('#player-bullets')
        const playerSpeed = document.querySelector('#player-speed')
        const playerJump = document.querySelector('#player-jump')
        const tryOnPlayerHealth = document.querySelector('#tryon-player-health')
        const tryOnPlayerBullets = document.querySelector('#tryon-player-bullets')
        const tryOnPlayerSpeed = document.querySelector('#tryon-player-speed')
        const tryOnPlayerJump = document.querySelector('#tryon-player-jump')
        tryOnPlayerHealth.textContent = healthBonus ? basicPlayerCharacteristics.health + parseInt(healthBonus) : playerHealth.textContent
        tryOnPlayerBullets.textContent = bulletsBonus ? basicPlayerCharacteristics.bullets + parseInt(bulletsBonus) : playerBullets.textContent
        tryOnPlayerSpeed.textContent = speedBonus ? basicPlayerCharacteristics.speed + parseInt(speedBonus) : playerSpeed.textContent
        tryOnPlayerJump.textContent = jumpBonus ? basicPlayerCharacteristics.jump + parseInt(jumpBonus) : playerJump.textContent
        const dressingModalOverlay = document.querySelector('.wrapper__dressing-modal-overlay')
        dressingModalOverlay.classList.toggle('wrapper__dressing-modal-overlay_active')
    
        if (dressingModalOverlay.classList.contains('wrapper__dressing-modal-overlay_active')) {
            document.querySelector('#tryon-character-background').style.display = 'none'
            document.querySelector('#tryon-character-slot2').className = 'character-wrap__img-wrap dressing_canvas_container lds-dual-ring-tryon'
            const tryOnWeaponImg = document.querySelector('#tryon-weapon-slot-img')
            const tryOnArmorImg = document.querySelector('#tryon-armor-slot-img')
            const tryOnBootsImg = document.querySelector('#tryon-boots-slot-img')
            const settedWeaponImg = localStorage.getItem('setted-weapon')
            const settedArmorImg = localStorage.getItem('setted-armor')
            const settedBootsImg = localStorage.getItem('setted-boots')
            if (settedWeaponImg || nftTypeName === InventoryTypes.WEAPONS) {
                document.querySelector('#tryon-weapon-slot').className = 'slot-wrap__slot weapon-slot dressing_slot'
                tryOnWeaponImg.src = nftTypeName === InventoryTypes.WEAPONS ? `/media/weapons/${nftId}.png` : settedWeaponImg
                tryOnWeaponImg.className = ''
                if (tryOnWeaponImg.width === 293 || tryOnWeaponImg.width === 120 || tryOnWeaponImg.width === 64) {
                    tryOnWeaponImg.className = 'slot-wrap__slot-img-wider'
                } else {
                    tryOnWeaponImg.className = 'slot-wrap__slot-img'
                }
                tryOnWeaponImg.style.display = ''
            } else {
                document.querySelector('#tryon-weapon-slot').className = 'slot-wrap__slot weapon-slot weapon__slot-background dressing_slot'
                tryOnWeaponImg.src = ''
                tryOnWeaponImg.style.display = 'none'
            }
            if (settedArmorImg || nftTypeName === InventoryTypes.ARMORS) {
                document.querySelector('#tryon-armor-slot').className = 'slot-wrap__slot armor-slot dressing_slot'
                tryOnArmorImg.src = nftTypeName === InventoryTypes.ARMORS ? `/media/armors/${nftId}.png` : settedArmorImg
                tryOnArmorImg.className = 'slot-wrap__slot-img'
                tryOnArmorImg.style.display = ''
            } else {
                document.querySelector('#tryon-armor-slot').className = 'slot-wrap__slot armor-slot armor__slot-background dressing_slot'
                tryOnArmorImg.src = ''
                tryOnArmorImg.style.display = 'none'
            }
            if (settedBootsImg || nftTypeName === InventoryTypes.BOOTS) {
                document.querySelector('#tryon-boots-slot').className = 'slot-wrap__slot boots-slot dressing_slot'
                tryOnBootsImg.src = nftTypeName === InventoryTypes.BOOTS ? `/media/boots/${nftId}.png` : settedBootsImg
                tryOnBootsImg.className = 'slot-wrap__slot-img'
                tryOnBootsImg.style.display = ''
            } else {
                document.querySelector('#tryon-boots-slot').className = 'slot-wrap__slot boots-slot boots__slot-background dressing_slot'
                tryOnBootsImg.src = ''
                tryOnBootsImg.style.display = 'none'
            }
            document.body.style.overflow = 'hidden'
            const res = await fetch('tryon', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address,
                    chainid,
                    inventory: {
                        [nftTypeName]: nftId
                    }
                })
            })
            if (res.status === 200) {
                let tryOnImage = await res.blob()
                if (drawTimeout) clearTimeout(drawTimeout)
                drawCharacterAnimation(tryOnImage)
            }
        } else {
            document.body.style.overflow = 'auto'
        }
    } catch (error) {
        console.log(error)
    }
}

const drawCharacterAnimation = (imageBlob) => {
    let canvas = document.querySelector('#tryon-character-background')
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

        const scale = 0.9;

        canvas.width = frameWidth * 1;
        canvas.height = frameHeight * 1;

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
                -50, // X-координата отрисовки на canvas
                -175, // Y-координата отрисовки на canvas
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
    document.querySelector('#tryon-character-background').style.display = ''
    document.querySelector('#tryon-character-slot2').className = 'character-wrap__img-wrap dressing_canvas_container'
}

const nftCharacteristic = (img, name, bonus) => {
    const itemRightBlock = document.createElement('div')
    itemRightBlock.classList.add('props-wrap__prop-item')
        const itemRightBlockImgWrap = document.createElement('img')
        itemRightBlockImgWrap.src = img
        itemRightBlockImgWrap.classList.add('prop-item__icon-wrap')
        const itemRightBlockTitle = document.createElement('span')
        itemRightBlockTitle.classList.add('prop-item__title')
        itemRightBlockTitle.textContent = name
        const itemRightBlockValue = document.createElement('span')
        itemRightBlockValue.classList.add('prop-item__value')
        itemRightBlockValue.textContent = bonus
        itemRightBlock.append(itemRightBlockImgWrap, itemRightBlockTitle, itemRightBlockValue)
    return itemRightBlock
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

const collectionChange = () => {
    // Получаем ссылки на все чекбоксы коллекций
    let collectionCheckboxes = document.querySelectorAll('input[name="collection-check"]');

    // Получаем ссылку на контейнер, содержащий персонажей
    // let charactersStore = document.getElementById("nft-shop-characters-list");
    let weaponsStore = document.getElementById("nft-shop-weapons-list");
    let armorsStore = document.getElementById("nft-shop-armors-list");
    let bootsStore = document.getElementById("nft-shop-boots-list");

    // Функция обновления отображения персонажей на основе состояния чекбоксов
    function updateDisplay() {
        // Получаем список выбранных коллекций
        let selectedCollections = Array.from(collectionCheckboxes)
            .filter(function(checkbox) {
                return checkbox.checked;
            })
            .map(function(checkbox) {
                return checkbox.value;
            });


        function displayItemChange(items) {
            for(let i = 0; i < items.length; i++) {
                let collection = items[i].getAttribute("data-collection");
    
                // Проверяем, принадлежит ли персонаж к выбранным коллекциям
                if (selectedCollections.length === 0) {
                    items[i].style.display = "flex";
                } else {
                    if (selectedCollections.includes(collection)) {
                        items[i].style.display = "flex"; // Показываем персонажа
                    } else {
                        items[i].style.display = "none"; // Скрываем персонажа
                    }
                }
            }
        }
        // Перебираем все персонажи и проверяем, должны ли они быть показаны
        // let characters = charactersStore.getElementsByClassName("list-items__item");
        let weapons = weaponsStore.getElementsByClassName("list-items__item");
        let armors = armorsStore.getElementsByClassName("list-items__item");
        let boots = bootsStore.getElementsByClassName("list-items__item");
        // displayItemChange(characters)
        displayItemChange(weapons)
        displayItemChange(armors)
        displayItemChange(boots)
    }

    // Назначаем обработчик события изменения состояния чекбоксов
    for (let i = 0; i < collectionCheckboxes.length; i++) {
        collectionCheckboxes[i].addEventListener("change", updateDisplay);
    }

    // Обновляем отображение персонажей при загрузке страницы
    updateDisplay();
}

const changeErrMessage = (err) => {
    if (err.message.includes('insufficient allowance')) {
        return 'Insufficient allowance'
    }
    if (err.message.includes("transfer amount exceeds balance")) {
        return `Token transfer amount exceeds balance`
      }
    return err.message
}

const showGoToInventoryBtn = (buy) => {
    const btn = document.querySelector('#go-to-inventory-btn')
    btn.style.display = buy ? '' : 'none' 
}

const updateAllowance = (usdt) => {
    const characters = document.querySelector('#nft-shop-characters-list')
    const weapons = document.querySelector('#nft-shop-weapons-list')
    const armors = document.querySelector('#nft-shop-armors-list')
    const boots = document.querySelector('#nft-shop-boots-list')
    let charactersItems = Array.from(characters.querySelectorAll('.list-items__item'))
    let weaponsItems = Array.from(weapons.querySelectorAll('.list-items__item'))
    let armorsItems = Array.from(armors.querySelectorAll('.list-items__item'))
    let bootsItems = Array.from(boots.querySelectorAll('.list-items__item'))
    charactersItems.forEach(item => _updateAllowance(item, __allowance, usdt))
    weaponsItems.forEach(item => _updateAllowance(item, __allowance, usdt))
    armorsItems.forEach(item => _updateAllowance(item, __allowance, usdt))
    bootsItems.forEach(item => _updateAllowance(item, __allowance, usdt))
}

const _updateAllowance = (item, allowance, usdt) => {
    try {
        allowance = BigInt(allowance) / BigInt(10**usdt.decimals)
        const price = item.getAttribute('data-price')
        const _price = parseFloat(price)
        const button = item.querySelector('button')
        button.src = "url('media/svg/frame-btn.svg')"
        if (allowance >= _price) {
            button.textContent = 'Buy now'
        } else {
            button.textContent = 'Approve'
        }
        if (button.disabled) {
            button.textContent = 'Bought' 
        }
    } catch (error) {
        console.log(error)
    } 
}