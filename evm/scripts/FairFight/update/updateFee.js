
const { ethers } = require("hardhat");

async function main() {
    const FairFight = await ethers.getContractFactory("FairFight");
    const ff = FairFight.attach('0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54')
    await ff.changeFee(500)
    console.log('Done')
}

main().catch(err => console.log(err))