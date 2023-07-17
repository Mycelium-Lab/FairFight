const { ethers } = require("hardhat");

async function main() {
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const weapons = FFNFT.attach('0x610178dA211FEF7D417bC0e6FeD39F05609AD788')
    await weapons.setBaseUri('https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/')
}

main().then(() => console.log('Done')).catch(err => console.log(err))