const { upgrades, ethers } = require("hardhat");
const { sign } = require("../../test/utils/sign");

async function main() {
    const [acc1] = await ethers.getSigners()

    console.log(
        await sign(
            1, 
            0, 
            '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
            '0x0000000000000000000000000000000000000000',
            '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            acc1
        )
    )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
