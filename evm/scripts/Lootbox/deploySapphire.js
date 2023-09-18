const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = await ethers.utils.parseEther('10')
    const token = '0x6b59C68405B0216C2C8ba1EC1f8DCcBd47892c58'
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0x560Eb55F9f633368d378b059d7Fd32a5f7a914bE')
    const armors = FFNFT.attach('0x1ee6037Fc30Fb21cf488181e5E4a0FF4803e8C18')
    const boots = FFNFT.attach('0xFF66c9aBBEE861D82C55658945E38DCC1A4780FC')
    const weapons = FFNFT.attach('0x4c04Eb1518Fa7395E954A0d7b6afe1cB226a21c6')
    const Lootbox = await ethers.getContractFactory("LootboxSapphire")
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