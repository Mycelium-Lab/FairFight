export const lootboxAbi = [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "contract IFFNFT",
              "name": "nft",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "propertyId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Lootbox.Prize[]",
          "name": "regularRarityPrizes",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "contract IFFNFT",
              "name": "nft",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "propertyId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Lootbox.Prize[]",
          "name": "superiorRarityPrizes",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "contract IFFNFT",
              "name": "nft",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "propertyId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Lootbox.Prize[]",
          "name": "rareRarityPrizes",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "contract IFFNFT",
              "name": "nft",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "propertyId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Lootbox.Prize[]",
          "name": "legendaryRarityPrizes",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "contract IFFNFT",
              "name": "nft",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "propertyId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Lootbox.Prize[]",
          "name": "epicRarityPrizes",
          "type": "tuple[]"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_collector",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "_paymentToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "looter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "contract IERC20",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "Buy",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "looter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "contract IFFNFT",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "Loot",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
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
      "name": "buy",
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
      "name": "currentUserLoot",
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
        },
        {
          "internalType": "uint256",
          "name": "somenumber",
          "type": "uint256"
        }
      ],
      "name": "loot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
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
      "inputs": [],
      "name": "price",
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
          "internalType": "enum Lootbox.Rarity",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "prizesByRarity",
      "outputs": [
        {
          "internalType": "contract IFFNFT",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum Lootbox.Rarity",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "rarityPercent",
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
      "name": "renounceOwnership",
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
      "name": "setSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]