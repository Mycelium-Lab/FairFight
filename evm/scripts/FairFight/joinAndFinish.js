const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function getShortStr(slot, contractAddress) {
    const storageLocation = await ethers.provider.getStorageAt(contractAddress, slot);
    return storageLocation;
  }

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    const FairFight = await ethers.getContractFactory("FairFight")
    // scale test MAIN CONTRACT
    // const fairFight = FairFight.attach('0xF9ff7BFd5bdd03B7B7ebAbaA1f43b9f5573a98f5')
    // scale test TEST CONTRACT
    const fairFight = FairFight.attach('0x073068dEeC83535569B29452e0448B60836ae335')
    // console.log(await fairFight.getSigner())
    // console.log(await getShortStr(4, fairFight.address))
    // console.log(await fairFight.connect(acc3).check2(
    //     2,
    //     '1000000000000',
    //     '0x6ac56539e254568e48276b3637e96052a9a79a4005c664ec86cc38379a95d765',
    //     28,
    //     '0x435bc8f77dcf5e89784bef572cb1452e4c33a9b76af6c3ce8b627ff7fb3dde37'
    // ))
    // const message = [2, '1000000000000', '1351057110', acc3.address, '0xF9ff7BFd5bdd03B7B7ebAbaA1f43b9f5573a98f5']
    // const hashMessage = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint256", "uint160", "uint160"], message)
    // console.log(hashMessage)
    let amountToPlay = ethers.utils.parseEther('0.000000001');
    let amountForOneDeath = ethers.utils.parseEther('0.0000000001');
    // await fairFight.create(amountForOneDeath, 10, 2, {value: amountToPlay})
    // const lastGame = await fairFight.getPlayerFullFights(acc1.address,(1).toString())
    // console.log(await fairFight.getChunkFights(0,10))
    // await fairFight.withdraw(1)
    const chainid = (await ethers.provider.getNetwork()).chainId
    // await fairFight.changeSigner(acc1.address)
    const fight = await fairFight.fights(1)
    await fairFight.connect(acc2).join(1, {value: fight.baseAmount})
    const signature1 = await sign(
        fight.ID.toString(), 
        fight.baseAmount.toString(), 
        chainid,
        wallet.address,
        fairFight.address,
        wallet
    )
    const signature2 = await sign(
        fight.ID.toString(), 
        fight.baseAmount.toString(), 
        chainid,
        acc2.address,
        fairFight.address,
        wallet
    )
    console.log(chainid, wallet.address)
    console.log(await fairFight.connect(wallet).check2(1, fight.baseAmount.toString(), signature1.r, signature1.v, signature1.s))
    console.log(await fairFight.getSigner())
    await fairFight.connect(wallet).finish(fight.ID, fight.baseAmount, signature1.r, signature1.v, signature1.s)
    // await fairFight.connect(acc2).finish(fight.ID, fight.baseAmount, signature2.r, signature2.v, signature2.s)
    console.log(await fairFight.fights(1))
    
}

main()
.catch(err => console.log(err))