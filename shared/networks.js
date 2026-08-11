// The single source of truth for chain metadata, shared by the Node server and
// the browser client. Plain ESM: no dependencies, no `process.env`, no `ethers`.
//
// BROWSER-SAFE BY CONSTRUCTION. Everything in this file is bundled into the
// client and served to anyone who loads the page. Server-only material — the
// settlement private keys and any authenticated/paid RPC endpoint — lives in
// ./networks.server.js and is merged in on the server side only. The guard at
// the bottom of this file fails the build/boot if a forbidden field ever
// appears here, so the split cannot rot silently.
//
// `publicRpc` is deliberately NOT called `rpc`: the server-side field named
// `rpc` may be overridden with a private endpoint, and the different name makes
// an accidental copy of a server value into this file obvious in review.
//
// Drift resolved when the three registries were merged (2026-08-11):
//   - 42161 Arbitrum publicRpc: kept the server's https://arb1.arbitrum.io/rpc.
//     The client's https://arbitrum-mainnet.infura.io returns HTTP 404 (verified).
//   - 23294 Sapphire shopAddress: kept the client's 0xa32fF845…DBdE90. Verified
//     on-chain: prices(characters, native, 0..2) returns 10 ROSE there, while
//     the server's 0x6B1e1447…13fa30 reverts on the same call.
//   - Chain names: kept the client (user-facing) spelling — "Emerald", "SKALE",
//     "ScaleT" — over the server's internal ones.
//   - `explorer` values are stored without a trailing slash; call sites append
//     "/address/…", which previously produced "//address" on 56, 97, 1115,
//     1440002 and 355113.
//   - Addresses missing on one side were filled from the other (Base's six NFT
//     addresses, Sapphire/Emerald/SKALE lootboxes, every multicallNFT).
//   - Chains 344435 and 355113 existed only client-side, chain 0 (TON) only
//     server-side. All are preserved here; nothing was dropped.
//   - The TON contract/shop/lootbox addresses were hardcoded in
//     lib/index_ton.js, lib/src/ton/shop.js and lib/src/ton/lootbox.js.
export const networks = [
    {
        chainid: 31337,
        family: "evm",
        name: "Hardhat",
        currency: "ETH",
        decimals: 18,
        explorer: "https://etherscan.io",
        publicRpc: "http://localhost:8545",
        // Local dev only. This is where evm/scripts/local/deployAndSeed.js puts the
        // FairFightV2 proxy when it runs first against a freshly started
        // `npx hardhat node` - deployment is deterministic from a clean chain, so the
        // address is stable. Restart the node before redeploying, or the address moves
        // and this entry goes stale. The authoritative value for a given run is always
        // deployment.local.json. See docs/LOCAL_DEV.md.
        // The NFT/shop/lootbox addresses below are legacy values from the original
        // developers; deployAndSeed.js does not deploy those contracts, so only the
        // fight flow works out of the box locally.
        contractAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        charactersAddress: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        armorsAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        weaponsAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
        bootsAddress: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
        shopAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
        lootboxAddress: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
        multicallNFT: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
    },
    {
        chainid: 1337,
        family: "evm",
        name: "Ganache",
        currency: "ETH",
        decimals: 18,
        explorer: "",
        publicRpc: "http://localhost:7545",
        contractAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    },
    {
        chainid: 5,
        family: "evm",
        name: "Goerli",
        currency: "ETH",
        decimals: 18,
        explorer: "",
        publicRpc: "https://goerli.infura.io/v3",
        contractAddress: "",
    },
    {
        chainid: 42261,
        family: "evm",
        name: "Emerald Testnet",
        currency: "ROSE",
        decimals: 18,
        explorer: "",
        publicRpc: "https://testnet.emerald.oasis.dev",
        contractAddress: "0x231d86b4A0280DcAA9De6282F784B374525e03c3",
    },
    {
        chainid: 344435,
        family: "evm",
        name: "SKALE Network Testnet",
        currency: "sFUEL",
        decimals: 18,
        explorer: "",
        publicRpc: "https://dev-testnet-v1-0.skalelabs.com",
        contractAddress: "",
    },
    {
        chainid: 1351057110,
        family: "evm",
        name: "ScaleT",
        currency: "sFUEL",
        decimals: 18,
        explorer: "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com",
        publicRpc: "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
        contractAddress: "0xB0993755B388c1223Da692A3F9622D7B7111E55e",
    },
    {
        chainid: 23295,
        family: "evm",
        name: "Sapphire Test",
        currency: "ROSE",
        decimals: 18,
        explorer: "",
        publicRpc: "https://testnet.sapphire.oasis.dev",
        contractAddress: "0x64BB70e1e2f776D95dE00676D8332e6aD5217195",
    },
    {
        chainid: 503129905,
        family: "evm",
        name: "SKALE",
        currency: "sFUEL",
        decimals: 18,
        explorer: "https://staging-faint-slimy-achird.explorer.staging-v3.skalenodes.com",
        publicRpc: "https://staging-v3.skalenodes.com/v1/staging-faint-slimy-achird",
        contractAddress: "0x176DC2E5cB86Ba5d7ee5819478bE1f4FA0931c54",
        charactersAddress: "0xD442C8b30eEeddD4cEf86Fe786D9b55BFAaFa9e6",
        armorsAddress: "0x927ebeff82ecEeaCD9a37014c60210413188f374",
        weaponsAddress: "0x8Aa1F3267da1099D51E461f95dcF32E9525675B7",
        bootsAddress: "0x2c9880C1dCFfa9ce105e0a586E35bf7e71f8ef95",
        shopAddress: "0xBB8072C0B33d919Fc4251B879c02a0538262855a",
        lootboxAddress: "0xBc62529CA6d837179B5a4a1d884698BE58b3FAE8",
    },
    {
        chainid: 56,
        family: "evm",
        name: "BNB",
        currency: "BNB",
        decimals: 18,
        explorer: "https://bscscan.com",
        publicRpc: "https://bsc-dataseed.binance.org",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4",
        armorsAddress: "0xe10cd6c65af7637ad8329f0adb161a968101bf86",
        weaponsAddress: "0x03467ad8efe8bb73c0dde0c436b7efafe9fc3e32",
        bootsAddress: "0x2b9e270d12ba5ce62ece2c458db7b7b2939d19ae",
        shopAddress: "0xdf82b488053b2f183d959969141b9896ab8c1efa",
        lootboxAddress: "0xD705227BBd4f5D40b5E542E5d415813825ED72cf",
        multicallNFT: "0xCe5b3ED9e3279a656Bf47b9Ee7Da8e6693F6c6c3",
    },
    {
        chainid: 97,
        family: "evm",
        name: "tBNB",
        currency: "tBNB",
        decimals: 18,
        explorer: "https://testnet.bscscan.com",
        publicRpc: "https://bsc-testnet.publicnode.com",
        contractAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        charactersAddress: "0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4",
        armorsAddress: "0xe10cd6c65Af7637ad8329f0Adb161A968101bF86",
        weaponsAddress: "0x03467ad8Efe8BB73c0Dde0c436b7efAfE9FC3E32",
        bootsAddress: "0x2B9e270d12bA5cE62ECe2c458db7b7B2939D19ae",
        shopAddress: "0xDf82B488053b2F183D959969141B9896aB8C1efA",
        lootboxAddress: "0x4e74D920cA1a403d7b2B4e403890BC7E5Db59a89",
    },
    {
        chainid: 42161,
        family: "evm",
        name: "Arbitrum",
        currency: "ETH",
        decimals: 18,
        explorer: "https://explorer.arbitrum.io",
        publicRpc: "https://arb1.arbitrum.io/rpc",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586",
        armorsAddress: "0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A",
        weaponsAddress: "0xe10cd6c65Af7637ad8329f0Adb161A968101bF86",
        bootsAddress: "0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4",
        shopAddress: "0x2B9e270d12bA5cE62ECe2c458db7b7B2939D19ae",
        lootboxAddress: "0x35Ae3e8aDd7278f0B2Af8AfA00dC15cA0d6A4725",
        multicallNFT: "0x69Ba425598445eC352c93E6163804b580460B4Dd",
    },
    {
        chainid: 8453,
        family: "evm",
        name: "Base",
        currency: "ETH",
        decimals: 18,
        explorer: "https://basescan.org",
        publicRpc: "https://mainnet.base.org",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A",
        armorsAddress: "0x5Af0d7aDc8a73334dC82f51C97be2582b845bdC4",
        weaponsAddress: "0x2B9e270d12bA5cE62ECe2c458db7b7B2939D19ae",
        bootsAddress: "0xe10cd6c65Af7637ad8329f0Adb161A968101bF86",
        shopAddress: "0x03467ad8Efe8BB73c0Dde0c436b7efAfE9FC3E32",
        lootboxAddress: "0xe1174A16c4d4075c512080585E5B132816010c33",
        multicallNFT: "0x964b71F2b5E93F862496dfC68d9B50aD92aa70eB",
    },
    {
        chainid: 1440002,
        family: "evm",
        name: "XRP EVM Devnet",
        currency: "XRP",
        decimals: 18,
        explorer: "https://evm-sidechain.xrpl.org",
        publicRpc: "https://rpc-evm-sidechain.xrpl.org",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0xf52DfC26359C556E56ceC800d9F833f009b63052",
        armorsAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        weaponsAddress: "0x159d80fcFaC328Cb0400E1265F4c79138C4dD376",
        bootsAddress: "0x2784e030B259D6E79D5c33275296d478110129C0",
        shopAddress: "0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586",
        lootboxAddress: "0xD705227BBd4f5D40b5E542E5d415813825ED72cf",
    },
    {
        chainid: 204,
        family: "evm",
        name: "opBNB",
        currency: "BNB",
        decimals: 18,
        explorer: "http://opbnbscan.com",
        publicRpc: "https://opbnb-mainnet-rpc.bnbchain.org",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        armorsAddress: "0x2784e030B259D6E79D5c33275296d478110129C0",
        weaponsAddress: "0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586",
        bootsAddress: "0x159d80fcFaC328Cb0400E1265F4c79138C4dD376",
        shopAddress: "0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A",
        lootboxAddress: "0xDf82B488053b2F183D959969141B9896aB8C1efA",
        multicallNFT: "0x790B3821fdEfBdCF1461aE76d54ec8708bB56376",
    },
    {
        chainid: 137,
        family: "evm",
        name: "Polygon",
        currency: "MATIC",
        decimals: 18,
        explorer: "https://polygonscan.com",
        publicRpc: "https://polygon-rpc.com",
        contractAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        charactersAddress: "0xe10cd6c65Af7637ad8329f0Adb161A968101bF86",
        armorsAddress: "0x2B9e270d12bA5cE62ECe2c458db7b7B2939D19ae",
        weaponsAddress: "0xDf82B488053b2F183D959969141B9896aB8C1efA",
        bootsAddress: "0x03467ad8Efe8BB73c0Dde0c436b7efAfE9FC3E32",
        shopAddress: "0x685b4bEf612229F3f246Ca08fA7E8a6240c18d2A",
        lootboxAddress: "0xe1174A16c4d4075c512080585E5B132816010c33",
        multicallNFT: "0x9DC173C2d48187CBfD48233365EB37cC98540eF8",
    },
    {
        chainid: 355113,
        family: "evm",
        name: "Bitfinity Testnet",
        currency: "BFT",
        decimals: 18,
        explorer: "https://explorer.bitfinity.network",
        publicRpc: "https://testnet.bitfinity.network",
        contractAddress: "0x178A6106339c4B56ED9BaB7CD2CA55f83aED8137",
        charactersAddress: "0xC05F8340c467838B934658Fb70ca5e48EAA8838F",
        armorsAddress: "0x14cE53d208Fd5ec7D46f8558d5EdD87d329d525C",
        weaponsAddress: "0xc59f2bD000bf1fc6c394e2ECC3964947819Ac73B",
        bootsAddress: "0x69Ba425598445eC352c93E6163804b580460B4Dd",
        shopAddress: "0xf71abF5a42213c35Ae316c6725026c520B02E9aC",
        lootboxAddress: "0x691eBC6F8385d2C95F86300607D98507A3f68e3B",
    },
    {
        chainid: 42262,
        family: "evm",
        name: "Emerald",
        currency: "ROSE",
        decimals: 18,
        explorer: "https://explorer.emerald.oasis.dev",
        publicRpc: "https://emerald.oasis.dev",
        contractAddress: "0x87b8BAe3f9C64d53167Ebc560FD73D0899215241",
        charactersAddress: "0xe30E4153BcF8420BA7d3FFC28b2772D9Fdb1b82A",
        armorsAddress: "0xC651C073E8D2f3eE28a9d2E1ac96ecbC8a90CcCB",
        weaponsAddress: "0xBcd0534481daB584ae3D458d274FDD65d537cDb7",
        bootsAddress: "0x7E2e1812f8C2414da8D5Bfce9c8476B0C477543E",
        shopAddress: "0xF6bed30A1c8dfFe5a36f42489fd6be8156AdcCd7",
        lootboxAddress: "0x8E4c7cB32b6A454804E27743f119258d6A6D9Ae0",
    },
    {
        chainid: 23294,
        family: "evm",
        name: "Sapphire",
        currency: "ROSE",
        decimals: 18,
        explorer: "https://explorer.sapphire.oasis.io",
        publicRpc: "https://sapphire.oasis.io",
        contractAddress: "0x87b8BAe3f9C64d53167Ebc560FD73D0899215241",
        charactersAddress: "0x560Eb55F9f633368d378b059d7Fd32a5f7a914bE",
        armorsAddress: "0x1ee6037Fc30Fb21cf488181e5E4a0FF4803e8C18",
        weaponsAddress: "0x4c04Eb1518Fa7395E954A0d7b6afe1cB226a21c6",
        bootsAddress: "0xFF66c9aBBEE861D82C55658945E38DCC1A4780FC",
        shopAddress: "0xa32fF84560231318896150fa8E5079BE34DBdE90",
        lootboxAddress: "0x8CA15dCcc8d9e94c70dE8D709B9094A051198805",
        multicallNFT: "0x6249b932408850c4c5C2D55e143E2E20746BceA2",
    },
    {
        chainid: 1115,
        family: "evm",
        name: "Core Testnet",
        currency: "tCORE",
        decimals: 18,
        explorer: "https://scan.test.btcs.network",
        publicRpc: "https://rpc.test.btcs.network",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        armorsAddress: "0x2784e030B259D6E79D5c33275296d478110129C0",
        weaponsAddress: "0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586",
        bootsAddress: "0x159d80fcFaC328Cb0400E1265F4c79138C4dD376",
        shopAddress: "0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A",
        lootboxAddress: "0xDf82B488053b2F183D959969141B9896aB8C1efA",
    },
    {
        chainid: 1116,
        family: "evm",
        name: "Core",
        currency: "CORE",
        decimals: 18,
        explorer: "https://scan.coredao.org",
        publicRpc: "https://rpc.coredao.org",
        contractAddress: "0xd136b9EdC06E9d9464B22Efd78DE12b1B3d1C595",
        charactersAddress: "0x58e29cF81dBBE7bB358CA16ACdd9d1d7EAE92BD2",
        armorsAddress: "0x2784e030B259D6E79D5c33275296d478110129C0",
        weaponsAddress: "0x839B9aBc7d7FBF49C65B84753ff7aF11d22f0586",
        bootsAddress: "0x159d80fcFaC328Cb0400E1265F4c79138C4dD376",
        shopAddress: "0xe3D9c28e22f997eE3956C2fA839EA79cB214A76A",
        lootboxAddress: "0xDf82B488053b2F183D959969141B9896aB8C1efA",
    },
    {
        chainid: 0,
        family: "tvm",
        name: "TON",
        currency: "TON",
        decimals: 9,
        explorer: "https://tonscan.org",
        publicRpc: null,
        contractAddress: "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ",
        shopAddress: "EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t",
        lootboxAddress: "EQBH6b8Y8_Q8Zu2SKcUNXABEy7GohYR4V9Jeb-rjYVANM_38",
    },
]

// Fields that may never appear in this file. Anything that carries key
// material, names an environment variable holding key material, or is a
// server-side endpoint belongs in ./networks.server.js.
export const FORBIDDEN_SHARED_FIELDS = [
    'privateKey', 'privateKeyEnv', 'rpc', 'rpcUrl', 'mnemonic', 'apiKey', 'secret',
]

for (const n of networks) {
    for (const field of FORBIDDEN_SHARED_FIELDS) {
        if (field in n) {
            throw new Error(
                `shared/networks.js: chain ${n.chainid} carries server-only field "${field}". ` +
                `Move it to shared/networks.server.js — this file is shipped to the browser.`
            )
        }
    }
}

/** Look up a chain by id. Compares loosely because call sites pass URL strings. */
export const findNetwork = (chainid) => networks.find(n => n.chainid == chainid)

/** EVM chains only — TON has no JSON-RPC endpoint in this registry. */
export const evmNetworks = networks.filter(n => n.family === 'evm')

/**
 * WalletConnect's `rpcMap`, derived from the registry instead of being pasted
 * at each `EthereumProvider.init` call site.
 */
export const rpcMapFor = (chainIds) => Object.fromEntries(
    chainIds
        .map(id => findNetwork(id))
        .filter(n => n && n.publicRpc)
        .map(n => [String(n.chainid), n.publicRpc])
)
