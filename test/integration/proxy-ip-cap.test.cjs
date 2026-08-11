// Integration test: the per-IP connection cap behind a reverse proxy.
//
// Behind nginx every connection arrives from the proxy's address, so a cap keyed on
// the socket address counts all players as one host and refuses the 21st real player.
// SIGNALLING_TRUST_PROXY=true makes it key on X-Forwarded-For instead - but only when
// set, because the header is client-settable and trusting it always would let anyone
// mint a fresh identity per connection and bypass the cap entirely.
//
//   docker start ff-pg ff-redis
//   SIGNALLING_TRUST_PROXY=true SIGNALLING_MAX_CONNECTIONS_PER_IP=3 \
//     SIGNALLING_PORT=8055 node signalling/server.js
//   SIGNALLING_PORT=8055 node test/integration/proxy-ip-cap.test.cjs
//
// Then repeat without SIGNALLING_TRUST_PROXY to exercise the untrusted case.

const io = require('socket.io-client')

const PORT = process.env.SIGNALLING_PORT || '8055'
const URL = `http://127.0.0.1:${PORT}`
const CAP = parseInt(process.env.SIGNALLING_MAX_CONNECTIONS_PER_IP || '3', 10)
const TRUSTED = process.env.EXPECT_TRUST_PROXY === 'true'

let failed = 0
const check = (name, ok, detail) => {
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

// Each connection claims a different originating client via X-Forwarded-For, the way a
// proxy would when forwarding distinct players.
function connectAs(forwardedFor) {
    return new Promise(resolve => {
        const socket = io.connect(URL, {
            forceNew: true,
            transports: ['polling'], // headers only ride the HTTP handshake
            extraHeaders: { 'X-Forwarded-For': forwardedFor },
        })
        socket.on('connect', () => resolve({ ok: true, socket }))
        socket.on('connect_error', err => resolve({ ok: false, reason: err.message }))
        setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 8000)
    })
}

;(async () => {
    const open = []

    // Fill the cap from one apparent client.
    let admitted = 0
    for (let i = 0; i < CAP; i++) {
        const r = await connectAs('203.0.113.10')
        if (r.ok) { admitted++; open.push(r.socket) }
    }
    check(`${CAP} connections from one forwarded client are admitted`, admitted === CAP, `${admitted}/${CAP}`)

    // One more from the SAME apparent client must be refused either way: when trusted
    // because that client is at its cap, when untrusted because the shared socket
    // address is.
    const overflow = await connectAs('203.0.113.10')
    check('the next connection from that client is refused', !overflow.ok, overflow.reason)
    if (overflow.ok) open.push(overflow.socket)

    // A DIFFERENT forwarded client is the discriminating case.
    const other = await connectAs('203.0.113.99')
    if (TRUSTED) {
        check('a different forwarded client is still admitted', other.ok,
            other.ok ? 'admitted' : other.reason)
    } else {
        check('forwarded header is ignored when the proxy is not trusted', !other.ok,
            other.ok ? 'ADMITTED - header was trusted without the flag' : other.reason)
    }
    if (other.ok) open.push(other.socket)

    // Slots are returned on disconnect.
    open.forEach(s => s.close())
    await new Promise(r => setTimeout(r, 1500))
    const afterRelease = await connectAs('203.0.113.10')
    check('slots are released on disconnect', afterRelease.ok, afterRelease.reason)
    if (afterRelease.ok) afterRelease.socket.close()

    console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
    process.exit(failed === 0 ? 0 : 1)
})().catch(e => { console.error('ERROR', e.message); process.exit(1) })
