import db from "../db/db.js"

const pgClient = db()
await pgClient.connect()

export async function setGamesProperties(req, response) {
    try {
        const gameid = req.body.gameid
        const chainid = req.body.chainid
        const map = req.body.map
        await pgClient.query(
            "INSERT INTO gamesproperties (gameid, chainid, map) VALUES($1, $2, $3)",
            [gameid, chainid, map]
        )
        response.status(200).send()
    } catch (error) {
        response.status(500).send()
    }
}

export async function getGamesProperties(req, response) {
    try {
        const gameid = req.query.gameid
        const chainid = req.query.chainid
        let res
        if (chainid == 999999) {
            res = await pgClient.query('SELECT map FROM game_f2p WHERE gameid=$1', [gameid])
        } else if (chainid == 0) {
            const player = req.query.player
            res = await pgClient.query('SELECT map FROM last_map_ton WHERE player=$1', [player])
        } else {
            res = await pgClient.query('SELECT map FROM gamesproperties WHERE gameid=$1 AND chainid=$2', [gameid, chainid])
        }
        if (res.rows.length === 0) {
            response.status(404).json({map: 0})
        } else {
            response.status(200).json(res.rows[0])
        }
    } catch (error) {
        response.status(500).json({map: 0})
    }
}