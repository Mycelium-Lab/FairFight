const { ethers } = require("hardhat");

async function main() {
    const token = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const Shop = await ethers.getContractFactory("FairFightShop")
    const shop = Shop.attach('0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e')
    const nftAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
    for (let i = 0; i <= 132; i++) {
        try {
            await shop.buy(nftAddress, token, i)
        } catch (error) {
            console.log(error)
        }
    }
}

main().then(() => console.log('Done')).catch(err => console.log(err))