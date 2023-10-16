const { ethers } = require("hardhat");

async function main() {
    const decimals = 18
    const collector = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const token = "0x55d398326f99059ff775485246999027b3197955"
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const Shop = await ethers.getContractFactory("FairFightShop")
    const characters = FFNFT.attach("0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4")
    const armors = FFNFT.attach("0xe10cd6c65af7637ad8329f0adb161a968101bf86")
    const boots = FFNFT.attach("0x2b9e270d12ba5ce62ece2c458db7b7b2939d19ae")
    const weapons = FFNFT.attach("0x03467ad8efe8bb73c0dde0c436b7efafe9fc3e32")
    let charactersPrices = [
        Math.round(50 * 10**decimals).toString(),
        Math.round(20 * 10**decimals).toString(),
        Math.round(15 * 10**decimals).toString(),
        Math.round(15 * 10**decimals).toString(),
        Math.round(5 * 10**decimals).toString(),
        Math.round(10 * 10**decimals).toString(),
        Math.round(15 * 10**decimals).toString()
    ]
    let armorsPrices = [
        Math.round(2.99 * 10**decimals).toString(),
        Math.round(9.9 * 10**decimals).toString(),
        Math.round(17.9 * 10**decimals).toString(),
        Math.round(29.9 * 10**decimals).toString(),
        Math.round(34.9 * 10**decimals).toString(),
        Math.round(47.9 * 10**decimals).toString(),
        Math.round(77.7 * 10**decimals).toString(),
        Math.round(99.9 * 10**decimals).toString()
    ]
    let bootsPrices = [
        Math.round(4.3 * 10**decimals).toString(),
        Math.round(9.9 * 10**decimals).toString(),
        Math.round(17.9 * 10**decimals).toString(),
        Math.round(31.9 * 10**decimals).toString(),
        Math.round(51.9 * 10**decimals).toString(),
        Math.round(65.9 * 10**decimals).toString(),
        Math.round(77.7 * 10**decimals).toString(),
        Math.round(99.9 * 10**decimals).toString()
    ]
    let weaponsPrices = [
        Math.round(4.9 * 10**decimals).toString(),
        Math.round(4.2 * 10**decimals).toString(),
        Math.round(15.5 * 10**decimals).toString(),
        Math.round(3.7 * 10**decimals).toString(),
        Math.round(18.99 * 10**decimals).toString(),
        Math.round(22.9 * 10**decimals).toString(),
        Math.round(22.9 * 10**decimals).toString(),
        Math.round(25.9 * 10**decimals).toString(),
        Math.round(27.9 * 10**decimals).toString(),
        Math.round(29.9 * 10**decimals).toString(),
        Math.round(26.9 * 10**decimals).toString(),
        Math.round(39.9 * 10**decimals).toString(),
        Math.round(29.9 * 10**decimals).toString(),
        Math.round(77.9 * 10**decimals).toString(),
        Math.round(32.99* 10**decimals).toString(),
        Math.round(42.99* 10**decimals).toString(),
        Math.round(49.99* 10**decimals).toString(),
        Math.round(27* 10**decimals).toString(),
        Math.round(40* 10**decimals).toString(),
        Math.round(72.99* 10**decimals).toString(),
        Math.round(24* 10**decimals).toString(),
        Math.round(33.99* 10**decimals).toString(),
        Math.round(51.99* 10**decimals).toString(),
        Math.round(14.99* 10**decimals).toString(),
        Math.round(35.99* 10**decimals).toString(),
        Math.round(74.99* 10**decimals).toString(),
        Math.round(22.99* 10**decimals).toString(),
        Math.round(39.99* 10**decimals).toString(),
        Math.round(73.99* 10**decimals).toString(),
        Math.round(19.99* 10**decimals).toString(),
        Math.round(28.99* 10**decimals).toString(),
        Math.round(29.5* 10**decimals).toString(),
        Math.round(86.99* 10**decimals).toString(),
        Math.round(12.99* 10**decimals).toString(),
        Math.round(15.99* 10**decimals).toString(),
        Math.round(40.99* 10**decimals).toString(),
        Math.round(35.99* 10**decimals).toString(),
        Math.round(17.99* 10**decimals).toString(),
        Math.round(60.99* 10**decimals).toString(),
        Math.round(18.99* 10**decimals).toString(),
        Math.round(24.99* 10**decimals).toString(),
        Math.round(13.99* 10**decimals).toString(),
        Math.round(59.9* 10**decimals).toString(),
        Math.round(23.99* 10**decimals).toString(),
        Math.round(27.99* 10**decimals).toString(),
        Math.round(18.99* 10**decimals).toString(),
        Math.round(27.99* 10**decimals).toString(),
        Math.round(82.99* 10**decimals).toString(),
        Math.round(56.99* 10**decimals).toString(),
        Math.round(66.9* 10**decimals).toString(),
        Math.round(39.99* 10**decimals).toString(),
        Math.round(99.99* 10**decimals).toString(),
        Math.round(20.99* 10**decimals).toString(),
        Math.round(27.99* 10**decimals).toString(),
        Math.round(33.99* 10**decimals).toString(),
        Math.round(37.99* 10**decimals).toString(),
        Math.round(16.99* 10**decimals).toString(),
        Math.round(25.99* 10**decimals).toString(),
        Math.round(15.99* 10**decimals).toString(),
        Math.round(16.99* 10**decimals).toString(),
        Math.round(24.99* 10**decimals).toString(),
        Math.round(31.99* 10**decimals).toString(),
        Math.round(63.99* 10**decimals).toString(),
        Math.round(17.99* 10**decimals).toString(),
        Math.round(28.99* 10**decimals).toString(),
        Math.round(13.99* 10**decimals).toString(),
        Math.round(16.99* 10**decimals).toString(),
        Math.round(59.99* 10**decimals).toString(),
        Math.round(61.99* 10**decimals).toString(),
        Math.round(42.99* 10**decimals).toString(),
        Math.round(36.99* 10**decimals).toString(),
        Math.round(5.99* 10**decimals).toString(),
        Math.round(12.99* 10**decimals).toString(),
        Math.round(22.99* 10**decimals).toString(),
        Math.round(17.99* 10**decimals).toString(),
        Math.round(38.99* 10**decimals).toString(),
        Math.round(62.99* 10**decimals).toString(),
        Math.round(29.99* 10**decimals).toString(),
        Math.round(75.99* 10**decimals).toString(),
        Math.round(72.99* 10**decimals).toString(),
        Math.round(53.99* 10**decimals).toString(),
        Math.round(30.99* 10**decimals).toString(),
        Math.round(35.99* 10**decimals).toString(),
        Math.round(70.99* 10**decimals).toString(),
        Math.round(74.99* 10**decimals).toString(),
        Math.round(3.99* 10**decimals).toString(),
        Math.round(4.99* 10**decimals).toString(),
        Math.round(11.99* 10**decimals).toString(),
        Math.round(4.49* 10**decimals).toString(),
        Math.round(3.33* 10**decimals).toString(),
        Math.round(4.99* 10**decimals).toString(),
        Math.round(9.99* 10**decimals).toString(),
        Math.round(23.99* 10**decimals).toString(),
        Math.round(4.39* 10**decimals).toString(),
        Math.round(10.99* 10**decimals).toString(),
        Math.round(19.99* 10**decimals).toString(),
        Math.round(15.99* 10**decimals).toString(),
        Math.round(3* 10**decimals).toString(),
        Math.round(32.99* 10**decimals).toString(),
        Math.round(33.99* 10**decimals).toString(),
        Math.round(55.55* 10**decimals).toString(),
        Math.round(17.99* 10**decimals).toString(),
        Math.round(66.66* 10**decimals).toString(),
        Math.round(69.99* 10**decimals).toString(),
        Math.round(39.99* 10**decimals).toString(),
        Math.round(63.99* 10**decimals).toString(),
        Math.round(74.99* 10**decimals).toString(),
        Math.round(22.22* 10**decimals).toString(),
        Math.round(79.99* 10**decimals).toString(),
        Math.round(44.9* 10**decimals).toString(),
        Math.round(95.99* 10**decimals).toString(),
        Math.round(27.99* 10**decimals).toString(),
        Math.round(82.99* 10**decimals).toString(),
        Math.round(13.99* 10**decimals).toString(),
        Math.round(23.99* 10**decimals).toString(),
        Math.round(73.99* 10**decimals).toString(),
        Math.round(8.99* 10**decimals).toString(),
        Math.round(12.99* 10**decimals).toString(),
        Math.round(19.99* 10**decimals).toString(),
        Math.round(6.99* 10**decimals).toString(),
        Math.round(99.99* 10**decimals).toString(),
        Math.round(99.99* 10**decimals).toString(),
        Math.round(22.22* 10**decimals).toString(),
        Math.round(88.88* 10**decimals).toString(),
        Math.round(25* 10**decimals).toString(),
        Math.round(16.99* 10**decimals).toString(),
        Math.round(75* 10**decimals).toString(),
        Math.round(18.99* 10**decimals).toString(),
        Math.round(23.99* 10**decimals).toString(),
        Math.round(47.5* 10**decimals).toString(),
        Math.round(30* 10**decimals).toString(),
        Math.round(44.99* 10**decimals).toString(),
        Math.round(99* 10**decimals).toString()
    ]
    const shop = await Shop.deploy(
        characters.address,
        weapons.address,
        armors.address,
        boots.address,
        token,
        charactersPrices,
        weaponsPrices,
        armorsPrices,
        bootsPrices,
        collector
    )
    await shop.deployed()
    await characters.setAllowedMint(shop.address, true)
    await armors.setAllowedMint(shop.address, true)
    await weapons.setAllowedMint(shop.address, true)
    await boots.setAllowedMint(shop.address, true)
    // await shop.setAllPrices(characters.address, ethers.constants.AddressZero, charactersPrices)
    // await shop.setAllPrices(armors.address, ethers.constants.AddressZero, armorsPrices)
    // await shop.setAllPrices(weapons.address, ethers.constants.AddressZero, weaponsPrices)
    // await shop.setAllPrices(boots.address, ethers.constants.AddressZero, bootsPrices)
    console.log(`Shop deployed to ${shop.address}`)
}

main()
    .catch(err => console.log(err))