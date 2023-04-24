const { ethers } = require("hardhat");

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    const charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    const armorsBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    const weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'
    const token = "0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0"
    let FFNFT = await ethers.getContractFactory("FairFightNFT")
    let Shop = await ethers.getContractFactory("FairFightShop")
    FFNFT = FFNFT.connect(wallet)
    Shop = Shop.connect(wallet)
    const characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI)
    const armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI)
    const weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI)
    await characters.deployed()
    await armors.deployed()
    await weapons.deployed()
    let charactersPrices = []
    let armorsPrices = []
    let weaponsPrices = []
    //set prices
    for (let i = 0; i < 2; i++) {
        charactersPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 16; i++) {
        armorsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 14; i++) {
        weaponsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    const shop = await Shop.deploy(
        characters.address,
        weapons.address,
        armors.address,
        token,
        charactersPrices,
        weaponsPrices,
        armorsPrices,
        collector
    )
    await shop.deployed()
    await characters.setAllowedMint(shop.address, true)
    await armors.setAllowedMint(shop.address, true)
    await weapons.setAllowedMint(shop.address, true)
    console.log(`Characters deployed to ${characters.address}`)
    console.log(`Armors deployed to ${armors.address}`)
    console.log(`Weapons deployed to ${weapons.address}`)
    console.log(`Shop deployed to ${shop.address}`)
}

main()
    .catch(err => console.log(err))