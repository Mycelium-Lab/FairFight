// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat");
const { sign } = require("../../test/utils/sign");

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const chain = await ethers.provider.getNetwork()
    const chainid = chain.chainId

    let FairFight = await ethers.getContractFactory("FairFight");
    const fairFight = await upgrades.deployProxy(FairFight, 
      [
        acc1.address, //signer
        10, //max rounds
        '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
        300, //fee
        ethers.utils.parseEther("1"), //min amount for one round
        2 //max players
      ], 
    { initializer: "initialize" });
    await fairFight.deployed()
    
    console.log(
      `FairFight to ${fairFight.address} on chain ${chainid}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
