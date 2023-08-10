import db from "../../db/db.js"

const pgClient = db()
await pgClient.connect()

export async function getAmountOfGames(chainid, address) {
    try {
        const res = await pgClient.query("SELECT COUNT(*) FROM statistics WHERE player=$1 AND chainid=$2", [address, chainid])
        const count = parseInt(res.rows[0].count)
        return { err: null, count }
    } catch (error) {
        console.log(error)
        return { err: error, count: 0 }
    }
}

export async function getAmountOfKills(chainid, address) {
    try {
        const res = await pgClient.query("SELECT SUM(kills) as count FROM statistics WHERE player=$1 AND chainid=$2", [address, chainid])
        const count = parseInt(res.rows[0].count)
        return { err: null, count }
    } catch (error) {
        console.log(error)
        return { err: error, count: 0 }
    }
}

