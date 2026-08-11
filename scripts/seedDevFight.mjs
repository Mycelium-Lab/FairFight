// Seeds a free-to-play fight so the game loop can be exercised with no wallet,
// no chain and no transactions.
//
//   node scripts/seedDevFight.mjs [player1] [player2]
//
// F2P fights carry no on-chain escrow: they live in game_f2p/players_f2p and settle
// into statistics_f2p instead of producing a payout signature. Player identity is
// just a string, so any handle works.
//
// Run the signalling server with FAIRFIGHT_DEV_NO_WALLET=true so joining the room
// does not demand a wallet signature.

import db from '../server/db/db.js'

const F2P_CHAIN_ID = 999999      // the non-EVM free-to-play pseudo-chain
const MAP = 0
const ROUNDS = 3
const BASE_AMOUNT = '1000000000' // 1 unit at 9 decimals, mirrors the TON-flavoured F2P values
const AMOUNT_PER_ROUND = '333333333'

const player1 = process.argv[2] || 'devplayer1'
const player2 = process.argv[3] || 'devplayer2'

const pg = db()
await pg.connect()

try {
    const { rows } = await pg.query(
        `INSERT INTO game_f2p (owner, map, rounds, baseAmount, amountPerRound, players, createTime, chainid)
         VALUES ($1, $2, $3, $4, $5, 2, $6, $7)
         RETURNING gameid`,
        [player1, MAP, ROUNDS, BASE_AMOUNT, AMOUNT_PER_ROUND, Date.now(), F2P_CHAIN_ID]
    )
    const gameid = rows[0].gameid

    for (const player of [player1, player2]) {
        await pg.query('INSERT INTO players_f2p (gameid, player) VALUES ($1, $2)', [gameid, player])
    }

    console.log('seeded free-to-play fight')
    console.log('  gameid  ', gameid)
    console.log('  chainid ', F2P_CHAIN_ID)
    console.log('  players ', player1, '/', player2)
    console.log('  rounds  ', ROUNDS)
    console.log()
    console.log('room name:', `${gameid}&network=${F2P_CHAIN_ID}`)
    console.log('play at  :', `http://127.0.0.1:5050/game?ID=${gameid}&network=${F2P_CHAIN_ID}`)
} finally {
    await pg.end()
}
