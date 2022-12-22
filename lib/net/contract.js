// jscs:disable validateIndentation
ig.module(
'net.contract'
)
.defines(function() {
    // contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    // contractAddress = '0xa061c2604F35352F8A7731d0c738f535DAa6411a'//goerli
    // contractAddress = '0xe7cCffC4F633713C3ee7d8FEe46d1253a1261206' //emerald_test
    contractAddress = '0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25' //emerald main
    contractAbi = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountForOneDeath",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "battleCreatedTimestamp",
            "type": "uint256"
          }
        ],
        "name": "CreateBattle",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "player1Amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "player2Amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "battleFinishedTimestamp",
            "type": "uint256"
          }
        ],
        "name": "FinishBattle",
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
            "indexed": false,
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "player2",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "JoinBattle",
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
        "inputs": [],
        "name": "PAUSER_ROLE",
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
        "inputs": [],
        "name": "amountUserGamesToReturn",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
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
        "name": "battles",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "ID",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "player1",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "player2",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "player1Amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "player2Amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "finished",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "battleCreatedTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "battleFinishedTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountForOneDeath",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "_new",
            "type": "uint8"
          }
        ],
        "name": "changeAmountUserGamesToReturn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "_new",
            "type": "uint16"
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
            "name": "_new",
            "type": "address"
          }
        ],
        "name": "changeFeeAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "_new",
            "type": "uint8"
          }
        ],
        "name": "changeMaxDeathInARow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_new",
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
            "name": "amountForOneDeath",
            "type": "uint256"
          }
        ],
        "name": "createBattle",
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
        "inputs": [],
        "name": "fee",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeAddress",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "finishBattle",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "chunkIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBattlesToReturn",
            "type": "uint256"
          }
        ],
        "name": "getChunkFinishedBattles",
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
                "name": "player1",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "player2",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "winner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "player1Amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "player2Amount",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "finished",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "battleCreatedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "battleFinishedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amountForOneDeath",
                "type": "uint256"
              }
            ],
            "internalType": "struct GameStorage.Battle[]",
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
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getCurrentUserGame",
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
                "name": "player1",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "player2",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "winner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "player1Amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "player2Amount",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "finished",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "battleCreatedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "battleFinishedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amountForOneDeath",
                "type": "uint256"
              }
            ],
            "internalType": "struct GameStorage.Battle",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getOpenBattles",
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
                "name": "player1",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "player2",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "winner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "player1Amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "player2Amount",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "finished",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "battleCreatedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "battleFinishedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amountForOneDeath",
                "type": "uint256"
              }
            ],
            "internalType": "struct GameStorage.Battle[]",
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
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getUserPastBattles",
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
                "name": "player1",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "player2",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "winner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "player1Amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "player2Amount",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "finished",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "battleCreatedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "battleFinishedTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amountForOneDeath",
                "type": "uint256"
              }
            ],
            "internalType": "struct GameStorage.Battle[]",
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
            "internalType": "uint8",
            "name": "_amountUserGamesToReturn",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "_maxDeathInARow",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "_feeAddress",
            "type": "address"
          },
          {
            "internalType": "uint16",
            "name": "_fee",
            "type": "uint16"
          },
          {
            "internalType": "uint256",
            "name": "_minAmountForOneRound",
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
            "name": "_ID",
            "type": "uint256"
          }
        ],
        "name": "joinBattle",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "maxDeathInARow",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "minAmountForOneRound",
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
        "name": "openBattles",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "_value",
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
        "inputs": [],
        "name": "signerAccess",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
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
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userBattles",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
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
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ]

})  