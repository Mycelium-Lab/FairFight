const express = require('express')
const server = express()
const path = require('path')
const pg = require("pg")
require("dotenv").config()

const pgClient = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
  })

async function getSignature(gameID, address) {
    const res = await pgClient.query(
        'SELECT * FROM signatures WHERE address=$1 AND gameid=$2',
        [address, gameID]
    )
    return {
        player1Amount: res.rows[0].player1amount,
        player2Amount: res.rows[0].player2amount,
        v: res.rows[0].v,
        r: res.rows[0].r,
        s: res.rows[0].s
    }
}

server.use(express.static(path.join(__dirname,'/lib')))
server.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

server.get('/game', (req, res) => {
    res.sendFile(__dirname + '/public/game.html')
})

server.get('/sign', async (req, res) => {
    res.json(await getSignature(req.query.gameID, req.query.address))
})

server.listen(5000, async () => {
    await pgClient.connect()
})

