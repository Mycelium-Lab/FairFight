const { ethers } = require("hardhat");

async function main() {
    const decimals = 18
    const token = "0x6b59C68405B0216C2C8ba1EC1f8DCcBd47892c58"
    const Shop = await ethers.getContractFactory("FairFightShop")
    const shop = Shop.attach('0xBaCb197E601aCdeb56E401Bc27A23F4626315a82')
    const nftAddress = '0x08ee54157DdAF89eEF5fB71a24E7c72C57a6640A'
    const nftTypeId = '12'
    const newPrice = Math.round(59.9 * 10**decimals).toString()
    await shop.setPrice(nftAddress, token, nftTypeId, newPrice)
}

main().then(() => console.log('Done')).catch(err => console.log(err))