import db from "../../db/db.js"
import { amountOfKillsForPrize, amountOfWinsInARowForPrize } from "../constants/constants.js"

const pgClient = db()
await pgClient.connect()

export async function getAmountOfGames(chainid, address) {
    try {
        const res = await pgClient.query("SELECT COUNT(*) FROM statistics WHERE player=$1 AND chainid=$2", [address.toLowerCase(), chainid])
        const count = parseInt(res.rows[0].count)
        return { err: null, count }
    } catch (error) {
        console.log(error)
        return { err: error, count: 0 }
    }
}

export async function getAmountOfKills(chainid, address) {
    try {
        const res = await pgClient.query("SELECT SUM(kills) as count FROM statistics WHERE player=$1 AND chainid=$2", [address.toLowerCase(), chainid])
        const count = parseInt(res.rows[0].count)
        return { err: null, count }
    } catch (error) {
        console.log(error)
        return { err: error, count: 0 }
    }
}

export async function getAmountOfWinsInARow(chainid, address) {
    try {
        const res = await pgClient.query(`
            SELECT s1.gameid,
                s1.player AS player1,
                s1.kills AS kills_player1,
                s1.deaths AS deaths_player1,
                s1.amount AS amount_player1,
                s1.remainingRounds AS remainingRounds_player1,
                s2.player AS player2,
                s2.kills AS kills_player2,
                s2.deaths AS deaths_player2,
                s2.amount AS amount_player2,
                s2.remainingRounds AS remainingRounds_player2
            FROM statistics s1
            JOIN statistics s2 ON s1.gameid = s2.gameid
            WHERE s1.player = $1 AND s2.player != $1 AND s1.chainid=$2 AND s2.chainid=$2
            ORDER BY s1.gameid DESC
            LIMIT ${amountOfKillsForPrize};
        `, [address.toLowerCase(), chainid])
        let allWins = true
        if (res.rows.length >= amountOfWinsInARowForPrize) {
            res.rows.forEach(v => {
                if (BigInt(v.amount_player1) <= BigInt(v.amount_player2)) {
                    allWins = false
                }
            })
        } else {
            allWins = false
        }
        return { err: null, allWins }
    } catch (error) {
        console.log(error)
        return { err: err.message, allWins: null }
    }
}