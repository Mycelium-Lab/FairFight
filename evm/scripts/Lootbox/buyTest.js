const { ethers } = require("hardhat");

async function main() {
    const Lootbox = await ethers.getContractFactory("LootboxSapphire")
    const lootbox = Lootbox.attach('0x020E4d6Fb3B8abB8d0f4318C54cd3594d7844818')
    await lootbox.buyNative({value: ethers.utils.parseEther('10')})
    // const Shop = await ethers.getContractFactory("FairFightShop")
    // const shop = Shop.attach('0x685b4bEf612229F3f246Ca08fA7E8a6240c18d2A')
    // await nft.setAllowedMint('0xe1174A16c4d4075c512080585E5B132816010c33', true)
    // console.log('Setted allowed mint')
    // console.log(await shop.prices(nft.address, '0x6b59C68405B0216C2C8ba1EC1f8DCcBd47892c58', '1'))
}

main().then(() => console.log('Done')).catch(err => console.log(err))