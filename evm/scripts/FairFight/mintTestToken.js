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
    //0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0
    //0x6aC2d8F07CEA9431075Ba20d5EE7A5944179b6Ea
    //0xED98091c7D2Fef365a4FE2BC14B2625813E056f6
    //0xBFaCA5eC344276F6ccce65602fbB62af0d5E3FeF
    // await token.mint(acc1.address, ethers.utils.parseEther('1000000'))
    // await token.mint('0x9054DB76442c69696E4Eb65eCbfa64Fc801CDCc6', ethers.utils.parseEther('1000000'))
    await token.mint('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', ethers.utils.parseEther('1000000'))
    // await token.mint('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7', ethers.utils.parseEther('1000000'))
    // await token.mint('0x2E539d5e4c1FFB4e187dE04C9Aead2D169b953D3', ethers.utils.parseEther('1000000'))
    // await token.mint('0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', ethers.utils.parseEther('1000000'))
    // await token.mint('0xCD7adc3d18386d27e91EC9Eb0D9A449089B38395', ethers.utils.parseEther('1000000'))
    // await token.mint('0xbED1EEdc17Bb6484DbE13f9a91b8A33033796Df9', ethers.utils.parseEther('1000000'))
    // await token.mint('0xa96E994e0F340ee814e8ac92974Ca847D10Fc1b8', ethers.utils.parseEther('1000000'))
    await token.mint('0xbDA5747bFD65F08deb54cb465eB87D40e51B197E', ethers.utils.parseEther('1000000'))
    // await token.approve('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', 0)
}

main()
.catch(err => console.log(err))