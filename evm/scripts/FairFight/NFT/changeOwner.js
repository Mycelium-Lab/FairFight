const { ethers } = require("hardhat");

async function main() {
    const newOwner = "0x38aE865Add0b9715b6cfb6e5AA03810715078f9A"
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const Shop = await ethers.getContractFactory("FairFightShop")
    const LootboxSapphire = await ethers.getContractFactory("Lootbox")
    const shop = Shop.attach('0xF6bed30A1c8dfFe5a36f42489fd6be8156AdcCd7')
    const characters = FFNFT.attach('0xe30E4153BcF8420BA7d3FFC28b2772D9Fdb1b82A')
    const armors = FFNFT.attach('0xC651C073E8D2f3eE28a9d2E1ac96ecbC8a90CcCB')
    const boots = FFNFT.attach('0x7E2e1812f8C2414da8D5Bfce9c8476B0C477543E')
    const weapons = FFNFT.attach('0xBcd0534481daB584ae3D458d274FDD65d537cDb7')
    const lootbox = LootboxSapphire.attach("0x8E4c7cB32b6A454804E27743f119258d6A6D9Ae0")
    // await shop.transferOwnership(newOwner)
    // await characters.transferOwnership(newOwner)
    // await armors.transferOwnership(newOwner)
    // await boots.transferOwnership(newOwner)
    // await weapons.transferOwnership(newOwner)
    // await lootbox.transferOwnership(newOwner)
    console.log(await shop.owner())
    console.log(await characters.owner())
    console.log(await armors.owner())
    console.log(await boots.owner())
    console.log(await lootbox.owner())
    console.log(await weapons.owner())
}

main().catch(err => console.log(err))