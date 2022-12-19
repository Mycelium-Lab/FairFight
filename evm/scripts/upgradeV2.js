const { upgrades, ethers } = require("hardhat")

async function main() {
    const GameV2 = await ethers.getContractFactory("GameV2");
    const gameV2 = await upgrades.upgradeProxy("0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25", GameV2)
    const chunk = await gameV2.getChunkFinishedBattles(0, 10)
    console.log(chunk)
    // .then(async (tx) => {
    //     await tx.wait()
    //     .then((data) => console.log(data.events[0]))
    // })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  