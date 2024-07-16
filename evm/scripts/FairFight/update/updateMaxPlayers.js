const { ethers } = require("hardhat");

async function main() {
    const FairFight = await ethers.getContractFactory("FairFight");
    const ff = FairFight.attach('0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2')
    const tx = await ff.changeMaxPlayers(5)
    await tx.wait().then(() =>console.log('Done'))
}

main().catch(err => console.log(err))