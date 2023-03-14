const { ethers } = require("hardhat")

async function createSing(ID, player1Amount, player2Amount, playerAddress, signer) {
    const message = [ID, player1Amount, player2Amount, playerAddress]
    const hashMessage = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message)
    const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
    const r = sign.substr(0, 66)
    const s = '0x' + sign.substr(66, 64);
    const v = parseInt("0x" + sign.substr(130,2));
    const data = ethers.utils.defaultAbiCoder.encode(
        [
            'uint256',
            'uint256',
            'uint256',
            'bytes32',
            'uint8',
            'bytes32'
        ], 
        [
            ID, 
            player1Amount, 
            player2Amount,
            r,
            v,
            s
        ]
    )
    return data;
}

async function main() {
    const Game = await ethers.getContractFactory("GameV2");
    const game = await Game.attach('0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE')
    const signer = await ethers.getSigner();
    const wallet = new ethers.Wallet('0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0', ethers.provider)
    const amountToPlay = ethers.utils.parseEther('1');
    const amountForOneDeath = ethers.utils.parseEther('1');
    for (let i = 0; i < 5; i++) {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        await game.connect(wallet).joinBattle(i, {value: amountToPlay})
        const data = await createSing(i, ethers.utils.parseEther('1'), ethers.utils.parseEther('1'), signer.address, signer)
        await game.finishBattle(data)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  