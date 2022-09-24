const { upgrades, ethers } = require("hardhat")

async function main() {
    const [signer, acc] = await ethers.getSigners()
    const jump = 150
    const hash = ethers.utils.solidityKeccak256(["uint256"], [jump])
    const sign = await signer.signMessage(ethers.utils.arrayify(hash));
    const address = await ethers.utils.verifyMessage(ethers.utils.arrayify(hash), sign)
    console.log(
        address,
        signer.address
    )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  