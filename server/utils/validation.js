import path from 'path'

//Image variants written by mixing.js (see mixing/mixing.js: players_${type}).
//Used as a directory name component, so it must never come straight from a request.
const IMAGE_TYPES = new Set(['main', 'rival', 'preview'])

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/
//TON addresses are base64url with an optional leading '-' for testnet workchains.
const TON_ADDRESS = /^[A-Za-z0-9_-]{48}$/
//Free-to-play players are not wallets at all - they are Telegram usernames or plain
//handles - so they cannot be held to an address format. Keep the charset tight and
//slash-free; safeJoin is still the backstop for anything that reaches the filesystem.
const F2P_HANDLE = /^[A-Za-z0-9_.-]{1,64}$/
const F2P_CHAIN_IDS = new Set(['999998', '999999'])

export function isValidImageType(typeofimage) {
    return IMAGE_TYPES.has(typeofimage)
}

//chainid 0 is TON, 999998/999999 are the free-to-play pseudo-chains, everything else
//is an EVM chain (see signalling/server.js).
export function isValidAddress(address, chainid) {
    if (typeof address !== 'string') return false
    const chain = `${chainid}`
    if (chain === '0') return TON_ADDRESS.test(address)
    if (F2P_CHAIN_IDS.has(chain)) return F2P_HANDLE.test(address) && !address.includes('..')
    return EVM_ADDRESS.test(address)
}

export function isValidChainId(chainid) {
    const parsed = Number(chainid)
    return Number.isInteger(parsed) && parsed >= 0
}

//Builds a path that is guaranteed to stay inside baseDir, whatever the segments contain.
//Returns null when the result would escape, so callers can 400 instead of serving the file.
export function safeJoin(baseDir, ...segments) {
    const resolvedBase = path.resolve(baseDir)
    const target = path.resolve(resolvedBase, ...segments)
    if (target !== resolvedBase && !target.startsWith(resolvedBase + path.sep)) return null
    return target
}
