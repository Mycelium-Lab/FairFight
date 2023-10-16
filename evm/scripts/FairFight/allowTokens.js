const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    let FairFight = await ethers.getContractFactory("FairFight")
    // const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    // const wallet = new ethers.Wallet(account, ethers.provider)
    // FairFight = FairFight.connect(wallet)
    const fairFight = FairFight.attach('0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595')

    const allowedTokens = [
        {
            symbol: 'USDT',
            address: '0x55d398326f99059ff775485246999027b3197955',
            decimals: 18
        },
        {
            symbol: 'USDC',
            address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
            decimals: 18
        },
        {
            symbol: 'DAI',
            address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
            decimals: 18
        },
        {
            symbol: 'BUSD',
            address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            decimals: 18
        }
    ]

    // for (let i = 0; i < allowedTokens.length; i++) {
      await fairFight.changeMinAmountPerRound(allowedTokens[3].address, (0.1 * 10**allowedTokens[3].decimals).toString());
      console.log(allowedTokens[3].symbol, 'allowed')
    // // }
    // console.log(await fairFight.minAmountPerRound(allowedTokens[3].address))
}

main()
.catch(err => console.log(err))