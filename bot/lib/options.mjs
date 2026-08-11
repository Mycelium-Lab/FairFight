// CLI surface for the sparring bot.

import { parseArgs } from 'node:util'

export const F2P_CHAIN_IDS = new Set(['999998', '999999'])
export const DEFAULT_SIGNALLING = 'http://127.0.0.1:8033'
export const DEFAULT_WEB = 'http://127.0.0.1:5050'

export const HELP = `
sparring-bot - a lifecycle opponent for solo FairFight development

  A FairFight match needs two players before anything happens: nobody can join a
  room alone, a death is only counted when the killer is also in the room, and
  settlement only fires with two players present. Working on the game by yourself
  therefore means opening a second browser, or having nothing happen at all.

  This bot is that second player, for everything that travels over socket.io:
  it seeds a free-to-play fight, joins the room, sits there so your client sees a
  real opponent, and dies on a schedule so you can watch a match settle.

  It is NOT a gameplay AI. Gameplay is peer-to-peer WebRTC between two browsers
  and this is a Node process, so the bot has no position, cannot be shot at and
  will not appear as a moving character on your screen. See docs/DEV_BOT.md.

USAGE
  node bot/sparring-bot.mjs [create|join] [options]

MODES
  create            Seed a fresh free-to-play fight with the bot and a named
                    human as the two players, print the URL to open, then wait
                    in the room.  (default)
  join              Find an open free-to-play fight that still has a free slot,
                    add the bot to it, then join the room. Use this when you
                    created the fight yourself from the lobby.

OPTIONS
  --name <player>          Name the bot plays under.        (default: sparring-bot)
  --human <player>         Name you will play under; create mode seeds this as
                           the second player.               (default: devplayer1)
  --chain <id>             Free-to-play chain, 999999 or 999998. (default: 999999)
  --rounds <n>             Rounds to seed. The match settles after this many
                           deaths.                          (default: 3)
  --map <n>                Map id to seed.                  (default: 0)

  --dies-after <duration>  Wait this long after the opponent shows up before the
                           bot's first death.               (default: 30s)
  --death-interval <dur>   Gap between deaths.       (default: same as --dies-after)
  --deaths <n>             How many times to die before stopping.
                           (default: enough to settle the fight - one per round)
  --immortal               Never die on a timer. Interactive 'd' still works.

  --fight <gameid>         Join this exact fight (implies join mode).
  --watch                  join mode: keep polling until an open fight appears.

  --signalling <url>       Signalling server.  (default: $SIGNALLING_URL or ${DEFAULT_SIGNALLING})
  --web <url>              Web server, used only to print the URL you open.
                           (default: $WEB_URL or ${DEFAULT_WEB})

  --no-interactive         Do not read keypresses, even on a terminal.
  --verbose                Print socket payloads in full instead of clipped.
  --quiet                  Only errors.
  --help, -h               This text.

DURATIONS
  '500ms', '30s', '2m', or a bare number meaning seconds.

INTERACTIVE KEYS (on a terminal, unless --no-interactive)
  d    die now, naming the opponent as the killer
  f    emit 'finishing' - end the match immediately and settle
  s    print what the bot currently believes about the room
  q    leave the room and quit

EXAMPLES
  node bot/sparring-bot.mjs
      Seed a 3-round fight between 'sparring-bot' and 'devplayer1', print the
      URL, wait for you, then die every 30s until the fight settles.

  node bot/sparring-bot.mjs --human alice --dies-after 10s
      Same, but you play as 'alice' and the match runs fast.

  node bot/sparring-bot.mjs --immortal
      A warm body in the room that never dies. Use 'd' to kill it on cue.

  node bot/sparring-bot.mjs join --watch
      Sit idle until you create a fight in the lobby, then take the free slot.

BEFORE YOU RUN IT
  docker start ff-pg ff-redis
  PORT=5050 node server.js
  FAIRFIGHT_DEV_NO_WALLET=true node signalling/server.js

  FAIRFIGHT_DEV_NO_WALLET is what lets a free-to-play room be entered without a
  wallet signature. It refuses to arm when APP_STATE=prod. Do not reach for
  REQUIRE_SOCKET_AUTH=false instead - that disables the wallet check for every
  room on the server, including ones holding real stake.
`.trimStart()

// '30s' -> 30000. A bare number is seconds, because that is what a dev typing
// `--dies-after 5` means every single time.
export function parseDuration(text, label) {
    const match = /^(\d+(?:\.\d+)?)(ms|s|m)?$/.exec(`${text}`.trim())
    if (!match) throw new Error(`${label}: cannot read '${text}' as a duration (try 30s, 2m, 500ms)`)
    const value = parseFloat(match[1])
    const unit = match[2] || 's'
    const scale = { ms: 1, s: 1000, m: 60000 }[unit]
    return Math.round(value * scale)
}

export function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`
    if (ms % 60000 === 0) return `${ms / 60000}m`
    return `${Math.round(ms / 100) / 10}s`
}

function positiveInt(text, label) {
    const n = Number(text)
    if (!Number.isInteger(n) || n < 1) throw new Error(`${label}: expected a whole number >= 1, got '${text}'`)
    return n
}

export function parseOptions(argv) {
    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        strict: true,
        options: {
            name: { type: 'string' },
            human: { type: 'string' },
            chain: { type: 'string' },
            rounds: { type: 'string' },
            map: { type: 'string' },
            'dies-after': { type: 'string' },
            'death-interval': { type: 'string' },
            deaths: { type: 'string' },
            immortal: { type: 'boolean' },
            fight: { type: 'string' },
            watch: { type: 'boolean' },
            signalling: { type: 'string' },
            web: { type: 'string' },
            'no-interactive': { type: 'boolean' },
            verbose: { type: 'boolean' },
            quiet: { type: 'boolean' },
            help: { type: 'boolean', short: 'h' }
        }
    })

    if (values.help) return { help: true }

    if (positionals.length > 1) throw new Error(`unexpected arguments: ${positionals.slice(1).join(' ')}`)
    let mode = positionals[0] || (values.fight ? 'join' : 'create')
    if (values.fight) mode = 'join'
    if (mode !== 'create' && mode !== 'join') throw new Error(`unknown mode '${mode}' (expected create or join)`)

    const chain = `${values.chain ?? '999999'}`
    if (!F2P_CHAIN_IDS.has(chain)) {
        throw new Error(`--chain must be a free-to-play chain (${[...F2P_CHAIN_IDS].join(' or ')}), got '${chain}'. `
            + 'Paid chains hold on-chain stake and need a real wallet, which this bot deliberately does not have.')
    }

    // The join check in signalling/server.js is a case-sensitive `players.includes()`,
    // while settlement writes statistics_f2p/board_f2p lowercased. Normalising here is
    // the only way both halves agree about who the bot is.
    const name = `${values.name ?? 'sparring-bot'}`.trim().toLowerCase()
    const human = `${values.human ?? 'devplayer1'}`.trim().toLowerCase()
    if (!name) throw new Error('--name cannot be empty')
    if (!human) throw new Error('--human cannot be empty')
    if (name === human) throw new Error(`--name and --human are both '${name}'; the bot cannot fight itself`)

    const rounds = positiveInt(values.rounds ?? '3', '--rounds')
    const diesAfter = parseDuration(values['dies-after'] ?? '30s', '--dies-after')
    const deathInterval = values['death-interval']
        ? parseDuration(values['death-interval'], '--death-interval')
        : diesAfter
    const deaths = values.deaths === undefined ? null : positiveInt(values.deaths, '--deaths')

    const map = Number(values.map ?? '0')
    if (!Number.isInteger(map) || map < 0) throw new Error(`--map: expected a whole number >= 0, got '${values.map}'`)

    return {
        help: false,
        mode,
        name,
        human,
        chain,
        rounds,
        map,
        diesAfter,
        deathInterval,
        deaths,
        immortal: Boolean(values.immortal),
        fight: values.fight ? `${values.fight}`.trim() : null,
        watch: Boolean(values.watch),
        signalling: (values.signalling || process.env.SIGNALLING_URL || DEFAULT_SIGNALLING).replace(/\/+$/, ''),
        web: (values.web || process.env.WEB_URL || DEFAULT_WEB).replace(/\/+$/, ''),
        interactive: !values['no-interactive'],
        verbose: Boolean(values.verbose),
        quiet: Boolean(values.quiet)
    }
}
