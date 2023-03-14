const { expect } = require("chai");
const assert = require("assert");
const { upgrades, ethers } = require("hardhat")

describe("AirDrop", function (){
    let acc1;
	let acc2;
	let acc3;
	let game;
    let signerAccess;
    let airDrop;
    let amountToPlay = ethers.utils.parseEther('1');
    //if win 1.1 eth
    //amount win with fee equals
    //1067000000000000000
    let amountForOneDeath = ethers.utils.parseEther('0.1');
    const amountUserGamesToReturn = 15
    const maxDeathInARow = 10
    const feeAddress = '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4'
    const fee = 300
    const minAmountForOneRound = '1'
    const newAmountToSend = ethers.utils.parseEther('1');
    const newAmountToFirstSend = ethers.utils.parseEther('0.5');
    const newMinBattlesAmount = 10;
    const wrongSign = {v:"0x1b",r:"0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042",s:"0x24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354"}

    const playBattle = async (ID) => {
        await game.createBattle(amountForOneDeath, {value: amountToPlay})
        await game.connect(acc2).joinBattle(ID, {value: amountToPlay})
        const player1Amount = ethers.utils.parseEther('0.9');
        const player2Amount = ethers.utils.parseEther('1.1');
        //player 1 sign
        const message1 = [ID, player1Amount, player2Amount, acc1.address]
        const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message1)
        const sign1 = await acc1.signMessage(ethers.utils.arrayify(hashMessage1));
        const r1 = sign1.substr(0, 66)
        const s1 = '0x' + sign1.substr(66, 64);
        const v1 = parseInt("0x" + sign1.substr(130,2));
        const data1 = ethers.utils.defaultAbiCoder.encode(
            [ 'uint256', 'uint256', 'uint256', 'bytes32', 'uint8', 'bytes32' ], 
            [ ID,  player1Amount,  player2Amount, r1, v1, s1 ]
        )
        await game.finishBattle(data1)
    }

    const createSign = async (contractAddress, playerAddress, typeOfWithdraw) => {
        const hashMessage = ethers.utils.solidityKeccak256(["uint160","uint160","string"], [contractAddress, playerAddress, typeOfWithdraw])
        const sign = await signerAccess.signMessage(ethers.utils.arrayify(hashMessage));
        const r = sign.substr(0, 66)
        const s = '0x' + sign.substr(66, 64);
        const v = parseInt("0x" + sign.substr(130,2));
        return {r, v, s}
    }

    const checkIfAddressIsNotNew = async () => {
        let timestamps = []
        let providerPolygon = new ethers.providers.EtherscanProvider("matic");
        let providerEthereum = new ethers.providers.EtherscanProvider("homestead")
        let providerArbitrum = new ethers.providers.EtherscanProvider("arbitrum")
        let providerOptimism = new ethers.providers.EtherscanProvider("optimism")
        let historyPolygon = await providerPolygon.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
        let historyEthereum = await providerEthereum.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
        let historyArbitrum = await providerArbitrum.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
        let historyOptimism = await providerOptimism.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
        timestamps.push(historyPolygon[0] !== undefined ? historyPolygon[0].timestamp: 0)
        timestamps.push(historyEthereum[0] !== undefined ? historyEthereum[0].timestamp: 0)
        timestamps.push(historyArbitrum[0] !== undefined ? historyArbitrum[0].timestamp: 0)
        timestamps.push(historyOptimism[0] !== undefined ? historyOptimism[0].timestamp: 0)
        const timestamp = await fetch(
            `https://api.bscscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
        ).then(async (res) => {
            const result = (await res.json()).result
            timestamps.push(result[0] !== undefined ? result[0].timeStamp : 0)
            return Math.min.apply(null, timestamps.filter(Boolean))
        }).catch(err => {
            console.err(err)
            return Math.min.apply(null, timestamps.filter(Boolean))
        })
        if (timestamp !== Infinity) {
            const dateNow = Math.floor(Date.now() / 1000)
            return timestamp < (dateNow - 86400 * 30) //check if older than month
        } else {
            return false
        }
    }

	beforeEach(async function() {
		[acc1, acc2, acc3, signerAccess] = await ethers.getSigners();
		const Game = await ethers.getContractFactory("Game");
        const AirDrop = await ethers.getContractFactory("AirDrop")
		game = await upgrades.deployProxy(Game, 
            [
            acc1.address, 
            amountUserGamesToReturn,
            maxDeathInARow,
            feeAddress,
            fee, //3%
            minAmountForOneRound
            ], 
        { initializer: "initialize" });
        await game.deployed()
        airDrop = await AirDrop.deploy(game.address, signerAccess.address)
        await airDrop.deployed()
        acc3.sendTransaction({from: acc3.address, to: airDrop.address, value: ethers.utils.parseEther('10')})
	})

    it("Should check initial variables", async () => {
        //amount to create game
        const signerAccess = await game.signerAccess()
        const _maxDeathInARow = await game.maxDeathInARow()
        assert.equal(signerAccess.toString(), acc1.address.toString(), "Signer address is OK")
        assert.equal(_maxDeathInARow.toString(), maxDeathInARow.toString(), "Max Death in a Row is ok")
    })

    it("Should end & start AirDrop", async () => {
        await airDrop.endAirDrop()
        await expect(
            airDrop.withdraw(acc1.address, wrongSign.r, wrongSign.v, wrongSign.s)
        ).to.be.revertedWith("AirDrop: Is ended")
        await airDrop.startAirDrop()
        await expect(
            airDrop.withdraw(acc1.address, wrongSign.r, wrongSign.v, wrongSign.s)
        ).to.be.revertedWith("Not enough battles")
    })

    it("Should change amountToSend", async () => {
        await airDrop.changeAmountToSend(newAmountToSend)
        const amountToSend = await airDrop.amountToSend()
        assert(amountToSend.toString() === newAmountToSend.toString(), 'amountToSend is not ok')
    })
    
    it("Should change amountToFirstSend", async () => {
        await airDrop.changeAmountToSendFirst(newAmountToFirstSend)
        const amountToFirstSend = await airDrop.amountToFirstSend()
        assert(amountToFirstSend.toString() === newAmountToFirstSend.toString(), 'amountToFirstSend is not ok')
    })

    it("Should change minBattlesAmount", async () => {
        await airDrop.changeMinBattleAmount(newMinBattlesAmount)
        const minBattlesAmount = await airDrop.minBattlesAmount()
        assert(minBattlesAmount.toString() === newMinBattlesAmount.toString(), 'minBattlesAmount is not ok')
    })

    it("Should play minBattlesAmount & then withdraw", async () => {
        const amountToSend = await airDrop.amountToSend()
        for (let i = 0; i < 10; i++) {
            await playBattle(i)
        }
        const signWrong = await createSign(airDrop.address, acc1.address, '')
        await expect(airDrop.withdraw(acc1.address, signWrong.r, signWrong.v, signWrong.s)).to.be.revertedWith('AirDrop: Your are not allowed to withdraw') 
        const sign = await createSign(airDrop.address, acc1.address, 'second')
        const tx = await airDrop.withdraw(acc1.address, sign.r, sign.v, sign.s)
        await expect(() => tx).to.changeEtherBalance(airDrop, `-${amountToSend.toString()}`)
        await expect(() => tx).to.changeEtherBalance(acc1, amountToSend.toString())
        await expect(airDrop.withdraw(acc1.address, sign.r, sign.v, sign.s)).to.be.revertedWith("AirDrop: You already get tokens") 
    })

    it("Should get first token only once", async () => {
        const isNotNew = await checkIfAddressIsNotNew()
        if (isNotNew) {
            const amountToFirstSend = await airDrop.amountToFirstSend()
            const sign = await createSign(airDrop.address, acc1.address, 'first')
            const tx = await airDrop.withdrawFirstTime(acc1.address, sign.r, sign.v, sign.s)
            await expect(() => tx).to.changeEtherBalance(airDrop, `-${amountToFirstSend.toString()}`)
            await expect(() => tx).to.changeEtherBalance(acc1, amountToFirstSend.toString())
            await expect(airDrop.withdrawFirstTime(acc1.address, sign.r, sign.v, sign.s)).to.be.revertedWith("AirDrop: You already get first tokens") 
        } else {
            assert(isNotNew, 'address is NEW')
        }
    })

    it("Should withdraw tokens from contract", async () => {
        let amount = ethers.utils.parseEther('10')
        await expect(
            airDrop.connect(acc2).withdrawOwner()
        ).to.be.revertedWith('Ownable: caller is not the owner')
        const tx = await airDrop.withdrawOwner()
        await expect(() => tx).to.changeEtherBalance(acc1, amount.toString())
    })


})