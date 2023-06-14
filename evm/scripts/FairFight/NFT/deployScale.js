const { ethers } = require("hardhat");

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    const armorsBaseURI = 'https://ipfs.io/ipfs/Qmd8U5jsHMqp4U4vVd5A4sb14WAsY6UWmHnpZef8G2jHv1/'
    const bootsBaseURI = 'https://ipfs.io/ipfs/Qmd7NkqYyuR3K2uP1Go3xHtuTomKV2aHBUa8mcncbUDNm3/'
    const weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'
    const token = "0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0"
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const Shop = await ethers.getContractFactory("FairFightShop")
    const characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI, ethers.constants.MaxUint256)
    const armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI, ethers.constants.MaxUint256)
    const boots = await FFNFT.deploy("FairFightBoots", "FFB", bootsBaseURI, ethers.constants.MaxUint256)
    const weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI, ethers.constants.MaxUint256)
    await characters.deployed()
    await armors.deployed()
    await boots.deployed()
    await weapons.deployed()
    let charactersPrices = [
        ethers.utils.parseEther(`50`),
        ethers.utils.parseEther(`20`),
        ethers.utils.parseEther(`15`),
        ethers.utils.parseEther(`15`),
        ethers.utils.parseEther(`5`),
        ethers.utils.parseEther(`10`),
        ethers.utils.parseEther(`15`),
    ]
    let armorsPrices = [
        ethers.utils.parseEther(`9.99`),
        ethers.utils.parseEther(`49.9`),
        ethers.utils.parseEther(`49.9`),
        ethers.utils.parseEther(`149.9`),
        ethers.utils.parseEther(`149.9`),
        ethers.utils.parseEther(`199.9`),
        ethers.utils.parseEther(`499`),
        ethers.utils.parseEther(`999`)
    ]
    let bootsPrices = [
        ethers.utils.parseEther(`14.9`),
        ethers.utils.parseEther(`41.9`),
        ethers.utils.parseEther(`222`),
        ethers.utils.parseEther(`145`),
        ethers.utils.parseEther(`444`),
        ethers.utils.parseEther(`499`),
        ethers.utils.parseEther(`888`),
        ethers.utils.parseEther(`999`)
    ]
    let weaponsPrices = [
        ethers.utils.parseEther(`17.9`),
        ethers.utils.parseEther(`14.9`),
        ethers.utils.parseEther(`40`),
        ethers.utils.parseEther(`39.9`),
        ethers.utils.parseEther(`59.9`),
        ethers.utils.parseEther(`149`),
        ethers.utils.parseEther(`199.9`),
        ethers.utils.parseEther(`499`),
        ethers.utils.parseEther(`199`),
        ethers.utils.parseEther(`599`),
        ethers.utils.parseEther(`555`),
        ethers.utils.parseEther(`580`),
        ethers.utils.parseEther(`777`),
        ethers.utils.parseEther(`888`),
    ]
    const shop = await Shop.deploy(
        characters.address,
        weapons.address,
        armors.address,
        boots.address,
        token,
        charactersPrices,
        weaponsPrices,
        armorsPrices,
        bootsPrices,
        collector
    )
    await shop.deployed()
    await characters.setAllowedMint(shop.address, true)
    await armors.setAllowedMint(shop.address, true)
    await weapons.setAllowedMint(shop.address, true)
    await boots.setAllowedMint(shop.address, true)
    console.log(`Characters deployed to ${characters.address}`)
    console.log(`Armors deployed to ${armors.address}`)
    console.log(`Boots deployed to ${boots.address}`)
    console.log(`Weapons deployed to ${weapons.address}`)
    console.log(`Shop deployed to ${shop.address}`)
}

main()
    .catch(err => console.log(err))