const express = require('express')
const server = express()
const path = require('path')
const pg = require("pg")
require("dotenv").config()
const redis = require("redis")
const ethers = require("ethers")
const cron = require("node-cron")
const { contractAbi, contractAddress } = require("./contract/contract.js")

const provider = new ethers.providers.JsonRpcProvider("https://emerald.oasis.dev")
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_EMERALD, provider)
const contract = new ethers.Contract(contractAddress, contractAbi, signer)
const secondsInADay = 86400

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

cron.schedule("6 6 6 * * *", async () => {
    await createLeaderboard()
}, {
    timezone: 'Europe/Moscow'
})

async function createLeaderboard() {
    try {
        await pgClient.query('DELETE FROM leaderboard')
        let lastID = 0
        const resID = await pgClient.query(
            'SELECT MAX(gameid) FROM statistics'
        )
        if (resID.rows.length === 0) {
            return;
        } else {
            lastID = resID.rows[0].max
        }
        const chunkSize = 10
        let allBattlesWeek = []
        let allBattlesMonth = []
        const unixDateNow = Math.floor(Date.now() / 1000)
        const unixDateLastWeek = unixDateNow - 7*secondsInADay
        const unixDateLastMonth = unixDateNow - 30*secondsInADay
        const lastBattle = await contract.battles(lastID)
        const lastBattleFinishTimestamp = parseInt(lastBattle.battleFinishedTimestamp)
        const res = await pgClient.query("UPDATE utils SET currentleaderboardupdate=currentleaderboardupdate+1 WHERE id=0 RETURNING currentleaderboardupdate")
        const currentleaderboardupdate = res.rows[0].currentleaderboardupdate
        for (let i = 0; i < (lastID / chunkSize); i++) {
            try {
                const chunk = await contract.getChunkFinishedBattles(i, chunkSize)
                allBattlesWeek = [...allBattlesWeek, ...(chunk.filter(v => parseInt(v.battleFinishedTimestamp) !== 0 && parseInt(v.battleFinishedTimestamp) > unixDateLastWeek))]
                allBattlesMonth = [...allBattlesMonth, ...(chunk.filter(v => parseInt(v.battleFinishedTimestamp) !== 0 && parseInt(v.battleFinishedTimestamp) > unixDateLastMonth))]
            } catch (error) {
                console.log(error)
            }
        }
        for (let i = 0; i < allBattlesWeek.length; i++) {
            const battle = allBattlesWeek[i]
            try {
                const resStats = await pgClient.query("SELECT * FROM statistics WHERE gameid=$1 AND address=$2", [battle.ID.toString(), battle.player1]);
                let winAmount = 0
                let isWin = 0;
                if (BigInt(battle.player1Amount) > BigInt(battle.player2Amount)) {
                    winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player1Amount) - BigInt(battle.player2Amount)).toString()))
                    isWin = 1;
                }
                await pgClient.query(
                    "UPDATE leaderboard SET games=games+1, wins=wins+$1, kills=kills+$2, amountwon=amountwon+$3 WHERE address=$4 AND perion=$5",
                    [isWin, resStats.rows[0].kills, winAmount, battle.player1, 0]
                )
                await pgClient.query(
                    "INSERT INTO leaderboard (address, games, wins, kills, amountwon, perion) SELECT $1,$2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1)",
                    [battle.player1, 1, isWin, resStats.rows[0].kills, winAmount, 0]
                )
            } catch (error) {
                console.log(error)
            }
            try {
                const resStats = await pgClient.query("SELECT * FROM statistics WHERE gameid=$1 AND address=$2", [battle.ID.toString(), battle.player2]);
                let winAmount = 0
                let isWin = 0;
                if (BigInt(battle.player2Amount) > BigInt(battle.player1Amount)) {
                    winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player2Amount) - BigInt(battle.player2Amount)).toString()))
                    isWin = 1;
                }
                await pgClient.query(
                    "UPDATE leaderboard SET games=games+1, wins=wins+$1, kills=kills+$2, amountwon=amountwon+$3 WHERE address=$4 AND perion=$5",
                    [isWin, resStats.rows[0].kills, winAmount, battle.player2, 0]
                )
                await pgClient.query(
                    "INSERT INTO leaderboard (address, games, wins, kills, amountwon, perion) SELECT $1,$2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1)",
                    [battle.player2, 1, isWin, resStats.rows[0].kills, winAmount, 0]
                )
            } catch (error) {
                console.log(error)
            }
        }
        for (let i = 0; i < allBattlesMonth.length; i++) {
            const battle = allBattlesMonth[i]
            try {
                const resStats = await pgClient.query("SELECT * FROM statistics WHERE gameid=$1 AND address=$2", [battle.ID.toString(), battle.player1]);
                let winAmount = 0
                let isWin = 0;
                if (BigInt(battle.player1Amount) > BigInt(battle.player2Amount)) {
                    winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player1Amount) - BigInt(battle.player2Amount)).toString()))
                    isWin = 1;
                }
                await pgClient.query(
                    "UPDATE leaderboard SET games=games+1, wins=wins+$1, kills=kills+$2, amountwon=amountwon+$3 WHERE address=$4 AND perion=$5",
                    [isWin, resStats.rows[0].kills, winAmount, battle.player1, 1]
                )
                await pgClient.query(
                    "INSERT INTO leaderboard (address, games, wins, kills, amountwon, perion) SELECT $1,$2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1)",
                    [battle.player1, 1, isWin, resStats.rows[0].kills, winAmount, 1]
                )
            } catch (error) {
                console.log(error)
            }
            try {
                const resStats = await pgClient.query("SELECT * FROM statistics WHERE gameid=$1 AND address=$2", [battle.ID.toString(), battle.player2]);
                let winAmount = 0
                let isWin = 0;
                if (BigInt(battle.player2Amount) > BigInt(battle.player1Amount)) {
                    winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player2Amount) - BigInt(battle.player2Amount)).toString()))
                    isWin = 1;
                }
                await pgClient.query(
                    "UPDATE leaderboard SET games=games+1, wins=wins+$1, kills=kills+$2, amountwon=amountwon+$3 WHERE address=$4 AND perion=$5",
                    [isWin, resStats.rows[0].kills, winAmount, battle.player2, 1]
                )
                await pgClient.query(
                    "INSERT INTO leaderboard (address, games, wins, kills, amountwon, perion) SELECT $1,$2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1)",
                    [battle.player2, 1, isWin, resStats.rows[0].kills, winAmount, 1]
                )
            } catch (error) {
                console.log(error)
            }
        }
        console.log(`LeaderBoard updated`)
    } catch (error) {
        console.error(error)
    } 
}

async function getLeaderboard(res) {
    try {
        const leaderboard = await pgClient.query("SELECT * FROM leaderboard")
        res.status(200).json({leaderboard: leaderboard.rows})
    } catch (error) {
        res.status(500).send('Something wen wrong')
    }
}

async function getSignature(gameID, address) {
    try {
        const res = await pgClient.query(
            'SELECT * FROM signatures WHERE address1=$1 AND gameid=$2',
            [address, gameID]
        )
        if (res.rows.length === 0) {
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

server.get('/leaderboard', async (req, res) => {
    await getLeaderboard(res)
})

server.listen(5000, async () => {
    await pgClient.connect()
    await redisClient.connect()
    // await createLeaderboard()
    console.log(`Server started on port 5000`)
})

