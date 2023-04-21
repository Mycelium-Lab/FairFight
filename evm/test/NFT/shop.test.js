const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat")

describe("FairFightShop", function (){

    //signers
    let owner
    let buyer
    let collector

    //utils
    let charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    let armorsBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    let weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'

    let charactersPrices = []
    let armorsPrices = []
    let weaponsPrices = []
    //set prices
    for (let i = 0; i < 2; i++) {
        charactersPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 16; i++) {
        armorsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 14; i++) {
        weaponsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }

    //contracts
    let testUSDC
    let shop
    let characters
    let armors
    let weapons

    //utils functions
    const getIDFromBuyEvent = async(buyTx) => {
        const events = (await buyTx.wait()).events
        const buyEvent = events.find(e => e.event === 'Buy')
        const tokenID = buyEvent.args.ID
        return tokenID;
    }

	beforeEach(async function() {
		[owner, buyer, collector] = await ethers.getSigners()
        const FFNFT = await ethers.getContractFactory("FairFightNFT")
        const Token = await ethers.getContractFactory("TokenForTests")
		const Shop = await ethers.getContractFactory("FairFightShop")
        characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI)
        armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI)
        weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI)
        testUSDC = await Token.deploy('TestCircle', 'TUSDC')
        await characters.deployed()
        await armors.deployed()
        await weapons.deployed()
        await testUSDC.deployed()
	    shop = await Shop.deploy(
            characters.address,
            weapons.address,
            armors.address,
            testUSDC.address,
            charactersPrices,
            weaponsPrices,
            armorsPrices,
            collector.address
        )
        await shop.deployed()
        await characters.setAllowedMint(shop.address, true)
        await armors.setAllowedMint(shop.address, true)
        await weapons.setAllowedMint(shop.address, true)
	})

    describe('Initial', async () => {
        it('positive initial variables', async () => {
            console.log(await characters.tokenURI(0))
            // const priceCharacter0 = await shop.allowedTokens(testUSDC.address, 0)
            // const priceCharacter1 = await shop.allowedTokens(testUSDC.address, 1)
            // const _character0Uri = await shop.characterURIs(0)
            // const _character1Uri = await shop.characterURIs(1)
            // assert(priceCharacter0.toString() === amountInUSDPerCharacter0.toString(), 'Price character 0')
            // assert(priceCharacter1.toString() === amountInUSDPerCharacter1.toString(), 'Price character 1')
            // assert(_character0Uri === character0Uri, 'Character 0 Uri')
            // assert(_character1Uri === character1Uri, 'Character 1 Uri')
        })
    })

    // describe('Buy', async () => {
    //     it('positive buy character 0', async () => {
    //         //check if collector balance equals 0 before buy
    //         const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
    //         assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
    //         //get price character 0
    //         const priceCharacter0 = await shop.connect(buyer).allowedTokens(testUSDC.address, 0)
    //         //approve token to shop in amount price character 0
    //         await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
    //         //buy character
    //         const buyTx = await shop.connect(buyer).buy(testUSDC.address, 0)
    //         //get tokenID from event
    //         const tokenID = await getIDFromBuyEvent(buyTx)
    //         const tokenOwner = await shop.ownerOf(tokenID)
    //         //check if collector got his tokens
    //         const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
    //         assert(collectorAmountAfter.toString() === priceCharacter0.toString(), 'Collector balance = price character 0')
    //         //check if buyer is token owner
    //         assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
    //     })

    //     it('positive buy character 1', async () => {
    //         //check if collector balance equals 0 before buy
    //         const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
    //         assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
    //         //get price character 0
    //         const priceCharacter1 = await shop.connect(buyer).allowedTokens(testUSDC.address, 1)
    //         //approve token to shop in amount price character 0
    //         await testUSDC.connect(buyer).approve(shop.address, priceCharacter1)
    //         //buy character
    //         const buyTx = await shop.connect(buyer).buy(testUSDC.address, 1)
    //         //get tokenID from event
    //         const tokenID = await getIDFromBuyEvent(buyTx)
    //         const tokenOwner = await shop.ownerOf(tokenID)
    //         //check if collector got his tokens
    //         const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
    //         assert(collectorAmountAfter.toString() === priceCharacter1.toString(), 'Collector balance = price character 1')
    //         //check if buyer is token owner
    //         assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
    //     })
    // })

})