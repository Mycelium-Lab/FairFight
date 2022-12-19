const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const web3 = require("web3")

describe("GameV2", function (){
    let acc1;
	let acc2;
	let acc3;
	let game;
    let amountToPlay = ethers.utils.parseEther('1');
    //if win 1.1 eth
    //amount win with fee equals
    //1067000000000000000
    let amountForOneDeath = ethers.utils.parseEther('1');
    const amountUserGamesToReturn = 15
    const maxDeathInARow = 10
    const feeAddress = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const fee = 300

    const createSign = async (ID, player1Amount, player2Amount) => {
        //player 1 sign
        const message1 = [ID, player1Amount, player2Amount, acc1.address]
        const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message1)
        const sign1 = await acc1.signMessage(ethers.utils.arrayify(hashMessage1));
        const r1 = sign1.substr(0, 66)
        const s1 = '0x' + sign1.substr(66, 64);
        const v1 = web3.utils.toDecimal("0x" + sign1.substr(130,2));
        const data1 = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256', 'uint256', 'bytes32', 'uint8', 'bytes32'], 
            [ID, player1Amount,  player2Amount, r1, v1, s1]
        )
        return data1
    }

	beforeEach(async function() {
		[acc1, acc2, acc3] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("GameV2");
		game = await upgrades.deployProxy(Game, 
            [
            acc1.address, 
            amountUserGamesToReturn,
            maxDeathInARow,
            feeAddress,
            fee, //3%
            ethers.utils.parseEther('1')
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
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        const data1 = await createSign(0, player1Amount, player2Amount)
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

    it("Should return chunk of battles", async () => {
        for (let i = 0; i < 30; i++) {
            await game.createBattle(amountForOneDeath, {value: amountToPlay})
            await game.connect(acc2).joinBattle(i, {value: amountToPlay})
            const player1Amount = ethers.utils.parseEther('0.9');
            const player2Amount = ethers.utils.parseEther('1.1');
            const data = await createSign(i, player1Amount, player2Amount)
            await game.finishBattle(data)
        }
        const chunk = await game.getChunkFinishedBattles(0, 10)
        assert(chunk[0].ID.toString() === '29')
        assert(chunk[9].ID.toString() === '20')
    })

})