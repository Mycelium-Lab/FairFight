const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { sign, signFightOutcome } = require("./utils/sign")

/**
 * Differential regression suite.
 *
 * Every test here first demonstrates the exploit succeeding against the legacy
 * `FairFight` contract, then asserts the equivalent attack is rejected by
 * `FairFightV2`. If a future change to FairFightV2 drops one of the hardening
 * checks, the second half of the matching test fails.
 */
describe("Legacy FairFight vulnerabilities vs FairFightV2", function () {
    const ZERO = ethers.constants.AddressZero
    const amountPerRound = ethers.utils.parseEther("0.1")
    const rounds = 10
    const legacyStake = amountPerRound.mul(rounds)
    const feeBps = 300

    let owner
    let referee
    let feeCollector
    let alice
    let bob
    let carol
    let dave
    let legacy
    let game

    beforeEach(async function () {
        ;[owner, referee, feeCollector, alice, bob, carol, dave] = await ethers.getSigners()

        const Legacy = await ethers.getContractFactory("FairFight")
        legacy = await upgrades.deployProxy(Legacy, [
            referee.address,
            20,
            feeCollector.address,
            feeBps,
            "10",
            2
        ])
        await legacy.deployed()

        const FairFightV2 = await ethers.getContractFactory("FairFightV2")
        game = await upgrades.deployProxy(
            FairFightV2,
            [referee.address, feeCollector.address, feeBps, legacyStake],
            { initializer: "initialize" }
        )
        await game.deployed()
    })

    async function v2ReadyFight(creator, opponent, stake = legacyStake) {
        const fightId = await game.nextFightId()
        await game.connect(creator).create(stake, ZERO, { value: stake })
        await game.connect(opponent).join(fightId, { value: stake })
        return fightId
    }

    async function v2Outcome(fightId, claimant, chainId) {
        const nonce = await game.nonces(claimant.address)
        const block = await ethers.provider.getBlock("latest")
        const deadline = block.timestamp + 3600
        const signature = await signFightOutcome(
            fightId,
            claimant.address,
            nonce,
            deadline,
            game.address,
            referee,
            chainId
        )
        return { nonce, deadline, signature }
    }

    it("a non-participant holding a valid signature can drain the legacy contract but not V2", async function () {
        // ---- legacy: carol never created or joined fight 1 ----
        await legacy.connect(alice).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })
        await legacy.connect(bob).join(1, { value: legacyStake })

        const stolen = await sign(1, legacyStake, carol.address, ZERO, legacy.address, referee)
        await expect(
            legacy.connect(carol).finish(1, legacyStake, stolen.r, stolen.v, stolen.s)
        ).to.changeEtherBalances([legacy, carol], [legacyStake.mul(-1), legacyStake])

        // ---- V2: identical setup, carol is not a participant ----
        const fightId = await v2ReadyFight(alice, bob)
        const outcome = await v2Outcome(fightId, carol)
        await expect(
            game
                .connect(carol)
                .finish(fightId, carol.address, outcome.nonce, outcome.deadline, outcome.signature)
        ).to.be.revertedWith("FairFightV2: not participant")

        // and she cannot claim a settled fight either
        const winner = await v2Outcome(fightId, alice)
        await game
            .connect(alice)
            .finish(fightId, alice.address, winner.nonce, winner.deadline, winner.signature)
        await expect(game.connect(carol).claim(fightId)).to.be.revertedWith(
            "FairFightV2: not participant"
        )
    })

    it("a signer-attested amount drains other fights on legacy; V2 pays strictly from one escrow", async function () {
        // ---- legacy: alice is in fight 1 (escrow 2 stakes) but signs for the whole balance ----
        await legacy.connect(alice).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })
        await legacy.connect(bob).join(1, { value: legacyStake })
        await legacy.connect(carol).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })

        const wholeBalance = await ethers.provider.getBalance(legacy.address)
        expect(wholeBalance).to.equal(legacyStake.mul(3)) // fight 1 escrow is only 2 stakes
        const inflated = await sign(1, wholeBalance, alice.address, ZERO, legacy.address, referee)
        await legacy.connect(alice).finish(1, wholeBalance, inflated.r, inflated.v, inflated.s)
        // carol's untouched fight has been emptied
        expect(await ethers.provider.getBalance(legacy.address)).to.equal(0)

        // ---- V2: a malicious signer cannot express an amount at all ----
        const first = await v2ReadyFight(alice, bob)
        const secondStake = legacyStake.mul(3)
        const second = await v2ReadyFight(carol, dave, secondStake)

        const firstEscrow = legacyStake.mul(2)
        const secondEscrow = secondStake.mul(2)
        const fee = firstEscrow.mul(feeBps).div(10_000)
        const payout = firstEscrow.sub(fee)

        const outcome = await v2Outcome(first, alice)
        await game
            .connect(alice)
            .finish(first, alice.address, outcome.nonce, outcome.deadline, outcome.signature)

        await expect(game.connect(alice).claim(first)).to.changeEtherBalances(
            [game, alice, feeCollector],
            [firstEscrow.mul(-1), payout, fee]
        )

        // the second fight's escrow is fully intact and still held by the contract
        expect(await game.escrowRemaining(first)).to.equal(0)
        expect(await game.escrowRemaining(second)).to.equal(secondEscrow)
        expect(await game.escrowLiability(ZERO)).to.equal(secondEscrow)
        expect(await ethers.provider.getBalance(game.address)).to.equal(secondEscrow)

        // and a second claim on the drained fight is impossible
        await expect(game.connect(alice).claim(first)).to.be.revertedWith(
            "FairFightV2: fight not settled"
        )
    })

    it("legacy signatures never expire; V2 rejects an expired deadline", async function () {
        await legacy.connect(alice).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })
        await legacy.connect(bob).join(1, { value: legacyStake })
        const stale = await sign(1, legacyStake, alice.address, ZERO, legacy.address, referee)

        await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60])
        await ethers.provider.send("evm_mine", [])
        // a year-old legacy signature is still good
        await expect(
            legacy.connect(alice).finish(1, legacyStake, stale.r, stale.v, stale.s)
        ).to.changeEtherBalance(alice, legacyStake)

        const fightId = await v2ReadyFight(alice, bob)
        const block = await ethers.provider.getBlock("latest")
        const expired = block.timestamp - 1
        const nonce = await game.nonces(alice.address)
        const signature = await signFightOutcome(
            fightId,
            alice.address,
            nonce,
            expired,
            game.address,
            referee
        )
        await expect(
            game.connect(alice).finish(fightId, alice.address, nonce, expired, signature)
        ).to.be.revertedWith("FairFightV2: signature expired")
    })

    it("the legacy digest omits chainId entirely; V2 binds it through the EIP-712 domain", async function () {
        await legacy.connect(alice).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })
        await legacy.connect(bob).join(1, { value: legacyStake })

        // Reconstruct the exact preimage the legacy contract checks. It contains
        // only (ID, amount, token, player, contract) - no chainId, so the same
        // signature is valid on every chain this contract is deployed to at the
        // same address.
        const digest = ethers.utils.solidityKeccak256(
            ["uint256", "uint256", "uint160", "uint160", "uint160"],
            [1, legacyStake, ZERO, alice.address, legacy.address]
        )
        const raw = await referee.signMessage(ethers.utils.arrayify(digest))
        const split = ethers.utils.splitSignature(raw)
        await expect(
            legacy.connect(alice).finish(1, legacyStake, split.r, split.v, split.s)
        ).to.changeEtherBalance(alice, legacyStake)

        // V2: the very same outcome signed for a neighbouring chainId is refused.
        const network = await ethers.provider.getNetwork()
        const fightId = await v2ReadyFight(alice, bob)
        const foreign = await v2Outcome(fightId, alice, network.chainId + 1)
        await expect(
            game
                .connect(alice)
                .finish(fightId, alice.address, foreign.nonce, foreign.deadline, foreign.signature)
        ).to.be.revertedWith("FairFightV2: invalid signature")

        // the correctly scoped signature still works, proving the fight was settleable
        const local = await v2Outcome(fightId, alice)
        await expect(
            game
                .connect(alice)
                .finish(fightId, alice.address, local.nonce, local.deadline, local.signature)
        ).to.emit(game, "FightSettled")
    })

    it("V2 consumes the claimant nonce, so a stale signature is refused on a fresh fight", async function () {
        const first = await v2ReadyFight(alice, bob)
        const outcome = await v2Outcome(first, alice)
        expect(outcome.nonce).to.equal(0)

        await game
            .connect(alice)
            .finish(first, alice.address, outcome.nonce, outcome.deadline, outcome.signature)
        expect(await game.nonces(alice.address)).to.equal(1)
        await game.connect(alice).claim(first)

        // A brand new fight, with a referee signature minted at the now-spent nonce 0.
        const second = await v2ReadyFight(alice, bob)
        const block = await ethers.provider.getBlock("latest")
        const deadline = block.timestamp + 3600
        const replayed = await signFightOutcome(
            second,
            alice.address,
            0,
            deadline,
            game.address,
            referee
        )
        await expect(
            game.connect(alice).finish(second, alice.address, 0, deadline, replayed)
        ).to.be.revertedWith("FairFightV2: invalid nonce")

        // the current nonce settles it, confirming the check is the only blocker
        const fresh = await v2Outcome(second, alice)
        expect(fresh.nonce).to.equal(1)
        await expect(
            game
                .connect(alice)
                .finish(second, alice.address, fresh.nonce, fresh.deadline, fresh.signature)
        ).to.emit(game, "FightSettled")
    })

    it("V2 refuses to re-settle a fight, so one signature cannot be replayed by its claimant", async function () {
        const fightId = await v2ReadyFight(alice, bob)
        const outcome = await v2Outcome(fightId, alice)

        await game
            .connect(alice)
            .finish(fightId, alice.address, outcome.nonce, outcome.deadline, outcome.signature)
        await expect(
            game
                .connect(alice)
                .finish(fightId, alice.address, outcome.nonce, outcome.deadline, outcome.signature)
        ).to.be.revertedWith("FairFightV2: fight not ready")

        await game.connect(alice).claim(fightId)
        await expect(game.connect(alice).claim(fightId)).to.be.revertedWith(
            "FairFightV2: fight not settled"
        )

        // legacy contrast: replay there is stopped only by a per-claimant flag,
        // and each *other* address with a signature gets a fresh payout.
        await legacy.connect(alice).create(amountPerRound, rounds, 2, ZERO, { value: legacyStake })
        await legacy.connect(bob).join(1, { value: legacyStake })
        const aliceSig = await sign(1, legacyStake, alice.address, ZERO, legacy.address, referee)
        const bobSig = await sign(1, legacyStake, bob.address, ZERO, legacy.address, referee)
        await legacy.connect(alice).finish(1, legacyStake, aliceSig.r, aliceSig.v, aliceSig.s)
        await expect(
            legacy.connect(bob).finish(1, legacyStake, bobSig.r, bobSig.v, bobSig.s)
        ).to.changeEtherBalance(bob, legacyStake)
        expect(await ethers.provider.getBalance(legacy.address)).to.equal(0)
    })
})
