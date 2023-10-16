const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1] = await ethers.getSigners()
    const FairFight = await ethers.getContractFactory("FairFight")
    const ff = FairFight.attach("0x927C8aF4282E507352088c52014bC8423367c610")
    console.log(await ff.hasRole("0x0000000000000000000000000000000000000000000000000000000000000000", acc1.address))
    // await ff.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", "0x38aE865Add0b9715b6cfb6e5AA03810715078f9A")
}

main()
.catch(err => console.log(err))