import pgClient from "../db/db.js"

//create game
export async function createFight(fight) {
    try {
        const query = `
            WITH inserted_game AS (
                INSERT INTO game_f2p (owner, map, rounds, baseAmount, amountPerRound, players, createTime)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING gameid
            )
            INSERT INTO players_f2p (gameid, player)
            SELECT gameid, $1
            FROM inserted_game;
        `;
        await pgClient.query(query, [
            fight.owner,
            fight.map,
            fight.rounds,
            fight.baseAmount,
            fight.amountPerRound,
            fight.players,
            Date.now()
        ]);
        return {
            code: 200,
            msg: 'Success'
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'Internal error'
        }
    }
}

//join game
export async function joinFight(fightId, player) {
    try {
        const res = await pgClient.query("SELECT * FROM game_f2p WHERE gameid=$1", [fightId])
        if (res.rows.length !== 0) {
            const resPlayers = await pgClient.query("SELECT * FROM players_f2p WHERE gameid=$1", [fightId])
            if (resPlayers.rows.length < res.rows[0].players) {
                await pgClient.query("INSERT INTO players_f2p (gameid, player) VALUES ($1, $2)", [fightId, player])
                return {
                    code: 200,
                    msg: 'Success'
                }
            } else {
                return {
                    code: 400,
                    msg: 'The game is full'
                }
            }
        } else {
            return {
                code: 404,
                msg: 'The game does not exist'
            }
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'Internal error'
        }
    }
}

//withdraw
export async function withdrawFight(fightId) {
    //require owner
    try {
        const res = await pgClient.query("SELECT * FROM players_f2p WHERE gameid=$1", [fightId])
        if (res.rows.length !== 0) {
            if (res.rows.length == 1) {
                await pgClient.query(
                    `UPDATE game_f2p SET finishTime = $1 WHERE gameid = $2`,
                    [Date.now(), fightId]
                )
                return {
                    code: 200,
                    msg: 'Success'
                }
            } else {
                return {
                    code: 400,
                    msg: 'Somebody joined game'
                }
            }
        } else {
            return {
                code: 404,
                msg: 'The game does not exist'
            }
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'Internal error'
        }
    }
}
