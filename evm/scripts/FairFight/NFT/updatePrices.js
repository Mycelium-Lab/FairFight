const { ethers } = require("hardhat");

async function main() {
    const decimals = 6
    const token = "0xdC19A122e268128B5eE20366299fc7b5b199C8e3"
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const Shop = await ethers.getContractFactory("FairFightShop")
    const shop = Shop.attach('0xFEd863cAb6B070a64D3613bD055Be0E647E4D98d')
    const characters = FFNFT.attach('0xA18CEbC58aaA1B647cD20901892dfD7999ef9499')
    const armors = FFNFT.attach('0xc73f96FCec6883dFfaBe3f89b09dd8Fa0Fc3c17e')
    const boots = FFNFT.attach('0x8513FA22e1b8e324Cd3aA4CdEC9168ff50d1991d')
    const weapons = FFNFT.attach('0x58C36887ce7293cC9CFbd809A23748A80Aabd840')
    let charactersPrices = [
        50 * 10**decimals,
        20 * 10**decimals,
        15 * 10**decimals,
        15 * 10**decimals,
        5 * 10**decimals,
        10 * 10**decimals,
        15 * 10**decimals
    ]
    let armorsPrices = [
        9.99 * 10**decimals,
        49.9 * 10**decimals,
        49.9 * 10**decimals,
        149.9 * 10**decimals,
        149.9 * 10**decimals,
        199.9 * 10**decimals,
        499 * 10**decimals,
        999 * 10**decimals
    ]
    let bootsPrices = [
        14.9 * 10**decimals,
        41.9 * 10**decimals,
        222 * 10**decimals,
        145 * 10**decimals,
        444 * 10**decimals,
        499 * 10**decimals,
        888 * 10**decimals,
        999 * 10**decimals
    ]
    let weaponsPrices = [
        17.9 * 10**decimals,
        14.9 * 10**decimals,
        40 * 10**decimals,
        39.9 * 10**decimals,
        59.9 * 10**decimals,
        149 * 10**decimals,
        199.9 * 10**decimals,
        499 * 10**decimals,
        199 * 10**decimals,
        599 * 10**decimals,
        555 * 10**decimals,
        580 * 10**decimals,
        777 * 10**decimals,
        888 * 10**decimals
    ]
    await shop.setAllPrices(characters.address, token, charactersPrices)
    await shop.setAllPrices(armors.address, token, armorsPrices)
    await shop.setAllPrices(weapons.address, token, weaponsPrices)
    await shop.setAllPrices(boots.address, token, bootsPrices)
}

main()
    .catch(err => console.log(err))