const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat")

describe("FairFightShop", function (){

    //signers
    let owner
    let buyer
    let collector
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

    //contracts
    let testUSDC
    let shop
    let characters
    let armors
    let weapons
    let boots
    const maxSupply = 5

	beforeEach(async function() {
		[owner, buyer, collector, acc4, acc5, acc6, acc7, acc8, acc9] = await ethers.getSigners()
        const FFNFT = await ethers.getContractFactory("FairFightNFT")
        const Token = await ethers.getContractFactory("TokenForTests")
		const Shop = await ethers.getContractFactory("FairFightShop")
        characters = await FFNFT.deploy("FairFightCharacters", "FFC", charactersBaseURI, maxSupply)
        armors = await FFNFT.deploy("FairFightArmor", "FFA", armorsBaseURI, maxSupply)
        boots = await FFNFT.deploy("FairFightBoots", "FFB", bootsBaseURI, maxSupply)
        weapons = await FFNFT.deploy("FairFightWeapons", "FFW", weaponsBaseURI, maxSupply)
        testUSDC = await Token.deploy('TestCircle', 'TUSDC')
        await characters.deployed()
        await armors.deployed()
        await weapons.deployed()
        await boots.deployed()
        await testUSDC.deployed()
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
	})

    describe('Initial', async () => {
        it('positive initial variables', async () => {
            const characterURI = await characters.tokenURI(0)
            const armorsURI = await armors.tokenURI(0)
            const weaponsURI = await weapons.tokenURI(0)
            assert(characterURI.includes(charactersBaseURI))
            assert(armorsURI.includes(armorsBaseURI))
            assert(weaponsURI.includes(weaponsBaseURI))
        })
    })

    describe('Buy', async () => {
        it('positive buy character 0', async () => {
            //check if collector balance equals 0 before buy
            const collectorAmountBefore = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountBefore.toString() === '0', 'Collector balance = 0')
            //get price character 0
            const priceCharacter0 = await shop.connect(buyer).prices(characters.address, testUSDC.address, 0)
            assert(priceCharacter0 > 0)
            //approve token to shop in amount price character 0
            await testUSDC.connect(buyer).approve(shop.address, priceCharacter0)
            //buy character
            const buyTx = await shop.connect(buyer).buy(characters.address, testUSDC.address, 0)
            const tokenOwner = await characters.ownerOf(1)
            //check if collector got his tokens
            const collectorAmountAfter = await testUSDC.balanceOf(collector.address)
            assert(collectorAmountAfter.toString() === priceCharacter0.toString(), 'Collector balance = price character 0')
            //check if buyer is token owner
            assert(tokenOwner === buyer.address, 'Buyer 0 token owner')
        })

        it('negative buy character 2', async () => {
            await expect(
                shop.connect(buyer).prices(characters.address, testUSDC.address, 2)
            ).to.be.reverted //because of array out of bonds
            //still trying
            await expect(
                shop.connect(buyer).buy(characters.address, testUSDC.address, 2)
            ).to.be.reverted //because of array out of bonds
        })
    })

    describe('NFT', async () => {
        it('Should exceed max supply', async () => {
            let signers = [acc4, acc5, acc6, acc7, acc8, acc9]
            await characters.setAllowedMint(owner.address, true)
            for (let i = 0; i <= maxSupply; i++) {
                if (i === maxSupply) {
                    await expect(
                        characters.mint(signers[i].address, 1)
                    ).to.be.revertedWith('FairFightNFT: MaxSupply exceeded')
                } else {
                    await characters.mint(signers[i].address, 1)
                }
            }
        })
    })

})