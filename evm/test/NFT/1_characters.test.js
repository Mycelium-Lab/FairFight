const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat")

describe("FairFightCharacterShop", function (){

    //signers
    let owner
    let buyer
    let collector

    //utils
    let amountInUSDPerCharacter0 = ethers.utils.parseEther('100')
    let amountInUSDPerCharacter1 = ethers.utils.parseEther('200')
    let character0Uri = 'ipfs://hash0'
    let character1Uri = 'ipfs://hash1'

    //contracts
    let testUSDC
    let shop

    //utils functions
    const getIDFromBuyEvent = async(buyTx) => {
        const events = (await buyTx.wait()).events
        const buyEvent = events.find(e => e.event === 'Buy')
        const tokenID = buyEvent.args.ID
        return tokenID;
    }

	beforeEach(async function() {
		[owner, buyer, collector] = await ethers.getSigners()
        //contracts deploy
		const Shop = await ethers.getContractFactory("FairFightCharacterShop")
	    shop = await Shop.deploy(collector.address)
        await shop.deployed()
        const Token = await ethers.getContractFactory("TokenForTests")
        testUSDC = await Token.deploy('Circle', 'USDC')
        await testUSDC.deployed()
        await testUSDC.mint(buyer.address, amountInUSDPerCharacter0)
        await testUSDC.mint(buyer.address, amountInUSDPerCharacter1)
        //set data
        await shop.setCharacterUri(0, character0Uri)
        await shop.setCharacterUri(1, character1Uri)
        await shop.setAllowedToken(testUSDC.address, 0, amountInUSDPerCharacter0)
        await shop.setAllowedToken(testUSDC.address, 1, amountInUSDPerCharacter1)
	})

    describe('Initial', async () => {
        it('positive initial variables', async () => {
            const priceCharacter0 = await shop.allowedTokens(testUSDC.address, 0)
            const priceCharacter1 = await shop.allowedTokens(testUSDC.address, 1)
            const _character0Uri = await shop.URIs(0)
            const _character1Uri = await shop.URIs(1)
            assert(priceCharacter0.toString() === amountInUSDPerCharacter0.toString(), 'Price character 0')
            assert(priceCharacter1.toString() === amountInUSDPerCharacter1.toString(), 'Price character 1')
            assert(_character0Uri === character0Uri, 'Character 0 Uri')
            assert(_character1Uri === character1Uri, 'Character 1 Uri')
        })
    })

    describe('Buy', async () => {
        it('positive buy character 0', async () => {
            //check if collector balance equals 0 before buy
            const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
            //get price character 0
            const priceCharacter0 = await shop.connect(buyer).allowedTokens(testUSDC.address, 0)
            //approve token to shop in amount price character 0
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            //buy character
            const buyTx = await shop.connect(buyer).buy(testUSDC.address, 0)
            //get tokenID from event
            const tokenID = await getIDFromBuyEvent(buyTx)
            const tokenOwner = await shop.ownerOf(tokenID)
            //check if collector got his tokens
            const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountAfter.toString() === priceCharacter0.toString(), 'Collector balance = price character 0')
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })

        it('positive buy character 1', async () => {
            //check if collector balance equals 0 before buy
            const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
            //get price character 0
            const priceCharacter1 = await shop.connect(buyer).allowedTokens(testUSDC.address, 1)
            //approve token to shop in amount price character 0
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter1)
            //buy character
            const buyTx = await shop.connect(buyer).buy(testUSDC.address, 1)
            //get tokenID from event
            const tokenID = await getIDFromBuyEvent(buyTx)
            const tokenOwner = await shop.ownerOf(tokenID)
            //check if collector got his tokens
            const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountAfter.toString() === priceCharacter1.toString(), 'Collector balance = price character 1')
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })
    })

})