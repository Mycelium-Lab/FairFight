const { ethers } = require("hardhat");

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    let Shop = await ethers.getContractFactory("FairFightCharacterShop")
    Shop = Shop.connect(wallet)
    const shop = await Shop.deploy(collector)
    await shop.deployed()
    console.log(`Shop deployed to ${shop.address}`)
    let amountInUSDPerCharacter0 = ethers.utils.parseEther('200')
    let amountInUSDPerCharacter1 = ethers.utils.parseEther('100')
    await shop.setCharacterUri(0, "https://ipfs.io/ipfs/QmQ8NWLnqubWgdLNrwhDroNTEYHa63cqY98ygNpXS8PjHU/0.json")
    await shop.setCharacterUri(1, "https://ipfs.io/ipfs/QmQ8NWLnqubWgdLNrwhDroNTEYHa63cqY98ygNpXS8PjHU/1.json")
    await shop.setAllowedToken('0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0', 0, amountInUSDPerCharacter0)
    await shop.setAllowedToken('0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0', 1, amountInUSDPerCharacter1)
    console.log(`Data set to shop characters`)
}

main()
    .catch(err => console.log(err))