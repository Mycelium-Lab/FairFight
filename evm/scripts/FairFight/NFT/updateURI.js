const { ethers } = require("hardhat");

async function main() {
    const FFNFT = await ethers.getContractFactory("FairFightNFT")
    const characters = FFNFT.attach('0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586')
    const armors = FFNFT.attach('0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A')
    const boots = FFNFT.attach('0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4')
    // const weapons = FFNFT.attach('0x4c04Eb1518Fa7395E954A0d7b6afe1cB226a21c6')
    console.log(`Characters`, await characters.baseURI())
    console.log(`Armors`, await armors.baseURI())
    console.log(`Boots`, await boots.baseURI())
    // console.log(`Weapons`, await weapons.baseURI())
    await characters.setBaseUri('https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/')
    await armors.setBaseUri('https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/')
    await boots.setBaseUri('https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/')
    // await weapons.setBaseUri('https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/')
}

main().then(() => console.log('Done')).catch(err => console.log(err))