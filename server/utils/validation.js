import path from 'path'

//Image variants written by mixing.js (see mixing/mixing.js: players_${type}).
//Used as a directory name component, so it must never come straight from a request.
const IMAGE_TYPES = new Set(['main', 'rival', 'preview'])

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/
//TON addresses are base64url with an optional leading '-' for testnet workchains.
const TON_ADDRESS = /^[A-Za-z0-9_-]{48}$/

export function isValidImageType(typeofimage) {
    return IMAGE_TYPES.has(typeofimage)
}

//chainid 0 is TON, everything else is an EVM chain (see signalling/server.js).
export function isValidAddress(address, chainid) {
    if (typeof address !== 'string') return false
    return `${chainid}` === '0' ? TON_ADDRESS.test(address) : EVM_ADDRESS.test(address)
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
