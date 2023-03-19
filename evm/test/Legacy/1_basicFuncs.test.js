const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const web3 = require("web3")

describe("Game", function (){
    let acc1;
	let acc2;
	let acc3;
	let game;
    let amountToPlay = ethers.utils.parseEther('1');
    //if win 1.1 eth
    //amount win with fee equals
    //1067000000000000000
    let amountForOneDeath = ethers.utils.parseEther('0.1');
    let amountForOneDeathWrongDivide = ethers.utils.parseEther('0.3');
    let amountForOneDeathWrongMaxDeath = ethers.utils.parseEther('0.05');
    const amountUserGamesToReturn = 15
    const maxDeathInARow = 10
    const feeAddress = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const fee = 300

	beforeEach(async function() {
		[acc1, acc2, acc3] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("Game");
		game = await upgrades.deployProxy(Game, 
            [
            acc1.address, 
            amountUserGamesToReturn,
            maxDeathInARow,
            feeAddress,
            fee, //3%
            '1'
            ], 
        { initializer: "initialize" });
        await game.deployed()
	})

    it("Should check initial variables", async () => {
        //amount to create game
        const signerAccess = await game.signerAccess()
        const _maxDeathInARow = await game.maxDeathInARow()
        assert.equal(signerAccess.toString(), acc1.address.toString(), "Signer address is OK")
        assert.equal(_maxDeathInARow.toString(), maxDeathInARow.toString(), "Max Death in a Row is ok")
    })

    it("Should positive createBattle(),joinBattle(),finishBattle()", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        const actualPlayer1 = (await game.battles(0)).player1
        assert.equal(actualPlayer1, acc1.address, "Battle created")
        await game.connect(acc2).joinBattle(0, {value: amountToPlay})
        const actualPlayer2 = (await game.battles(0)).player2
        assert.equal(actualPlayer2.toString(), acc2.address, "Player 2 Joined")
        const ID = 0
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        //player 1 sign
        const message1 = [ID, player1Amount, player2Amount, acc1.address]
        const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message1)
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
        const tx1 = await game.finishBattle(data1)
        await expect(() => tx1).to.changeEtherBalance(acc1, player1Amount)
        await expect(() => tx1).to.changeEtherBalance(acc2, '1067000000000000000')//with fee
        await expect(() => tx1).to.changeEtherBalance(feeAddress, '33000000000000000')//owner fee
        //get past battles
        const pastBattlesAcc1 = await game.getUserPastBattles(acc1.address)
        const pastBattlesAcc2 = await game.getUserPastBattles(acc2.address)
        assert.equal(pastBattlesAcc1.length, 1, "Past Acc 1 battles")
        assert.equal(pastBattlesAcc2.length, 1, "Past Acc 2 battles")
    })

    it("Should negative finishBattle()", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        const actualPlayer1 = (await game.battles(0)).player1
        assert.equal(actualPlayer1, acc1.address, "Battle created")
        await game.connect(acc2).joinBattle(0, {value: amountToPlay})
        const actualPlayer2 = (await game.battles(0)).player2
        assert.equal(actualPlayer2.toString(), acc2.address, "Player 2")
        const ID = 0
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        const player1WrongAmount = ethers.utils.parseEther('2');
        const player2WrongAmount = ethers.utils.parseEther('2');
        //PLAYER 1 SIGN
        const message1 = [ID, player1Amount, player2Amount, acc1.address]
        const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message1)
        const sign1 = await acc1.signMessage(ethers.utils.arrayify(hashMessage1));
        const r1 = sign1.substr(0, 66)
        const s1 = '0x' + sign1.substr(66, 64);
        const v1 = web3.utils.toDecimal("0x" + (sign1.substr(130,2) == 0 ? "1b" : "1c"));
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
                player1WrongAmount, 
                player2Amount,
                r1,
                v1,
                s1
            ]
        )
        await expect(
            game.finishBattle(data1)
          ).to.be.revertedWith("You dont have access")
        // PLAYER 2 SIGN
        const message2 = [ID, player1Amount, player2Amount, acc2.address]
        const hashMessage2 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message2)
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
                player2WrongAmount,
                r2,
                v2,
                s2
            ]
        )
        await expect(
            game.connect(acc2).finishBattle(data2)
          ).to.be.revertedWith("You dont have access")
    })

    it("Should getOpenBattles() and withdraw()", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        //get open battles
        const openBattlesBefore = await game.getOpenBattles()
        //check if exist
        assert.equal(openBattlesBefore.length, 1, "Open battles")
        //withdraw before somebody join game
        const tx = await game.withdraw(0)
        const openBattlesAfter = await game.getOpenBattles()
        await expect(() => tx).to.changeEtherBalance(acc1, amountToPlay)
        //check if zero
        assert.equal(openBattlesAfter.length, 0, "Open battles")
        const pastBattles = await game.getUserPastBattles(acc1.address)
        assert.equal(pastBattles.length, 1, "Past battles")
    })

    it("Cant create 2 games in one moment", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        //cant create two battles in one moment
        await expect(
            game.createBattle(amountForOneDeath, {value: amountToPlay})
        ).to.be.revertedWith("You already have open battle")
    })

    it("Cant join 2 games in one moment", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        await game.connect(acc2).createBattle(amountForOneDeath, {value: amountToPlay})
        //join first
        await game.connect(acc3).joinBattle(0, {value: amountToPlay})
        //cant join two battles in one moment
        await expect(
            game.connect(acc3).joinBattle(1, {value: amountToPlay})
        ).to.be.revertedWith("You already have open battle")
    })

    it(`Should return maximum ${amountUserGamesToReturn} user past games`, async () => {
        let amount = 16
        for (let i = 0; i < amount; i++) {
            await game.createBattle(amountForOneDeath, {value: amountToPlay})
            await game.withdraw(i)
        }
        //all user games amount
        const userBattlesAmount = await game.userBattles(acc1.address)
        //equal amountUserGamesToReturn
        const userBattlesPast = await game.getUserPastBattles(acc1.address)
        assert.equal(userBattlesAmount, amount)
        //last timestamp is higher because it is created lately
        expect(
            userBattlesPast[amountUserGamesToReturn - 4].battleCreatedTimestamp
        ).to.be.above(
            userBattlesPast[amountUserGamesToReturn - 3].battleCreatedTimestamp
        ).to.be.above(
            userBattlesPast[amountUserGamesToReturn - 2].battleCreatedTimestamp
        )
    })

    it("Should getCurrentUserGame()", async () => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        const currentGame = await game.getCurrentUserGame(acc1.address)
        assert.equal(
            currentGame.player1Amount.toString(),
            amountToPlay,
            "Amount not equal"
        )
        await game.withdraw(0)
        //because we dont have current games contract will return 0 Battle
        const currentGameNotExist = await game.getCurrentUserGame(acc1.address)
        assert.equal(
            currentGameNotExist.player1Amount.toString(),
            "0",
            "Amount not equal"
        )
    })

    it("Should createBattle() with wrong amountForOneDeath", async () => {
        await expect(
            game.createBattle(amountForOneDeathWrongDivide, {value: amountToPlay})
        ).to.be.revertedWith("Amount for one death must be divided by the msg.value with the remainder 0")
    })

    it("Should createBattle() with wrong maxDeathInARow", async () => {
        await expect(
            game.createBattle(amountForOneDeathWrongMaxDeath, {value: amountToPlay})
        ).to.be.revertedWith("Exceeded the limit death in a row")
    })

})