/*
 * The lobby entry. One bundle, both chain families.
 *
 * There used to be two entries - main.js for public/index.html and main_ton.js
 * for public/index_ton.html - which is why the two pages could never become one
 * page: a merged page cannot choose between two <script> tags. This file is the
 * choice, made at runtime.
 *
 * WHY THE FAMILY HALVES ARE import()ed AND NOT IMPORTED
 * Statically importing both would execute both. `lib/modules/tokens.js` reads
 * the global `ethers` at module top level and index_ton.html does not load the
 * ethers UMD script, so a static import of the EVM half would throw a
 * ReferenceError on the TON page before anything rendered. It would also put
 * @walletconnect and the 2,529-line ABI module into the Telegram mini app, and
 * @ton/ton + @tonconnect into the EVM page - about 1 MB each way.
 *
 * webpack's parser is configured with `dynamicImportMode: 'eager'` so that
 * @tonconnect/ui's own dynamic imports do not become numbered async chunks.
 * These two are the deliberate exception: `webpackMode: "lazy"` gives each
 * family its own chunk, and `webpackChunkName` gives that chunk a stable name
 * rather than a number that the next unrelated code change would renumber.
 */
import { findNetwork } from './modules/networks.js'

/**
 * Which family this page is.
 *
 * A `data-chain` attribute is the page saying so outright, and is what both
 * pages do today - on the script tag that loads this file. `?network=` is the
 * fallback a single merged page will use once index.html and index_ton.html
 * become one file; the path is the fallback after that, since the server
 * already routes / and /ton separately.
 */
const familyForPage = () => {
    const declared = document.querySelector('[data-chain]')
    if (declared && declared.dataset.chain) return declared.dataset.chain
    const requested = new URLSearchParams(window.location.search).get('network')
    const network = requested != null ? findNetwork(requested) : null
    if (network) return network.family
    return window.location.pathname.startsWith('/ton') ? 'tvm' : 'evm'
}

const start = async () => {
    if (familyForPage() === 'tvm') {
        const {startTonLobby} = await import(
            /* webpackMode: "lazy", webpackChunkName: "lobby-tvm" */ './lobby/tvm.js')
        await startTonLobby()
    } else {
        const {startEvmLobby} = await import(
            /* webpackMode: "lazy", webpackChunkName: "lobby-evm" */ './lobby/evm.js')
        await startEvmLobby()
    }
}

start().catch(err => console.log(err))
