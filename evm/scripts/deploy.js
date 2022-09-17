// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat")

async function main() {
  const [acc1] = await ethers.getSigners();
  const Game = await ethers.getContractFactory("Game");
  const game = await upgrades.deployProxy(Game, 
    [
      '0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7', 
      15,
      10
    ], 
  { initializer: "initialize" });
  await game.deployed()

  console.log(
    `Game deployed to ${game.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});