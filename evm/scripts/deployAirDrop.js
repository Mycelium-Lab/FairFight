// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat")

async function main() {
  const AirDrop = await ethers.getContractFactory("AirDrop")
  const airDrop = await AirDrop.deploy('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25', '0xD32a4f0dFE804D10c6cC4fAA87cfdBDAE915A2E0')
  await airDrop.deployed()
  console.log(
    `AirDrop deployed to ${airDrop.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
