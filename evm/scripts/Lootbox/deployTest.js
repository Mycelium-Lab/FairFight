const { ethers } = require("hardhat");
const { regularRarityPrizes, superiorRarityPrizes, rareRarityPrizes, legendaryRarityPrizes, epicRarityPrizes } = require('../utils/lootboxRarity')

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const signer = await ethers.getSigner()
    const price = await ethers.utils.parseEther('10')
    const token = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const characters = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
    const armors = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
    const boots = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
    const weapons = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
    const Lootbox = await ethers.getContractFactory("Lootbox")
    const lootbox = await Lootbox.deploy(
        regularRarityPrizes(characters, weapons, boots, armors),
        superiorRarityPrizes(characters, weapons, boots, armors),
        rareRarityPrizes(characters, weapons, boots, armors),
        legendaryRarityPrizes(characters, weapons, boots, armors),
        epicRarityPrizes(characters, weapons, boots, armors),
        price,
        signer.address,
        collector,
        token
    )
    await lootbox.deployed()
    console.log(`Lootbox contract deployed on address: ${lootbox.address}`)
}

main().then(console.log('done')).catch((err) => console.log(err))