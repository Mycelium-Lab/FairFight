// Client view of the chain registry.
//
// This file used to be a hand-maintained second copy of contract/contract.js's
// array, and the two had drifted (different Arbitrum RPC, different Sapphire
// shop address, chains present on one side only). It is now a re-export of the
// single shared source so drift is not expressible.
//
// The shared module is browser-safe by construction: it has no `process.env`,
// no private keys, and no server RPC endpoints — see the guard at the bottom of
// shared/networks.js. The server adds those in shared/networks.server.js, which
// nothing under lib/ may import.
//
// NOTE: this module is bundled by webpack (resolved at build time). It is not
// loadable as a raw <script type="module"> from /modules/networks.js, because
// shared/ lives outside the statically served roots.
export { networks, findNetwork, evmNetworks, rpcMapFor } from '../../shared/networks.js'
