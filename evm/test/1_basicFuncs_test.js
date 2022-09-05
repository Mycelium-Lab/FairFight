const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const web3 = require("web3")

describe("Game", () => {
    let acc1;
	let acc2;
	let acc3;
	let game;
    let amountToPlay = ethers.utils.parseEther('1');

	beforeEach(async () => {
		[acc1, acc2, acc3] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("Game");
		game = await upgrades.deployProxy(Game, [amountToPlay, acc1.address], { initializer: "initialize" });
        await game.deployed()
	})

    it("Should check initial variables", async () => {
        const _amountToPlay = await game.amountToPlay()
        assert.equal(_amountToPlay.toString(), amountToPlay.toString(), "Amount to play is OK")
    })

    it("Should createBattle() and joinBattle()", async () => {
        const battleName = "new"
        await game.createBattle(battleName, {value: amountToPlay})
        const actualName = (await game.battles(0)).name
        assert.equal(actualName, battleName, "Battle created")
        await game.connect(acc2).joinBattle(0, {value: amountToPlay})
        const actualPlayer2 = (await game.battles(0)).player2
        assert.equal(actualPlayer2.toString(), acc2.address, "Player 2")
        const ID = 0
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        //player 1 sign
        const message1 = [ID, player1Amount, player2Amount, game.address, acc1.address]
        const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160","uint160"], message1)
        const sign1 = await acc1.signMessage(ethers.utils.arrayify(hashMessage1));
        const r1 = sign1.substr(0, 66)
        const s1 = '0x' + sign1.substr(66, 64);
        const v1 = web3.utils.toDecimal("0x" + sign1.substr(130,2));
        const data1 = ethers.utils.defaultAbiCoder.encode(
            [
                'uint256',
                'uint256',
                'uint256',
                'bytes32',
                'uint8',
                'bytes32'
            ], 
            [
                ID, 
                player1Amount, 
                player2Amount,
                r1,
                v1,
                s1
            ]
        )
        await game.finishBattle(data1)
        //player 1 sign
        const message2 = [ID, player1Amount, player2Amount, game.address, acc2.address]
        const hashMessage2 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160","uint160"], message2)
        const sign2 = await acc1.signMessage(ethers.utils.arrayify(hashMessage2));
        const r2 = sign2.substr(0, 66)
        const s2 = '0x' + sign2.substr(66, 64);
        const v2 = web3.utils.toDecimal("0x" + sign2.substr(130,2));
        const data2 = ethers.utils.defaultAbiCoder.encode(
            [
                'uint256',
                'uint256',
                'uint256',
                'bytes32',
                'uint8',
                'bytes32'
            ], 
            [
                ID, 
                player1Amount, 
                player2Amount,
                r2,
                v2,
                s2
            ]
        )
        await game.connect(acc2).finishBattle()
    })

})