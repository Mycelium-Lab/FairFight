const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function getShortStr(slot, contractAddress) {
    const storageLocation = await ethers.provider.getStorageAt(contractAddress, slot);
    return storageLocation;
  }

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    const Token = await ethers.getContractFactory("TokenForTests")
    const token = Token.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3')
    await token.mint(acc1.address, ethers.utils.parseEther('1000000'))
    await token.mint('0xbDA5747bFD65F08deb54cb465eB87D40e51B197E', ethers.utils.parseEther('1000000'))
    // await token.approve('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', 0)
}

main()
.catch(err => console.log(err))