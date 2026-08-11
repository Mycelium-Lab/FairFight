#!/usr/bin/env node
//
// A stand-in for the human's browser, for when you want to watch the sparring
// bot work without opening a game window at all.
//
//   node bot/fake-human.mjs <room> [--name alice] [--die-after 5s]
//
// It joins the room and prints every frame the server sends, which is the same
// set of frames lib/net/room-connection.js reacts to in a real client. It is
// even less of a game client than the bot is: no canvas, no WebRTC, no input.
//
// --die-after makes it report ITS OWN death, naming the bot as killer - which is
// the only way to make the bot "win", because signalling/server.js accepts a
// death report solely from the socket that owns the dying wallet.

import { io } from 'socket.io-client'
import { parseArgs } from 'node:util'
import { parseDuration, DEFAULT_SIGNALLING } from './lib/options.mjs'
import { createLogger } from './lib/log.mjs'

const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
        name: { type: 'string' },
        'die-after': { type: 'string' },
        signalling: { type: 'string' },
        help: { type: 'boolean', short: 'h' }
    }
})

if (values.help || positionals.length !== 1) {
    process.stdout.write(`usage: node bot/fake-human.mjs <room> [--name alice] [--die-after 5s] [--signalling url]

  <room>          the "<gameid>&network=<chainid>" string sparring-bot prints
  --name          who to join as (default: devplayer1)
  --die-after     report our own death this long after the bot appears, naming
                  it as the killer. Omit to never die.
  --signalling    default: $SIGNALLING_URL or ${DEFAULT_SIGNALLING}
`)
    process.exit(values.help ? 0 : 2)
}

const room = positionals[0]
const name = `${values.name || 'devplayer1'}`.toLowerCase()
const url = (values.signalling || process.env.SIGNALLING_URL || DEFAULT_SIGNALLING).replace(/\/+$/, '')
const dieAfter = values['die-after'] ? parseDuration(values['die-after'], '--die-after') : null
const log = createLogger({})

const socket = io(url, { forceNew: true, transports: ['websocket', 'polling'] })
const members = new Map()
let dieTimer = null
const offered = new Set()

const others = () => [...members.keys()].filter(w => w.toLowerCase() !== name)

// A real client opens a WebRTC peer connection with everyone it finds in the
// room (lib/net/room-connection.js, initPeerConnection). Doing the same here -
// with a placeholder offer, since there is no RTCPeerConnection in Node - keeps
// the stand-in honest: the sparring bot will ignore it and say so, which is
// exactly what a browser would run into.
function offerPeerConnection() {
    for (const [wallet, userId] of members) {
        if (wallet.toLowerCase() === name || offered.has(userId)) continue
        offered.add(userId)
        log.sent('sdp', { userId, sdp: '(placeholder offer - Node has no RTCPeerConnection)' })
        socket.emit('sdp', { userId, sdp: { type: 'offer', sdp: 'v=0 placeholder' } })
    }
}

function maybeScheduleDeath() {
    if (!dieAfter || dieTimer || !others().length) return
    log.note(`dying in ${values['die-after']}`)
    dieTimer = setTimeout(() => {
        const killer = others()[0]
        if (!killer) return
        const payload = { walletAddress: name, killerAddress: killer }
        log.sent('user_dead', payload)
        socket.emit('user_dead', payload)
        dieTimer = null
        maybeScheduleDeath()
    }, dieAfter)
}

socket.on('connect', () => {
    log.wire(`connected to ${url} as ${socket.id}`)
    log.sent('join', { roomName: room, walletAddress: name })
    socket.emit('join', { roomName: room, walletAddress: name })
})
socket.on('connect_error', err => {
    log.error(`cannot reach ${url}: ${err.message}`)
    process.exit(1)
})
socket.onAny((event, payload) => {
    log.recv(event, payload)
    if (event === 'room') {
        for (const u of (payload && payload.users) || []) members.set(u.walletAddress, u.userId)
        offerPeerConnection()
        maybeScheduleDeath()
    }
    if (event === 'user_join') {
        const u = (payload && payload.user) || payload
        if (u && u.walletAddress) members.set(u.walletAddress, u.userId)
        offerPeerConnection()
        maybeScheduleDeath()
    }
    if (event === 'user_leave') {
        for (const [w, id] of members) if (id === (payload && payload.userId)) members.delete(w)
    }
    if (event === 'finishing') {
        log.ok('fight is settling - a real client would show the game-over modal here')
        setTimeout(() => { socket.close(); process.exit(0) }, 1500)
    }
    if (event === 'not_user_room' || event === 'error_auth_required') {
        log.error(`refused: ${event}`)
        process.exit(1)
    }
})

process.on('SIGINT', () => { socket.close(); process.exit(0) })
