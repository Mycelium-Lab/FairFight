// Integration test: the developer sparring bot, end to end.
//
// Drives bot/sparring-bot.mjs as a real subprocess and plays the human side of
// the match with a bare socket.io client, then checks the database for the
// settlement the match should have produced.
//
//   docker start ff-pg ff-redis
//   FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8044 node signalling/server.js
//   SIGNALLING_URL=http://127.0.0.1:8044 node test/integration/sparring-bot.test.mjs
//
// It covers the four things the bot has to get right:
//   1. it produces a fight and gets into the room,
//   2. a second player genuinely sees it there,
//   3. its death moves stake and settles the fight,
//   4. it only ever reports its OWN death - the server-side spoofing guard in
//      signalling/server.js is never worked around.

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { io } from 'socket.io-client'
import * as fights from '../../bot/lib/fights.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const URL = process.env.SIGNALLING_URL || 'http://127.0.0.1:8033'
const CHAIN = '999999'
const BOT = 'sparring-bot-test'
const HUMAN = 'devhuman-test'

let failed = 0
const check = (name, ok, detail) => {
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`)
}

// --- helpers ---------------------------------------------------------------

function startBot(args) {
    const child = spawn(process.execPath, ['bot/sparring-bot.mjs', ...args], {
        cwd: REPO,
        env: { ...process.env, NO_COLOR: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
    })
    const state = { output: '', exitCode: null, child }
    const absorb = chunk => { state.output += chunk }
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', absorb)
    child.stderr.on('data', absorb)
    state.exited = new Promise(resolve => child.on('exit', code => { state.exitCode = code; resolve(code) }))

    state.waitFor = (pattern, timeoutMs = 20000) => new Promise((resolve, reject) => {
        const started = Date.now()
        const poll = () => {
            const match = pattern.exec(state.output)
            if (match) return resolve(match)
            if (state.exitCode !== null) return reject(new Error(`bot exited (${state.exitCode}) before matching ${pattern}\n${state.output}`))
            if (Date.now() - started > timeoutMs) return reject(new Error(`timed out waiting for ${pattern}\n${state.output}`))
            setTimeout(poll, 100)
        }
        poll()
    })
    return state
}

function connectSocket() {
    return new Promise((resolve, reject) => {
        const s = io(URL, { forceNew: true, transports: ['websocket', 'polling'] })
        s.on('connect', () => resolve(s))
        s.on('connect_error', reject)
        setTimeout(() => reject(new Error('connect timeout')), 8000)
    })
}

function join(socket, room, wallet) {
    return new Promise(resolve => {
        const done = result => { clearTimeout(timer); resolve(result) }
        socket.once('room', info => done({ ok: true, info }))
        socket.once('not_user_room', () => done({ ok: false, reason: 'not_user_room' }))
        socket.once('error_auth_required', () => done({ ok: false, reason: 'auth_required' }))
        const timer = setTimeout(() => done({ ok: false, reason: 'timeout' }), 8000)
        socket.emit('join', { roomName: room, walletAddress: wallet })
    })
}

const once = (socket, event, timeoutMs) => new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs)
    socket.once(event, data => { clearTimeout(timer); resolve(data === undefined ? {} : data) })
})

const FIGHT_READY = /fight ready {2}gameid=([0-9a-f-]{36}) {2}room=(\S+)/

// --- 1. the CLI contract, no server needed ---------------------------------

async function testCli() {
    const help = startBot(['--help'])
    await help.exited
    check('--help exits 0', help.exitCode === 0, `exit ${help.exitCode}`)
    check('--help admits it is not a gameplay AI', /NOT a gameplay AI/.test(help.output))
    check('--help documents dying on a schedule', /--dies-after/.test(help.output))

    const bad = startBot(['--chain', '42161'])
    await bad.exited
    check('a paid chain is refused', bad.exitCode === 2 && /free-to-play chain/.test(bad.output), `exit ${bad.exitCode}`)

    const same = startBot(['--name', 'solo', '--human', 'solo'])
    await same.exited
    check('the bot refuses to fight itself', same.exitCode === 2 && /cannot fight itself/.test(same.output), `exit ${same.exitCode}`)
}

// --- 2. create mode: a whole match, start to settlement ---------------------

async function testFullMatch(pg) {
    const bot = startBot([
        'create',
        '--name', BOT,
        '--human', HUMAN,
        '--rounds', '1',
        '--dies-after', '1s',
        '--signalling', URL,
        '--no-interactive'
    ])

    const ready = await bot.waitFor(FIGHT_READY)
    const gameid = ready[1]
    const room = ready[2]
    check('bot seeded a fight and printed its room', Boolean(gameid && room), room)

    const seeded = await fights.getFight(pg, gameid, CHAIN)
    check('the fight exists in game_f2p', Boolean(seeded) && seeded.finishtime === null)
    check('both players are in players_f2p', seeded.players_list.sort().join(',') === [BOT, HUMAN].sort().join(','),
        seeded.players_list.join(','))

    await bot.waitFor(/joined room .* as '/)

    // The human turns up. Its 'room' payload is the server telling it who is
    // already there - this is the bot being seen by a second player.
    const human = await connectSocket()
    const joined = await join(human, room, HUMAN)
    check('the human can join the room the bot advertised', joined.ok, joined.reason)
    const seenWallets = ((joined.info && joined.info.users) || []).map(u => u.walletAddress)
    check('the human sees the bot already in the room', seenWallets.includes(BOT), seenWallets.join(','))

    await bot.waitFor(new RegExp(`opponent present: ${HUMAN}`))
    check('the bot noticed the human arrive', true)

    // A real client opens a WebRTC peer connection with everyone in the room.
    // The bot cannot answer one, and the whole point is that it says so loudly
    // rather than leaving the dev wondering where the opponent's body is.
    const botUserId = ((joined.info && joined.info.users) || []).find(u => u.walletAddress === BOT).userId
    human.emit('sdp', { userId: botUserId, sdp: { type: 'offer', sdp: 'v=0 placeholder' } })
    await bot.waitFor(/trying to open a WebRTC peer connection/, 8000)
    check('the bot says out loud that it ignores WebRTC offers', true)

    // The bot dies a second later. The server moves the round's stake to the
    // killer and tells the surviving socket about it.
    const balance = await once(human, 'update_balance', 15000)
    check("the bot's death reached the human as update_balance", balance !== null)
    if (balance) {
        const winner = balance.address2
        const loser = balance.address1
        check('stake moved from the bot to the human', loser === BOT && winner === HUMAN, `${loser} -> ${winner}`)
    }

    // rounds=1, so that death is the last one and the fight settles.
    const finishing = await once(human, 'finishing', 20000)
    check('the human is told the fight is finishing', finishing !== null)

    const exit = await bot.exited
    check('the bot exits cleanly once settled', exit === 0, `exit ${exit}`)
    check('the bot reported settlement itself', /ok {4}settled: game_f2p.finishtime/.test(bot.output))

    const settlement = await fights.waitForSettlement(pg, gameid, { timeoutMs: 10000 })
    check('the fight is settled in the database', settlement.settled)
    check('statistics_f2p holds both players', settlement.stats.length === 2, `${settlement.stats.length} rows`)

    const base = BigInt(seeded.baseamount)
    const botRow = settlement.stats.find(r => r.player === BOT)
    const humanRow = settlement.stats.find(r => r.player === HUMAN)
    check('the bot ended below its stake', Boolean(botRow) && BigInt(botRow.amount) < base,
        botRow && `${botRow.amount} vs ${base}`)
    check('the human ended above its stake', Boolean(humanRow) && BigInt(humanRow.amount) > base,
        humanRow && `${humanRow.amount} vs ${base}`)
    check('the human is credited with the kill', Boolean(humanRow) && humanRow.kills === 1, humanRow && `kills=${humanRow.kills}`)
    check('the bot is charged with the death', Boolean(botRow) && botRow.deaths === 1, botRow && `deaths=${botRow.deaths}`)

    // The security property this bot must never erode: signalling/server.js
    // refuses a socket that reports somebody else's death, and the bot does not
    // try. Every user_dead it sent names itself as the victim.
    const deathFrames = [...bot.output.matchAll(/--> user_dead (\{.*?\})/g)].map(m => JSON.parse(m[1]))
    check('the bot sent at least one death report', deathFrames.length >= 1, `${deathFrames.length} frames`)
    check('every death report names the bot as the victim',
        deathFrames.every(f => f.walletAddress === BOT), JSON.stringify(deathFrames))
    check('no death report ever names the human as the victim',
        deathFrames.every(f => f.walletAddress !== HUMAN))
    check('the bot names the human as the killer', deathFrames.every(f => f.killerAddress === HUMAN))

    human.close()
    return gameid
}

// --- 3. the fight ending before the bot's death quota -----------------------
//
// Rounds are shared, so a human who dies too can exhaust them early. The server
// only announces settlement to sockets OTHER than the one that reported the last
// death, so when the bot's own death ends the fight the bot is told nothing. It
// has to notice by itself, or it sits in a dead room forever.

async function testEarlySettlement(pg) {
    const bot = startBot([
        'create',
        '--name', BOT,
        '--human', HUMAN,
        '--rounds', '2',
        '--deaths', '5',          // far more than the fight can absorb
        '--dies-after', '4s',
        '--death-interval', '4s',
        '--signalling', URL,
        '--no-interactive'
    ])

    const ready = await bot.waitFor(FIGHT_READY)
    const gameid = ready[1]
    const room = ready[2]
    await bot.waitFor(/joined room .* as '/)

    const human = await connectSocket()
    const joined = await join(human, room, HUMAN)
    check('(early settlement) the human joined', joined.ok, joined.reason)

    // The human spends the first round on itself. Reporting its own death is
    // legitimate - it owns that wallet - and it is the only way the bot can win.
    human.emit('user_dead', { walletAddress: HUMAN, killerAddress: BOT })
    await once(human, 'update_balance', 10000)

    // The bot's first scheduled death now takes the last round, and the server
    // tells the bot nothing about it.
    const exit = await bot.exited
    check('the bot notices a fight that ended before its quota', exit === 0, `exit ${exit}`)
    check('the bot only died once, not five times', (bot.output.match(/--> user_dead/g) || []).length === 1,
        `${(bot.output.match(/--> user_dead/g) || []).length} deaths`)
    check('the bot says why it stopped early', /rounds ran out before the bot's quota/.test(bot.output))

    const settlement = await fights.readSettlement(pg, gameid)
    check('(early settlement) the fight is settled', settlement.settled)

    human.close()
}

// --- 4. the bot arriving second --------------------------------------------
//
// In join mode the human is usually in the room first. The bot then learns about
// them from its own 'room' frame rather than from a later 'user_join', so the
// death clock has to start off that instead - otherwise the bot sits there
// politely forever and the match never ends.

async function testBotJoinsSecond(pg) {
    const gameid = await fights.seedFight(pg, {
        owner: HUMAN, opponent: BOT, chainid: CHAIN, rounds: 1
    })
    const room = `${gameid}&network=${CHAIN}`

    const human = await connectSocket()
    const joined = await join(human, room, HUMAN)
    check('(bot second) the human got there first', joined.ok, joined.reason)

    const bot = startBot([
        'join', '--fight', gameid,
        '--name', BOT,
        '--dies-after', '2s',
        '--signalling', URL,
        '--no-interactive'
    ])

    await bot.waitFor(/joined room .* as '/)
    const sawPeer = await bot.waitFor(new RegExp(`opponent present: ${HUMAN}`), 10000).then(() => true, () => false)
    check('the bot notices an opponent who was already in the room', sawPeer)

    const finishing = await once(human, 'finishing', 25000)
    check('(bot second) the match still runs to settlement', finishing !== null)
    check('(bot second) the bot exits cleanly', (await bot.exited) === 0, `exit ${bot.exitCode}`)

    human.close()
}

// --- 5. join mode: taking a free slot in someone else's fight ---------------

async function testJoinMode(pg) {
    // A fight as the lobby would leave it: created by the human, one seat free.
    const { rows } = await pg.query(
        `INSERT INTO game_f2p (owner, map, rounds, baseAmount, amountPerRound, players, createTime, chainid)
         VALUES ($1, 0, 2, $2, $3, 2, $4, $5) RETURNING gameid`,
        [HUMAN, fights.BASE_AMOUNT, fights.amountPerRound(2), Date.now(), parseInt(CHAIN, 10)]
    )
    const gameid = rows[0].gameid
    await fights.addPlayer(pg, gameid, HUMAN)

    const bot = startBot([
        'join',
        '--fight', gameid,
        '--name', BOT,
        '--immortal',
        '--signalling', URL,
        '--no-interactive'
    ])

    const ready = await bot.waitFor(FIGHT_READY)
    check('join mode found the fight', ready[1] === gameid, ready[1])

    const row = await fights.getFight(pg, gameid, CHAIN)
    check('join mode took the free slot in players_f2p', row.players_list.includes(BOT), row.players_list.join(','))

    await bot.waitFor(/joined room .* as '/)

    const human = await connectSocket()
    const joined = await join(human, `${gameid}&network=${CHAIN}`, HUMAN)
    check('the human joins the fight it created', joined.ok, joined.reason)
    check('the human sees the bot holding the other slot',
        ((joined.info && joined.info.users) || []).some(u => u.walletAddress === BOT))

    await bot.waitFor(/immortal: no death timer/)
    check('an immortal bot schedules no death', !/--> user_dead/.test(bot.output))

    // Leaving is part of the lifecycle too: the human's client needs the
    // user_leave to tear its peer down.
    const left = once(human, 'user_leave', 8000)
    bot.child.kill('SIGINT')
    check('the human is told when the bot leaves', (await left) !== null)
    check('the bot exits 0 on SIGINT', (await bot.exited) === 0, `exit ${bot.exitCode}`)

    human.close()
    await pg.query('UPDATE game_f2p SET finishtime = $1 WHERE gameid = $2', [Date.now(), gameid])
}

// --- run -------------------------------------------------------------------

const pg = await fights.connect()
try {
    await testCli()
    console.log('')
    await testFullMatch(pg)
    console.log('')
    await testEarlySettlement(pg)
    console.log('')
    await testBotJoinsSecond(pg)
    console.log('')
    await testJoinMode(pg)
} catch (error) {
    failed++
    console.error('ERROR', error.message)
} finally {
    await pg.end()
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
