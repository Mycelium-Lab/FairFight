import { ethers } from "ethers"
import db from "../db/db.js"
import blockchainConfig from "../utils/blockchainConfig.js"
import { erc20Abi } from "../../contract/erc20.js"
import { calcAmountWithDecimals } from "../utils/utils.js"
import { networks } from "../../contract/contract.js"

const pgClient = db()
await pgClient.connect()

// cron.schedule("6 6 6 * * *", async () => {
//     await createLeaderboard()
// }, {
//     timezone: 'Europe/Moscow'
// })

export async function createLeaderboard(chainid) {
    // try {
        const network = networks.find(v.chainid == chainid)
        const priceRequest = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${network.currency}USDT`).then(res => res.json()).catch(err => {price: "3700"})
        const priceMainCurrency = priceRequest.price
        console.log(`Start creating leaderboard for chainid = ${chainid}`)
        await pgClient.query('DELETE FROM leaderboard WHERE chainid = $1', [chainid])
        let lastID = 0
        const resID = await pgClient.query(
            'SELECT MAX(gameid) FROM statistics WHERE chainid = $1',
            [chainid]
        )
        if (resID.rows.length === 0) {
            return;
        } else {
            lastID = resID.rows[0].max
        }
        const chunkSize = 10
        let allBattlesWeek = []
        let allBattlesMonth = []
        const {contract, signer} = blockchainConfig(chainid)
        const unixDateNow = Math.floor(Date.now() / 1000)
        const unixDateLastWeek = unixDateNow - 7*secondsInADay
        const unixDateLastMonth = unixDateNow - 30*secondsInADay
        for (let i = 0; i < (lastID / chunkSize); i++) {
            try {
                const chunk = await contract.getChunkFinishedBattles(i, chunkSize)
                allBattlesWeek = [...allBattlesWeek, ...(chunk.filter(v => parseInt(v.finishTime) > unixDateLastWeek))]
                allBattlesMonth = [...allBattlesMonth, ...(chunk.filter(v => parseInt(v.finishTime) > unixDateLastMonth))]
            } catch (error) {
                console.log(error)
            }
        }
        /*
        LEADERBOARD PERIODS:
        0 - week
        1 - month
        2 - weekMultiplayers
        3 - monthMultiplayers
        */
        for (let i = 0; i < allBattlesWeek.length; i++) {
            const battle = allBattlesWeek[i]
            const tokenContract = new ethers.Contract(battle.token, erc20Abi, signer)
            const decimals = await tokenContract.decimals()
            const baseAmount = calcAmountWithDecimals(battle.baseAmount, decimals)
            try {
                const battleAllStats = await pgClient.query(
                    `
                    SELECT DISTINCT ON (player)
                        gameid,
                        player,
                        token,
                        contract,
                        chainid,
                        amount,
                        kills,
                        deaths,
                        remainingRounds
                    FROM statistics
                    WHERE gameid = $1 AND chainid = $2;
                    `
                    , [parseInt(battle.ID), chainid])
                for (let i = 0; i < battleAllStats.rows.length; i++) {
                    let amount = calcAmountWithDecimals(battleAllStats.rows[i].amount, decimals)
                    let winAmount = 0
                    let isWin = 0;
                    if (amount > baseAmount) {
                        winAmount = (amount - baseAmount) * (battle.token == ethers.constants.AddressZero ? priceMainCurrency : 1)
                        isWin = 1;
                    }
                    const data = {
                        player: battleAllStats.rows[i].player,
                        isWin: 1,
                        winAmount: winAmount,
                        kills: battleAllStats.rows[i].kills,
                        deaths: battleAllStats.rows[i].deaths,
                        period: battleAllStats.rows.length > 2 ? 2 : 0
                    }
                    await pgClient.query(
                        "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2, kills=kills+$3, deaths=deaths+$4 WHERE address=$5 AND period=$6 AND chainid = $7",
                        [data.isWin, data.winAmount, data.kills, data.deaths, data.player, data.period, chainid]
                    )
                    await pgClient.query(
                        "INSERT INTO leaderboard (address, games, wins, amountwon, period, kills, deaths, chainid) SELECT $1,$2, $3, $4, $5, $6, $7, $8 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5 AND chainid = $8)",
                        [data.player, 1, data.isWin, data.winAmount, data.period, data.kills, data.deaths, chainid]
                    )
                }
            } catch (error) {
                console.log(error)
            }
        }
        for (let i = 0; i < allBattlesMonth.length; i++) {
            const battle = allBattlesMonth[i]
            const tokenContract = new ethers.Contract(battle.token, erc20Abi, signer)
            const decimals = await tokenContract.decimals()
            const baseAmount = calcAmountWithDecimals(battle.baseAmount, decimals)
            try {
                const battleAllStats = await pgClient.query(
                    `
                    SELECT DISTINCT ON (player)
                        gameid,
                        player,
                        token,
                        contract,
                        chainid,
                        amount,
                        kills,
                        deaths,
                        remainingRounds
                    FROM statistics
                    WHERE gameid = $1 AND chainid = $2;
                    `
                    , [parseInt(battle.ID), chainid])
                for (let i = 0; i < battleAllStats.rows.length; i++) {
                    let amount = calcAmountWithDecimals(battleAllStats.rows[i].amount, decimals)
                    let winAmount = 0
                    let isWin = 0;
                    if (amount > baseAmount) {
                        winAmount = (amount - baseAmount) * (battle.token == ethers.constants.AddressZero ? priceMainCurrency : 1)
                        isWin = 1;
                    }
                    const data = {
                        player: battleAllStats.rows[i].player,
                        isWin: 1,
                        winAmount: winAmount,
                        kills: battleAllStats.rows[i].kills,
                        deaths: battleAllStats.rows[i].deaths,
                        period: battleAllStats.rows.length > 2 ? 3 : 1
                    }
                    await pgClient.query(
                        "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2, kills=kills+$3, deaths=deaths+$4 WHERE address=$5 AND period=$6 AND chainid = $8",
                        [data.isWin, data.winAmount, data.kills, data.deaths, data.player, data.period, chainid]
                    )
                    await pgClient.query(
                        "INSERT INTO leaderboard (address, games, wins, amountwon, period, kills, deaths, chainid) SELECT $1,$2, $3, $4, $5, $6, $7, $8 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5 AND chainid = $8)",
                        [data.player, 1, data.isWin, data.winAmount, data.period, data.kills, data.deaths, chainid]
                    )
                }
            } catch (error) {
                console.log(error)
            }
        }
        console.log(`LeaderBoard updated`)
}

export async function getLeaderboard(res) {
    // try {
    //     const leaderboard = await pgClient.query("SELECT * FROM leaderboard")
    //     res.status(200).json({leaderboard: leaderboard.rows})
    // } catch (error) {
    //     res.status(500).send('Something went wrong')
    // }
}

