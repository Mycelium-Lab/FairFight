const { ethers } = require("hardhat")
const { sign } = require("../../test/utils/sign")

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    let FairFight = await ethers.getContractFactory("FairFight")
    const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    const wallet = new ethers.Wallet(account, ethers.provider)
    FairFight = FairFight.connect(wallet)
    const fairFight = FairFight.attach('0xBeBF242338794e8ED107687F62d3AFfd05FfCf6F')

    const allowedTokens = [
      {
          symbol: 'USDT',
          address: '0x6bC5db5C9C5CfedAf6adF8C938Ac72c9653Ff9f0'
      },
      {
          symbol: 'USDC',
          address: '0x6aC2d8F07CEA9431075Ba20d5EE7A5944179b6Ea'
      },
      {
          symbol: 'DAI',
          address: '0xED98091c7D2Fef365a4FE2BC14B2625813E056f6'
      },
      {
          symbol: 'BUSD',
          address: '0xBFaCA5eC344276F6ccce65602fbB62af0d5E3FeF'
      }
    ]

    for (let i = 0; i < allowedTokens.length; i++) {
      await fairFight.changeMinAmountPerRound(allowedTokens[i].address, ethers.utils.parseEther('0.1'));
      console.log(allowedTokens[i].symbol, 'allowed')
    }
}

main()
.catch(err => console.log(err))