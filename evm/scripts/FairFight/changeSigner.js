const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1] = await ethers.getSigners()
    let FairFight = await ethers.getContractFactory("FairFight")
    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    FairFight = FairFight.connect(wallet)
    const fairFight = FairFight.attach('0xCDcB3D4354486F0D4f8F776328aC9A21b27F0B5b')
    await fairFight.changeSigner(acc1.address)
}

main()
.catch(err => console.log(err))