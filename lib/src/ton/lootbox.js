import { tokens } from "../../modules/tokens"
import { showGoToInventoryBtn } from "../shop"
import charactersJsons from '../../jsons/characters.json'
import armorsJsons from '../../jsons/armors.json'
import weaponsJsons from '../../jsons/weapons.json'
import bootsJsons from '../../jsons/boots.json'
import { addInventoryItem } from "../inventory"
import { changeErrMessage } from "../utils/utils"
import { showInventoryItemModal } from "../inventory"
import { beginCell, Cell, toNano } from "ton-core"
import { Address } from "@ton/ton"

let timeoutID

let allowance = BigInt(0)
let price = toNano(10)
let hash = ''

const isTest = true

const lootboxAddress = ""
const lootboxAddressTest = "EQBrhHw3d6mTuB0VlZu_D6vuJg0frsNpPDFjfs2iKrivLppz"

const approveModal = document.querySelector('#new-approve-modal')
const progressModal = document.querySelector('#new-progress-modal')
const confirmModal = document.querySelector('#new-confirm-modal')
const errorModal = document.querySelector('#new-error-modal')
const errorModalText = document.querySelector('#new-error-modal-text')
let buyButton = document.querySelector('#lootbox-buy-btn')
const splashScreen = document.querySelector('#splash-modal')

export async function lootboxTon(address, isMobile, tonConnectUI) {
    const network = { chainid: 0, explorer: 'https://tonscan.org' }
    try {
        buyButton = isMobile ? document.querySelector('#lootbox-buy-btn-mobile') : buyButton
        price = BigInt(10*10**9)
        buyButton.textContent = 'buy now'
        buyButton.addEventListener('click', async () => {
            window.addEventListener("popstate", () => {});
            document.querySelector('#inventory-nftbox-modal').style.display = 'none'
            confirmModal.style.display = 'flex'
            await buy(address, network, price, tonConnectUI)
        })
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

async function buy(address, network, price, tonConnectUI) {
    const body = beginCell().storeUint(0, 32).storeStringTail("Buy").endCell();
    
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: Address.parse(isTest ? lootboxAddressTest : lootboxAddress).toString(),
                amount: (price + toNano(0.05) * 2n).toString(), 
                payload: body.toBoc().toString("base64") 
            }
        ]
    }
    const result = await tonConnectUI.sendTransaction(transaction)
    // console.log(result.boc)
    // const boc = 'te6cckEBBAEAvwAB5YgAV49qjSIqzFFDgazIKUtota0N+4zfxM2SximSRUx9ajQDm0s7c////+s3YN7wAAABtVmC/I1C8bPo+HuYE51G1SZogX6oZEAxCRdZILcXVmP+0saQxDs5T8BSqncIxFQbpxamcsPnd4Hgz1rr+t6xzAEBAgoOw8htAwMCAHhiADXCPhu71MncDorKzd+H1fcTBo/XYbSeGLG/ZtEVXFeXKBLQDigAAAAAAAAAAAAAAAAAAAAAAABCdXkAAHpe7Us='
    // console.log(Cell.fromBoc(Buffer.from(boc, 'base64')))
    // showGoToInventoryBtn(true)
    // const lootEvent = waited.events.find(v => v.event === 'Loot')
    // const lootedNFT = lootEvent.args.nft
    // const lootedPropertyId = lootEvent.args.propertyId
    // progressModal.style.display = 'none'
    // const _nftData = nftData(lootedNFT, parseInt(lootedPropertyId), network)
    // splashScreen.style.display = 'flex'
    // document.querySelector('#btn-close-splash').addEventListener('click', () => {
    //     splashScreen.style.display = 'none'
    // })
    // document.querySelector('#splash-video').addEventListener('play', listenPlay(_nftData, address, network))
    // document.querySelector('#splash-video').play()   
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
    error.message = changeErrMessage(error)
    errorModalText.textContent = error.message
    approveModal.style.display = 'none'
    progressModal.style.display = 'none'
    confirmModal.style.display = 'none'
    errorModal.style.display = 'flex'
}