const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    let FairFight = await ethers.getContractFactory("FairFight")
    // const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    // const wallet = new ethers.Wallet(account, ethers.provider)
    // FairFight = FairFight.connect(wallet)
    const fairFight = FairFight.attach('0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2')

    const allowedTokens = [
        {
            symbol: 'USDT',
            address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            decimals: 6
        },
        {
            symbol: 'USDC',
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            decimals: 6
        },
        {
            symbol: 'DAI',
            address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            decimals: 18
        }
    ]

    // for (let i = 0; i < allowedTokens.length; i++) {
      await fairFight.changeMinAmountPerRound(allowedTokens[2].address, (0.1 * 10**allowedTokens[2].decimals).toString());
      console.log(allowedTokens[2].symbol, 'allowed')
    // // }
    // console.log(await fairFight.minAmountPerRound(allowedTokens[0].address))
}

main()
.catch(err => console.log(err))