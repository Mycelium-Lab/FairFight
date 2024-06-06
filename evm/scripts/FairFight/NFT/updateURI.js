const { ethers } = require("hardhat");

async function main() {
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0x560Eb55F9f633368d378b059d7Fd32a5f7a914bE')
    const armors = FFNFT.attach('0x1ee6037Fc30Fb21cf488181e5E4a0FF4803e8C18')
    const boots = FFNFT.attach('0xFF66c9aBBEE861D82C55658945E38DCC1A4780FC')
    const weapons = FFNFT.attach('0x4c04Eb1518Fa7395E954A0d7b6afe1cB226a21c6')
    console.log(`Characters`, await characters.baseURI())
    console.log(`Armors`, await armors.baseURI())
    console.log(`Boots`, await boots.baseURI())
    console.log(`Weapons`, await weapons.baseURI())
    await characters.setBaseUri('https://ipfs.io/ipfs/QmdGpPVHvabzGmofEajr5okx4R5MyuyGBvQfTxnupDkrQ2/')
    await armors.setBaseUri('https://ipfs.io/ipfs/QmbkhgXUrv4UzvLzB21QJGqMtQMfmNdnQN22S7UH9HJSok/')
    await boots.setBaseUri('https://ipfs.io/ipfs/QmcBcszocmtgxtQfiBY5epoQkzXCnf6965NBmyN8JwnSqm/')
    await weapons.setBaseUri('https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/')
}

main().then(() => console.log('Done')).catch(err => console.log(err))