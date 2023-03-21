const { upgrades, ethers } = require("hardhat")
const { getImplementationAddress, getAdminAddress } = require('@openzeppelin/upgrades-core');

async function main() {
    // const signer = await ethers.getSigner()
    const GameV3 = await ethers.getContractFactory("GameV3");
    // const gameV2 = await upgrades.forceImport('0x0b97a986D6A8C25F29a110A1Cb7402624453d4d1', await ethers.getContractFactory("GameV2"))
    // const gameV3 = await upgrades.upgradeProxy("0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25", GameV3)
    // console.log(await getAdminAddress(ethers.provider, '0x0b97a986D6A8C25F29a110A1Cb7402624453d4d1'))
    // console.log(await ethers.provider.getStorageAt('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25', '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'))
    // await upgrades.admin.transferProxyAdminOwnership('0x0B306BF915C4d645ff596e518fAf3F9669b97016')
    // console.log(await upgrades.getUpgrader('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25', signer))
    const gameV3 = await GameV3.attach('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25')
    // const gameV3 = await GameV3.attach('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25')
    // const amountToPlay = ethers.utils.parseEther('1');
    // const amountForOneDeath = ethers.utils.parseEther('1');
    // await gameV3.createBattle(amountForOneDeath, {value: amountToPlay})
    // console.log(await gameV3.battles(340))
    // console.log(await gameV3.openBattles())
    const chunk = await gameV3.getChunkFinishedBattles(0, 10)
    console.log(chunk)
    // .then(async (tx) => {
    //     await tx.wait()
    //     .then((data) => console.log(data.events[0]))
    // })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  