import db from "../db/db.js"

const pgClient = db()
await pgClient.connect()

// cron.schedule("6 6 6 * * *", async () => {
//     await createLeaderboard()
// }, {
//     timezone: 'Europe/Moscow'
// })

export async function createLeaderboard() {
    // try {
    //     console.log('Start creating leaderboard')
    //     await pgClient.query('DELETE FROM leaderboard')
    //     let lastID = 0
    //     const resID = await pgClient.query(
    //         'SELECT MAX(gameid) FROM statistics'
    //     )
    //     if (resID.rows.length === 0) {
    //         return;
    //     } else {
    //         lastID = resID.rows[0].max
    //     }
    //     const chunkSize = 10
    //     let allBattlesWeek = []
    //     let allBattlesMonth = []
    //     const unixDateNow = Math.floor(Date.now() / 1000)
    //     const unixDateLastWeek = unixDateNow - 7*secondsInADay
    //     const unixDateLastMonth = unixDateNow - 30*secondsInADay
    //     for (let i = 0; i < (lastID / chunkSize); i++) {
    //         try {
    //             const chunk = await contract.getChunkFinishedBattles(i, chunkSize)
    //             allBattlesWeek = [...allBattlesWeek, ...(chunk.filter(v => parseInt(v.finishTime) > unixDateLastWeek))]
    //             allBattlesMonth = [...allBattlesMonth, ...(chunk.filter(v => parseInt(v.finishTime) > unixDateLastMonth))]
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    //     for (let i = 0; i < allBattlesWeek.length; i++) {
    //         const battle = allBattlesWeek[i]
    //         try {
    //             let winAmount = 0
    //             let isWin = 0;
    //             if (BigInt(battle.player1Amount) > BigInt(battle.player2Amount)) {
    //                 winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player1Amount) - BigInt(battle.player2Amount)).toString()))
    //                 isWin = 1;
    //             }
    //             await pgClient.query(
    //                 "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2 WHERE address=$3 AND period=$4",
    //                 [isWin, winAmount, battle.player1, 0]
    //             )
    //             await pgClient.query(
    //                 "INSERT INTO leaderboard (address, games, wins, amountwon, period) SELECT $1,$2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5)",
    //                 [battle.player1, 1, isWin, winAmount, 0]
    //             )
    //         } catch (error) {
    //             console.log(error)
    //         }
    //         try {
    //             let winAmount = 0
    //             let isWin = 0;
    //             if (BigInt(battle.player2Amount) > BigInt(battle.player1Amount)) {
    //                 winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player2Amount) - BigInt(battle.player2Amount)).toString()))
    //                 isWin = 1;
    //             }
    //             await pgClient.query(
    //                 "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2 WHERE address=$3 AND period=$4",
    //                 [isWin, winAmount, battle.player2, 0]
    //             )
    //             await pgClient.query(
    //                 "INSERT INTO leaderboard (address, games, wins, amountwon, period) SELECT $1,$2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5)",
    //                 [battle.player2, 1, isWin, winAmount, 0]
    //             )
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    //     for (let i = 0; i < allBattlesMonth.length; i++) {
    //         const battle = allBattlesMonth[i]
    //         try {
    //             let winAmount = 0
    //             let isWin = 0;
    //             if (BigInt(battle.player1Amount) > BigInt(battle.player2Amount)) {
    //                 winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player1Amount) - BigInt(battle.player2Amount)).toString()))
    //                 isWin = 1;
    //             }
    //             await pgClient.query(
    //                 "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2 WHERE address=$3 AND period=$4",
    //                 [isWin, winAmount, battle.player1, 1]
    //             )
    //             await pgClient.query(
    //                 "INSERT INTO leaderboard (address, games, wins, amountwon, period) SELECT $1,$2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5)",
    //                 [battle.player1, 1, isWin, winAmount, 1]
    //             )
    //         } catch (error) {
    //             console.log(error)
    //         }
    //         try {
    //             let winAmount = 0
    //             let isWin = 0;
    //             if (BigInt(battle.player2Amount) > BigInt(battle.player1Amount)) {
    //                 winAmount = parseFloat(ethers.utils.formatEther((BigInt(battle.player2Amount) - BigInt(battle.player2Amount)).toString()))
    //                 isWin = 1;
    //             }
    //             await pgClient.query(
    //                 "UPDATE leaderboard SET games=games+1, wins=wins+$1, amountwon=amountwon+$2 WHERE address=$3 AND period=$4",
    //                 [isWin, winAmount, battle.player2, 1]
    //             )
    //             await pgClient.query(
    //                 "INSERT INTO leaderboard (address, games, wins, amountwon, period) SELECT $1,$2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE address=$1 AND period=$5)",
    //                 [battle.player2, 1, isWin, winAmount, 1]
    //             )
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    //     console.log(`LeaderBoard updated`)
    // } catch (error) {
    //     console.error(error)
    // } 
}

export async function getLeaderboard(res) {
    // try {
    //     const leaderboard = await pgClient.query("SELECT * FROM leaderboard")
    //     res.status(200).json({leaderboard: leaderboard.rows})
    // } catch (error) {
    //     res.status(500).send('Something wen wrong')
    // }
}

