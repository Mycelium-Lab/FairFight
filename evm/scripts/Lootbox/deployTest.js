const { ethers } = require("hardhat");

async function main() {
    const signer = await ethers.getSigner()
    const nftsArray = [
        '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',   //charactersAddress
        '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',   //armorsAddress
        '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',   //bootsAddress
        '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'    //weaponsAddress
    ]
    const propertiesArray = [
        [1, 3], 
        [5, 6], 
        [2, 4], 
        [8, 9]
    ]
    const Lootbox = await ethers.getContractFactory("Lootbox")
    const lootbox = await Lootbox.deploy(
        nftsArray, 
        propertiesArray,
        signer.address
    )
    await lootbox.deployed()
    console.log(`Lootbox contract deployed on address: ${lootbox.address}`)
}

main().then(console.log('done')).catch((err) => console.log(err))