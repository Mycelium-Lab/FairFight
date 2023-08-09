import db from "../db/db.js"
import { networks, lootboxAbi } from "../../contract/contract.js"

const pgClient = db()
await pgClient.connect()

const amountOfGamesForPrize = 10

async function getAmountOfGames(chainid, address) {
    try {
        const res = await pgClient.query("SELECT COUNT(*) FROM statistics WHERE player=$1 AND chainid=$2", [address, chainid])
        const count = parseInt(res.rows[0].count)
        return { err: null, count }
    } catch (error) {
        console.log(error)
        return { err: error, count: 0 }
    }
}

export async function createSignatureForAmountOfGames(req, res) {
    try {
        const isOk = await getAmountOfGames(req.body.chainid, req.body.address)
        res.status(isOk ? 200 : 401).json({isOk})
    } catch (error) {
        console.log(error)
        res.status(500).json({})
    }
}