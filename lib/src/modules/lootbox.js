import { ERC20, lootboxAbi } from "../../contract"
import { tokens } from "../../modules/tokens"
import { showGoToInventoryBtn } from "../shop"
import charactersJsons from '../../jsons/characters.json'
import armorsJsons from '../../jsons/armors.json'
import weaponsJsons from '../../jsons/weapons.json'
import bootsJsons from '../../jsons/boots.json'
import { addInventoryItem } from "../inventory"
import { changeErrMessage } from "../utils/utils"
import { showInventoryItemModal } from "../inventory"

let timeoutID

let allowance = BigInt(0)
let price = BigInt(ethers.utils.parseEther('10').toString())
let hash = ''

const approveModal = document.querySelector('#new-approve-modal')
const progressModal = document.querySelector('#new-progress-modal')
const confirmModal = document.querySelector('#new-confirm-modal')
const errorModal = document.querySelector('#new-error-modal')
const errorModalText = document.querySelector('#new-error-modal-text')
let buyButton = document.querySelector('#lootbox-buy-btn')
const splashScreen = document.querySelector('#splash-modal')

export async function lootbox(address, network, signer, wrap, isMobile) {
    try {
        buyButton = isMobile ? document.querySelector('#lootbox-buy-btn-mobile') : buyButton
        if (network.lootboxAddress) {
            let lootboxContract = new ethers.Contract(network.lootboxAddress, lootboxAbi, signer)
            const _tokens = tokens.find(v => v.chaindid == network.chainid)
            let usdt = _tokens.list.find(v => v.symbol == 'USDT' || v.symbol == 'weUSDT' || v.symbol == 'USDC')
            let usdtContract = usdt ? new ethers.Contract(usdt.address, ERC20, signer) : {symbol: 'USDT', decimals: 18}
            if (!usdt) {
                usdt = {symbol: 'USDT', decimals: 18}
            }
            const _allowance = (network.chainid == 23294 || network.chainid == 355113 || network.chainid == 1440002) ? ethers.constants.MaxUint256 : await usdtContract.allowance(address, lootboxContract.address)
            let _price
            try {
                _price = await lootboxContract.price()
            } catch (error) {
                if (!usdt.address) {
                    _price = 10*10**18
                } else {
                    _price = 10*10**usdt.decimals
                }
            }
            allowance = BigInt(_allowance.toString())
            price = BigInt(_price.toString())
            if (allowance < price) {
                buyButton.textContent = 'Approve'
                buyButton.addEventListener('click', async () => {
                    window.addEventListener("popstate", () => {});
                    document.querySelector('#inventory-nftbox-modal').style.display = 'none'
                    approveModal.style.display = 'flex'
                    if (network.chainid == 23294) {
                        usdtContract
                            .connect(wrap(signer))
                            .approve(lootboxContract.address, ethers.constants.MaxUint256)
                            .then((tx) => {
                                approveModal.style.display = 'none'
                                progressModal.style.display = 'flex'
                                hash = tx.hash
                                tx.wait()
                                    .then(async (_waited) => {
                                        try {
                                            showGoToInventoryBtn(false)
                                            const approveEvent = _waited.events.find(v => v.event === 'Approval')
                                            const approvedAmount = BigInt((approveEvent.args.value).toString())
                                            allowance = approvedAmount
                                            if (allowance >= price) {
                                                buyButton.textContent = 'Buy now'
                                                await buy(address, lootboxContract, usdtContract, network)
                                            } else {
                                                showError({message: 'insufficient allowance'})
                                            }
                                        } catch (error) {
                                            console.log(error)
                                            showError(error)
                                        }
                                    })
                            })
                    } else {
                        usdtContract
                            .approve(lootboxContract.address, ethers.constants.MaxUint256)
                            .then((tx) => {
                                approveModal.style.display = 'none'
                                progressModal.style.display = 'flex'
                                hash = tx.hash
                                tx.wait()
                                    .then(async (_waited) => {
                                        try {
                                            showGoToInventoryBtn(false)
                                            const approveEvent = _waited.events.find(v => v.event === 'Approval')
                                            const approvedAmount = BigInt((approveEvent.args.value).toString())
                                            allowance = approvedAmount
                                            if (allowance >= price) {
                                                buyButton.textContent = 'Buy now'
                                                await buy(address, lootboxContract, usdtContract, network, wrap, signer, price)
                                            } else {
                                                showError({message: 'insufficient allowance'})
                                            }
                                        } catch (error) {
                                            console.log(error)
                                            showError(error)
                                        }
                                    })
                            })
                    }
                })
            } else {
                buyButton.textContent = 'buy now'
                buyButton.addEventListener('click', async () => {
                    window.addEventListener("popstate", () => {});
                    document.querySelector('#inventory-nftbox-modal').style.display = 'none'
                    confirmModal.style.display = 'flex'
                    await buy(address, lootboxContract, usdtContract, network, wrap, signer, price)
                })
            }
        } else {
            buyButton.disabled = true
        }
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

async function buy(address, lootboxContract, usdtContract, network, wrap, signer, price) {
    try {
        let tx
        if (network.chainid == 23294) {
            tx = await lootboxContract.connect(wrap(signer)).buyNative({value: price.toString()})
        } else if (network.chainid == 355113 || network.chainid == 1440002) {
            tx = await lootboxContract.buyNative({value: price.toString()})
        } else {
            tx = await lootboxContract.buy()
        }
        confirmModal.style.display = 'none'
        progressModal.style.display = 'flex'
        const waited = await tx.wait()
        hash = tx.hash
        showGoToInventoryBtn(true)
        const lootEvent = waited.events.find(v => v.event === 'Loot')
        const lootedNFT = lootEvent.args.nft
        const lootedPropertyId = lootEvent.args.propertyId
        progressModal.style.display = 'none'
        const _allowance = (network.chainid == 23294 || network.chainid == 355113 || network.chainid == 1440002) ? ethers.constants.MaxUint256 : await usdtContract.allowance(address, lootboxContract.address)
        allowance = BigInt(_allowance.toString())
        if (allowance < price) {
            buyButton.textContent = 'Approve'
        } else {
            buyButton.textContent = 'Buy now'
        }
        const _nftData = nftData(lootedNFT, parseInt(lootedPropertyId), network)
        splashScreen.style.display = 'flex'
        document.querySelector('#btn-close-splash').addEventListener('click', () => {
            splashScreen.style.display = 'none'
        })
        document.querySelector('#splash-video').addEventListener('play', listenPlay(_nftData, address, network))
        document.querySelector('#splash-video').play()   
    } catch (error) {
        showError(error)
    }
}

function listenPlay (_nftData, address, network) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => {
        showInventoryItemModal(
            _nftData.src, _nftData.name, _nftData.attributes, _nftData.description ? _nftData.description : 'Description', _nftData.typeName, _nftData.id, '',
            'loot'
        )
        splashScreen.style.display = 'none'
        const listItem = document.querySelector(_nftData.listItemId)
        const list = listItem.querySelectorAll('.item-list__slot')
        const firstEmpty = Array.from(list).findIndex(v => v.childElementCount === 4)
      
    
        addInventoryItem(_nftData.listItemId, {
            image: _nftData.src,
            id: _nftData.id,
            name: _nftData.name,
            attributes: _nftData.attributes,
            collection: _nftData.collection,
            description: _nftData.description
        }, _nftData.typeName, address, network, firstEmpty)
        document.querySelector('#splash-video').removeEventListener('play', listenPlay)
    }, 3600)
}

function nftData(nftAddress, nftId, network) {
    let data = {
        typeName: '',
        name: '',
        src: '',
        listItemId: '',
        id: '',
        attributes: [],
        collection: '',
        description: ''
    }
    if (nftAddress === network.charactersAddress) {
        data.typeName = 'characters'
        data.src = `/media/characters/${nftId + 1}.png`
        data.listItemId = "#left-inventory-characters-list"
        data.id = nftId + 1
        const json = charactersJsons[nftId]
        const attributes = json.attributes
        data.attributes = attributes
        data.collection = 'Character'
        data.description = json.description
        data.name = json.name
    }
    if (nftAddress === network.armorsAddress) {
        data.typeName = 'armors'
        data.src = `/media/armors/${nftId}.png`
        data.listItemId = "#left-inventory-armors-list"
        data.id = nftId
        const json = armorsJsons[nftId]
        const attributes = json.attributes
        data.attributes = attributes
        const findedClass = attributes.find(v => v.trait_type === 'Class')
        data.collection = findedClass.value
        data.description = json.description
        data.name = json.name
    }
    if (nftAddress === network.bootsAddress) {
        data.typeName = 'boots'
        data.src = `/media/boots/${nftId}.png`
        data.listItemId = "#left-inventory-boots-list"
        data.id = nftId
        const json = bootsJsons[nftId]
        const attributes = json.attributes
        data.attributes = attributes
        const findedClass = attributes.find(v => v.trait_type === 'Class')
        data.collection = findedClass.value
        data.description = json.description
        data.name = json.name
    }
    if (nftAddress === network.weaponsAddress) {
        data.typeName = 'weapons'
        data.src = `/media/weapons/${nftId}.png`
        data.listItemId = "#left-inventory-weapons-list"
        data.id = nftId
        const json = weaponsJsons[nftId]
        const attributes = json.attributes
        data.attributes = attributes
        const findedClass = attributes.find(v => v.trait_type === 'Class')
        data.collection = findedClass.value
        data.description = json.description
        data.name = json.name
    }
    return data
}

function showError(error) {
    error.message = changeErrMessage(error.data ? error.data : error)
    errorModalText.textContent = error.message
    approveModal.style.display = 'none'
    progressModal.style.display = 'none'
    confirmModal.style.display = 'none'
    errorModal.style.display = 'flex'
}