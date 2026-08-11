// Postgres side of the sparring bot.
//
// Free-to-play fights are pure database rows: game_f2p holds the fight,
// players_f2p the roster, statistics_f2p the settled result and board_f2p the
// leaderboard. There is no escrow, no chain and no signature anywhere in this
// file - that is exactly why the bot can be a participant at all.
//
// The insert below is the same one scripts/seedDevFight.mjs performs; this
// module adds reading the fight back, taking a free slot in someone else's
// fight, and watching for settlement.

import db from '../../server/db/db.js'

// 1 unit at 9 decimals, mirroring the TON-flavoured free-to-play values that
// scripts/seedDevFight.mjs uses.
export const BASE_AMOUNT = '1000000000'

export function connect() {
    const pg = db()
    return pg.connect().then(() => pg)
}

// signalling/server.js takes a round off the counter on every death and settles
// when it hits zero, so amountPerRound has to divide the stake into `rounds`
// slices or the balances make no sense next to the round count.
export function amountPerRound(rounds, baseAmount = BASE_AMOUNT) {
    return (BigInt(baseAmount) / BigInt(rounds)).toString()
}

export async function seedFight(pg, { owner, opponent, chainid, rounds, map = 0, baseAmount = BASE_AMOUNT }) {
    const { rows } = await pg.query(
        `INSERT INTO game_f2p (owner, map, rounds, baseAmount, amountPerRound, players, createTime, chainid)
         VALUES ($1, $2, $3, $4, $5, 2, $6, $7)
         RETURNING gameid`,
        [owner, map, rounds, baseAmount, amountPerRound(rounds, baseAmount), Date.now(), parseInt(chainid, 10)]
    )
    const gameid = rows[0].gameid
    for (const player of [owner, opponent]) {
        await pg.query('INSERT INTO players_f2p (gameid, player) VALUES ($1, $2)', [gameid, player])
    }
    return gameid
}

// Mirrors the SELECT that signalling/server.js runs on join, so if this returns
// nothing the bot would have been bounced with not_user_room anyway.
export async function getFight(pg, gameid, chainid) {
    const { rows } = await pg.query(
        `SELECT g.gameid, g.owner, g.map, g.rounds, g.baseamount, g.amountperround,
                g.players, g.createtime, g.finishtime, g.chainid,
                array_remove(array_agg(p.player), NULL) AS players_list
           FROM game_f2p g
           LEFT JOIN players_f2p p ON g.gameid = p.gameid
          WHERE g.gameid = $1 AND g.chainid = $2
          GROUP BY g.gameid`,
        [gameid, parseInt(chainid, 10)]
    )
    return rows[0] || null
}

// An open fight is one nobody has settled that still has a seat free and does
// not already list the bot. Newest first: a dev almost always means the fight
// they just created in the lobby.
export async function findOpenFight(pg, { chainid, botName }) {
    const { rows } = await pg.query(
        `SELECT g.gameid, g.owner, g.rounds, g.players, g.createtime,
                array_remove(array_agg(p.player), NULL) AS players_list
           FROM game_f2p g
           LEFT JOIN players_f2p p ON g.gameid = p.gameid
          WHERE g.finishtime IS NULL AND g.chainid = $1
          GROUP BY g.gameid
         HAVING count(p.player) < g.players
            AND NOT ($2 = ANY(array_remove(array_agg(p.player), NULL)))
          ORDER BY g.createtime DESC
          LIMIT 1`,
        [parseInt(chainid, 10), botName]
    )
    return rows[0] || null
}

export async function addPlayer(pg, gameid, player) {
    await pg.query('INSERT INTO players_f2p (gameid, player) VALUES ($1, $2)', [gameid, player])
}

// signalling/server.js refuses a join when statistics_f2p already has a row for
// this player and fight ("Fight ended"), so a settled fight can never be
// re-entered. Checking up front turns a silent server-side throw into a clear
// message on the bot's terminal.
export async function alreadySettledFor(pg, gameid, player) {
    const { rows } = await pg.query(
        'SELECT 1 FROM statistics_f2p WHERE player = $1 AND gameid = $2',
        [player.toLowerCase(), gameid]
    )
    return rows.length > 0
}

// What settlement looks like from the outside: statistics_f2p rows for both
// players, and game_f2p.finishtime stamped.
export async function readSettlement(pg, gameid) {
    const stats = await pg.query(
        'SELECT player, amount, kills, deaths, remainingrounds FROM statistics_f2p WHERE gameid = $1 ORDER BY player',
        [gameid]
    )
    const game = await pg.query('SELECT finishtime FROM game_f2p WHERE gameid = $1', [gameid])
    return {
        settled: stats.rows.length > 0 && game.rows[0] && game.rows[0].finishtime !== null,
        finishtime: game.rows[0] ? game.rows[0].finishtime : null,
        stats: stats.rows
    }
}

export async function waitForSettlement(pg, gameid, { timeoutMs = 15000, intervalMs = 250 } = {}) {
    const deadline = Date.now() + timeoutMs
    for (;;) {
        const result = await readSettlement(pg, gameid)
        if (result.settled) return result
        if (Date.now() >= deadline) return { ...result, timedOut: true }
        await new Promise(r => setTimeout(r, intervalMs))
    }
}

export async function readBoard(pg, players) {
    const { rows } = await pg.query(
        'SELECT player, games, wins, amountwon, tokens, kills, deaths FROM board_f2p WHERE player = ANY($1) ORDER BY player',
        [players.map(p => p.toLowerCase())]
    )
    return rows
}
