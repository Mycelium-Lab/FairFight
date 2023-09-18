const { ethers } = require("hardhat");

async function main() {
    const NFT = await ethers.getContractFactory("FairFightNFT")
    const nft = NFT.attach('0x4d456cee51F599f70231fB0Fec95274E349db99f')
    const Shop = await ethers.getContractFactory("FairFightShop")
    const shop = Shop.attach('0x3017385EA01B9d434181Db082921d24F335D250A')
    // await nft.setAllowedMint(shop.address, true)
    console.log(await shop.prices(nft.address, '0x6b59C68405B0216C2C8ba1EC1f8DCcBd47892c58', '1'))
}

main().then(() => console.log('Done')).catch(err => console.log(err))