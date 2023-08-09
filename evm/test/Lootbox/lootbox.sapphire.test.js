const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat");
const { signLootbox } = require("../utils/sign");

describe("FairFightLootbox", function (){

    //signers
    let owner
    let looter
    let signer

    //utils
    const charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    const armorsBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    const bootsBaseURI = 'https://ipfs.io/ipfs/Qmd7NkqYyuR3K2uP1Go3xHtuTomKV2aHBUa8mcncbUDNm3/'
    const weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'
    const maxSupply = 5
    const price = ethers.utils.parseEther("10")

    //contracts
    let lootbox
    let characters
    let armors
    let weapons
    let boots
    let testToken

    let regularRarityPrizes = []
    let superiorRarityPrizes = []
    let rareRarityPrizes = []
    let legendaryRarityPrizes = []
    let epicRarityPrizes = []

	beforeEach(async function() {
		[owner, looter, signer] = await ethers.getSigners()
        const FFNFT = await ethers.getContractFactory("FairFightNFT")
        const Lootbox = await ethers.getContractFactory("LootboxSapphire")
        const TestToken = await ethers.getContractFactory("TokenForTests")
        testToken = await TestToken.deploy("TokenForTests", "TFT")
        characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI, maxSupply)
        armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI, maxSupply)
        boots = await FFNFT.deploy("FairFightBoots", "FFB", bootsBaseURI, maxSupply)
        weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI, maxSupply)
        await testToken.deployed()
        await characters.deployed()
        await armors.deployed()
        await weapons.deployed()
        await boots.deployed()
        regularRarityPrizes = [
            {
                nft: characters.address,
                propertyId: 0
            },
            {
                nft: weapons.address,
                propertyId: 0
            },
            {
                nft: weapons.address,
                propertyId: 1
            },
            {
                nft: boots.address,
                propertyId: 0
            },
            {
                nft: armors.address,
                propertyId: 0
            }
        ]
        superiorRarityPrizes = [
            {
                nft: characters.address,
                propertyId: 1
            },
            {
                nft: weapons.address,
                propertyId: 2
            },
            {
                nft: weapons.address,
                propertyId: 3
            },
            {
                nft: boots.address,
                propertyId: 1
            },
            {
                nft: armors.address,
                propertyId: 1
            }
        ]
        rareRarityPrizes = [
            {
                nft: characters.address,
                propertyId: 2
            },
            {
                nft: weapons.address,
                propertyId: 4
            },
            {
                nft: weapons.address,
                propertyId: 5
            },
            {
                nft: boots.address,
                propertyId: 2
            },
            {
                nft: armors.address,
                propertyId: 2
            }
        ]
        legendaryRarityPrizes = [
            {
                nft: characters.address,
                propertyId: 3
            },
            {
                nft: weapons.address,
                propertyId: 6
            },
            {
                nft: weapons.address,
                propertyId: 7
            },
            {
                nft: boots.address,
                propertyId: 3
            },
            {
                nft: armors.address,
                propertyId: 3
            }
        ]
        epicRarityPrizes = [
            {
                nft: characters.address,
                propertyId: 4
            },
            {
                nft: weapons.address,
                propertyId: 8
            },
            {
                nft: weapons.address,
                propertyId: 9
            },
            {
                nft: boots.address,
                propertyId: 4
            },
            {
                nft: armors.address,
                propertyId: 4
            }
        ]
        lootbox = await Lootbox.deploy(
            regularRarityPrizes,
            superiorRarityPrizes,
            rareRarityPrizes,
            legendaryRarityPrizes,
            epicRarityPrizes,
            price,
            signer.address,
            owner.address,          //collector
            testToken.address
        )
        await lootbox.deployed()
        await testToken.mint(looter.address, ethers.utils.parseEther("10000"))
        await characters.setAllowedMint(lootbox.address, true)
        await armors.setAllowedMint(lootbox.address, true)
        await weapons.setAllowedMint(lootbox.address, true)
        await boots.setAllowedMint(lootbox.address, true)
	})

    describe('Initial', async () => {
        it('Should check initial variables positive', async () => {
            const characterURI = await characters.tokenURI(0)
            const armorsURI = await armors.tokenURI(0)
            const weaponsURI = await weapons.tokenURI(0)
            assert(characterURI.includes(charactersBaseURI))
            assert(armorsURI.includes(armorsBaseURI))
            assert(weaponsURI.includes(weaponsBaseURI))
        })
    })

    describe('Loot', () => {
        it('Should loot random nft', async () => {
            const counter = await lootbox.currentUserLoot(looter.address)
            const sign = await signLootbox(looter.address, lootbox.address, counter.toString(), signer)
            const tx = await lootbox.connect(looter).loot(sign.r, sign.v, sign.s, sign.randomNumber)
            const waitedTx = await tx.wait()
            const lootedEvent = waitedTx.events.find(v => v.event === 'Loot')
            const lootedNft = { nft: lootedEvent.args.nft, propertyId: lootedEvent.args.propertyId }
            const regularRarityLooted = regularRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const superiorRarityLooted = superiorRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const rareRarityLooted = rareRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const legendaryRarityLooted = legendaryRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const epicRarityLooted = epicRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            assert(regularRarityLooted || superiorRarityLooted || rareRarityLooted || legendaryRarityLooted || epicRarityLooted, "NFT exist")
        })
        it('Should loot negative random nft (err: already rewarded)', async () => {
            const counter = await lootbox.currentUserLoot(looter.address)
            const sign = await signLootbox(looter.address, lootbox.address, counter.toString(), signer)
            await lootbox.connect(looter).loot(sign.r, sign.v, sign.s, sign.randomNumber)
            await expect(
                lootbox.connect(looter).loot(sign.r, sign.v, sign.s, sign.randomNumber)
            ).to.be.revertedWith('FairFight Lootbox: Not verified')
        })
        it('Should loot negative random nft (err: not verified (wrong number))', async () => {
            const counter = await lootbox.currentUserLoot(looter.address)
            const sign = await signLootbox(looter.address, lootbox.address, counter.toString(), signer)
            await expect(
                lootbox.connect(looter).loot(sign.r, sign.v, sign.s, 99)
            ).to.be.revertedWith('FairFight Lootbox: Not verified')
        })
    })

    describe('Buy', () => {
        it('Should buy lootbox', async () => {
            await testToken.connect(looter).approve(lootbox.address, price)
            const tx = await lootbox.connect(looter).buy()
            const waitedTx = await tx.wait()
            const lootedEvent = waitedTx.events.find(v => v.event === 'Loot')
            const lootedNft = { nft: lootedEvent.args.nft, propertyId: lootedEvent.args.propertyId }
            const regularRarityLooted = regularRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const superiorRarityLooted = superiorRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const rareRarityLooted = rareRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const legendaryRarityLooted = legendaryRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            const epicRarityLooted = epicRarityPrizes.find(v => v.nft === lootedNft.nft && v.propertyId == lootedNft.propertyId)
            assert(regularRarityLooted || superiorRarityLooted || rareRarityLooted || legendaryRarityLooted || epicRarityLooted, "NFT exist")
            const ownerBalance = await testToken.balanceOf(owner.address)
            assert(ownerBalance.toString() === price.toString())
        })
    })

})