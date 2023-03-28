const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1] = await ethers.getSigners()
    let FairFight = await ethers.getContractFactory("FairFight")
    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    FairFight = FairFight.connect(wallet)
    const fairFight = FairFight.attach('0xBeBF242338794e8ED107687F62d3AFfd05FfCf6F')
    await fairFight.changeSigner(wallet.address)
}

main()
.catch(err => console.log(err))