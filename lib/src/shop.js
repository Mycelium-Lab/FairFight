import { charactersShopAbi } from '../contract.js'
import { tokens } from '../modules/tokens.js'

export const shop = async (address, network, signer, wrap) => {
    const characterShopContract = new ethers.Contract(network.charactersShopAddress, charactersShopAbi, signer)
    shopSwitcher()
    charactersShop(characterShopContract)
}

const charactersShop = async (characterShopContract) => {
    const _tokens = tokens.find(v => v.chaindid == network.chaindid)
    const usdt = _tokens.list.find(v => v.symbol == 'USDT')
    const charactersBlockBox = document.querySelectorAll('.characters-block__box')
    const characterModal = document.querySelector('#character-modal')
    const characterModalTitle = document.querySelector('#character-modal-name')
    const characterModalImg = document.querySelector('#character-modal-img')
    for (let i = 0; i < charactersBlockBox.length; i++) {
        const item = charactersBlockBox.item(i)
        if (item.id.includes('character')) {
            const itemId = item.id.split('-')
            const characterID = itemId[1]
            item.addEventListener('click', () => {
                characterModalImg.src = `/media/characters/${characterID}.png`
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