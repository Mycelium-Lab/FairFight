const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { signFightOutcome } = require("./utils/sign")

describe("FairFightV2 hardened settlement", function () {
    const ZERO = ethers.constants.AddressZero
    const stake = ethers.utils.parseEther("1")
    const feeBps = 300

    let owner
    let referee
    let feeCollector
    let alice
    let bob
    let carol
    let dave
    let game

    beforeEach(async function () {
        ;[owner, referee, feeCollector, alice, bob, carol, dave] = await ethers.getSigners()
        const FairFightV2 = await ethers.getContractFactory("FairFightV2")
        game = await upgrades.deployProxy(
            FairFightV2,
            [referee.address, feeCollector.address, feeBps, stake],
            { initializer: "initialize" }
        )
        await game.deployed()
    })

    async function deadlineFromNow(seconds = 3600) {
        const block = await ethers.provider.getBlock("latest")
        return block.timestamp + seconds
    }

    async function createReadyNative(creator = alice, opponent = bob, amount = stake) {
        const fightId = await game.nextFightId()
        await game.connect(creator).create(amount, ZERO, { value: amount })
        await game.connect(opponent).join(fightId, { value: amount })
        return fightId
    }

    async function outcomeSignature(fightId, claimant, signer = referee, chainId) {
        const nonce = await game.nonces(claimant.address)
        const deadline = await deadlineFromNow()
        const signature = await signFightOutcome(
            fightId,
            claimant.address,
            nonce,
            deadline,
            game.address,
            signer,
            chainId
        )
        return { nonce, deadline, signature }
    }

    it("settles a native fight from escrow and conserves payout plus fee", async function () {
        const fightId = await createReadyNative()
        const escrow = stake.mul(2)
        const fee = escrow.mul(feeBps).div(10_000)
        const payout = escrow.sub(fee)
        const outcome = await outcomeSignature(fightId, alice)

        await expect(
            game.connect(alice).finish(
                fightId,
                alice.address,
                outcome.nonce,
                outcome.deadline,
                outcome.signature
            )
        ).to.emit(game, "FightSettled").withArgs(fightId, alice.address)

        const transaction = game.connect(alice).claim(fightId)

        await expect(transaction).to.changeEtherBalances(
            [game, alice, feeCollector],
            [escrow.mul(-1), payout, fee]
        )
        await expect(transaction)
            .to.emit(game, "FightClaimed")
            .withArgs(fightId, alice.address, payout, fee)

        const fight = await game.fights(fightId)
        expect(fight.winner).to.equal(alice.address)
        expect(fight.escrowed).to.equal(escrow)
        expect(fight.released).to.equal(escrow)
        expect(fight.status).to.equal(4)
        expect(await game.escrowRemaining(fightId)).to.equal(0)
        expect(await game.escrowLiability(ZERO)).to.equal(0)
        expect(await game.currentlyBusy(alice.address)).to.equal(false)
        expect(await game.currentlyBusy(bob.address)).to.equal(false)
    })

    it("supports ERC-20 escrow and pays the configured basis-point fee", async function () {
        const Token = await ethers.getContractFactory("TokenForTests")
        const token = await Token.deploy("Token", "TKN")
        await token.deployed()
        await game.setMinStake(token.address, stake)

        await token.mint(alice.address, stake)
        await token.mint(bob.address, stake)
        await token.connect(alice).approve(game.address, stake)
        await token.connect(bob).approve(game.address, stake)

        await game.connect(alice).create(stake, token.address)
        await game.connect(bob).join(1)
        const outcome = await outcomeSignature(1, bob)
        await game.connect(bob).finish(1, bob.address, outcome.nonce, outcome.deadline, outcome.signature)
        await game.connect(bob).claim(1)

        const escrow = stake.mul(2)
        const fee = escrow.mul(feeBps).div(10_000)
        expect(await token.balanceOf(bob.address)).to.equal(escrow.sub(fee))
        expect(await token.balanceOf(feeCollector.address)).to.equal(fee)
        expect(await token.balanceOf(game.address)).to.equal(0)
        expect(await game.escrowLiability(token.address)).to.equal(0)
    })

    it("rejects a valid referee signature for a non-participant", async function () {
        const fightId = await createReadyNative()
        const outcome = await outcomeSignature(fightId, carol)

        await expect(
            game.connect(carol).finish(
                fightId,
                carol.address,
                outcome.nonce,
                outcome.deadline,
                outcome.signature
            )
        ).to.be.revertedWith("FairFightV2: not participant")

        const winnerOutcome = await outcomeSignature(fightId, alice)
        await game.connect(alice).finish(
            fightId,
            alice.address,
            winnerOutcome.nonce,
            winnerOutcome.deadline,
            winnerOutcome.signature
        )
        await expect(game.connect(carol).claim(fightId)).to.be.revertedWith(
            "FairFightV2: not participant"
        )
    })

    it("rejects settlement before a second player makes the fight ready", async function () {
        await game.connect(alice).create(stake, ZERO, { value: stake })
        const outcome = await outcomeSignature(1, alice)

        await expect(
            game.connect(alice).finish(1, alice.address, outcome.nonce, outcome.deadline, outcome.signature)
        ).to.be.revertedWith("FairFightV2: fight not ready")
    })

    it("rejects a claim until the signed outcome completes the fight", async function () {
        const fightId = await createReadyNative()
        await expect(game.connect(alice).claim(fightId)).to.be.revertedWith(
            "FairFightV2: fight not settled"
        )

        const outcome = await outcomeSignature(fightId, alice)
        await game.connect(alice).finish(
            fightId,
            alice.address,
            outcome.nonce,
            outcome.deadline,
            outcome.signature
        )
        await expect(game.connect(bob).claim(fightId)).to.be.revertedWith("FairFightV2: not winner")
        await expect(game.connect(alice).claim(fightId)).to.emit(game, "FightClaimed")
    })

    it("cannot release more than one fight's escrow even with a compromised signer", async function () {
        const Token = await ethers.getContractFactory("TokenForTests")
        const token = await Token.deploy("Token", "TKN")
        await token.deployed()
        await game.setMinStake(token.address, stake)

        const secondStake = stake.mul(3)
        for (const [player, amount] of [
            [alice, stake],
            [bob, stake],
            [carol, secondStake],
            [dave, secondStake]
        ]) {
            await token.mint(player.address, amount)
            await token.connect(player).approve(game.address, amount)
        }

        await game.connect(alice).create(stake, token.address)
        await game.connect(bob).join(1)
        await game.connect(carol).create(secondStake, token.address)
        await game.connect(dave).join(2)

        const network = await ethers.provider.getNetwork()
        const nonce = await game.nonces(alice.address)
        const deadline = await deadlineFromNow()
        const inflatedSignature = await referee._signTypedData(
            {
                name: "FairFight",
                version: "2",
                chainId: network.chainId,
                verifyingContract: game.address
            },
            {
                InflatedOutcome: [
                    { name: "fightId", type: "uint256" },
                    { name: "claimant", type: "address" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                    { name: "amount", type: "uint256" }
                ]
            },
            {
                fightId: 1,
                claimant: alice.address,
                nonce,
                deadline,
                amount: ethers.utils.parseEther("1000000")
            }
        )

        await expect(
            game.connect(alice).finish(1, alice.address, nonce, deadline, inflatedSignature)
        ).to.be.revertedWith("FairFightV2: invalid signature")

        const aliceOutcome = await outcomeSignature(1, alice)
        const bobOutcome = await outcomeSignature(1, bob)
        await game.connect(alice).finish(
            1,
            alice.address,
            aliceOutcome.nonce,
            aliceOutcome.deadline,
            aliceOutcome.signature
        )
        await expect(
            game.connect(bob).finish(
                1,
                bob.address,
                bobOutcome.nonce,
                bobOutcome.deadline,
                bobOutcome.signature
            )
        ).to.be.revertedWith("FairFightV2: fight not ready")
        await game.connect(alice).claim(1)
        await expect(game.connect(alice).claim(1)).to.be.revertedWith(
            "FairFightV2: fight not settled"
        )

        const firstEscrow = stake.mul(2)
        const secondEscrow = secondStake.mul(2)
        const firstFight = await game.fights(1)
        expect(firstFight.released).to.equal(firstEscrow)
        expect(firstFight.escrowed).to.equal(firstEscrow)
        expect(await game.escrowRemaining(1)).to.equal(0)
        expect(await game.escrowRemaining(2)).to.equal(secondEscrow)
        expect(await game.escrowLiability(token.address)).to.equal(secondEscrow)
        expect(await token.balanceOf(game.address)).to.equal(secondEscrow)
    })

    it("rejects an outcome signed for a different chain", async function () {
        const fightId = await createReadyNative()
        const network = await ethers.provider.getNetwork()
        const outcome = await outcomeSignature(fightId, alice, referee, network.chainId + 1)

        await expect(
            game.connect(alice).finish(
                fightId,
                alice.address,
                outcome.nonce,
                outcome.deadline,
                outcome.signature
            )
        ).to.be.revertedWith("FairFightV2: invalid signature")
    })

    it("consumes the claimant nonce and rejects replay", async function () {
        const fightId = await createReadyNative()
        const outcome = await outcomeSignature(fightId, alice)

        await game.connect(alice).finish(
            fightId,
            alice.address,
            outcome.nonce,
            outcome.deadline,
            outcome.signature
        )
        expect(await game.nonces(alice.address)).to.equal(1)

        await expect(
            game.connect(alice).finish(
                fightId,
                alice.address,
                outcome.nonce,
                outcome.deadline,
                outcome.signature
            )
        ).to.be.revertedWith("FairFightV2: fight not ready")
    })

    it("rejects an expired outcome signature", async function () {
        const fightId = await createReadyNative()
        const block = await ethers.provider.getBlock("latest")
        const deadline = block.timestamp - 1
        const nonce = await game.nonces(alice.address)
        const signature = await signFightOutcome(
            fightId,
            alice.address,
            nonce,
            deadline,
            game.address,
            referee
        )

        await expect(
            game.connect(alice).finish(fightId, alice.address, nonce, deadline, signature)
        ).to.be.revertedWith("FairFightV2: signature expired")
    })

    it("only releases a player from the exact fight after the stale timeout", async function () {
        await game.connect(alice).create(stake, ZERO, { value: stake })

        await expect(game.releaseStalePlayer(1, alice.address)).to.be.revertedWith(
            "FairFightV2: fight not stale"
        )
        await expect(game.connect(bob).releaseStalePlayer(1, alice.address)).to.be.revertedWith(
            "Ownable: caller is not the owner"
        )

        await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60])
        await ethers.provider.send("evm_mine", [])
        await expect(game.releaseStalePlayer(1, alice.address))
            .to.emit(game, "StalePlayerReleased")
            .withArgs(1, alice.address)

        expect(await game.currentlyBusy(alice.address)).to.equal(false)
        await expect(game.connect(alice).create(stake, ZERO, { value: stake })).to.emit(
            game,
            "FightCreated"
        )
    })
})
