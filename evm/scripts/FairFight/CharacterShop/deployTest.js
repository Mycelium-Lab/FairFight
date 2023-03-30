const { ethers } = require("hardhat");

async function main() {
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const Shop = await ethers.getContractFactory("FairFightCharacterShop")
    const shop = await Shop.deploy(collector)
    await shop.deployed()
    console.log(`Shop deployed to ${shop.address}`)
    let amountInUSDPerCharacter0 = ethers.utils.parseEther('200')
    let amountInUSDPerCharacter1 = ethers.utils.parseEther('100')
    await shop.setCharacterUri(0, "https://ipfs.io/ipfs/QmQ8NWLnqubWgdLNrwhDroNTEYHa63cqY98ygNpXS8PjHU/0.json")
    await shop.setCharacterUri(1, "https://ipfs.io/ipfs/QmQ8NWLnqubWgdLNrwhDroNTEYHa63cqY98ygNpXS8PjHU/1.json")
    await shop.setAllowedToken('0x5FbDB2315678afecb367f032d93F642f64180aa3', 0, amountInUSDPerCharacter0)
    await shop.setAllowedToken('0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, amountInUSDPerCharacter1)
    console.log(`Data set to shop characters`)
}

main()
    .catch(err => console.log(err))