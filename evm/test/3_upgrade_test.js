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
            ethers.utils.parseEther("1")
            ], 
        { initializer: "initialize" });
        await game.deployed()
        const GameV2 = await ethers.getContractFactory("GameV2");
        await upgrades.upgradeProxy(game.address, GameV2)
        console.log('ss')
        await game.createBattle(amountForOneDeath)
        .then(async (tx) => {
            await tx.wait()
            .then((data) => console.log(data))
        })
	})

    // it('should be updated', async () => {
    //     
    // })

})