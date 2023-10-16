const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = 10*10**6
    const token = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0xe10cd6c65Af7637ad8329f0Adb161A968101bF86')
    const armors = FFNFT.attach('0x2B9e270d12bA5cE62ECe2c458db7b7B2939D19ae')
    const boots = FFNFT.attach('0x03467ad8Efe8BB73c0Dde0c436b7efAfE9FC3E32')
    const weapons = FFNFT.attach('0xDf82B488053b2F183D959969141B9896aB8C1efA')
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