#!/usr/bin/env node
//
// sparring-bot - a lifecycle opponent for solo FairFight development.
//
// A match needs two players before anything happens at all: the signalling
// server will not count a death whose killer is absent from the room, and it
// only settles a fight with two players present. Developing the game alone
// therefore means driving a second browser by hand for every single run.
//
// This process is that second player - for the socket.io half of the game.
// It seeds (or joins) a free-to-play fight, sits in the room so your client
// sees a real opponent, and dies on a schedule so you can watch a match run to
// settlement without a second pair of hands.
//
// It is NOT a gameplay AI. See bot/lib/opponent.mjs and docs/DEV_BOT.md for the
// blunt version of what it cannot do; the short form is that gameplay is
// browser-to-browser WebRTC, so the bot is invisible in your game view.
//
//   node bot/sparring-bot.mjs --help

import { parseOptions, formatDuration, HELP } from './lib/options.mjs'
import { createLogger } from './lib/log.mjs'
import { SparringOpponent, BotError } from './lib/opponent.mjs'
import * as fights from './lib/fights.mjs'

// signalling/server.js starts a timer when a room's first player arrives and
// auto-finishes the fight if they are still alone three minutes later. Worth
// saying out loud, because otherwise a dev who wanders off comes back to a
// fight that quietly settled itself.
const LONELY_ROOM_TIMEOUT_MS = 3 * 60 * 1000

let shuttingDown = false

async function main() {
    let opts
    try {
        opts = parseOptions(process.argv.slice(2))
    } catch (error) {
        process.stderr.write(`sparring-bot: ${error.message}\n\nRun with --help for usage.\n`)
        process.exitCode = 2
        return
    }

    if (opts.help) {
        process.stdout.write(HELP)
        return
    }

    const log = createLogger({ verbose: opts.verbose, quiet: opts.quiet })

    log.blank()
    log.step('sparring-bot')
    log.note(`  it plays the match protocol, not the game. Gameplay is browser-to-browser`)
    log.note(`  WebRTC, so this bot is invisible in your game view - that is expected.`)
    log.blank()

    let pg
    try {
        pg = await fights.connect()
    } catch (error) {
        log.error(`cannot reach Postgres: ${error.message}`)
        log.error('start it with: docker start ff-pg ff-redis   (see docs/LOCAL_DEV.md)')
        process.exitCode = 1
        return
    }

    let bot = null
    const shutdown = async code => {
        if (shuttingDown) return
        shuttingDown = true
        if (bot) bot.leave()
        try { await pg.end() } catch { /* closing anyway */ }
        if (code !== undefined) process.exitCode = code
        // Raw-mode stdin keeps the loop alive; let go of it so we actually exit.
        if (process.stdin.isTTY && process.stdin.isRaw) process.stdin.setRawMode(false)
        process.stdin.pause()
    }

    try {
        // Reach the signalling server before touching the database. Getting this
        // wrong (server not started, wrong port) is the common mistake, and it
        // should not leave a half-created fight behind in game_f2p.
        bot = new SparringOpponent({ url: opts.signalling, name: opts.name, log })
        await bot.connect()

        const fight = await prepareFight(pg, opts, log)
        if (!fight) {
            await shutdown(1)
            return
        }

        printJoinInstructions(fight, opts, log)

        const joined = await bot.join(fight.room)
        if (!joined.ok) {
            log.blank()
            log.error(`the server refused the bot's join: ${joined.reason}`)
            explainJoinFailure(joined.reason, opts, log)
            await shutdown(1)
            return
        }
        log.ok(`joined room ${fight.room} as '${opts.name}' (userId ${bot.userId})`)

        await runMatch({ bot, pg, opts, fight, log, shutdown })
    } catch (error) {
        if (error instanceof BotError) {
            log.error(error.message)
            if (error.hint) log.error(`        ${error.hint}`)
        } else {
            log.error(error.stack || error.message)
        }
        await shutdown(1)
    }
}

// ---------------------------------------------------------------------------
// Getting a fight to play

async function prepareFight(pg, opts, log) {
    if (opts.mode === 'create') {
        log.step(`seeding a free-to-play fight: ${opts.name} vs ${opts.human}`)
        const gameid = await fights.seedFight(pg, {
            owner: opts.name,
            opponent: opts.human,
            chainid: opts.chain,
            rounds: opts.rounds,
            map: opts.map
        })
        const row = await fights.getFight(pg, gameid, opts.chain)
        log.ok(`seeded gameid ${gameid}`)
        log.note(`  rounds ${row.rounds}, stake ${row.baseamount} each, ${row.amountperround} per round`)
        log.note('  no chain, no escrow, no wallet: this fight is rows in game_f2p/players_f2p')
        return describe(row, opts)
    }

    // join mode
    let row = null
    if (opts.fight) {
        row = await fights.getFight(pg, opts.fight, opts.chain)
        if (!row) {
            log.error(`no fight ${opts.fight} on chain ${opts.chain}`)
            return null
        }
        if (row.finishtime !== null) {
            log.error(`fight ${opts.fight} already finished at ${new Date(Number(row.finishtime)).toISOString()}`)
            return null
        }
        if (!row.players_list.includes(opts.name)) {
            if (row.players_list.length >= row.players) {
                log.error(`fight ${opts.fight} is full (${row.players_list.join(', ')}) and the bot is not in it`)
                return null
            }
            log.step(`taking the free slot in fight ${opts.fight}`)
            await fights.addPlayer(pg, row.gameid, opts.name)
            row = await fights.getFight(pg, row.gameid, opts.chain)
        }
    } else {
        const open = await findFightToJoin(pg, opts, log)
        if (!open) return null
        log.step(`taking the free slot in ${open.owner}'s fight ${open.gameid}`)
        await fights.addPlayer(pg, open.gameid, opts.name)
        row = await fights.getFight(pg, open.gameid, opts.chain)
    }

    if (await fights.alreadySettledFor(pg, row.gameid, opts.name)) {
        log.error(`'${opts.name}' already has a settled result for this fight; the server would refuse the join`)
        return null
    }

    log.ok(`fight ${row.gameid}: ${row.players_list.join(' vs ')}, ${row.rounds} round(s)`)
    return describe(row, opts)
}

async function findFightToJoin(pg, opts, log) {
    const once = () => fights.findOpenFight(pg, { chainid: opts.chain, botName: opts.name })
    let open = await once()
    if (open || !opts.watch) {
        if (!open) {
            log.error(`no open free-to-play fight with a free slot on chain ${opts.chain}`)
            log.note('  create one in the lobby, pass --watch to wait for one, or run in create mode:')
            log.note('    node bot/sparring-bot.mjs')
        }
        return open
    }

    log.step(`watching for an open fight on chain ${opts.chain}... (create one in the lobby, Ctrl-C to stop)`)
    while (!open && !shuttingDown) {
        await new Promise(r => setTimeout(r, 2000))
        open = await once()
    }
    if (open) log.ok(`found fight ${open.gameid} created by ${open.owner}`)
    return open
}

function describe(row, opts) {
    // Who the bot expects to fight. In join mode the roster can still be short
    // of the seat the human is about to take (the lobby writes players_f2p when
    // they join, not when they create), so fall back to the fight's owner and
    // then to --human rather than printing a blank name at the dev.
    const listed = (row.players_list || []).filter(p => p !== opts.name)
    const opponent = listed[0] || (row.owner !== opts.name ? row.owner : null) || opts.human
    return {
        gameid: row.gameid,
        room: `${row.gameid}&network=${opts.chain}`,
        rounds: Number(row.rounds),
        baseAmount: row.baseamount,
        amountPerRound: row.amountperround,
        players: row.players_list,
        opponent
    }
}

// ---------------------------------------------------------------------------
// Telling the dev what to open

function printJoinInstructions(fight, opts, log) {
    const human = fight.opponent
    log.blank()
    log.raw('  ------------------------------------------------------------------')
    log.raw('  YOUR SIDE OF THE FIGHT')
    log.raw('')
    log.raw(`  1. On ${opts.web}, open the browser console and claim your name:`)
    log.raw('')
    log.raw(`       localStorage.setItem('tonwallet', '${human}')`)
    log.raw('')
    log.raw('     Free-to-play identity is just that string - lib/net/room-connection.js')
    log.raw('     reads it instead of asking a wallet who you are.')
    log.raw('')
    log.raw('  2. Then open:')
    log.raw('')
    log.raw(`       ${opts.web}/game?ID=${fight.gameid}&network=${opts.chain}`)
    log.raw('')
    log.raw('  ------------------------------------------------------------------')
    log.blank()
    // Stable, greppable line: the integration test and any wrapper script keys off this.
    log.info(`fight ready  gameid=${fight.gameid}  room=${fight.room}  chain=${opts.chain}  human=${human}`)
    log.blank()
}

function explainJoinFailure(reason, opts, log) {
    if (reason === 'error_auth_required') {
        log.note('  the room demanded a wallet signature. Start the signalling server with:')
        log.note('    FAIRFIGHT_DEV_NO_WALLET=true node signalling/server.js')
        log.note('  (it refuses to arm when APP_STATE=prod, which is the point of it)')
    } else if (reason === 'not_user_room') {
        log.note(`  the server does not consider '${opts.name}' a player in this fight, or the`)
        log.note('  fight is already finished. players_f2p is matched case-sensitively.')
    } else if (reason === 'timeout') {
        log.note(`  no answer from ${opts.signalling}. Is the signalling server running there?`)
        log.note('  Also check its Postgres/Redis: docker start ff-pg ff-redis')
    }
}

// ---------------------------------------------------------------------------
// Running the match

function runMatch({ bot, pg, opts, fight, log, shutdown }) {
    return new Promise(resolve => {
        const deathsWanted = opts.deaths ?? fight.rounds
        let timer = null
        let settling = false

        const stopTimer = () => {
            if (timer) { clearTimeout(timer); timer = null }
        }

        const scheduleNextDeath = delay => {
            stopTimer()
            if (opts.immortal || bot.finished || settling) return
            if (bot.deaths >= deathsWanted) return
            log.note(`next death in ${formatDuration(delay)} (${bot.deaths}/${deathsWanted} so far)`)
            timer = setTimeout(() => {
                timer = null
                if (!bot.die()) return // opponent vanished; opponent_present will retry
                if (bot.deaths >= deathsWanted) {
                    log.step(`that was death ${bot.deaths} of ${deathsWanted} - the fight should settle now`)
                    settle('death quota reached')
                } else {
                    scheduleNextDeath(opts.deathInterval)
                    // The round counter is shared: if the human has been dying too,
                    // the fight can run out of rounds before the bot's quota. The
                    // server announces that with 'finishing' - but only to sockets
                    // OTHER than the one that reported the last death, so when it is
                    // the bot's own death that ends things the bot hears nothing at
                    // all. Look in the database instead.
                    setTimeout(() => checkSettledQuietly('the rounds ran out before the bot\'s quota'), 2500)
                }
            }, delay)
        }

        const checkSettledQuietly = async why => {
            if (settling) return
            const result = await fights.readSettlement(pg, fight.gameid).catch(() => null)
            if (result && result.settled) settle(why)
        }

        const settle = async why => {
            if (settling) return
            settling = true
            stopTimer()
            log.step(`waiting for settlement (${why})`)
            const result = await fights.waitForSettlement(pg, fight.gameid)
            reportSettlement(result, fight, opts, log, bot.deaths)
            const roster = [...new Set([...fight.players, fight.opponent, opts.name])]
            const board = await fights.readBoard(pg, roster).catch(() => [])
            if (board.length) {
                log.info('board_f2p now:')
                for (const row of board) {
                    log.raw(`    ${row.player.padEnd(16)} games ${row.games}  wins ${row.wins}  tokens ${row.tokens}  k/d ${row.kills}/${row.deaths}`)
                }
            }
            await shutdown(result.timedOut ? 1 : 0)
            resolve()
        }

        const onOpponentPresent = others => {
            log.blank()
            log.ok(`opponent present: ${others.join(', ')}`)
            log.note('  your client now believes it has a real opponent for everything')
            log.note('  that runs over socket.io. It will not draw one - the bot has no')
            log.note('  position and is not in the WebRTC mesh.')
            if (opts.immortal) {
                const keys = opts.interactive && process.stdin.isTTY
                log.step(`immortal: no death timer.${keys ? ' Press d to die on cue.' : ' Nothing will end this match but you.'}`)
            } else {
                scheduleNextDeath(opts.diesAfter)
            }
        }
        bot.on('opponent_present', onOpponentPresent)

        bot.on('opponent_gone', () => {
            log.warn('opponent left the room; pausing the death clock (a death needs its killer present)')
            stopTimer()
            // They may have left because the fight already ended on their screen.
            checkSettledQuietly('the fight settled and the opponent left')
        })

        bot.on('finishing', () => {
            log.step("the server says the fight is finishing - the other side ended it")
            settle('server sent finishing')
        })

        bot.on('disconnect', reason => {
            if (settling || shuttingDown) return
            log.error(`lost the signalling server (${reason})`)
            shutdown(1).then(resolve)
        })

        // In join mode the human is often in the room before the bot is, so the
        // 'opponent_present' event has already fired (during the 'room' frame,
        // before these listeners existed). Pick that case up by hand rather than
        // waiting for an event that has been and gone.
        if (bot.hasOpponent()) {
            onOpponentPresent(bot.opponents())
        } else {
            log.step(`waiting for ${fight.opponent} to open the URL above`)
            log.warn(`the server auto-finishes a fight whose room sits at one player for ${formatDuration(LONELY_ROOM_TIMEOUT_MS)}`)
        }

        setupKeys({ bot, opts, log, settle, shutdown, resolve })

        process.on('SIGINT', () => {
            log.blank()
            log.step('leaving the room')
            stopTimer()
            shutdown(0).then(resolve)
        })
    })
}

function reportSettlement(result, fight, opts, log, botDeaths) {
    log.blank()
    if (!result.settled) {
        log.warn('no settlement showed up in the database')
        log.note('  statistics_f2p is still empty for this fight. Check the signalling')
        log.note('  server log - settlement runs there, a second after the last death.')
        return
    }
    log.ok(`settled: game_f2p.finishtime = ${result.finishtime}`)
    log.info('statistics_f2p:')
    const base = BigInt(fight.baseAmount)
    for (const row of result.stats) {
        const delta = BigInt(row.amount) - base
        const verdict = delta > 0n ? 'won' : delta < 0n ? 'lost' : 'level'
        log.raw(`    ${row.player.padEnd(16)} amount ${String(row.amount).padStart(12)}  (${verdict} ${delta >= 0n ? '+' : ''}${delta})  k/d ${row.kills}/${row.deaths}  roundsLeft ${row.remainingrounds}`)
    }
    log.blank()
    if (botDeaths > 0) {
        // Worth restating next to the numbers: this is a property of the server,
        // not a limitation of the schedule. signalling/server.js takes a death
        // report only from the socket that owns the dying wallet, so the bot can
        // move stake in exactly one direction - away from itself.
        log.note(`the bot lost every round it reported, and that is the only direction it has:`)
        log.note(`signalling/server.js accepts a death report solely from the socket that owns`)
        log.note(`the dying wallet, so '${opts.name}' can only ever report its own death.`)
        log.note(`Making YOU lose is your client's job - it reports your death, not the bot.`)
    } else {
        log.note(`the bot never reported a death here; the rounds were spent by the other side.`)
    }
}

function setupKeys({ bot, opts, log, settle, shutdown, resolve }) {
    if (!opts.interactive || !process.stdin.isTTY) {
        if (opts.interactive) log.note('stdin is not a terminal, so keyboard control is off')
        return
    }
    log.note("keys: d = die now   f = finish the match   s = status   q = quit")
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', key => {
        switch (key) {
            case 'd':
                bot.die()
                break
            case 'f':
                bot.finish()
                settle('finishing sent from the keyboard')
                break
            case 's':
                log.info(`status ${JSON.stringify(bot.status(), null, 2)}`)
                break
            case 'q':
            case '\u0003': // Ctrl-C
                log.blank()
                log.step('leaving the room')
                shutdown(0).then(resolve)
                break
            default:
                break
        }
    })
}

await main()
