// jscs:disable validateIndentation
ig.module(
'net.contract'
)
.defines(function() {
    contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    // contractAddress = '0xa061c2604F35352F8A7731d0c738f535DAa6411a'//goerli
    // contractAddress = '0xe7cCffC4F633713C3ee7d8FEe46d1253a1261206' //emerald_test
    // contractAddress = '0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25' //emerald main
    networks = [
        {
            name: "Hardhat",
            chainid: 31337,
            rpc: 'http://localhost:8545',
            currency: 'ETH',
            contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            explorer: 'https://etherscan.io',
        },
        {
            name: "Ganache",
            chainid: 1337,
            rpc: 'http://localhost:7545',
            currency: 'ETH',
            contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
            explorer: '',
        },
        {
            name: "Goerli",
            chainid: 5,
            rpc: 'https://goerli.infura.io/v3',
            currency: 'ETH',
            contractAddress: '',
            explorer: '',
        },
        {
            name: "Bitfinity Testnet",
            chainid: 355113,
            rpc: 'https://testnet.bitfinity.network',
            currency: 'BFT',
            explorer: 'https://explorer.bitfinity.network/',
            contractAddress: '0x178A6106339c4B56ED9BaB7CD2CA55f83aED8137'
        },
        {
            name: "Emerald Testnet",
            chainid: 42261,
            rpc: 'https://testnet.emerald.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x231d86b4A0280DcAA9De6282F784B374525e03c3',
            explorer: '',
        },
        {
            name: "Emerald Mainnet",
            chainid: 42262,
            rpc: 'https://emerald.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x87b8BAe3f9C64d53167Ebc560FD73D0899215241',
             explorer: 'https://explorer.emerald.oasis.dev',
        },
        {
            name: "Sapphire Test",
            chainid: 23295,
            rpc: 'https://testnet.sapphire.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x64BB70e1e2f776D95dE00676D8332e6aD5217195',
             explorer: '',
        },
        {
            name: "Sapphire",
            chainid: 23294,
            rpc: 'https://sapphire.oasis.io',
            currency: 'ROSE',
            explorer: 'https://explorer.sapphire.oasis.io',
            contractAddress: '0x87b8BAe3f9C64d53167Ebc560FD73D0899215241',
              explorer: 'https://explorer.sapphire.oasis.io',
        },
        {
            name: "ScaleT",
            chainid: 1351057110,
            rpc: 'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix',
            currency: 'sFUEL',
            explorer: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com',
            contractAddress: '0xB0993755B388c1223Da692A3F9622D7B7111E55e'
        },
        {
          name: 'Scale Test',
          chainid: 503129905,
          rpc: 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
          contractAddress: '0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54',
          currency: 'sFUEL',
          explorer: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com'
        },
        {
          name: "BNB",
          chainid: 56,
          rpc: 'https://bsc-dataseed.binance.org',
          currency: 'BNB',
          explorer: 'https://bscscan.com/',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "tBNB",
          chainid: 97,
          rpc: 'https://bsc-testnet.publicnode.com',
          currency: 'tBNB',
          explorer: 'https://testnet.bscscan.com/',
          contractAddress: '0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2'
        },
        {
          name: "Arbitrum",
          chainid: 42161,
          rpc: 'https://arb1.arbitrum.io/rpc',
          currency: 'ETH',
          explorer: 'https://explorer.arbitrum.io',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "Base",
          chainid: 8453,
          rpc: 'https://mainnet.base.org',
          currency: 'ETH',
          explorer: 'https://basescan.org',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "XRP EVM Devnet",
          chainid: 1440002,
          rpc: 'https://rpc-evm-sidechain.xrpl.org',
          currency: 'XRP',
          explorer: 'https://evm-sidechain.xrpl.org/',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "opBNB",
          chainid: 204,
          rpc: 'https://opbnb-mainnet-rpc.bnbchain.org',
          currency: 'BNB',
          explorer: 'http://opbnbscan.com',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "Polygon",
          chainid: 137,
          rpc: 'https://polygon-rpc.com',
          currency: 'MATIC',
          explorer: 'https://polygonscan.com',
          contractAddress: '0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2'
        },
        {
          name: "Core Testnet",
          chainid: 1115,
          rpc: 'https://rpc.test.btcs.network',
          currency: 'tCORE',
          explorer: 'https://scan.test.btcs.network/',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        },
        {
          name: "Core",
          chainid: 1116,
          rpc: 'https://rpc.coredao.org',
          currency: 'CORE',
          explorer: 'https://scan.coredao.org',
          contractAddress: '0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595'
        }
    ]
    contractAbi = [
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

})  