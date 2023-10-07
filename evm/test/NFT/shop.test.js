const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat")

describe("FairFightShop", function (){

    //signers
    let owner
    let buyer
    let collector
    let newCollector
    let acc4, acc5, acc6, acc7, acc8, acc9

    //utils
    let charactersBaseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    let armorsBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    const bootsBaseURI = 'https://ipfs.io/ipfs/Qmd7NkqYyuR3K2uP1Go3xHtuTomKV2aHBUa8mcncbUDNm3/'
    let weaponsBaseURI = 'https://ipfs.io/ipfs/QmSjXwvkd9jb46x4yJLHVQtBbthquJxEeeUaJuQpzMkGBs/'

    let charactersPrices = []
    let armorsPrices = []
    let bootsPrices = []
    let weaponsPrices = []
    //set prices
    for (let i = 0; i < 2; i++) {
        charactersPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 8; i++) {
        armorsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 8; i++) {
        bootsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    for (let i = 0; i < 14; i++) {
        weaponsPrices.push(ethers.utils.parseEther(`${1 + i}`))
    }
    let newCharactersPrices = []
    for (let i = 0; i < 2; i++) {
        newCharactersPrices.push(ethers.utils.parseEther(`${10 + i}`))
    }

    //contracts
    let testUSDC
    let testUSDT
    let shop
    let characters
    let armors
    let weapons
    let boots
    let testProperty
    const maxSupply = 5

	beforeEach(async function() {
		[owner, buyer, collector, acc4, acc5, acc6, acc7, acc8, newCollector] = await ethers.getSigners()
        const FFNFT = await ethers.getContractFactory("FairFightNFT")
        const Token = await ethers.getContractFactory("TokenForTests")
		const Shop = await ethers.getContractFactory("FairFightShop")
        characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI, maxSupply)
        armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI, maxSupply)
        boots = await FFNFT.deploy("FairFightBoots", "FFB", bootsBaseURI, maxSupply)
        weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI, maxSupply)
        testProperty = await FFNFT.deploy("FairFightTestProperty", "FFTP", '', maxSupply)
        testUSDC = await Token.deploy('TestCircle', 'TUSDC')
        testUSDT = await Token.deploy('TestTether', 'TUSDT')
        await characters.deployed()
        await armors.deployed()
        await weapons.deployed()
        await boots.deployed()
        await testUSDC.deployed()
        await testUSDT.deployed()
        await testProperty.deployed()
	    shop = await Shop.deploy(
            characters.address,
            weapons.address,
            armors.address,
            boots.address,
            testUSDC.address,
            charactersPrices,
            weaponsPrices,
            armorsPrices,
            bootsPrices,
            collector.address
        )
        await shop.deployed()
        await characters.setAllowedMint(shop.address, true)
        await armors.setAllowedMint(shop.address, true)
        await weapons.setAllowedMint(shop.address, true)
        await testUSDC.mint(buyer.address, ethers.utils.parseEther('10000000'))
        await shop.setAllPrices(characters.address, ethers.constants.AddressZero, charactersPrices)
        await shop.setAllPrices(armors.address, ethers.constants.AddressZero, armorsPrices)
        await shop.setAllPrices(weapons.address, ethers.constants.AddressZero, weaponsPrices)
        await shop.setAllPrices(boots.address, ethers.constants.AddressZero, bootsPrices)
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

    describe('Buy', () => {
        it('Should buy erc20 positive', async () => {
            //check if collector balance equals 0 before buy
            const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
            //get price character 0
            const priceCharacter0 = await shop.connect(buyer).prices(characters.address, testUSDC.address, 0)
            assert(priceCharacter0 > 0)
            //approve token to shop in amount price character 0
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            //buy character
            await shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
            const tokenOwner = await characters.ownerOf(1)
            //check if collector got his tokens
            const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountAfter.toString() === priceCharacter0.toString(), 'Collector balance = price character 0')
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })

        it('Should buy native positive', async () => {
            //get price character 0
            const priceCharacter0 = await shop.connect(buyer).prices(characters.address, ethers.constants.AddressZero, 0)
            assert(priceCharacter0 > 0)
            //buy character
            const tx = await shop.connect(buyer).buy(characters.address, ethers.constants.AddressZero, 0, { value: priceCharacter0 })
            const tokenOwner = await characters.ownerOf(1)
            //check if collector got his tokens
            await expect(() => tx).to.changeEtherBalance(collector, priceCharacter0)
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })

        it('Should buy native negative (err: value is empty)', async () => {
            //get price character 0
            const priceCharacter0 = await shop.connect(buyer).prices(characters.address, ethers.constants.AddressZero, 0)
            assert(priceCharacter0 > 0)
            //buy character
            await expect(
                shop.connect(buyer).buy(characters.address, ethers.constants.AddressZero, 0)
            ).to.be.revertedWith("FFShop: Value not equal price")
        })
        
        it('Should buy negative (err: not exist)', async () => {
            await expect(
                shop.connect(buyer).prices(characters.address, testUSDC.address, 2)
            ).to.be.reverted //because of array out of bonds
            //still trying
            await expect(
                shop.connect(buyer).buy(characters.address, testUSDC.address, 2)
            ).to.be.reverted //because of array out of bonds
        })

        it('Should buy negative (err: not allowed to buy because price is 0)', async () => {
             //set character 0 price = 0
             await shop.setPrice(characters.address, testUSDC.address, 0, 0)
             //trying to buy
             await expect(
                shop.buy(characters.address, testUSDC.address, 0)
             ).to.be.revertedWithCustomError(shop, 'NotAllowedBuy')
        })

        it('Should buy negative (err: not allowed to buy because wrong token)', async () => {
            //Array accessed at an out-of-bounds or negative
            await expect(
                shop.buy(characters.address, testUSDT.address, 0)
            ).to.be.reverted
        })

        it('Should buy negative (err: not allowed to buy because wrong property)', async () => {
            //Array accessed at an out-of-bounds or negative
            await expect(
                shop.buy(testProperty.address, testUSDC.address, 0)
            ).to.be.reverted
        })
    })

    describe('Update', () => {
        //setPrice already used in Should buy negative (err: not allowed to buy because price is 0)
        let priceCharacter0

        it('Should set work status positive', async () => {
            await shop.setWorkStatus(false)
            await expect(
                shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
            ).to.be.revertedWithCustomError(shop, 'ShopNotWorking')
            await shop.setWorkStatus(true)
            //works
            priceCharacter0 = await shop.connect(buyer).prices(characters.address, testUSDC.address, 0)
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            await shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
        })

        it('Should set all prices positive', async () => {
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            await shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
            await shop.setAllPrices(characters.address, testUSDC.address, [])
            //trying to buy
            //Array accessed at an out-of-bounds or negative
            await expect(
                shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
             ).to.be.reverted
        })

        it('Should set collector positive', async () => {
            //set new collector
            await shop.setCollector(newCollector.address)
            //check if collector balance equals 0 before buy
            const collectorAmountBefore = await testUSDC.balanceOf(newCollector.address)
            assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
            //approve token to shop in amount price character 0
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            //buy character
            await shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
            const tokenOwner = await characters.ownerOf(1)
            //check if collector got his tokens
            const collectorAmountAfter = await testUSDC.balanceOf(newCollector.address)
            assert(collectorAmountAfter.toString() === priceCharacter0.toString(), 'Collector balance = price character 0')
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })

    })

    describe('Owner', () => {

        it('Should setAllPrices() negative (err: ownable)', async () => {
            await expect(
                shop.connect(buyer).setAllPrices(characters.address, testUSDC.address, [])
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('Should setPrice() negative (err: ownable)', async () => {
            await expect(
                shop.connect(buyer).setPrice(characters.address, testUSDC.address, 0, 1)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('Should setCollector() negative (err: ownable)', async () => {
            await expect(
                shop.connect(buyer).setCollector(buyer.address)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('Should setWorkStatus() negative (err: ownable)', async () => {
            await expect(
                shop.connect(buyer).setWorkStatus(false)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

    })

})