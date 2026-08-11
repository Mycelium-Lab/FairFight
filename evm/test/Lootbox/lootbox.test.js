const { expect } = require("chai")
const { ethers } = require("hardhat")
const { signLootboxCommit } = require("../utils/sign")

describe("Lootbox commit-reveal", function () {
    const price = ethers.utils.parseEther("10")

    let owner
    let looter
    let signer
    let collector
    let nft
    let paymentToken
    let lootbox

    beforeEach(async function () {
        ;[owner, looter, signer, collector] = await ethers.getSigners()

        const NFT = await ethers.getContractFactory("FairFightNFT")
        const Token = await ethers.getContractFactory("TokenForTests")
        const Lootbox = await ethers.getContractFactory("Lootbox")

        nft = await NFT.deploy("FairFight Items", "FFI", "ipfs://items/", 100)
        paymentToken = await Token.deploy("TokenForTests", "TFT")
        await nft.deployed()
        await paymentToken.deployed()

        const prizes = [
            [{ nft: nft.address, propertyId: 0 }],
            [{ nft: nft.address, propertyId: 1 }],
            [{ nft: nft.address, propertyId: 2 }],
            [{ nft: nft.address, propertyId: 3 }],
            [{ nft: nft.address, propertyId: 4 }]
        ]
        lootbox = await Lootbox.deploy(
            prizes[0],
            prizes[1],
            prizes[2],
            prizes[3],
            prizes[4],
            price,
            signer.address,
            collector.address,
            paymentToken.address
        )
        await lootbox.deployed()
        await nft.setAllowedMint(lootbox.address, true)
        await paymentToken.mint(looter.address, price.mul(10))
    })

    function commitmentFor(player, secret) {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["address", "address", "bytes32"],
                [player, lootbox.address, secret]
            )
        )
    }

    async function mineBlock() {
        await ethers.provider.send("evm_mine", [])
    }

    it("reveals a signer-authorized loot only after committing", async function () {
        const secret = ethers.utils.id("authorized loot")
        const commitment = commitmentFor(looter.address, secret)
        const counter = await lootbox.currentUserLoot(looter.address)
        const signature = await signLootboxCommit(
            commitment,
            looter.address,
            lootbox.address,
            counter,
            signer
        )

        await expect(
            lootbox.connect(looter).commitLoot(commitment, signature.r, signature.v, signature.s)
        ).to.emit(lootbox, "LootCommitted")
        await mineBlock()

        await expect(lootbox.connect(looter).reveal(secret)).to.emit(lootbox, "Loot")
        expect(await nft.ownerOf(1)).to.equal(looter.address)
    })

    it("consumes an authorization when it is committed", async function () {
        const secret = ethers.utils.id("one authorization")
        const commitment = commitmentFor(looter.address, secret)
        const signature = await signLootboxCommit(
            commitment,
            looter.address,
            lootbox.address,
            0,
            signer
        )

        await lootbox.connect(looter).commitLoot(commitment, signature.r, signature.v, signature.s)
        await mineBlock()
        await lootbox.connect(looter).reveal(secret)

        await expect(
            lootbox.connect(looter).commitLoot(commitment, signature.r, signature.v, signature.s)
        ).to.be.revertedWith("FairFight Lootbox: Not verified")
    })

    it("rejects a reveal whose secret does not match the commitment", async function () {
        const secret = ethers.utils.id("paid loot")
        const commitment = commitmentFor(looter.address, secret)
        await paymentToken.connect(looter).approve(lootbox.address, price)
        await lootbox.connect(looter).commitBuy(commitment)
        await mineBlock()

        await expect(lootbox.connect(looter).reveal(ethers.utils.id("wrong secret"))).to.be.revertedWith(
            "FairFight Lootbox: Wrong secret"
        )
    })

    it("charges at commitment and supports a rarity containing exactly one prize", async function () {
        const secret = ethers.utils.id("single prize")
        const commitment = commitmentFor(looter.address, secret)
        await paymentToken.connect(looter).approve(lootbox.address, price)

        await expect(lootbox.connect(looter).commitBuy(commitment))
            .to.emit(lootbox, "Buy")
            .withArgs(looter.address, paymentToken.address, price)
        expect(await paymentToken.balanceOf(collector.address)).to.equal(price)

        await mineBlock()
        await expect(lootbox.connect(looter).reveal(secret)).to.emit(lootbox, "Loot")
        expect(await nft.ownerOf(1)).to.equal(looter.address)
    })

    it("keeps one fixed paid result when a wrapper reverts and retries", async function () {
        const Buyer = await ethers.getContractFactory("RevertingLootboxBuyer")
        const buyer = await Buyer.deploy(lootbox.address)
        await buyer.deployed()
        await nft.setAllowedMint(lootbox.address, true)
        await paymentToken.mint(buyer.address, price)

        const secret = ethers.utils.id("fixed retry-resistant draw")
        const commitment = commitmentFor(buyer.address, secret)
        await buyer.approveAndCommit(paymentToken.address, price, commitment)
        expect(await paymentToken.balanceOf(collector.address)).to.equal(price)
        await mineBlock()

        const firstPreview = await buyer.callStatic.previewReveal(secret)
        await expect(buyer.revealAndRevert(secret)).to.be.revertedWith(
            "RevertingLootboxBuyer: reject draw"
        )
        expect((await lootbox.pendingLoots(buyer.address)).commitment).to.equal(commitment)

        for (let i = 0; i < 5; i++) {
            await mineBlock()
        }
        const secondPreview = await buyer.callStatic.previewReveal(secret)
        expect(secondPreview.nft).to.equal(firstPreview.nft)
        expect(secondPreview.propertyId).to.equal(firstPreview.propertyId)

        await buyer.reveal(secret)
        expect(await nft.ownerOf(1)).to.equal(buyer.address)
        expect(await nft.tokenProperty(1)).to.equal(firstPreview.propertyId)
        expect(await paymentToken.balanceOf(collector.address)).to.equal(price)
        await expect(buyer.reveal(secret)).to.be.revertedWith("FairFight Lootbox: No commitment")
    })

    it("refuses parallel commitments, so draws cannot be opened and cherry-picked", async function () {
        const first = ethers.utils.id("first roll")
        const second = ethers.utils.id("second roll")
        await paymentToken.connect(looter).approve(lootbox.address, price.mul(3))

        await lootbox.connect(looter).commitBuy(commitmentFor(looter.address, first))
        await expect(
            lootbox.connect(looter).commitBuy(commitmentFor(looter.address, second))
        ).to.be.revertedWith("FairFight Lootbox: Pending commitment")

        // Abandoning a bad draw does not free the slot until the commitment ages out.
        await expect(lootbox.connect(looter).expireCommitment()).to.be.revertedWith(
            "FairFight Lootbox: Not expired"
        )
    })

    it("charges the price again for every re-roll after an abandoned draw", async function () {
        const first = ethers.utils.id("abandoned roll")
        const second = ethers.utils.id("replacement roll")
        await paymentToken.connect(looter).approve(lootbox.address, price.mul(3))

        await lootbox.connect(looter).commitBuy(commitmentFor(looter.address, first))
        expect(await paymentToken.balanceOf(collector.address)).to.equal(price)

        // Let the abandoned commitment expire, then take a fresh draw.
        for (let i = 0; i < 258; i++) {
            await mineBlock()
        }
        await expect(lootbox.connect(looter).reveal(first)).to.be.revertedWith(
            "FairFight Lootbox: Commitment expired"
        )
        await expect(lootbox.connect(looter).expireCommitment()).to.emit(
            lootbox,
            "LootCommitmentExpired"
        )

        await lootbox.connect(looter).commitBuy(commitmentFor(looter.address, second))
        // The re-roll was not free: the collector was paid a second time.
        expect(await paymentToken.balanceOf(collector.address)).to.equal(price.mul(2))
        await mineBlock()
        await expect(lootbox.connect(looter).reveal(second)).to.emit(lootbox, "Loot")
    })
})
