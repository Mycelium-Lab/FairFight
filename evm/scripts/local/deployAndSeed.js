// Deploys FairFightV2 to the local hardhat chain and seeds a fight that is ready
// to play, so the game can be exercised end to end without touching a real network.
//
//   npx hardhat node --port 8545
//   npx hardhat run scripts/local/deployAndSeed.js --network localhost
//
// Writes deployment.local.json at the repo root for the server and client to read.

const fs = require('fs')
const path = require('path')
const { ethers, upgrades } = require('hardhat')

const FEE_BPS = 500                                   // 5%, matches production config
const MIN_NATIVE_STAKE = ethers.utils.parseEther('0.001')
const STAKE = ethers.utils.parseEther('1')
const NATIVE = ethers.constants.AddressZero

async function main() {
    const [deployer, player1, player2] = await ethers.getSigners()

    // The signer is the referee key the backend uses to attest outcomes. Locally it is
    // the same well-known hardhat account the server has in .env as PRIVATE_KEY.
    const signer = deployer.address
    const feeCollector = deployer.address

    const FairFightV2 = await ethers.getContractFactory('FairFightV2')
    const fairFight = await upgrades.deployProxy(
        FairFightV2,
        [signer, feeCollector, FEE_BPS, MIN_NATIVE_STAKE],
        { initializer: 'initialize' }
    )
    await fairFight.deployed()
    console.log('FairFightV2 proxy:', fairFight.address)

    // Native token must be explicitly allowed before fights can be created with it.
    if (typeof fairFight.changeMinStake === 'function') {
        await (await fairFight.changeMinStake(NATIVE, MIN_NATIVE_STAKE)).wait()
    } else if (typeof fairFight.setMinStake === 'function') {
        await (await fairFight.setMinStake(NATIVE, MIN_NATIVE_STAKE)).wait()
    }

    // Seed a fight that already has both players, so it is immediately playable.
    const createTx = await fairFight.connect(player1).create(STAKE, NATIVE, { value: STAKE })
    const createReceipt = await createTx.wait()
    const created = createReceipt.events.find(e => e.event === 'CreateFight' || e.event === 'FightCreated')
    const fightId = created
        ? (created.args.fightId !== undefined ? created.args.fightId : created.args[0])
        : (await fairFight.nextFightId()).sub(1)
    console.log('fight created:', fightId.toString(), 'by', player1.address)

    await (await fairFight.connect(player2).join(fightId, { value: STAKE })).wait()
    console.log('fight joined by', player2.address)

    const fight = await fairFight.fights(fightId)
    console.log('status:', fight.status, '| escrowed:', ethers.utils.formatEther(fight.escrowed), 'ETH')

    const out = {
        chainId: 31337,
        rpc: 'http://127.0.0.1:8545',
        contractAddress: fairFight.address,
        signer,
        feeCollector,
        feeBps: FEE_BPS,
        seededFight: {
            id: fightId.toString(),
            stake: STAKE.toString(),
            token: NATIVE,
            player1: player1.address,
            player2: player2.address,
        },
        players: {
            player1: { address: player1.address, privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' },
            player2: { address: player2.address, privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' },
        },
    }
    const outPath = path.join(__dirname, '../../../deployment.local.json')
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
    console.log('wrote', outPath)
}

main().catch(e => { console.error(e); process.exit(1) })
