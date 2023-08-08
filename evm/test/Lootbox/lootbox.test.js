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
    let charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    let armorsBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    const bootsBaseURI = 'https://ipfs.io/ipfs/Qmd7NkqYyuR3K2uP1Go3xHtuTomKV2aHBUa8mcncbUDNm3/'
    let weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'

    //contracts
    let lootbox
    let characters
    let armors
    let weapons
    let boots
    let testProperty
    let regularRarityPrizes = []
    let superiorRarityPrizes = []
    let rareRarityPrizes = []
    let legendaryRarityPrizes = []
    let epicRarityPrizes = []
    const maxSupply = 5

	beforeEach(async function() {
		[owner, looter, signer] = await ethers.getSigners()
        const FFNFT = await ethers.getContractFactory("FairFightNFT")
        const Lootbox = await ethers.getContractFactory("Lootbox")
        characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI, maxSupply)
        armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI, maxSupply)
        boots = await FFNFT.deploy("FairFightBoots", "FFB", bootsBaseURI, maxSupply)
        weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI, maxSupply)
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
            signer.address
        )
        await lootbox.deployed()
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
            console.log(lootedEvent)
            // const nftAddressIndex = nftsArray.findIndex(v => v === lootedEvent.args.nft)
            // const nftIds = propertiesArray[nftAddressIndex]
            // const nftIdFinded = nftIds.find(v => v == lootedEvent.args.propertyId) 
            // assert(!isNaN(parseInt(nftIdFinded)), "NFT exist")
        })
        // it('Should loot negative random nft (err: already rewarded)', async () => {
        //     const sign = await signLootbox(looter.address, lootbox.address, signer)
        //     await lootbox.connect(looter).loot(sign.r, sign.v, sign.s, sign.randomNum)
        //     await expect(
        //         lootbox.connect(looter).loot(sign.r, sign.v, sign.s, sign.randomNum)
        //     ).to.be.revertedWith('FairFight Lootbox: Already rewarded')
        // })
        // it('Should loot negative random nft (err: not verified (wrong number))', async () => {
        //     const sign = await signLootbox(looter.address, lootbox.address, signer)
        //     await expect(
        //         lootbox.connect(looter).loot(sign.r, sign.v, sign.s, 99)
        //     ).to.be.revertedWith('FairFight Lootbox: Not verified')
        // })
    })
})