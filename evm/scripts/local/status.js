// Prints the state of the local deployment and its seeded fight.
//   npx hardhat run scripts/local/status.js --network localhost

const fs = require('fs')
const path = require('path')
const { ethers } = require('hardhat')

const STATUS = ['None', 'Open', 'Ready', 'Settled', 'Claimed']

async function main() {
    const deployment = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../../deployment.local.json'), 'utf8')
    )
    const fairFight = await ethers.getContractAt('FairFightV2', deployment.contractAddress)
    const fight = await fairFight.fights(deployment.seededFight.id)
    const network = await ethers.provider.getNetwork()

    console.log('chain      ', network.chainId)
    console.log('contract   ', deployment.contractAddress)
    console.log('fight      ', deployment.seededFight.id)
    console.log('  status   ', fight.status, `(${STATUS[fight.status] || '?'})`)
    console.log('  escrowed ', ethers.utils.formatEther(fight.escrowed), 'ETH')
    console.log('  creator  ', fight.creator)
    console.log('  opponent ', fight.opponent)
    console.log('playable   ', fight.status === 2 ? 'YES' : `NO - re-run deployAndSeed.js`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
