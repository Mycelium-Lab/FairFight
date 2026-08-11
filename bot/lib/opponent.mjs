// The socket.io half of the sparring bot: everything the bot does as a
// participant in a live match room.
//
// WHAT THIS IS NOT
// ----------------
// Gameplay in FairFight is peer-to-peer WebRTC between two browsers. Movement,
// shooting and hit detection never touch the signalling server - they travel on
// an RTCDataChannel that a Node process has no realistic way to join. So this
// bot:
//
//   * has no position, no health and no weapon,
//   * cannot be shot at, and cannot shoot,
//   * will not be drawn as a character in the human's game view,
//   * ignores the 'sdp' and 'ice_candidate' frames the human's client sends it,
//     which means the human's PeerConnection for the bot never opens.
//
// What it does hold up is the match LIFECYCLE, all of which is plain socket.io:
// joining, room membership, deaths, balance movement and settlement. That is the
// part a solo developer cannot exercise alone, and it is the part this drives.
//
// ONE-SIDED BY CONSTRUCTION
// -------------------------
// signalling/server.js only accepts a death report from the socket that owns the
// dying wallet (isDeathReportValid: no reporting other people, no self-kills, and
// the killer must be in the room). The bot can therefore only ever report its own
// death and name the human as killer - so with this bot the human always wins.
// Making the human lose is the human client's job; it is not something the bot
// can, or should, be able to do.

import { EventEmitter } from 'node:events'
import { io } from 'socket.io-client'

// Every event signalling/server.js can push at a room member. Listed explicitly
// so the bot's log is a readable inventory of the protocol rather than whatever
// happened to arrive.
export const SERVER_EVENTS = {
    room: 'room info for the room we just joined',
    user_join: 'another player entered the room',
    user_leave: 'another player left the room',
    end_waiting_another_user: 'the room stopped being one player short',
    update_balance: 'stake moved between players',
    user_lose_all: 'a player lost their whole stake',
    finishing: 'the fight is settling',
    end_finishing: 'settlement finished, clients navigate away',
    user_dead: 'a death was broadcast',
    user_ready: 'a player signalled ready',
    jump: 'peer jump relay (disabled server-side)',
    sdp: 'WebRTC session description - the bot cannot use this',
    ice_candidate: 'WebRTC ICE candidate - the bot cannot use this',
    auth_nonce: 'a nonce to sign; free-to-play rooms in dev mode do not need one',
    not_user_room: 'refused: not a player in this fight, or the fight is over',
    error_auth_required: 'refused: a wallet signature was required',
    error_room_is_full: 'refused: the room is full',
    error_user_initialized: 'refused: this socket already joined'
}

const WEBRTC_EVENTS = new Set(['sdp', 'ice_candidate'])

// Thrown for the mistakes a dev actually makes - server not running, wrong port.
// main() prints these as one line of advice instead of a stack trace.
export class BotError extends Error {
    constructor(message, hint) {
        super(message)
        this.name = 'BotError'
        this.hint = hint
    }
}

export class SparringOpponent extends EventEmitter {
    constructor({ url, name, log }) {
        super()
        this.url = url
        this.room = null
        this.name = name
        this.log = log
        this.socket = null
        this.userId = null
        // walletAddress -> userId, for everyone in the room including us.
        this.members = new Map()
        this.joined = false
        this.finished = false
        this.deaths = 0
        this.webrtcOffers = 0
    }

    opponents() {
        return [...this.members.keys()].filter(w => w.toLowerCase() !== this.name.toLowerCase())
    }

    hasOpponent() {
        return this.opponents().length > 0
    }

    // Called before any fight is seeded, so that a signalling server that is not
    // running costs the dev an error message rather than an orphan row in game_f2p.
    connect({ timeoutMs = 10000 } = {}) {
        return new Promise((resolve, reject) => {
            this.log.wire(`connecting to ${this.url}`)
            // No Origin header is sent from Node, which signalling/server.js
            // deliberately allows: its allowRequest only enforces the origin
            // allowlist for browsers. CLI clients are gated by the wallet check
            // instead, and free-to-play rooms are exempt from that in dev mode.
            const socket = io(this.url, { forceNew: true, transports: ['websocket', 'polling'] })
            this.socket = socket

            const hint = 'start it with:  FAIRFIGHT_DEV_NO_WALLET=true node signalling/server.js\n'
                + '        or point the bot elsewhere with --signalling / $SIGNALLING_URL'
            const fail = message => {
                clearTimeout(timer)
                socket.close()
                reject(new BotError(message, hint))
            }
            const timer = setTimeout(() => fail(`no answer from the signalling server at ${this.url} after ${timeoutMs}ms`), timeoutMs)

            socket.on('connect', () => {
                clearTimeout(timer)
                this.log.wire(`connected, socket id ${socket.id}`)
                resolve(this)
            })
            socket.on('connect_error', err => fail(`cannot reach the signalling server at ${this.url}: ${err.message}`))
            socket.on('disconnect', reason => {
                this.log.wire(`disconnected (${reason})`)
                this.emit('disconnect', reason)
            })

            // Log first, act second, so the transcript always shows the frame that
            // caused whatever the bot does next.
            socket.onAny((event, payload) => {
                this.log.recv(event, payload)
                const meaning = SERVER_EVENTS[event]
                if (meaning && this.log.verbose) this.log.note(`  (${meaning})`)
                this._handle(event, payload)
            })
        })
    }

    // Free-to-play rooms in dev mode take no signature, so the join payload is
    // just who we claim to be. On a paid chain this would need auth_request ->
    // sign the nonce -> join, and the bot has no wallet to do that with.
    join(room, { timeoutMs = 10000 } = {}) {
        this.room = room
        return new Promise(resolve => {
            const done = result => {
                clearTimeout(timer)
                this.off('joined', onJoin)
                this.off('rejected', onReject)
                resolve(result)
            }
            const onJoin = info => done({ ok: true, info })
            const onReject = reason => done({ ok: false, reason })
            const timer = setTimeout(() => done({ ok: false, reason: 'timeout' }), timeoutMs)

            this.once('joined', onJoin)
            this.once('rejected', onReject)

            const payload = { roomName: this.room, walletAddress: this.name }
            this.log.sent('join', payload)
            this.socket.emit('join', payload)
        })
    }

    _handle(event, payload) {
        switch (event) {
            case 'room': {
                this.joined = true
                this.userId = payload && payload.userId
                this.members.clear()
                for (const user of (payload && payload.users) || []) {
                    if (user && user.walletAddress) this.members.set(user.walletAddress, user.userId)
                }
                this.emit('joined', payload)
                this._announceRoom()
                break
            }
            case 'user_join': {
                const user = (payload && payload.user) || payload
                if (user && user.walletAddress) this.members.set(user.walletAddress, user.userId)
                this.emit('user_join', user)
                this._announceRoom()
                break
            }
            case 'user_leave': {
                const goneId = payload && payload.userId
                for (const [wallet, id] of this.members) if (id === goneId) this.members.delete(wallet)
                this.emit('user_leave', payload)
                this._announceRoom()
                break
            }
            case 'sdp':
            case 'ice_candidate': {
                this.webrtcOffers++
                if (this.webrtcOffers === 1) {
                    this.log.warn('the other client is trying to open a WebRTC peer connection with the bot.')
                    this.log.note('        the bot ignores it: gameplay is browser-to-browser and a Node process')
                    this.log.note('        cannot join that mesh. Expect no character to appear on your screen.')
                }
                break
            }
            case 'finishing': {
                this.finished = true
                this.emit('finishing', payload)
                break
            }
            case 'end_finishing': {
                this.emit('end_finishing', payload)
                break
            }
            case 'update_balance': {
                this.emit('update_balance', payload)
                break
            }
            case 'user_lose_all': {
                this.emit('user_lose_all', payload)
                break
            }
            case 'not_user_room':
                this.emit('rejected', 'not_user_room')
                break
            case 'error_auth_required':
                this.emit('rejected', 'error_auth_required')
                break
            case 'error_room_is_full':
                this.emit('rejected', 'error_room_is_full')
                break
            case 'error_user_initialized':
                this.emit('rejected', 'error_user_initialized')
                break
            default:
                break
        }
    }

    _announceRoom() {
        const others = this.opponents()
        this.log.info(`room now holds ${this.members.size} player(s): ${[...this.members.keys()].join(', ') || '(none)'}`)
        if (others.length && !this._hadOpponent) {
            this._hadOpponent = true
            this.emit('opponent_present', others)
        } else if (!others.length && this._hadOpponent) {
            this._hadOpponent = false
            this.emit('opponent_gone')
        }
    }

    // The only result-affecting frame the bot is allowed to send. walletAddress
    // must be the bot itself: signalling/server.js rejects a socket reporting
    // anybody else's death, and that check is a good thing - do not try to route
    // around it by having the bot claim the human died.
    die() {
        const [killer] = this.opponents()
        if (!killer) {
            this.log.warn('not dying: no opponent in the room. The server rejects a death whose killer is absent.')
            return false
        }
        const payload = { walletAddress: this.name, killerAddress: killer }
        this.deaths++
        this.log.sent('user_dead', payload)
        this.log.note(`        death #${this.deaths}: the bot dies, ${killer} takes the round's stake`)
        this.socket.emit('user_dead', payload)
        // The server sends every update_balance with socket.to(...), which excludes
        // the sender - so the bot gets nothing back from its own death. The human's
        // client is the one that sees the balance move.
        this.log.note('        (no reply expected: the server excludes the reporting socket from update_balance)')
        this.emit('died', { killer, count: this.deaths })
        return true
    }

    // Ends the match immediately. signalling/server.js takes the address from the
    // authenticated socket rather than the payload, so this settles the fight for
    // whoever the bot joined as.
    finish() {
        const payload = { fromButton: true }
        this.log.sent('finishing', payload)
        this.socket.emit('finishing', payload)
        return true
    }

    status() {
        return {
            room: this.room,
            name: this.name,
            userId: this.userId,
            members: [...this.members.entries()].map(([wallet, id]) => ({ wallet, userId: id })),
            deaths: this.deaths,
            finished: this.finished,
            webrtcOffersIgnored: this.webrtcOffers
        }
    }

    leave() {
        if (this.socket) {
            this.log.wire(this.joined
                ? 'closing socket (the server will broadcast user_leave)'
                : 'closing socket')
            this.socket.close()
            this.socket = null
        }
    }
}
