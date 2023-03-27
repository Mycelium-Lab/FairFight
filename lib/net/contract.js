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
            contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
        },
        {
            name: "Ganache",
            chainid: 1337,
            rpc: 'http://localhost:7545',
            currency: 'ETH',
            contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
        },
        {
            name: "Goerli",
            chainid: 5,
            rpc: 'https://goerli.infura.io/v3',
            currency: 'ETH',
            contractAddress: ''
        },
        {
            name: "Emerald Testnet",
            chainid: 42261,
            rpc: 'https://testnet.emerald.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x231d86b4A0280DcAA9De6282F784B374525e03c3'
        },
        {
            name: "Emerald Mainnet",
            chainid: 42262,
            rpc: 'https://emerald.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x1374837B4eb6873150E8792826407409BfAB82e8'
        },
        {
            name: "Sapphire Test",
            chainid: 23295,
            rpc: 'https://testnet.sapphire.oasis.dev',
            currency: 'ROSE',
            contractAddress: '0x64BB70e1e2f776D95dE00676D8332e6aD5217195'
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
          contractAddress: '0x372F2f33b9e6c1e1d48c2f872f75b1eeCd421C96',
          currency: 'sFUEL',
          explorer: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com'
        },
        {
          name: "BNB",
          chainid: 56,
          rpc: 'https://bsc-dataseed.binance.org',
          currency: 'BNB',
          explorer: 'https://bscscan.com/',
          contractAddress: '0xCDcB3D4354486F0D4f8F776328aC9A21b27F0B5b'
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