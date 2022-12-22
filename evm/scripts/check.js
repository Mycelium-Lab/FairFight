const { upgrades, ethers } = require("hardhat")

async function main() {
    const signer = await hre.ethers.getSigner()
    const Game = await hre.ethers.getContractFactory("GameV2");
    const game = Game.attach('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25')
    let openBattles = await game.getChunkFinishedBattles(0, 10)
    openBattles = [...openBattles, await game.getChunkFinishedBattles(1, 10)]
    openBattles = [...openBattles, await game.getChunkFinishedBattles(2, 10)]
    openBattles = [...openBattles, await game.getChunkFinishedBattles(3, 10)]
    openBattles = [...openBattles, await game.getChunkFinishedBattles(4, 10)]
    openBattles = openBattles.filter(v => v.player2 == '0x0000000000000000000000000000000000000000' && v.finished == false)
    console.log(openBattles)
    console.log(openBattles.length)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  