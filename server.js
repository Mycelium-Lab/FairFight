const express = require('express')
const server = express()
const path = require('path')
const pg = require("pg")
require("dotenv").config()
const redis = require("redis")

const redisClient = redis.createClient({
  socket: {
      host: 'localhost',
      port: 6379
  }
})

const pgClient = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
  })

async function getSignature(gameID, address) {
    try {
        const res = await pgClient.query(
            'SELECT * FROM signatures WHERE address1=$1 AND gameid=$2',
            [address, gameID]
        )
        if (res.rows.length !== 1) {
            return {
                player1Amount: '',
                player2Amount: '',
                v: '',
                r: '',
                s: '' 
            }
        }
        return {
            player1Amount: res.rows[0].player1amount,
            player2Amount: res.rows[0].player2amount,
            v: res.rows[0].v,
            r: res.rows[0].r,
            s: res.rows[0].s
        }
    } catch (error) {
        console.error(error)
    }
}

async function getCurrentInGameStatistics(gameID, address) {
    try {
        const remainingRounds = await redisClient.get(gameID)
        const kills = await redisClient.get(`${address}_kills`)
        const deaths = await redisClient.get(`${address}_deaths`)
        const balance = await redisClient.get(address)
        if (
            remainingRounds == null 
            || 
            kills == null 
            || 
            deaths == null 
        ) {
            const stats = await getStatistics(gameID, address)
            return {
                gameid: stats.gameid,
                address: stats.address,
                kills: stats.kills,
                deaths: stats.deaths,
                remainingRounds: remainingRounds == null ? stats.remainingrounds : remainingRounds,
                balance
            }
        } else {
            return {
                gameid: gameID,
                address,
                kills,
                deaths,
                remainingRounds,
                balance
            }
        }
    } catch (error) {
        
    }
}

async function getStatistics(gameID, address) {
    try {
        const res = await pgClient.query(
            "SELECT * FROM statistics WHERE address=$1 AND gameid=$2",
            [address, gameID]
        )
        if (res.rows.length !== 1) {
            return {
                gameid: '',
                address: '',
                kills: '',
                deaths: '',
                remainingRounds: ''
            }
        }
        return {
            gameid: res.rows[0].gameid,
            address: res.rows[0].address,
            kills: res.rows[0].kills,
            deaths: res.rows[0].deaths,
            remainingRounds: res.rows[0].remainingrounds
        }
    } catch (error) {
        console.error(error)
    }
}

server.use(express.static(path.join(__dirname,'/lib')))
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/lib') + '/public/index.html')
})

server.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname,'/lib') + '/public/game.html')
})

server.get('/sign', async (req, res) => {
    res.json(await getSignature(req.query.gameID, req.query.address))
})

server.get('/statistics', async (req, res) => {
    res.json(await getStatistics(req.query.gameID, req.query.address))
})

server.get('/balance', async (req, res) => {
    res.json(await getCurrentInGameStatistics(req.query.gameID, req.query.address))
})

server.listen(5000, async () => {
    await pgClient.connect()
    await redisClient.connect()
    console.log(`Server started on port 5000`)
})

