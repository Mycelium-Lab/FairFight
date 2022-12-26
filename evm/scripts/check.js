const { upgrades, ethers } = require("hardhat")

async function main() {
    const signer = await hre.ethers.getSigner()
    const Game = await hre.ethers.getContractFactory("Game");
    const game = Game.attach('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25')
    console.log(await game.battles('13'))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  