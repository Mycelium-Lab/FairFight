// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat")

async function main() {
  // const [acc1] = await ethers.getSigners();
  const FairFight = await ethers.getContractFactory("FairFight");
  const fairFight = await upgrades.deployProxy(FairFight, 
    [
      '0xD32a4f0dFE804D10c6cC4fAA87cfdBDAE915A2E0', //signer
      10, //max rounds
      '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
      300, //fee
      ethers.utils.parseEther("1"), //min amount for one round
      2 //max players
    ], 
  { initializer: "initialize" });
  await fairFight.deployed()

  console.log(
    `FairFight to ${fairFight.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
