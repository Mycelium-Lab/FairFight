// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { upgrades, ethers } = require("hardhat");
const { sign } = require("../../test/utils/sign");

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const chain = await ethers.provider.getNetwork()
    const chainid = chain.chainId

    // const account = ethers.utils.HDNode.fromMnemonic(process.env.MNEMONIC).derivePath(`m/44'/60'/0'/0/1`);
    // const wallet = new ethers.Wallet(account, ethers.provider)
    let FairFight = await ethers.getContractFactory("FairFight");
    // FairFight = FairFight.connect(wallet)
    console.log(acc1.address)
    const fairFight = await upgrades.deployProxy(FairFight, 
      [
        acc1.address, //signer
        10, //max rounds
        '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //fee address,
        500, //fee
        ethers.utils.parseEther("0.0002"), //min amount for one round
        2 //max players
      ], 
    { initializer: "initialize", timeout: 600000, pollingInterval: 10000 });
    await fairFight.deployed()
    
    console.log(
      `FairFight to ${fairFight.address} on chain ${chainid}`
    );

    const allowedTokens = [
      {
          symbol: 'USDT',
          address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
          decimals: 18
      },
      // {
      //     symbol: 'USDC',
      //     address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      //     decimals: 18
      // },
      // {
      //     symbol: 'DAI',
      //     address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
      //     decimals: 18
      // },
      // {
      //     symbol: 'BUSD',
      //     address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      //     decimals: 18
      // }
    ]

    for (let i = 0; i < allowedTokens.length; i++) {
      await fairFight.changeMinAmountPerRound(allowedTokens[i].address, 0.1 * 10**allowedTokens[i].decimals);
      console.log(allowedTokens[i].symbol, 'allowed')
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
