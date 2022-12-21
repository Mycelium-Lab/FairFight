const express = require('express')
const ethers = require("ethers")
const server = express()
const path = require('path')
const pg = require("pg")
require("dotenv").config()
const redis = require("redis")

const { airdropAddress, airdropAbi } = require("./contract/airdrop.js")

// const redisClient = redis.createClient({
//   socket: {
//       host: 'localhost',
//       port: 6379
//   }
// })

// const pgClient = new pg.Client({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB
//   })

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_TEST, provider)
const airdropContract = new ethers.Contract(airdropAddress, airdropAbi, signer)

const checkIfAddressIsNotNew = async (address) => {
    let timestamps = []
    let providerEthereum = new ethers.providers.EtherscanProvider("homestead")
    let providerOptimism = new ethers.providers.EtherscanProvider("optimism")
    let historyEthereum = await providerEthereum.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
    let historyOptimism = await providerOptimism.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
    timestamps.push(historyEthereum[0] !== undefined ? historyEthereum[0].timestamp: 0)
    timestamps.push(historyOptimism[0] !== undefined ? historyOptimism[0].timestamp: 0)
    let historyBinance = await fetch(
                `https://api.bscscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
            ).then(res => res.json()).catch(err => {return {result: []}})
    let historyPolygon = await fetch(
                `https://api.polygonscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.POLYGONSCAN_API_KEY}`
            ).then(res => res.json()).catch(err => {return {result: []}})
    timestamps = [
        ...timestamps, 
        ...historyBinance.result.map(v => parseInt(v.timeStamp)), 
        ...historyPolygon.result.map(v => parseInt(v.timeStamp))
    ]
    const timestamp = Math.min.apply(null, timestamps.filter(Boolean))
    if (timestamp !== Infinity) {
        const dateNow = Math.floor(Date.now() / 1000)
        return timestamp < (dateNow - 86400 * 30) //check if older than month
    } else {
        return false
    }
}

async function getAirDropSignature(address,typeOfWithdraw) {
    try {
        const isNotNew = await checkIfAddressIsNotNew(address)
        if (isNotNew) {
            const hashMessage = ethers.utils.solidityKeccak256(["uint160","uint160","string"], [airdropAddress, address, typeOfWithdraw])
            const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
            const r = sign.substr(0, 66)
            const s = '0x' + sign.substr(66, 64);
            const v = parseInt("0x" + sign.substr(130,2));
            return {r, v, s}
        } else {
            return {r:'',v:'',s:''}
        }
    } catch (error) {
        console.error(error)
        return {r:'',v:'',s:''}
    }
}

async function sendTokensFirstTime(req, res) {
    try {
        const alreadyGetFirstTokens = await airdropContract.alreadyGetFirstTokens(req.query.address)
        if (alreadyGetFirstTokens === false) {
            const sign = await getAirDropSignature(req.query.address, 'first')
            await airdropContract.withdrawFirstTime(req.query.address, sign.r, sign.v, sign.s)
                .then((tx) => tx.wait())
                .then(() => {res.status(200).send('Success')})
                .catch((err) => {
                    console.log(err)
                    res.status(500).send('Not success')
                })
        } else {
            res.status(500).send('Not success')
        }
    } catch (error) {
        console.log(error)
    }
}

async function sendTokensSecondTime(req, res) {
    try {
        const alreadyGetPrizeTokens = await airdropContract.alreadyGetTokens(req.query.address)
        if (alreadyGetPrizeTokens === false) {
            const sign = await getAirDropSignature(req.query.address, 'second')
            await airdropContract.withdraw(req.query.address, sign.r, sign.v, sign.s)
                .then((tx) => tx.wait())
                .then(() => {res.status(200).send('Success')})
                .catch((err) => {
                    console.log(err)
                    res.status(500).send('Not success')
                })
        } else {
            res.status(500).send('Not success')
        }
    } catch (error) {
        console.log(error)
    }
}

async function getSignature(gameID, address) {
    // try {
    //     const res = await pgClient.query(
    //         'SELECT * FROM signatures WHERE address1=$1 AND gameid=$2',
    //         [address, gameID]
    //     )
    //     if (res.rows.length === 0) {
    //         return {
    //             player1Amount: '',
    //             player2Amount: '',
    //             v: '',
    //             r: '',
    //             s: '' 
    //         }
    //     }
    //     return {
    //         player1Amount: res.rows[0].player1amount,
    //         player2Amount: res.rows[0].player2amount,
    //         v: res.rows[0].v,
    //         r: res.rows[0].r,
    //         s: res.rows[0].s
    //     }
    // } catch (error) {
    //     console.error(error)
    // }
}

async function getCurrentInGameStatistics(gameID, address) {
    // try {
    //     const remainingRounds = await redisClient.get(gameID)
    //     const kills = await redisClient.get(`${address}_kills`)
    //     const deaths = await redisClient.get(`${address}_deaths`)
    //     const balance = await redisClient.get(address)
    //     if (
    //         remainingRounds == null 
    //         || 
    //         kills == null 
    //         || 
    //         deaths == null 
    //     ) {
    //         const stats = await getStatistics(gameID, address)
    //         return {
    //             gameid: stats.gameid,
    //             address: stats.address,
    //             kills: stats.kills,
    //             deaths: stats.deaths,
    //             remainingRounds: remainingRounds == null ? stats.remainingrounds : remainingRounds,
    //             balance
    //         }
    //     } else {
    //         return {
    //             gameid: gameID,
    //             address,
    //             kills,
    //             deaths,
    //             remainingRounds,
    //             balance
    //         }
    //     }
    // } catch (error) {
        
    // }
}

async function getStatistics(gameID, address) {
    // try {
    //     const res = await pgClient.query(
    //         "SELECT * FROM statistics WHERE address=$1 AND gameid=$2",
    //         [address, gameID]
    //     )
    //     if (res.rows.length !== 1) {
    //         return {
    //             gameid: '',
    //             address: '',
    //             kills: '',
    //             deaths: '',
    //             remainingRounds: ''
    //         }
    //     }
    //     return {
    //         gameid: res.rows[0].gameid,
    //         address: res.rows[0].address,
    //         kills: res.rows[0].kills,
    //         deaths: res.rows[0].deaths,
    //         remainingRounds: res.rows[0].remainingrounds
    //     }
    // } catch (error) {
    //     console.error(error)
    // }
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

server.post('/airdrop_first_sign', async (req, res) => {
    await sendTokensFirstTime(req, res)
})

server.post('/airdrop_second_sign', async (req, res) => {
    await sendTokensSecondTime(req, res)
})

server.listen(5000, async () => {
    // await pgClient.connect()
    // await redisClient.connect()
    console.log(`Server started on port 5000`)
})

