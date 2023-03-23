// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat");
const { sign } = require("../../test/utils/sign");
require('dotenv').config()

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const Token = await ethers.getContractFactory('TokenForTests')
    const token = await Token.deploy('TokenForTests', 'USDT')
    await token.deployed()
    const allowedTokens = [{
        address: token.address,
        minAmount: ethers.utils.parseEther("1")
    }]
    const chain = await ethers.provider.getNetwork()
    const chainid = chain.chainId
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider)
    let FairFight = await ethers.getContractFactory("FairFight");
    let signerAddress;
    if (chainid != 31337) {
        FairFight = FairFight.connect(wallet)
        signerAddress = wallet.address
    } else {
        signerAddress = acc1.address
    }
    const fairFight = await upgrades.deployProxy(FairFight, 
      [
        signerAddress, //signer
        10, //max rounds
        '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
        300, //fee
        ethers.utils.parseEther("0.0000000001"), //min amount for one round
        2 //max players
      ], 
    { initializer: "initialize" });
    await fairFight.deployed()
    
    console.log(
      `FairFight deployed on address ${fairFight.address} on chain ${chainid}`
    );

    for (let i = 0; i < allowedTokens.length; i++) {
        await fairFight.changeMinAmountPerRound(allowedTokens[i].address, allowedTokens[i].minAmount)
        console.log(`Token: ${allowedTokens[i].address} allowed to use in game from amount: ${allowedTokens[i].minAmount}`)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});