export const networks = [
    {
        name: "Hardhat",
        chainid: 31337,
        rpc: 'http://localhost:8545',
        currency: 'ETH',
        contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
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
        contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    {
        name: "SKALE Network Testnet",
        chainid: 344435,
        rpc: 'https://dev-testnet-v1-0.skalelabs.com',
        currency: 'sFUEL',
        contractAddress: ''
    },
    {
        name: "Sapphire Main",
        chainid: 23294,
        rpc: 'https://sapphire.oasis.io',
        currency: 'ROSE',
        contractAddress: ''
    },
    {
        name: "Sapphire Test",
        chainid: 23295,
        rpc: 'https://testnet.sapphire.oasis.dev',
        currency: 'ROSE',
        contractAddress: '0x64BB70e1e2f776D95dE00676D8332e6aD5217195'
    },
]