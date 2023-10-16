const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = (10*10**18).toString()
    const token = '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3'
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2')
    const armors = FFNFT.attach('0x2784e030B259D6E79D5c33275296d478110129C0')
    const boots = FFNFT.attach('0x159d80fcFaC328Cb0400E1265F4c79138C4dD376')
    const weapons = FFNFT.attach('0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586')
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