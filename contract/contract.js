import dotenv from "dotenv"
export { nftAbi, shopAbi} from "./shop.js"
export { lootboxAbi } from './lootbox.js'
dotenv.config()

export const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
// const contractAddress = '0xa061c2604F35352F8A7731d0c738f535DAa6411a'//goerli
// const contractAddress = '0xe7cCffC4F633713C3ee7d8FEe46d1253a1261206' //emerald_test
// export const contractAddress = '0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25' //emerald main
export const networks = [
  {
      name: "Hardhat",
      chainid: 31337,
      rpc: 'http://localhost:8545',
      currency: 'ETH',
      contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      charactersAddress: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
      armorsAddress: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
      bootsAddress: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
      weaponsAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
      shopAddress: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
      lootboxAddress: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
      privateKey: process.env.PRIVATE_KEY_TEST
  },
  {
      name: "Ganache",
      chainid: 1337,
      rpc: 'http://localhost:7545',
      currency: 'ETH',
      contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      privateKey: process.env.PRIVATE_KEY_TEST
  },
  {
      name: "Goerli",
      chainid: 5,
      rpc: 'https://goerli.infura.io/v3',
      currency: 'ETH',
      contractAddress: '',
      privateKey: process.env.PRIVATE_KEY_TEST
  },
  {
      name: "Emerald Testnet",
      chainid: 42261,
      rpc: 'https://testnet.emerald.oasis.dev',
      currency: 'ROSE',
      contractAddress: '0x231d86b4A0280DcAA9De6282F784B374525e03c3',
      privateKey: process.env.PRIVATE_KEY_EMERALD
  },
  {
      name: "Emerald Mainnet",
      chainid: 42262,
      rpc: 'https://emerald.oasis.dev',
      currency: 'ROSE',
      privateKey: process.env.PRIVATE_KEY_EMERALD,
      contractAddress: '0x739B9dedAc3aA99Dbe9102F97fE6cbAeBc66980C',
      charactersAddress: '0xe30E4153BcF8420BA7d3FFC28b2772D9Fdb1b82A',
      armorsAddress: '0xC651C073E8D2f3eE28a9d2E1ac96ecbC8a90CcCB',
      weaponsAddress: '0xBcd0534481daB584ae3D458d274FDD65d537cDb7',
      bootsAddress: '0x7E2e1812f8C2414da8D5Bfce9c8476B0C477543E',
      shopAddress: '0xF6bed30A1c8dfFe5a36f42489fd6be8156AdcCd7'
  },
  {
      name: "Sapphire Test",
      chainid: 23295,
      rpc: 'https://testnet.sapphire.oasis.dev',
      currency: 'ROSE',
      contractAddress: '0x64BB70e1e2f776D95dE00676D8332e6aD5217195',
      privateKey: process.env.PRIVATE_KEY_EMERALD
  },
  {
      name: "Sapphire",
      chainid: 23294,
      rpc: 'https://sapphire.oasis.io',
      currency: 'ROSE',
      contractAddress: '0x927C8aF4282E507352088c52014bC8423367c610',
      charactersAddress: '0x94bf5570374e8df0b48958707FCde58fDeBFfB3C',
      armorsAddress: '0x1fFDbdc535d4a67E8728A5cA7daee07b81D4AD7C',
      weaponsAddress: '0x4d456cee51F599f70231fB0Fec95274E349db99f',
      bootsAddress: '0x477e075eCA5a8d250f51817cFcdabfE235A71C7a',
      shopAddress: '0x3017385EA01B9d434181Db082921d24F335D250A',
      explorer: 'https://explorer.sapphire.oasis.io',
      privateKey: process.env.PRIVATE_KEY_EMERALD
  },
  {
      name: "staging-fast-active-bellatrix",
      chainid: 1351057110,
      rpc: 'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix',
      currency: 'sFUEL',
      explorer: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com',
      contractAddress: '0xB0993755B388c1223Da692A3F9622D7B7111E55e',
      privateKey: process.env.PRIVATE_KEY_EMERALD
  },
  {
    name: 'Scale',
    chainid: 503129905,
    rpc: 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
    contractAddress: '0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54',
    charactersAddress: '0xD442C8b30eEeddD4cEf86Fe786D9b55BFAaFa9e6',
    armorsAddress: '0x927ebeff82ecEeaCD9a37014c60210413188f374',
    weaponsAddress: '0x8Aa1F3267da1099D51E461f95dcF32E9525675B7',
    bootsAddress: '0x2c9880C1dCFfa9ce105e0a586E35bf7e71f8ef95',
    shopAddress: '0xBB8072C0B33d919Fc4251B879c02a0538262855a',
    currency: 'sFUEL',
    explorer: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com',
    privateKey: process.env.PRIVATE_KEY
  },
  {
    name: 'BNB',
    chainid: 56,
    rpc: "https://bsc-dataseed.binance.org",
    contractAddress: '0x905E08cE63fb7D13cD44520015c557964E0200FF',
    currency: 'BNB',
    explorer: 'https://bscscan.com/',
    privateKey: process.env.PRIVATE_KEY
  }
  
]

export const contractAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "CreateFight",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "FinishFight",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "JoinFight",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_feeCollector",
        "type": "address"
      }
    ],
    "name": "changeFeeCollector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxPlayers",
        "type": "uint256"
      }
    ],
    "name": "changeMaxPlayers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxRounds",
        "type": "uint256"
      }
    ],
    "name": "changeMaxRounds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_minAmountPerRound",
        "type": "uint256"
      }
    ],
    "name": "changeMinAmountPerRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_signer",
        "type": "address"
      }
    ],
    "name": "changeSigner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountPerRound",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rounds",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "playersAmount",
        "type": "uint256"
      },
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "create",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "currentlyBusy",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "fights",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "baseAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "createTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "finishTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountPerRound",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rounds",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "playersAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "finish",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getChunkFights",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "baseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "finishTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountPerRound",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rounds",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playersAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct IFairFight.Fight[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      }
    ],
    "name": "getFightPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getPlayerFullFights",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "baseAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "finishTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountPerRound",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "rounds",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playersAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct IFairFight.Fight[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_signer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_maxRounds",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_feeCollector",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minAmountPerRound",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxPlayers",
        "type": "uint256"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      }
    ],
    "name": "join",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastPlayerFight",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxRounds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "name": "minAmountPerRound",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "playerClaimed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]