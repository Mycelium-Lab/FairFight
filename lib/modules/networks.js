export const networks = [
    {
        name: "Hardhat",
        chainid: 31337,
        rpc: 'http://localhost:8545',
        currency: 'ETH',
        explorer: 'https://etherscan.io',
        contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        charactersAddress: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
        armorsAddress: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        bootsAddress: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
        weaponsAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
        shopAddress: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
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
        name: "Sapphire",
        chainid: 23294,
        rpc: 'https://sapphire.oasis.io',
        currency: 'ROSE',
        explorer: 'https://explorer.sapphire.oasis.io',
        contractAddress: '0xaBE08D013c1342e786c5964bc2e4E3f6b70797ea'
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
        name: 'Scale',
        chainid: 503129905,
        rpc: 'https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird',
        contractAddress: '0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54',
        charactersAddress: '0x7f1c57CcF77c638C3274398C7b296338D7Cf849b',
        armorsAddress: '0x7e8a5e2d6F5D460747CB0ffd3Def7aEaEC8681DC',
        weaponsAddress: '0x72184aba9c75c360d9cFD79d6547ff4FE91e984b',
        bootsAddress: '0xD437Fd7DEA156791CbA5cEDe7E1a3202CDFD65eE',
        shopAddress: '0xd0314f751Dc470dD868573402b59d2da14C10B2F',
        currency: 'sFUEL',
        explorer: 'https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com'
    },
    {
        name: "BNB",
        chainid: 56,
        rpc: 'https://bsc-dataseed.binance.org',
        currency: 'BNB',
        explorer: 'https://bscscan.com',
        contractAddress: '0x905E08cE63fb7D13cD44520015c557964E0200FF'
    },
    {
        name: "Emerald",
        chainid: 42262,
        rpc: 'https://emerald.oasis.dev',
        currency: 'ROSE',
        explorer: 'https://explorer.emerald.oasis.dev',
        contractAddress: '0x703a3203A7F5C5da04afE7a2af4f4DF3474f0609'
    }
]