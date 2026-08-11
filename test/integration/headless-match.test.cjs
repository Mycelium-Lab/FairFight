// Integration test: play a whole match with no wallet, no chain and no browser.
//
// This is the wallet-free loop the game needs for netcode work and for capturing
// gameplay fixtures. It drives the signalling server exactly as two browsers would:
// join a free-to-play room, report a death, and settle.
//
//   docker start ff-pg ff-redis
//   node scripts/seedDevFight.mjs
//   FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8033 node signalling/server.js
//   node test/integration/headless-match.test.cjs <gameid>
//
// Pass the gameid printed by seedDevFight.mjs, or set DEV_GAME_ID.

const io = require('socket.io-client')

const URL = process.env.SIGNALLING_URL || 'http://127.0.0.1:8033'
const CHAIN = '999999'
const GAME_ID = process.argv[2] || process.env.DEV_GAME_ID
const P1 = 'devplayer1'
const P2 = 'devplayer2'

if (!GAME_ID) {
    console.error('usage: node test/integration/headless-match.test.cjs <gameid>')
    process.exit(2)
}
const ROOM = `${GAME_ID}&network=${CHAIN}`

let failed = 0
const check = (name, ok, detail) => {
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

function connect() {
    return new Promise((resolve, reject) => {
        const s = io.connect(URL, { forceNew: true, transports: ['websocket', 'polling'] })
        s.on('connect', () => resolve(s))
        s.on('connect_error', reject)
        setTimeout(() => reject(new Error('connect timeout')), 8000)
    })
}

// Joining succeeds when the server sends room info; it refuses with not_user_room
// or error_auth_required.
function join(socket, wallet) {
    return new Promise(resolve => {
        socket.once('room', info => resolve({ ok: true, info }))
        socket.once('not_user_room', () => resolve({ ok: false, reason: 'not_user_room' }))
        socket.once('error_auth_required', () => resolve({ ok: false, reason: 'auth_required' }))
        socket.emit('join', { roomName: ROOM, walletAddress: wallet })
        setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 8000)
    })
}

;(async () => {
    const s1 = await connect()
    const s2 = await connect()

    // No signature is sent by either client - this is the point of dev mode.
    const j1 = await join(s1, P1)
    check('player 1 joins without a wallet', j1.ok, j1.reason)

    // Player 2 joining should reach player 1 as a user_join event.
    const sawPeer = new Promise(resolve => {
        s1.once('user_join', () => resolve(true))
        setTimeout(() => resolve(false), 8000)
    })
    const j2 = await join(s2, P2)
    check('player 2 joins without a wallet', j2.ok, j2.reason)
    check('player 1 is told about player 2', await sawPeer)

    if (!j1.ok || !j2.ok) {
        console.log('\njoin failed - is the server running with FAIRFIGHT_DEV_NO_WALLET=true?')
        process.exit(1)
    }

    // A death moves stake from the victim to the killer and is broadcast as a
    // balance update. Player 2 reports its own death, naming player 1 as killer.
    const balanceUpdate = new Promise(resolve => {
        s1.once('update_balance', data => resolve(data))
        setTimeout(() => resolve(null), 12000)
    })
    s2.emit('user_dead', { walletAddress: P2, killerAddress: P1 })
    const update = await balanceUpdate
    check('a death produces a balance update', update !== null)

    // The victim reporting someone else's death must be rejected (the fix from the
    // socket-auth commit), and must not move any balance.
    const spoofRejected = new Promise(resolve => {
        s1.once('update_balance', () => resolve(false))
        setTimeout(() => resolve(true), 4000)
    })
    s2.emit('user_dead', { walletAddress: P1, killerAddress: P2 })
    check('a player cannot report the OTHER player as dead', await spoofRejected)

    s1.close()
    s2.close()
    console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
    process.exit(failed === 0 ? 0 : 1)
})().catch(e => { console.error('ERROR', e.message); process.exit(1) })
