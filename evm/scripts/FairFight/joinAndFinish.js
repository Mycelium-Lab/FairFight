const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const FairFight = await ethers.getContractFactory("FairFight")
    const fairFight = FairFight.attach('0x42746829041260Dd49C2bB2A22BD804d60A6f0F9')
    let amountToPlay = ethers.utils.parseEther('1');
    let amountForOneDeath = ethers.utils.parseEther('1');
    // await fairFight.create(amountForOneDeath, 1, 2, {value: amountToPlay})
    // const lastGame = await fairFight.getPlayerFullFights(acc1.address,(1).toString())
    console.log(await fairFight.getChunkFights(0,10))
    // const chainid = (await ethers.provider.getNetwork()).chainId
    // await fairFight.changeSigner(acc1.address)
    // await fairFight.connect(acc2).join(lastGame, {value: fight.baseAmount})
    // const signature1 = await sign(
    //     fight.ID, 
    //     fight.baseAmount, 
    //     chainid,
    //     acc1.address,
    //     fairFight.address,
    //     acc1
    // )
    // const signature2 = await sign(
    //     fight.ID, 
    //     fight.baseAmount, 
    //     chainid,
    //     acc2.address,
    //     fairFight.address,
    //     acc1
    // )
    // await fairFight.finish(fight.ID, fight.baseAmount, signature1.r, signature1.v, signature1.s)
    // await fairFight.connect(acc2).finish(fight.ID, fight.baseAmount, signature2.r, signature2.v, signature2.s)
}

main()
.catch(err => console.log(err))