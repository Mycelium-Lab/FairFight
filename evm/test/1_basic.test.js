const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const web3 = require("web3");
const { sign } = require("./utils/sign");

describe("FairFight", function (){
    const chainid = 31337
    let acc1;
	let acc2;
	let acc3;
	let game;
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
	})

    it("Should check initial variables", async () => {
        const _minAmountPerRound = await game.minAmountPerRound()
        const _maxPlayers = await game.maxPlayers()
        const _maxRounds = await game.maxRounds()
        assert.equal(maxRounds.toString(), _maxRounds.toString(), "maxRounds is ok")
        assert.equal(minAmountPerRound.toString(), _minAmountPerRound.toString(), "minAmountPerRound  in a Row is ok")
        assert.equal(maxPlayers.toString(), _maxPlayers.toString(), "maxPlayers in a Row is ok")
    })

    it("Should positive create(),join(),finish()", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        const actualOwner = (await game.fights(0)).owner
        assert.equal(actualOwner, acc1.address, "Battle created")
        await game.connect(acc2).join(0, {value: amountToPlay})
        const actualPlayer = await game.players(0, 1)
        assert(actualPlayer === acc2.address, "Player 2 Joined")
        const ID = 0
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        const signature1 = await sign(ID, player1Amount, chainid, acc1.address, game.address, acc1)
        const signature2 = await sign(ID, player2Amount, chainid, acc2.address, game.address, acc1)
        const tx1 = await game.finish(ID, player1Amount, signature1.r, signature1.v, signature1.s)
        const tx2 = await game.connect(acc2).finish(ID, player2Amount, signature2.r, signature2.v, signature2.s)
        await expect(() => tx1).to.changeEtherBalance(acc1, player1Amount)
        await expect(() => tx2).to.changeEtherBalance(acc2, '1067000000000000000')//with fee
        await expect(() => tx2).to.changeEtherBalance(feeAddress, '33000000000000000')//owner fee
        //get past battles
        const pastBattlesAcc1 = await game.userPastFights(acc1.address, 1)
        const pastBattlesAcc2 = await game.userPastFights(acc2.address, 1)
        assert.equal(pastBattlesAcc1.length, 1, "Past Acc 1 battles")
        assert.equal(pastBattlesAcc2.length, 1, "Past Acc 2 battles")
    })

    it("Should negative finishBattle()", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        const actualOwner = (await game.fights(0)).owner
        assert.equal(actualOwner, acc1.address, "Battle created")
        await game.connect(acc2).join(0, {value: amountToPlay})
        const actualPlayer = await game.players(0, 1)
        assert(actualPlayer === acc2.address, "Player 2 Joined")
        const ID = 0
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        const player1WrongAmount = ethers.utils.parseEther('2');
        const player2WrongAmount = ethers.utils.parseEther('2');
        const signature1 = await sign(ID, player1Amount, chainid, acc1.address, game.address, acc1)
        const signature2 = await sign(ID, player2Amount, chainid, acc2.address, game.address, acc1)
        await expect(
            game.finish(ID, player1WrongAmount, signature1.r, signature1.v, signature1.s)
          ).to.be.revertedWith("FairFight: You dont have access")
        await expect(
            game.connect(acc2).finish(ID, player2WrongAmount, signature2.r, signature2.v, signature2.s)
          ).to.be.revertedWith("FairFight: You dont have access")
    })

    it("Should withdraw()", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        const busy = await game.currentlyBusy(acc1.address)
        //check if exist
        assert(busy, "Busy")
        //withdraw before somebody join game
        const tx = await game.withdraw(0)
        const busyAfter = await game.currentlyBusy(acc1.address)
        await expect(() => tx).to.changeEtherBalance(acc1, amountToPlay)
        //check if zero
        assert(!busyAfter, "Busy after")
    })

    it("Cant create 2 games in one moment", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        //cant create two fights in one moment
        await expect(
            game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        ).to.be.revertedWith("FairFight: You have open fight")
    })

    it("Cant join 2 games in one moment", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        await game.connect(acc2).create(amountForOneDeath, 10, 2, {value: amountToPlay})
        //join first
        await game.connect(acc3).join(0, {value: amountToPlay})
        //cant join two battles in one moment
        await expect(
            game.connect(acc3).join(1, {value: amountToPlay})
        ).to.be.revertedWith("FairFight: You have open fight")
    })

    it(`Should return maximum ${amountUserGamesToReturn} user past games`, async () => {
        let amount = 16
        for (let i = 0; i <= amount; i++) {
            await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
            await game.connect(acc2).join(i, {value: amountToPlay})
            const player1Amount = ethers.utils.parseEther('0.9');
            const player2Amount = ethers.utils.parseEther('1.1');
            const signature1 = await sign(i, player1Amount, chainid, acc1.address, game.address, acc1)
            const signature2 = await sign(i, player2Amount, chainid, acc2.address, game.address, acc1)
            await game.finish(i, player1Amount, signature1.r, signature1.v, signature1.s)
            await game.connect(acc2).finish(i, player2Amount, signature2.r, signature2.v, signature2.s)
        }
        //all user games amount
        const userPastFights = await game.userPastFights(acc1.address, amount)
        assert.equal(userPastFights.length, amount)
        assert(userPastFights[0].finishTime != 0, 'Real game')
        assert(userPastFights[userPastFights.length-1].finishTime != 0, 'Real game2')
    })

    it("Should lastPlayerFight()", async () => {
        await game.create(amountForOneDeath, 10, 2, {value: amountToPlay})
        const lastGame = await game.lastPlayerFight(acc1.address)
        const fight = await game.fights(lastGame)
        assert.equal(
            fight.owner,
            acc1.address,
            "Not owner"
        )
    })

    it("Should create() with wrong value", async () => {
        await expect(
            game.create(amountForOneDeath, 10, 2, {value: '1'})
        ).to.be.revertedWith("FairFight: Wrong amount")
    })

    it("Should create() with wrong amountPerRound", async () => {
        await expect(
            game.create('1', 10, 2, {value: amountToPlay})
        ).to.be.revertedWith("FairFight: Too little amount per round")
    })

    it("Should create() with wrong rounds", async () => {
        await expect(
            game.create(amountForOneDeath, 20, 2, {value: amountToPlay})
        ).to.be.revertedWith("FairFight: Too much rounds")
    })

    it("Should create() with wrong amount of players", async () => {
        await expect(
            game.create(amountForOneDeath, 10, 3, {value: amountToPlay})
        ).to.be.revertedWith("FairFight: Too much players")
    })

})