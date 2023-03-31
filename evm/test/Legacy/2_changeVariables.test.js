const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")

describe("Game Variables", function (){
    let acc1;
	let acc2;
	let acc3;
	let game;
    let amountToPlay = ethers.utils.parseEther('1');
    let amountForOneDeath = ethers.utils.parseEther('0.1');
    const amountUserGamesToReturn = 15
    const maxDeathInARow = 10
    const newAmountUserGamesToReturn = 20
    const newMaxDeathInARow = 20

	beforeEach(async function() {
		[acc1, acc2, acc3] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("Game");
		game = await upgrades.deployProxy(Game, 
            [
            acc1.address, 
            amountUserGamesToReturn,
            maxDeathInARow,
            '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4',
            300, //3%
            '1'
            ], 
        { initializer: "initialize" });
        await game.deployed()
	})

    it("Should changeMaxDeathInARow()", async () => {
        const _maxDeathInARowBefore = await game.maxDeathInARow()
        assert.equal(_maxDeathInARowBefore, maxDeathInARow, 'Before')
        await game.changeMaxDeathInARow(newMaxDeathInARow)
        const _maxDeathInARowAfter = await game.maxDeathInARow()
        assert.equal(_maxDeathInARowAfter, newMaxDeathInARow, 'After')
    })

    it("Should changeMaxDeathInARow() negative", async () => {
        const _maxDeathInARowBefore = await game.maxDeathInARow()
        assert.equal(_maxDeathInARowBefore, maxDeathInARow, 'Before')
        //because wrong access
        await expect(
            game.connect(acc2).changeMaxDeathInARow(newMaxDeathInARow)
        ).to.be.reverted
        const _maxDeathInARowAfter = await game.maxDeathInARow()
        assert.equal(_maxDeathInARowAfter, _maxDeathInARowBefore, 'After')
    })

    it("Should changeSigner()", async () => {
        const _signerBefore = await game.signerAccess()
        assert.equal(_signerBefore, acc1.address, 'Before')
        await game.changeSigner(acc2.address)
        const _signerAfter = await game.signerAccess()
        assert.equal(_signerAfter, acc2.address, 'After')
    })

    it("Should changeSigner() negative", async () => {
        const _signerBefore = await game.signerAccess()
        assert.equal(_signerBefore, acc1.address, 'Before')
        //because wrong access
        await expect(
            game.connect(acc2).changeSigner(acc2.address)
        ).to.be.reverted
        const _signerAfter = await game.signerAccess()
        assert.equal(_signerAfter, _signerBefore, 'After')
    })

    it("Should changeAmountUserGamesToReturn()", async () => {
        const _amountUserGamesToReturnBefore = await game.amountUserGamesToReturn()
        assert.equal(_amountUserGamesToReturnBefore, amountUserGamesToReturn, 'Before')
        await game.changeAmountUserGamesToReturn(newAmountUserGamesToReturn)
        const _amountUserGamesToReturnAfter = await game.amountUserGamesToReturn()
        assert.equal(_amountUserGamesToReturnAfter, newAmountUserGamesToReturn, 'After')
    })

    it("Should changeAmountUserGamesToReturn() negative", async () => {
        const _amountUserGamesToReturnBefore = await game.amountUserGamesToReturn()
        assert.equal(_amountUserGamesToReturnBefore, amountUserGamesToReturn, 'Before')
        //because wrong access
        await expect(
            game.connect(acc2).changeAmountUserGamesToReturn(newAmountUserGamesToReturn)
        ).to.be.reverted
        const _amountUserGamesToReturnAfter = await game.amountUserGamesToReturn()
        assert.equal(_amountUserGamesToReturnAfter, _amountUserGamesToReturnBefore, 'After')
    })

    it("Should pause() and unpause() contract", async () => {
        await game.pause()
        await expect(
            game.createBattle(amountForOneDeath, {value: amountToPlay})
        ).to.be.revertedWith('Pausable: paused')
        await game.unpause()
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        const openBattlesBefore = await game.getOpenBattles()
        //check if exist
        assert.equal(openBattlesBefore.length, 1, "Open battles")
    })
})