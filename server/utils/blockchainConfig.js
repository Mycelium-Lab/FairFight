import { ethers } from "ethers"
import { contractAbi, lootboxAbi, networks, nftAbi, shopAbi } from "../../contract/contract.js"

export default function blockchainConfig(chainid) {
    const network = networks.find(n => n.chainid == chainid)
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    const signer = new ethers.Wallet(network.privateKey, provider)
    const _contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
    let shop
    let characters
    let armors
    let weapons
    let boots
    let lootbox
    if (network.shopAddress) {
        shop = new ethers.Contract(network.shopAddress, shopAbi, signer)
        characters = new ethers.Contract(network.charactersAddress, nftAbi, signer)
        armors = new ethers.Contract(network.armorsAddress, nftAbi, signer)
        weapons = new ethers.Contract(network.weaponsAddress, nftAbi, signer)
        boots = new ethers.Contract(network.bootsAddress, nftAbi, signer)
    } 
    if (network.lootboxAddress) {
        lootbox = new ethers.Contract(network.lootboxAddress, lootboxAbi, signer)
    }
    return {contract: _contract, signer, shop, characters, armors, weapons, boots, lootbox};
}