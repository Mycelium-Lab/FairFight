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
      '0xAb1F38D350729e74B22E14e3254BaC70A10cb9e1', 
      15,
      10,
      '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
      300 //fee
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
