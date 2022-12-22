const { upgrades, ethers } = require("hardhat")

async function main() {
    const signer = await hre.ethers.getSigner()
    const AirDrop = await hre.ethers.getContractFactory("AirDrop");
    const airdrop = AirDrop.attach('0x3c7ac716c340929B1579cbBD665C3D5338759d68')
    // console.log(await ethers.provider.getBalance(airdrop.address))
    console.log(await airdrop.signerAccess())
    // const wallet = new ethers.Wallet('0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0', ethers.provider)
    // await airdrop.connect(signer).withdrawOwner()
    // console.log(await ethers.provider.getBalance(airdrop.address))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  