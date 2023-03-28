const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const { sign } = require("./utils/sign");

describe("FairFight", function (){
    let chainid;
    let acc1;
	let acc2;
	let acc3;
	let game;
    let ethCallGame;
    let ethCallProvider;
    let amountToPlay = ethers.utils.parseEther('1');
    //if win 1.1 eth
    //amount win with fee equals
    //1067000000000000000
    let amountForOneDeath = ethers.utils.parseEther('0.1');
    const amountUserGamesToReturn = 15
    const maxRounds = 10
    const maxPlayers = 2
    const minAmountPerRound = '10'
    const feeAddress = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const fee = 300 //3%

	beforeEach(async function() {
		[acc1, acc2, acc3] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("FairFight");
		game = await upgrades.deployProxy(Game, 
            [
            acc1.address, 
            maxRounds,
            feeAddress,
            fee,
            minAmountPerRound,
            maxPlayers
            ], 
        { initializer: "initialize" });
        await game.deployed()
        const chain = await ethers.provider.getNetwork()
        chainid = chain.chainId
	})

    describe('Initial', () => {
        it("Should check initial variables", async () => {
            const _minAmountPerRound = await game.minAmountPerRound(ethers.constants.AddressZero)
            const _maxPlayers = await game.maxPlayers()
            const _maxRounds = await game.maxRounds()
            assert.equal(maxRounds.toString(), _maxRounds.toString(), "maxRounds is ok")
            assert.equal(minAmountPerRound.toString(), _minAmountPerRound.toString(), "minAmountPerRound  in a Row is ok")
            assert.equal(maxPlayers.toString(), _maxPlayers.toString(), "maxPlayers in a Row is ok")
        })
    })

    describe('Positive main functions', () => {
        it("Should positive create(),join(),finish()", async () => {
            const tx = await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            const actualOwner = (await game.fights(1)).owner
            assert.equal(actualOwner, acc1.address, "Battle created")
            const tx2 = await game.connect(acc2).join(1, {value: amountToPlay})
            const actualPlayers = await game.getFightPlayers(1)
            assert(actualPlayers.find(v => v === acc2.address), "Player 2 Joined")
            const ID = 1
            const player1Amount = ethers.utils.parseEther('0.9');
            const player2Amount = ethers.utils.parseEther('1.1');
            const signature1 = await sign(ID, player1Amount, acc1.address, ethers.constants.AddressZero,game.address, acc1)
            const signature2 = await sign(ID, player2Amount, acc2.address, ethers.constants.AddressZero,game.address, acc1)
            const tx3 = await game.finish(ID, player1Amount, signature1.r, signature1.v, signature1.s)
            const tx4 = await game.connect(acc2).finish(ID, player2Amount, signature2.r, signature2.v, signature2.s)
            await expect(() => tx3).to.changeEtherBalance(acc1, player1Amount)
            await expect(() => tx3).to.changeEtherBalance(feeAddress, '0')//owner fee is 0 because lower than base amount
            await expect(() => tx4).to.changeEtherBalance(acc2, '1067000000000000000')//with fee
            await expect(() => tx4).to.changeEtherBalance(feeAddress, '33000000000000000')//owner fee
            //get past battles
            const pastBattlesAcc1 = await game.getPlayerFullFights(acc1.address, 1)
            const pastBattlesAcc2 = await game.getPlayerFullFights(acc2.address, 1)
            assert.equal(pastBattlesAcc1.length, 1, "Past Acc 1 battles")
            assert.equal(pastBattlesAcc1[0].owner, acc1.address, "Is not zeroAddress")
            assert.equal(pastBattlesAcc2.length, 1, "Past Acc 2 battles")
            assert.equal(pastBattlesAcc1[0].owner, acc1.address, "Is not zeroAddress")
        })

        it("Should positive withdraw()", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            //withdraw before somebody join game
            const tx = await game.withdraw(1)
            await expect(() => tx).to.changeEtherBalance(acc1, amountToPlay)
        })
    })

    describe('Negative create', () => {
        it("Should negative create() two times", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{ value: amountToPlay })
            await expect(
                game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            ).to.be.revertedWith("FairFight: You have open fight")
        })
    
        it("Should negative create() with zero", async () => {
            await expect(
                game.create(amountForOneDeath, 1, 2, ethers.constants.AddressZero,{value: '0'})
            ).to.be.revertedWith('FairFight: Wrong amount') 
        })
    
        it("Should negative create() with wrong amountPerRound", async () => {
            await expect(
                game.create('1', maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            ).to.be.revertedWith("FairFight: Too little amount per round")
        })
    
        it("Should negative create() with wrong rounds", async () => {
            await expect(
                game.create(amountForOneDeath, 20, 2, ethers.constants.AddressZero,{value: amountToPlay})
            ).to.be.revertedWith("FairFight: Wrong rounds amount")
        })
    
        it("Should negative create() with wrong amount of players", async () => {
            await expect(
                game.create(amountForOneDeath, maxRounds, 3, ethers.constants.AddressZero,{value: amountToPlay})
            ).to.be.revertedWith("FairFight: Too much players")
        })
    })

    describe('Negative join', () => {

        it("Should negative join() wrong amount", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{ value: amountToPlay })
            await expect(
                game.connect(acc2).join(1, {value: '0'})
            ).to.be.revertedWith("FairFight: Wrong amount")
        })
    
        it("Should negative join() two games in one moment", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc2).create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc3).join(1, {value: amountToPlay})
            await expect(
                game.connect(acc3).join(2, {value: amountToPlay})
            ).to.be.revertedWith("FairFight: You have open fight")
        })
    
        it("Should negative join() can't join same game", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc3).join(1, {value: amountToPlay})
            await expect(
                game.connect(acc3).join(1, {value: amountToPlay})
            ).to.be.revertedWith("FairFight: You have open fight")
        })
    
        it("Should negative join() fight is full", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc2).join(1, {value: amountToPlay})
            await expect(
                game.connect(acc3).join(1, {value: amountToPlay})
            ).to.be.revertedWith("FairFight: Fight is full")
        })    
    
        it("Should negative join() fight is over", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.withdraw(1)
            await expect(
                game.connect(acc3).join(1, {value: amountToPlay})
            ).to.be.revertedWith("FairFight: Fight is over")
        }) 
    
        it("Should negative join() fight's owner", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await expect(
                game.join(1, {value: amountToPlay})
            ).to.be.revertedWith("FairFight: You have open fight")
        }) 
    })

    describe('Negative withdraw', () => {
        it("Should negative withdraw() not fight's owner", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await expect(
                game.connect(acc3).withdraw(1)
            ).to.be.revertedWith("FairFight: You're not fight's owner")
        })
    
        it("Should negative withdraw() not fight is over", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.withdraw(1)
            await expect(
                game.withdraw(1)
            ).to.be.revertedWith("FairFight: Fight is over")
        })
    
        it("Should negative withdraw() fight has players", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc2).join(1, {value: amountToPlay})
            await expect(
                game.withdraw(1)
            ).to.be.revertedWith("FairFight: Fight has players")
        })
    })

    describe('Negative finish', () => {
        it("Should negative finish() don't have access", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            const actualOwner = (await game.fights(1)).owner
            assert.equal(actualOwner, acc1.address, "Battle created")
            await game.connect(acc2).join(1, {value: amountToPlay})
            const actualPlayers = await game.getFightPlayers(1)
            assert(actualPlayers.find(v => v === acc2.address), "Player 2 Joined")
            const ID = 1
            const player1Amount = ethers.utils.parseEther('0.9');
            const player2Amount = ethers.utils.parseEther('1.1');
            const player1WrongAmount = ethers.utils.parseEther('2');
            const player2WrongAmount = ethers.utils.parseEther('2');
            const signature1 = await sign(ID, player1Amount, acc1.address, ethers.constants.AddressZero,game.address, acc1)
            const signature2 = await sign(ID, player2Amount, acc2.address, ethers.constants.AddressZero,game.address, acc1)
            await expect(
                game.finish(ID, player1WrongAmount, signature1.r, signature1.v, signature1.s)
              ).to.be.revertedWith("FairFight: You dont have access")
            await expect(
                game.connect(acc2).finish(ID, player2WrongAmount, signature2.r, signature2.v, signature2.s)
              ).to.be.revertedWith("FairFight: You dont have access")
        })

        it("Should negative finish() already sended", async () => {
            await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
            const actualOwner = (await game.fights(1)).owner
            assert.equal(actualOwner, acc1.address, "Battle created")
            await game.connect(acc2).join(1, {value: amountToPlay})
            const actualPlayers = await game.getFightPlayers(1)
            assert(actualPlayers.find(v => v === acc2.address), "Player 2 Joined")
            const ID = 1
            const player1Amount = ethers.utils.parseEther('0.9');
            const player2Amount = ethers.utils.parseEther('1.1');
            const signature1 = await sign(ID, player1Amount, acc1.address, ethers.constants.AddressZero,game.address, acc1)
            const signature2 = await sign(ID, player2Amount, acc2.address, ethers.constants.AddressZero,game.address, acc1)
            await game.finish(ID, player1Amount, signature1.r, signature1.v, signature1.s)
            await game.connect(acc2).finish(ID, player2Amount, signature2.r, signature2.v, signature2.s)
            await expect(
                game.finish(ID, player1Amount, signature1.r, signature1.v, signature1.s)
              ).to.be.revertedWith("FairFight: Already sended")
            await expect(
                game.connect(acc2).finish(ID, player2Amount, signature2.r, signature2.v, signature2.s)
              ).to.be.revertedWith("FairFight: Already sended")
        })
    })

    describe('View functions', () => {
        it(`Should positive getPlayerFullFights()`, async () => {
            let amount = 16
            for (let i = 0; i <= amount; i++) {
                await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
                await game.connect(acc2).join(i+1, {value: amountToPlay})
                const player1Amount = ethers.utils.parseEther('0.9');
                const player2Amount = ethers.utils.parseEther('1.1');
                const signature1 = await sign(i+1, player1Amount,  acc1.address, ethers.constants.AddressZero,game.address, acc1)
                const signature2 = await sign(i+1, player2Amount,  acc2.address, ethers.constants.AddressZero,game.address, acc1)
                await game.finish(i+1, player1Amount, signature1.r, signature1.v, signature1.s)
                await game.connect(acc2).finish(i+1, player2Amount, signature2.r, signature2.v, signature2.s)
            }
            //all user games amount
            const userPastFights = await game.getPlayerFullFights(acc1.address, 16)
            assert.equal(userPastFights.length, 16)
            assert(userPastFights[0].finishTime != 0, 'Real game')
            assert(userPastFights[userPastFights.length-1].finishTime != 0, 'Real game2')
        })

        it("Should positive lastPlayerFight()", async () => {
            await game.create(amountForOneDeath, 10, 2, ethers.constants.AddressZero,{value: amountToPlay})
            const lastGame = await game.lastPlayerFight(acc1.address)
            const fight = await game.fights(lastGame)
            assert.equal(
                fight.owner,
                acc1.address,
                "Owner"
            )
        })

        it("Should positive getChunkFights()", async () => {
            let amount = 16
            for (let i = 1; i <= amount; i++) {
                await game.create(amountForOneDeath, maxRounds, 2, ethers.constants.AddressZero,{value: amountToPlay})
                await game.connect(acc2).join(i, {value: amountToPlay})
                const player1Amount = ethers.utils.parseEther('0.9');
                const player2Amount = ethers.utils.parseEther('1.1');
                const signature1 = await sign(i, player1Amount,  acc1.address, ethers.constants.AddressZero,game.address, acc1)
                const signature2 = await sign(i, player2Amount,  acc2.address, ethers.constants.AddressZero,game.address, acc1)
                await game.finish(i, player1Amount, signature1.r, signature1.v, signature1.s)
                await game.connect(acc2).finish(i, player2Amount, signature2.r, signature2.v, signature2.s)
            }
            let pastFights = []
            pastFights = [...pastFights, ...(await game.getChunkFights(0, 10))]
            pastFights = [...pastFights, ...(await game.getChunkFights(10, 10))]
            const pastFightsNotZeroAddress = pastFights.filter(v => v.owner !== ethers.constants.AddressZero)
            assert(pastFightsNotZeroAddress[0].ID == 16, 'ID of last is OK')
            assert(pastFightsNotZeroAddress[pastFightsNotZeroAddress.length - 1].ID == 1, 'ID of first is OK')
            assert(pastFightsNotZeroAddress.length === amount, 'Right amount of fights')
        })

        it("Should positive getFightPlayers()", async () => {
            const playersAmount = 2
            await game.create(amountForOneDeath, maxRounds, playersAmount, ethers.constants.AddressZero,{value: amountToPlay})
            await game.connect(acc2).join(1, {value: amountToPlay})
            const players = await game.getFightPlayers(1)
            assert(players.length === playersAmount, 'Players is OK')
        })
    })

})