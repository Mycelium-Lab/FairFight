// Integration test: sign-in nonce replay protection.
//
// Requires Redis (server/db/cache.js reads REDIS_HOST/REDIS_PORT):
//   docker start ff-redis
//   node test/integration/auth-nonce.test.mjs
//
// The private keys below are the well-known public Hardhat test accounts.
import { ethers } from 'ethers'
import { issueNonce, verifySignIn } from '../../server/utils/authNonce.js'

const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
const other = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

let failed = 0
const check = (name, got, want) => {
    const ok = got === want
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (got ${got})`)
}

const { message } = await issueNonce(wallet.address)
check('valid signature over live nonce accepted', await verifySignIn(wallet.address, await wallet.signMessage(message)), true)

// The nonce is consumed on first use, so the same signature must not work twice.
check('replay of the same signature rejected', await verifySignIn(wallet.address, await wallet.signMessage(message)), false)

// The old scheme signed a constant string, making signatures permanent credentials.
await issueNonce(wallet.address)
check('legacy static sign-in message rejected', await verifySignIn(wallet.address, await wallet.signMessage('Sign in message to Fair Fight')), false)

const { message: forOther } = await issueNonce(wallet.address)
check('signature from a different wallet rejected', await verifySignIn(wallet.address, await other.signMessage(forOther)), false)

check('signature with no live nonce rejected', await verifySignIn(other.address, await other.signMessage('anything')), false)
check('missing signature rejected', await verifySignIn(wallet.address, undefined), false)

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
