const { expect } = require("chai")
const { ethers } = require("hardhat")

/**
 * ============================================================================
 * KNOWN UNFIXED VULNERABILITY - LootboxSapphire allows unlimited free re-rolls
 * ============================================================================
 *
 * `Lootbox.sol` was hardened with commit-reveal: payment is taken in the commit
 * transaction and the draw is fixed by the commit block, so a caller that
 * reverts after seeing a bad result loses the payment and still gets the same
 * result on retry.
 *
 * `LootboxSapphire.sol` was NOT given that treatment. It still draws inside the
 * same transaction that takes payment, from block-derived entropy:
 *
 *     keccak256(addr, block.number, block.prevrandao, somenumber,
 *               blockhash(block.number - 1), MASK)
 *
 * `MASK` is confidential TEE randomness, so the result is unpredictable from
 * off-chain. That does NOT help here: a wrapper contract does not need to
 * predict the draw, it only needs to *observe* it and roll it back.
 *
 *   1. wrapper calls buyNative() inside try/catch and reverts on a bad draw
 *   2. the revert unwinds the payment AND the mint - the attempt is free
 *   3. the next block produces different entropy, so the attacker retries
 *
 * Expected cost of grinding to Epic (0.02%) is therefore gas only, not ~5000
 * lootboxes. The two tests below pin that behaviour so it cannot be forgotten.
 *
 * FIX: split payment from the draw across two transactions, i.e. port
 * commitBuy/commitBuyNative/reveal from Lootbox.sol and fold MASK into the
 * revealed entropy. That is an API change (buy/buyNative/loot callers and
 * scripts/Lootbox/deploySapphire.js + buyTest.js must move to the two-step
 * flow), so it was left for an explicit decision rather than done in passing.
 *
 * WHEN THIS IS FIXED, BOTH TESTS BELOW WILL FAIL. Delete them at that point.
 */
describe("KNOWN ISSUE: LootboxSapphire revert-and-retry re-rolls", function () {
    const price = ethers.utils.parseEther("1")

    let owner
    let looter
    let signer
    let nft
    let token
    let lootbox

    beforeEach(async function () {
        ;[owner, looter, signer] = await ethers.getSigners()

        const NFT = await ethers.getContractFactory("FairFightNFT")
        const Token = await ethers.getContractFactory("TokenForTests")
        const Lootbox = await ethers.getContractFactory("LootboxSapphire")

        nft = await NFT.deploy("Items", "ITM", "ipfs://items/", 1000)
        token = await Token.deploy("TokenForTests", "TFT")
        await nft.deployed()
        await token.deployed()

        const rarity = (ids) => ids.map((propertyId) => ({ nft: nft.address, propertyId }))
        lootbox = await Lootbox.deploy(
            rarity([0, 1, 2, 3, 4]),
            rarity([5]),
            rarity([6]),
            rarity([7]),
            rarity([8]),
            price,
            signer.address,
            owner.address,
            token.address
        )
        await lootbox.deployed()
        await nft.setAllowedMint(lootbox.address, true)
    })

    it("draws a different prize for identical input in a different block", async function () {
        const drawn = new Set()
        for (let i = 0; i < 8; i++) {
            const receipt = await (await lootbox.connect(looter).buyNative({ value: price })).wait()
            const looted = receipt.events.find((event) => event.event === "Loot")
            drawn.add(looted.args.propertyId.toString())
        }

        // Same caller, same price, same contract - only the block changed.
        expect(drawn.size).to.be.greaterThan(
            1,
            "entropy is block-derived, so retrying in a later block re-rolls the draw"
        )
    })

    it("refunds the payment when a wrapper rejects the draw, making each attempt free", async function () {
        const Attacker = await ethers.getContractFactory("SapphireRerollAttacker")
        const attacker = await Attacker.deploy(lootbox.address)
        await attacker.deployed()
        await owner.sendTransaction({ to: attacker.address, value: price.mul(5) })

        const attackerBefore = await ethers.provider.getBalance(attacker.address)
        const collectorBefore = await ethers.provider.getBalance(owner.address)

        for (let i = 0; i < 5; i++) {
            await attacker.connect(looter).grind(price)
        }

        // Five lootboxes "bought" and rejected: the collector was never paid and
        // the attacker is down zero wei. Only the looter's gas was spent.
        expect(await ethers.provider.getBalance(attacker.address)).to.equal(attackerBefore)
        expect(await ethers.provider.getBalance(owner.address)).to.equal(collectorBefore)
        expect(await nft.balanceOf(attacker.address)).to.equal(0)
    })
})
