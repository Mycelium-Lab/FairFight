// Proves the whole money path end to end on the local chain: the referee attests a
// winner, the winner settles and claims, and the escrow lands where it should.
//
//   npx hardhat run scripts/local/settleSeededFight.js --network localhost
//
// Reads deployment.local.json written by deployAndSeed.js.

const fs = require('fs')
const path = require('path')
const { ethers } = require('hardhat')
const { signFightOutcome } = require('../../test/utils/sign')

const BASIS_POINTS = 10000

async function main() {
    const deployment = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../../deployment.local.json'), 'utf8')
    )
    const [referee, player1, player2] = await ethers.getSigners()
    const fairFight = await ethers.getContractAt('FairFightV2', deployment.contractAddress)

    const fightId = deployment.seededFight.id
    const before = await fairFight.fights(fightId)
    console.log('fight', fightId, 'status', before.status, 'escrowed', ethers.utils.formatEther(before.escrowed), 'ETH')

    // The backend decides player2 won and signs only that fact - no amount is signed.
    const winner = player2
    const nonce = await fairFight.nonces(winner.address)
    const deadline = Math.floor(Date.now() / 1000) + 3600
    const signature = await signFightOutcome(
        fightId, winner.address, nonce, deadline, fairFight.address, referee
    )

    const winnerBalanceBefore = await ethers.provider.getBalance(winner.address)
    const feeCollectorBefore = await ethers.provider.getBalance(deployment.feeCollector)

    const finishTx = await fairFight.connect(winner).finish(fightId, winner.address, nonce, deadline, signature)
    const finishReceipt = await finishTx.wait()
    console.log('settled by referee attestation')

    const claimTx = await fairFight.connect(winner).claim(fightId)
    const claimReceipt = await claimTx.wait()

    const gasSpent = finishReceipt.gasUsed.mul(finishReceipt.effectiveGasPrice)
        .add(claimReceipt.gasUsed.mul(claimReceipt.effectiveGasPrice))
    const winnerBalanceAfter = await ethers.provider.getBalance(winner.address)
    const feeCollectorAfter = await ethers.provider.getBalance(deployment.feeCollector)

    const escrow = before.escrowed
    const expectedFee = escrow.mul(deployment.feeBps).div(BASIS_POINTS)
    const expectedPayout = escrow.sub(expectedFee)
    const actualPayout = winnerBalanceAfter.sub(winnerBalanceBefore).add(gasSpent)
    const actualFee = feeCollectorAfter.sub(feeCollectorBefore)

    console.log('expected payout', ethers.utils.formatEther(expectedPayout), '| actual', ethers.utils.formatEther(actualPayout))
    console.log('expected fee   ', ethers.utils.formatEther(expectedFee), '| actual', ethers.utils.formatEther(actualFee))

    const after = await fairFight.fights(fightId)
    const contractBalance = await ethers.provider.getBalance(fairFight.address)

    const ok = actualPayout.eq(expectedPayout)
        && actualFee.eq(expectedFee)
        && contractBalance.isZero()
        && !(await fairFight.currentlyBusy(player1.address))
        && !(await fairFight.currentlyBusy(player2.address))

    console.log('fight status now', after.status, '| contract balance', ethers.utils.formatEther(contractBalance), 'ETH')
    console.log('both players freed:', !(await fairFight.currentlyBusy(player1.address)) && !(await fairFight.currentlyBusy(player2.address)))
    console.log(ok ? '\nEND TO END OK' : '\nEND TO END FAILED')
    process.exit(ok ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
