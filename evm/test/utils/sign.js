const { upgrades, ethers } = require("hardhat")

async function sign(
    ID,
    amount,
    player,
    tokenAddress,
    contractAddress,
    signer
) {
    const message = [ID, amount, tokenAddress, player,contractAddress]
    const hashMessage = ethers.utils.solidityKeccak256([
        "uint256","uint256","uint160","uint160","uint160"
    ], message)
    const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
    const r = sign.substr(0, 66)
    const s = '0x' + sign.substr(66, 64);
    const v = parseInt("0x" + sign.substr(130,2));
    return {r,s,v}
}

async function signLootbox(
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
    return {r,s,v, randomNumber}
}

async function signFightOutcome(
    fightId,
    claimant,
    nonce,
    deadline,
    contractAddress,
    signer,
    chainId
) {
    const network = await signer.provider.getNetwork()
    const domain = {
        name: "FairFight",
        version: "2",
        chainId: chainId === undefined ? network.chainId : chainId,
        verifyingContract: contractAddress
    }
    const types = {
        FightOutcome: [
            { name: "fightId", type: "uint256" },
            { name: "claimant", type: "address" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    }
    return signer._signTypedData(domain, types, { fightId, claimant, nonce, deadline })
}

async function signLootboxCommit(
    commitment,
    player,
    contractAddress,
    currentUserLoot,
    signer
) {
    const hashMessage = ethers.utils.solidityKeccak256(
        ["bytes32", "address", "address", "uint256"],
        [commitment, player, contractAddress, currentUserLoot]
    )
    const signature = await signer.signMessage(ethers.utils.arrayify(hashMessage))
    return ethers.utils.splitSignature(signature)
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    sign,
    signLootbox,
    signFightOutcome,
    signLootboxCommit
}
