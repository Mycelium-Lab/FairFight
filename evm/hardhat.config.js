require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require("@openzeppelin/hardhat-upgrades");
require('hardhat-contract-sizer');
require('@oasisprotocol/sapphire-paratime');
require('@oasisprotocol/sapphire-hardhat');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    testnet: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd"]
    },
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
    emerald_testnet: {
      url: "https://testnet.emerald.oasis.dev",
      accounts:
        process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
    },
    emerald_mainnet: {
      url: "https://emerald.oasis.dev",
      accounts:
        process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
    },
    sapphire_testnet: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 0x5aff
    },
    sapphire_mainnet: {
      url: "https://sapphire.oasis.io",
      accounts: process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 0x5afe
    },
    scale: {
      url: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
    scale1: {
      url: 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
    bnb: {
      url: "https://bsc-dataseed.binance.org",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 56
    },
    opbnb: {
      url: "https://opbnb-mainnet-rpc.bnbchain.org",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 204
    },
    polygon_mainnet: {
      url: "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 137
    },
    bitfinity_testnet: {
      url: "https://testnet.bitfinity.network",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
      chainId: 355113
    },
    bnbTest: {
      url: 'https://bsc-testnet.publicnode.com',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 97
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161
    },
    xrpDev: {
      url: 'https://rpc-evm-sidechain.xrpl.org',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 1440002
    },
    coreTestnet: {
      url: 'https://rpc.test.btcs.network',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 1115,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.8.17"
      },
    ],
  },
  mocha: {
    timeout: 100000000
  }
};
