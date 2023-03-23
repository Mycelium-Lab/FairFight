export const networks = [
    {
        name: "Hardhat",
        chainid: 31337,
        rpc: 'http://localhost:8545',
        currency: 'ETH',
        explorer: '',
        contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    },
    {
        name: "Ganache",
        chainid: 1337,
        rpc: 'http://localhost:7545',
        currency: 'ETH',
        explorer: '',
        contractAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    {
        name: "Goerli",
        chainid: 5,
        rpc: 'https://goerli.infura.io/v3',
        currency: 'ETH',
        explorer: '',
        contractAddress: ''
    },
    {
        name: "Emerald Testnet",
        chainid: 42261,
        rpc: 'https://testnet.emerald.oasis.dev',
        currency: 'ROSE',
        explorer: '',
        contractAddress: '0x231d86b4A0280DcAA9De6282F784B374525e03c3'
    },
    {
        name: "SKALE Network Testnet",
        chainid: 344435,
        rpc: 'https://dev-testnet-v1-0.skalelabs.com',
        currency: 'sFUEL',
        explorer: '',
        contractAddress: ''
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
        name: "Sapphire Main",
        chainid: 23294,
        rpc: 'https://sapphire.oasis.io',
        currency: 'ROSE',
        explorer: '',
        contractAddress: ''
    },
    {
        name: "Sapphire Test",
        chainid: 23295,
        rpc: 'https://testnet.sapphire.oasis.dev',
        currency: 'ROSE',
        explorer: '',
        contractAddress: '0x64BB70e1e2f776D95dE00676D8332e6aD5217195'
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
        name: "Emerald Mainnet",
        chainid: 42262,
        rpc: 'https://emerald.oasis.dev',
        currency: 'ROSE',
        explorer: 'https://explorer.emerald.oasis.dev',
        contractAddress: '0x1374837B4eb6873150E8792826407409BfAB82e8'
    }
]