/*
 * The chain-family seam.
 *
 * Two families, EVM and TVM, sit behind one interface. `evm.js` and `tvm.js`
 * are the implementations; this file is the part that has no family: which
 * network the page is for, the capability record, and base-unit arithmetic.
 *
 * WHY THIS FILE DOES NOT IMPORT THE IMPLEMENTATIONS
 * Statically importing both would put `ethers`, the 2,529-line ABI module and
 * @walletconnect into main_ton.js, and @ton/ton + @tonconnect into main.js -
 * undoing the bundle split. webpack is configured with
 * `dynamicImportMode: 'eager'`, so an `import()` here would inline both too.
 * Until the two lobby pages become one (Step 6/8), each entry imports its own
 * family directly and asks this file only for the network. When there is one
 * page, the selection moves here.
 */
import { findNetwork } from '../modules/networks.js'

/** Where each family lands when `?network=` is missing or names another family. */
export const FAMILY_DEFAULT_CHAINID = { evm: 42161, tvm: 0 }

/**
 * The network this page is for, read from `?network=`.
 *
 * `family` is the family the calling bundle can actually talk to. A request for
 * another family's chain (`/?network=0` on the EVM page) falls back to that
 * family's default rather than returning a network whose adapter is absent -
 * which is what `networks.find(...)` returning `undefined` used to do, one
 * property access before a crash.
 */
export const networkFromQuery = (family, search = window.location.search) => {
    const requested = new URLSearchParams(search).get('network')
    const found = requested != null ? findNetwork(requested) : null
    return (found && found.family === family)
        ? found
        : findNetwork(FAMILY_DEFAULT_CHAINID[family])
}

/**
 * Capability record. Every flag names a place where the two families genuinely
 * do not unify, so that call sites branch on a capability instead of on a chain
 * id (`chainid == 0`) or on the presence of an SDK.
 *
 *   tokenChoice        multi-asset bets; TON bets are TON
 *   requiresApproval   the ERC20 allowance two-step
 *   liveEvents         push discovery (contract.on) vs pull (poll)
 *   syncReceipt        submit() hands back something confirm() can wait on
 *   chainSwitch        the wallet can be asked to change network
 *   multiplayerTimer   >2-player join countdown and auto-redirect
 *   perItemNftAddress  an NFT's identity carries its own contract address
 *   explorerTxLinks    a submitted tx has a ref an explorer can resolve
 *   dismissItemModalOnBackdropClick  item modal closes on a backdrop click
 */
export const makeCaps = (caps) => {
    // Not a style rule: TonConnect's sendTransaction resolves with a BOC, which
    // is not a tx hash and cannot be looked up. A family that cannot confirm a
    // transaction has nothing to put in an explorer URL either, and pretending
    // otherwise is how `ton/shop.js` came to build an href out of an undefined
    // `hash`.
    if (!caps.syncReceipt && caps.explorerTxLinks) {
        throw new Error('chain caps: explorerTxLinks requires syncReceipt - a BOC is not a tx hash')
    }
    return Object.freeze({...caps})
}

export const MAX_UINT256 = (1n << 256n) - 1n

/**
 * Human decimal string -> base units, in string math.
 *
 * Replaces `value * 10**decimals` on Numbers, which loses precision above 15
 * significant digits: `0.3 * 10**18` is 300000000000000030, not
 * 300000000000000000, and that number was the one sent on chain.
 *
 * Digits past the asset's precision are truncated rather than rounded - the
 * float path could round *up* into an amount the user never typed.
 */
export const toBaseUnits = (human, decimals) => {
    const text = String(human ?? '').trim()
    if (text === '' || text === '.' || !/^\d*(\.\d*)?$/.test(text)) {
        throw new Error(`not a positive decimal amount: "${human}"`)
    }
    const places = Number(decimals)
    const [whole, frac = ''] = text.split('.')
    return BigInt((whole || '0') + frac.slice(0, places).padEnd(places, '0'))
}

/** Base units -> human decimal string. Replaces `units / 10**decimals`. */
export const fromBaseUnits = (units, decimals) => {
    const places = Number(decimals)
    let value = BigInt(units)
    const sign = value < 0n ? '-' : ''
    if (value < 0n) value = -value
    const digits = value.toString().padStart(places + 1, '0')
    const whole = digits.slice(0, digits.length - places)
    const frac = places === 0 ? '' : digits.slice(digits.length - places).replace(/0+$/, '')
    return `${sign}${whole}${frac ? `.${frac}` : ''}`
}
