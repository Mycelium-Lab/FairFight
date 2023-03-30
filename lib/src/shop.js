import { charactersShopAbi } from '../contract.js'

export const shop = async (address, wrap) => {
    shopSwitcher()
}

const charactersShop = () => {

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