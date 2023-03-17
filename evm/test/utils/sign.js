const { upgrades, ethers } = require("hardhat")

async function sign(
    ID,
    amount,
    chainid,
    player,
    contractAddress,
    signer
) {
    const message = [ID, amount, chainid, player,contractAddress]
    const hashMessage = ethers.utils.solidityKeccak256([
        "uint256","uint256","uint256","uint160","uint160"
    ], message)
    const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
    const r = sign.substr(0, 66)
    const s = '0x' + sign.substr(66, 64);
    const v = parseInt("0x" + sign.substr(130,2));
    return {r,s,v}
}

module.exports = {
    sign
}