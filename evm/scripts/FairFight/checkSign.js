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

    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    
    console.log(
        await sign(1, 1, chainid, acc1.address, acc1.address, acc1.address, acc1)
    )
    console.log(
        await sign(1, 1, chainid, acc1.address, acc1.address, acc1.address, wallet)
    )

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
