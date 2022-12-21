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
  const AirDrop = await ethers.getContractFactory("AirDrop")
  const game = await upgrades.deployProxy(Game, 
    [
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', //signer
      15, //_amountUserGamesToReturn
      255, //max rounds
      '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
      300, //fee
      ethers.utils.parseEther("1")
    ], 
  { initializer: "initialize" });
  await game.deployed()
  const airDrop = await AirDrop.deploy(game.address, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  await airDrop.deployed()
  await acc1.sendTransaction({to: airDrop.address, from: acc1.address, value: ethers.utils.parseEther('100')})
  console.log(
    `Game deployed to ${game.address}`
  );
  console.log(
    `AirDrop deployed to ${airDrop.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
