import dotenv from "dotenv"
export { nftAbi, shopAbi} from "./shop.js"
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
      contractAddress: '0x703a3203A7F5C5da04afE7a2af4f4DF3474f0609',
      privateKey: process.env.PRIVATE_KEY_EMERALD
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
      contractAddress: '0xaBE08D013c1342e786c5964bc2e4E3f6b70797ea',
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
    charactersAddress: '0xc299c4A1cC9E748D77882a76D0b88256a670F74D',
    armorsAddress: '0x6AD4C8e2117aeaaf0A07229e51fFa710F7EAD66D',
    weaponsAddress: '0xb7566ffb7AfD6A13484a6dd21fB8238f901781de',
    bootsAddress: '0xa8CC3C8Fb8AF482385d277F13dfD902cc08823ed',
    shopAddress: '0x2Cfd31e9aA23183c81A2cE7a7f6AFFA80724e2fa',
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