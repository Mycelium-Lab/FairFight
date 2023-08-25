import { ERC20, lootboxAbi } from "../../contract"
import { tokens } from "../../modules/tokens"
import { showGoToInventoryBtn } from "../shop"
import charactersJsons from '../../jsons/characters.json'
import armorsJsons from '../../jsons/armors.json'
import weaponsJsons from '../../jsons/weapons.json'
import bootsJsons from '../../jsons/boots.json'
import { addInventoryItem } from "../inventory"
import { changeErrMessage } from "../utils/utils"

let allowance = BigInt(0)
let price = BigInt(ethers.utils.parseEther('10.3').toString())
let hash = ''

const approveModal = document.querySelector('#new-approve-modal')
const progressModal = document.querySelector('#new-progress-modal')
const confirmModal = document.querySelector('#new-confirm-modal')
const errorModal = document.querySelector('#new-error-modal')
const errorModalText = document.querySelector('#new-error-modal-text')
const successModal = document.querySelector('#new-success-modal')
const successModalImg = document.querySelector('#new-success-modal-img')
const successModalText = document.querySelector('#new-success-modal-text')
const successModalLink = document.querySelector('#new-success-modal-link')
const buyButton = document.querySelector('#lootbox-buy-btn')

export async function lootbox(address, network, signer, wrap) {
    try {
        if (network.lootboxAddress) {
            let lootboxContract = new ethers.Contract(network.lootboxAddress, lootboxAbi, signer)
            const _tokens = tokens.find(v => v.chaindid == network.chainid)
            const usdt = _tokens.list.find(v => v.symbol == 'USDT' || v.symbol == 'weUSDT')
            let usdtContract = new ethers.Contract(usdt.address, ERC20, signer)
            if (network.chainid == 23294) { 
                lootboxContract = lootboxContract.connect(wrap(signer))
                usdtContract = usdtContract.connect(wrap(signer))
            }
            const _allowance = await usdtContract.allowance(address, lootboxContract.address)
            const _price = await lootboxContract.price()
            allowance = BigInt(_allowance.toString())
            price = BigInt(_price.toString())
            if (allowance < price) {
                buyButton.textContent = 'Approve'
                buyButton.addEventListener('click', async () => {
                    approveModal.style.display = 'flex'
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
                                            await buy(address, lootboxContract, usdtContract, network)
                                        } else {
                                            console.log('not enough allowance')
                                        }
                                    } catch (error) {
                                        console.log(error)
                                    }
                                })
                        })
                })
            } else {
                buyButton.addEventListener('click', async () => {
                    await buy(address, lootboxContract, usdtContract, network)
                })
            }
        } else {
            buyButton.disabled = true
        }
    } catch (error) {
        console.log(error)
        err.message = changeErrMessage(err)
        errorModalText.textContent = err.message
        approveModal.style.display = 'none'
        errorModal.style.display = 'flex'
    }
}

async function buy(address, lootboxContract, usdtContract, network) {
    const tx = await lootboxContract.buy()
    confirmModal.style.display = 'none'
    progressModal.style.display = 'flex'
    const waited = await tx.wait()
    hash = tx.hash
    showGoToInventoryBtn(true)
    const lootEvent = waited.events.find(v => v.event === 'Loot')
    const lootedNFT = lootEvent.args.nft
    const lootedPropertyId = lootEvent.args.propertyId
    progressModal.style.display = 'none'
    const _allowance = await usdtContract.allowance(address, lootboxContract.address)
    allowance = BigInt(_allowance.toString())
    if (allowance < price) {
        buyButton.textContent = 'Approve'
    } else {
        buyButton.textContent = 'Buy now'
    }
    const _nftData = nftData(lootedNFT, parseInt(lootedPropertyId), network)
    successModalImg.src = _nftData.src
    const _img = document.createElement('img')
    _img.src = _nftData.src
    if (_nftData.typeName === 'weapons') {
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