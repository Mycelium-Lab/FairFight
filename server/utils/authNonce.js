import crypto from 'crypto'
import { ethers } from 'ethers'
import cacheClient from '../db/cache.js'

//Sign-in used to be a signature over the constant string 'Sign in message to Fair Fight'.
//That makes a captured signature a permanent bearer credential for that wallet, since
//there is nothing tying it to a moment in time or to a single use. These nonces are
//issued per address, expire, and are consumed on first successful verification.

const NONCE_TTL_SECONDS = 300

const client = cacheClient()
let connecting = null

async function redis() {
    if (!client.isOpen) {
        connecting = connecting || client.connect()
        await connecting
    }
    return client
}

const key = (address) => `authnonce_${`${address}`.toLowerCase()}`

export function buildSignInMessage(nonce) {
    return `Sign in to Fair Fight\nnonce: ${nonce}`
}

export async function issueNonce(address) {
    const nonce = crypto.randomBytes(16).toString('hex')
    const cache = await redis()
    await cache.set(key(address), nonce, { EX: NONCE_TTL_SECONDS })
    return { nonce, message: buildSignInMessage(nonce) }
}

//Returns the message that should have been signed, or null when there is no live
//nonce. Consumes the nonce so a signature cannot be replayed.
export async function consumeNonce(address) {
    const cache = await redis()
    const nonce = await cache.get(key(address))
    if (!nonce) return null
    await cache.del(key(address))
    return buildSignInMessage(nonce)
}

//True only when `signature` is this address's signature over its live, unused nonce.
export async function verifySignIn(address, signature) {
    if (!signature || !address) return false
    const message = await consumeNonce(address)
    if (!message) return false
    try {
        return ethers.utils.verifyMessage(message, signature).toLowerCase() === `${address}`.toLowerCase()
    } catch (error) {
        return false
    }
}
