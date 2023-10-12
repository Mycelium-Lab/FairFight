const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = 10*10**6
    const token = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0xDa091ebf42532fA670F56205681E98ed7E5A386a')
    const armors = FFNFT.attach('0xc138f48191827CB9eBa84F581Cb43A5b4831dF65')
    const boots = FFNFT.attach('0x03c1162f0161480a25fEB6abd9136D6b2727253F')
    const weapons = FFNFT.attach('0x0ECf7540D6A969AA8ba130167C2E526A377515F3')
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