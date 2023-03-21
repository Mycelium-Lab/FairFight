const { upgrades, ethers } = require("hardhat")

async function main() {
  const amountToPlay = ethers.utils.parseEther('1');
  const [acc1] = await ethers.getSigners();
  const Game = await ethers.getContractFactory("Game");
  const game = await upgrades.deployProxy(Game, [amountToPlay, acc1.address, 15], { initializer: "initialize" });
  await game.deployed()

  console.log(
    `Game deployed to ${game.address}`
  );
// 0x36a858270f4b03fdddede202d0f1d79e4bcf1d5e13a85698882f8b5394b55aa0
// 0x8d5a8af94f0ae2275214b477f729291bc0b82388b2c9cc18360cb909394dbf43
    const data1 = ethers.utils.defaultAbiCoder.encode(
        [
            'uint256',
            'uint256',
            'uint256',
            'bytes32',
            'uint8',
            'bytes32'
        ], 
        [
            0, 
            0, 
            "2000000000000000000",
            "0x0be95d95920306a294d693fad73b921598258a0aecdf5c50f8cf1394808a3a62",
            27,
            "0x691ddc02488ca2718c64a0263ea5c979575b8e6f3478d22eaa1af27112e55480"
        ]
    )
  console.log(
    await game.getAccess(
        data1,
        "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
    )
  )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  