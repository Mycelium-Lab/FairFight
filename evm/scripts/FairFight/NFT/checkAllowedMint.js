const { ethers } = require("hardhat");

async function main() {
    const NFT = await ethers.getContractFactory("FairFightNFT")
    const nft = NFT.attach('0x03467ad8efe8bb73c0dde0c436b7efafe9fc3e32')
    console.log(await nft.symbol())
    // const Shop = await ethers.getContractFactory("FairFightShop")
    // const shop = Shop.attach('0x685b4bEf612229F3f246Ca08fA7E8a6240c18d2A')
    // await nft.setAllowedMint('0xe1174A16c4d4075c512080585E5B132816010c33', true)
    // console.log('Setted allowed mint')
    // console.log(await shop.prices(nft.address, '0x6b59C68405B0216C2C8ba1EC1f8DCcBd47892c58', '1'))
}

main().then(() => console.log('Done')).catch(err => console.log(err))