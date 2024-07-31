const { ethers } = require("hardhat");

async function main() {
    const multicall = await ethers.getContractFactory("MulticallNFT");
    const multicallContract = await multicall.deploy();
    await multicallContract.deployed();
    console.log("Multicall deployed to:", multicallContract.address);
}

main()
    .catch(err => console.log(err))