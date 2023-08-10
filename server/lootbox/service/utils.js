import { ethers } from "ethers";

export async function signLootbox(
    player,
    contractAddress,
    currentUserLoot,
    signer
) {
    const randomNumber = getRandomNumber(10000000, 100000000)
    const message = [randomNumber, player, contractAddress, currentUserLoot]
    const hashMessage = ethers.utils.solidityKeccak256([
        "uint256","uint160","uint160","uint256"
    ], message)
    const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
    const r = sign.substr(0, 66)
    const s = '0x' + sign.substr(66, 64);
    const v = parseInt("0x" + sign.substr(130,2));
    return { r, s, v, randomNumber }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}