const { expect } = require("chai");
const assert = require("assert");
const { ethers } = require("hardhat")

describe("FairFightNFT", function (){

    const name = "FairFightNFT"
    const symbol = "FFNFT"
    const baseURI = 'https://ipfs.io/ipfs/QmbZvNDcrz4ev1q39eatpwxnpGgfLadDZoKJi6FaVnHEvd/'
    const newBaseURI = 'https://ipfs.io/ipfs/QmSYxh2K2fEpWUpeqs3K8hsE9JMWjViFhJdVHMHoo7aCy1/'
    const maxSupply = 4
    const newMaxSupply = 5
    let owner, user
    let nft
    
    beforeEach(async function () {
        [owner, user] = await ethers.getSigners()
        const NFT = await ethers.getContractFactory("FairFightNFT")
        nft = await NFT.deploy(name, symbol, baseURI, maxSupply)
        await nft.deployed()
        await nft.setAllowedMint(owner.address, true)
    })

    describe("Initial", async () => {
        it('Should check initial variables positive', async () => {
            const deployedName = await nft.name()
            const deployedSymbol = await nft.symbol()
            const deployedBaseURI = await nft.baseURI()
            assert(deployedName === name, "NFT name")
            assert(deployedSymbol === symbol, "NFT symbol")
            assert(deployedBaseURI === baseURI, "NFT baseURI")
            //check constants
            assert(baseURI !== newBaseURI, "Base URI difference")
            assert(maxSupply !== newMaxSupply, "Max supply difference")
        })
    })

    describe("Mint", async () => {
        const characterId = 0

        it('Should mint token positive', async () => {
            let tx = await nft.mint(owner.address, characterId)
            tx = await tx.wait()
            const transferEvent = tx.events.find(v => v.event === 'Transfer')
            const tokenId = transferEvent.args.tokenId.toString()
            const nftOwner = await nft.ownerOf(tokenId)
            const tokenURI = await nft.tokenURI(tokenId)
            const mintedCharacterId = await nft.tokenProperty(tokenId)
            const characterMintedToThisUser = await nft.propertyToken(owner.address, characterId)
            //can't be zero
            assert(BigInt(tokenId) > BigInt(0), "NFT Id")
            assert(nftOwner === owner.address, "NFT owner")
            assert(tokenURI === `${baseURI}${characterId}.json`, "NFT tokenURI")
            assert(parseInt(mintedCharacterId) === characterId, "NFT characterID")
            //if === 0 means not exist to this player
            assert(parseInt(characterMintedToThisUser) !== 0, "NFT exist to this user")
        })
        
        it('Should mint token negative (err: already have this character)', async () => {
            //mint first time
            await nft.mint(owner.address, characterId)
            //mint second time negative
            await expect(
                nft.mint(owner.address, characterId)
            ).to.be.revertedWith('FairFightNFT: You already have this character')
        })

        it('Should mint token negative (err: not allowed to mint)', async () => {
            await expect(
                nft.connect(user).mint(user.address, characterId)
            ).to.be.revertedWith('FairFightNFT: Not allowed to mint') 
        })

        it('Should mint negative (err: max supply exceeded)', async () => {
            for (let i = 0; i < maxSupply + 1; i++) {
                if (i < maxSupply) {
                    await nft.mint(owner.address, characterId + i)
                } else {
                    await expect(
                        nft.mint(owner.address, characterId)
                    ).to.be.revertedWith("FairFightNFT: MaxSupply exceeded")
                }
            }
        })
    })

    describe('Update', async () => {
        const characterId = 1

        it('Should set allowed mint positive', async () => {
            //not allowed
            await expect(
                nft.connect(user).mint(user.address, characterId)
            ).to.be.revertedWith('FairFightNFT: Not allowed to mint') 
            //give allowance
            await nft.setAllowedMint(user.address, true)
            //succesfully
            await nft.connect(user).mint(user.address, characterId)
            //take back allowance
            await nft.setAllowedMint(user.address, false)
            //not allowed
            await expect(
                nft.connect(user).mint(user.address, characterId)
            ).to.be.revertedWith('FairFightNFT: Not allowed to mint') 
        })

        it('Should set base uri positive', async () => {
            //update base uri
            await nft.setBaseUri(newBaseURI)
            //get new base uri
            const settedBaseUri = await nft.baseURI()
            let tx = await nft.mint(owner.address, characterId)
            tx = await tx.wait()
            const transferEvent = tx.events.find(v => v.event === 'Transfer')
            const tokenId = transferEvent.args.tokenId.toString()
            const tokenURI = await nft.tokenURI(tokenId)
            assert(settedBaseUri === newBaseURI, "NFT base uri")
            assert(tokenURI === `${newBaseURI}${characterId}.json`, "NFT tokenURI")
        })

        it('Should set max supply', async () => {
            //update max supply
            await nft.setMaxSupply(newMaxSupply)
            const settedMaxSupply = await nft.maxSupply()
            assert(parseInt(settedMaxSupply) === newMaxSupply, "NFT max supply")
        })
    })

    describe('Owner control', async () => {
        it('Should setAllowedMint() negative (err: ownable)', async () => {
            await expect(
                nft.connect(user).setAllowedMint(user.address, true)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('Should setBaseUri() negative (err: ownable)', async () => {
            await expect(
                nft.connect(user).setBaseUri(newBaseURI)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('Should setMaxSupply() negative (err: ownable)', async () => {
            await expect(
                nft.connect(user).setMaxSupply(newMaxSupply)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Transfer', async () => {
        const characterId = 1

        it('Should transfer nft to user positive', async () => {
            let tx = await nft.mint(owner.address, characterId)
            tx = await tx.wait()
            const transferEvent = tx.events.find(v => v.event === 'Transfer')
            const tokenId = transferEvent.args.tokenId.toString()
            //transfer to user
            await nft.transferFrom(owner.address, user.address, tokenId)
            const nftOwner = await nft.ownerOf(tokenId)
            const characterTransferedToThisUser = await nft.propertyToken(user.address, characterId)
            const characterTransferedFromThisUser = await nft.propertyToken(owner.address, characterId)
            assert(nftOwner === user.address, "NFT new owner")
            //if === 0 means not exist to this player
            assert(parseInt(characterTransferedToThisUser) !== 0, "NFT character exist to this user")
            assert(parseInt(characterTransferedFromThisUser) === 0, "NFT character not exist to this user")
        })

        it('Should transfer nft to user negative (err: already have this character)', async () => {
            let tx = await nft.mint(owner.address, characterId)
            //mint to user too
            await nft.mint(user.address, characterId)
            tx = await tx.wait()
            const transferEvent = tx.events.find(v => v.event === 'Transfer')
            const tokenId = transferEvent.args.tokenId.toString()
            //transfer to user
            await expect(
                nft.transferFrom(owner.address, user.address, tokenId)
            ).to.be.revertedWith('ERC721: You already have this property')
        })

    })
})