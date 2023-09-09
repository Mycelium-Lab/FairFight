const { ethers } = require("hardhat");

async function main() {
    const FairFight = await ethers.getContractFactory("FairFight");
    const ff = FairFight.attach('0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54')
    await ff.finish('35', '10000000000000000000', '0x7e78a7c702eff435ad980b18f18f16fe7c3cafb973ab58824bb1d919e4cb92c6', '27', '0x78d0eba17eba2a69705ab99136450bac7a083ea349d70ddb59bafd50c59b8828')
    console.log('Done')
}

main().catch(err => console.log(err))