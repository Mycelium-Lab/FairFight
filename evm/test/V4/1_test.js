const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")
const web3 = require("web3")

describe("GameV4", function (){
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
		const Game = await ethers.getContractFactory("GameV4");
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

    it("Should change currently busy", async () => {
        assert(await game.currentlyBusy(acc1.address) == false)
        await game.changePlayerCurrentlyBusy(acc1.address, true)
        assert(await game.currentlyBusy(acc1.address) == true)
        await game.changePlayerCurrentlyBusy(acc1.address, false)
        assert(await game.currentlyBusy(acc1.address) == false)
    })

})