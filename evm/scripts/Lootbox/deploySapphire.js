const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = (10*10**18).toString()
    const token = '0x55d398326f99059ff775485246999027b3197955'
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4')
    const armors = FFNFT.attach('0xe10cd6c65af7637ad8329f0adb161a968101bf86')
    const boots = FFNFT.attach('0x2b9e270d12ba5ce62ece2c458db7b7b2939d19ae')
    const weapons = FFNFT.attach('0x03467ad8efe8bb73c0dde0c436b7efafe9fc3e32')
    const Lootbox = await ethers.getContractFactory("Lootbox")
    const lootbox = await Lootbox.deploy(
        regularRarityPrizes(characters.address, weapons.address, boots.address, armors.address),
        superiorRarityPrizes(characters.address, weapons.address, boots.address, armors.address),
        rareRarityPrizes(characters.address, weapons.address, boots.address, armors.address),
        legendaryRarityPrizes(characters.address, weapons.address, boots.address, armors.address),
        epicRarityPrizes(characters.address, weapons.address, boots.address, armors.address),
        price,
        signer.address,
        collector,
        token
    )
    await lootbox.deployed()
    await characters.setAllowedMint(lootbox.address, true)
    await armors.setAllowedMint(lootbox.address, true)
    await weapons.setAllowedMint(lootbox.address, true)
    await boots.setAllowedMint(lootbox.address, true)
    console.log(`Lootbox contract deployed on address: ${lootbox.address}`)
}

main().then(console.log('done')).catch((err) => console.log(err))