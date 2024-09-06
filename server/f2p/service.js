import db from "../db/db.js"

const pgClient = db()
await pgClient.connect()

//create game
export async function createFight(fight) {
    try {
        const res = await pgClient.query(
            `SELECT *
            FROM game_f2p
            WHERE owner = $1 AND finishTime IS NULL;
            `, [fight.owner])
        if (res.rows.length) {
            return {
                code: 400,
                msg: 'Already has fight'
            }
        } else {
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
                BigInt(fight.baseAmount),
                BigInt(fight.amountPerRound),
                fight.players,
                Date.now()
            ]);
            return {
                code: 200,
                msg: 'Success'
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

export async function getFightsWithNullFinish() {
    try {
        const res = await pgClient.query(
            `
            SELECT 
                g.gameid, 
                g.owner, 
                g.map, 
                g.rounds, 
                g.baseAmount, 
                g.amountPerRound, 
                g.players, 
                g.createTime, 
                g.finishTime, 
                array_agg(p.player) AS players_list
            FROM 
                game_f2p g
            LEFT JOIN 
                players_f2p p ON g.gameid = p.gameid
            WHERE 
                g.finishTime IS NULL
            GROUP BY 
                g.gameid;
            `
        )
        return {
            code: 200,
            msg: 'Success',
            fights: res.rows
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'Internal error',
            fights: []
        }
    }
}

export async function getPastFights(player) {
    try {
        console.log(player)
        const res = await pgClient.query(
            `
            SELECT 
                g.gameid, 
                g.owner, 
                g.map, 
                g.rounds, 
                g.baseAmount, 
                g.amountPerRound, 
                g.players, 
                g.createTime, 
                g.finishTime, 
                json_agg(
                    json_build_object(
                        'player', s.player, 
                        'amount', s.amount, 
                        'kills', s.kills, 
                        'deaths', s.deaths, 
                        'remainingrounds', s.remainingrounds
                    )
                ) AS statistics
            FROM 
                game_f2p g
            JOIN 
                statistics_f2p s ON g.gameid = s.gameid
            WHERE 
                g.finishTime IS NOT NULL
                AND EXISTS (
                    SELECT 1
                    FROM statistics_f2p s2
                    WHERE s2.gameid = g.gameid 
                    AND s2.player = $1
                )
            GROUP BY 
                g.gameid;
            `,
            [player]
        )
        return {
            code: 200,
            msg: 'Past fights',
            fights: res.rows
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'Internal error',
            fights: []
        }
    }
}