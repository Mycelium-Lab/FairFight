// Server-side view of the chain registry: shared/networks.js plus the fields
// that must never reach the browser.
//
// NEVER import this from anything webpack bundles. `lib/**` imports
// shared/networks.js instead; this file is Node-only and reads process.env.
//
// Two server-only fields are merged in:
//   privateKey — the settlement signing key, read lazily from the environment
//                variable named in PRIVATE_KEY_ENV. Defined as a
//                non-enumerable getter so it never lands in a JSON.stringify()
//                of a network object and is never copied by object spread.
//   rpc        — the endpoint the server dials. Defaults to the chain's public
//                endpoint but can be replaced per chain with RPC_URL_<chainid>
//                for a private or paid provider, which then stays server-side.
//
// Callers must have loaded dotenv (server/utils/env.js) before *reading*
// `privateKey`; the getter defers the lookup so import order does not matter.
import { networks as sharedNetworks } from './networks.js'

// Which environment variable holds the signing key for each chain.
// The names are here and only here — they are not part of the shared shape.
const PRIVATE_KEY_ENV = {
    31337: 'PRIVATE_KEY_TEST',
    1337: 'PRIVATE_KEY_TEST',
    5: 'PRIVATE_KEY_TEST',
    97: 'PRIVATE_KEY_EMERALD',
    42161: 'PRIVATE_KEY_EMERALD',
    8453: 'PRIVATE_KEY_EMERALD',
    1440002: 'PRIVATE_KEY_EMERALD',
    42261: 'PRIVATE_KEY_EMERALD',
    42262: 'PRIVATE_KEY_EMERALD',
    23295: 'PRIVATE_KEY_EMERALD',
    23294: 'PRIVATE_KEY_EMERALD',
    1351057110: 'PRIVATE_KEY_EMERALD',
    // Was commented out of contract/contract.js with this same key; the client
    // registry has always listed the chain, so it is wired up here too.
    355113: 'PRIVATE_KEY_EMERALD',
    503129905: 'PRIVATE_KEY_SKALE',
    // Client-only chain until now. Grouped with the other SKALE network.
    344435: 'PRIVATE_KEY_SKALE',
    137: 'PRIVATE_KEY',
    56: 'PRIVATE_KEY',
    204: 'PRIVATE_KEY',
    1115: 'PRIVATE_KEY',
    1116: 'PRIVATE_KEY',
    // chain 0 (TON) has no EVM signing key — settlement uses MNEMONIC_TON in
    // server/ton/service.js.
}

export const networks = sharedNetworks.map((shared) => {
    const n = { ...shared }

    // The server dials `rpc`; the browser only ever sees `publicRpc`.
    Object.defineProperty(n, 'rpc', {
        enumerable: false,
        get: () => process.env[`RPC_URL_${shared.chainid}`] || shared.publicRpc,
    })

    const envName = PRIVATE_KEY_ENV[shared.chainid]
    if (envName) {
        Object.defineProperty(n, 'privateKey', {
            enumerable: false,
            get: () => process.env[envName],
        })
        Object.defineProperty(n, 'privateKeyEnv', { enumerable: false, value: envName })
    }

    return n
})

export const findNetwork = (chainid) => networks.find(n => n.chainid == chainid)
