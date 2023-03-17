const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const FairFight = await ethers.getContractFactory("FairFight")
    const fairFight = FairFight.attach('0x64BB70e1e2f776D95dE00676D8332e6aD5217195')
    let amountToPlay = ethers.utils.parseEther('1');
    let amountForOneDeath = ethers.utils.parseEther('0.1');
    await fairFight.create(amountForOneDeath, 10, 2, {value: amountToPlay})
    const lastGame = await fairFight.lastPlayerFight(acc1.address)
    // const fight = await fairFight.fights(lastGame)
    console.log(lastGame)
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