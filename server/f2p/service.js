// process.env.NTBA_FIX_319 = 1

import db from "../db/db.js"
import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'
import { checkSignatureTG } from "../utils/utils.js";
import { appState, appStateTypes } from "../utils/appState.js";
import { msgSignIn, playersToNotify } from "../constants/constants.js";
import { ethers } from "ethers";
dotenv.config()

const pgClient = db()
await pgClient.connect()

export const bot = process.env.TG_BOT_KEY ? new TelegramBot(process.env.TG_BOT_KEY, {polling: false}) : null
const evmF2PChainid = 999998
//create game
export async function createFight(fight, bodyInitData, sign_evm) {
    try {
        if (appState == appStateTypes.prod && fight.chainid != evmF2PChainid) {
            const initDataURI = decodeURIComponent(bodyInitData)
            const initData = new URLSearchParams( initDataURI );
            initData.sort();
            const hash = initData.get( "hash" );
            initData.delete( "hash" );
            const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
            const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
            if (!checkerTG) {
                return {
                    code: 401,
                    msg: 'wrong tg init data'
                }
            }
        }
        if (fight.chainid == evmF2PChainid) {
            if (!sign_evm) {
                return {
                    code: 401,
                    msg: 'wrong sign'
                }
            } else {
                const recoveredAddress = ethers.utils.verifyMessage(msgSignIn, sign_evm)
                console.log(recoveredAddress, fight.owner)
                if (recoveredAddress != fight.owner) {
                    return {
                        code: 401,
                        msg: 'wrong sign'
                    }
                }
            }
        }
        //TODO: fight owner signature check
        if (fight.baseAmount <= 0) {
            return {
                code: 400,
                msg: 'Wrong fight amount'
            }
        }
        if (fight.players <= 1) {
            return {
                code: 400,
                msg: 'Not enough players'
            }
        }
        if (fight.amountPerRound <= 0) {
            return {
                code: 400,
                msg: 'Not enough amount per round'
            }
        }
        if (fight.rounds <= 0) {
            return {
                code: 400,
                msg: 'Not enough rounds'
            }
        }
        if (fight.map < 0) {
            return {
                code: 400,
                msg: 'Wrong map'
            }
        }
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
                    INSERT INTO game_f2p (owner, map, rounds, baseAmount, amountPerRound, players, createTime, chainid)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
                Date.now(),
                fight.chainid
            ]);
            if (bot) {
                for (let i = 0; i < playersToNotify.length; i++) {
                    bot.sendMessage(playersToNotify[i], `${fight.owner} have created new fight.`)
                }
                // const chat = await pgClient.query('SELECT * FROM tg_chats WHERE username = $1', [fight.owner])
                // if (chat.rows.length ) {
                //     bot.sendMessage(chat.rows[0].chat_id, 'You have created new fight.')
                // }
            }
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
export async function joinFight(fightId, player, bodyInitData, sign_evm) {
    try {
        const res = await pgClient.query("SELECT * FROM game_f2p WHERE gameid=$1", [fightId])
        if (res.rows.length !== 0) {
            if (appState == appStateTypes.prod && res.rows[0].chainid != evmF2PChainid) {
                const initDataURI = decodeURIComponent(bodyInitData)
                const initData = new URLSearchParams( initDataURI );
                initData.sort();
                const hash = initData.get( "hash" );
                initData.delete( "hash" );
                const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
                const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
                if (!checkerTG) {
                    return {
                        code: 401,
                        msg: 'wrong tg init data'
                    }
                }
            }
            if (res.rows[0].chainid == evmF2PChainid) {
                if (!sign_evm) {
                    return {
                        code: 401,
                        msg: 'wrong sign'
                    }
                } else {
                    const recoveredAddress = ethers.utils.verifyMessage(msgSignIn, sign_evm)
                    console.log(recoveredAddress, player)
                    if (recoveredAddress != player) {
                        return {
                            code: 401,
                            msg: 'wrong sign'
                        }
                    }
                }
            }
            const resPlayers = await pgClient.query("SELECT * FROM players_f2p WHERE gameid=$1", [fightId])
            if (resPlayers.rows.length < res.rows[0].players) {
                await pgClient.query("INSERT INTO players_f2p (gameid, player) VALUES ($1, $2)", [fightId, player])
                if (bot) {
                    // const chat = await pgClient.query('SELECT * FROM tg_chats WHERE username = $1', [res.rows[0].owner])
                    // const chatJoiner = await pgClient.query('SELECT * FROM tg_chats WHERE username = $1', [player])
                    // if (chat.rows.length) {
                    for (let i = 0; i < playersToNotify.length; i++) {
                        bot.sendMessage(playersToNotify[i], `${player} joined your fight (id: ${fightId})`)
                    }
                        // bot.sendMessage(chat.rows[0].chat_id, `Player (username: ${player}) joined your fight (id: ${fightId})`)
                    // }
                    // if (chatJoiner.rows.length) {
                    //     bot.sendMessage(chatJoiner.rows[0].chat_id, `You joined fight (id: ${fightId})`)
                    // }
                }
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
export async function withdrawFight(fightId, bodyInitData, sign_evm) {
    //require owner
    try {
        const res = await pgClient.query("SELECT * FROM players_f2p WHERE gameid=$1", [fightId])
        if (res.rows.length !== 0) {
            if (appState == appStateTypes.prod && res.rows[0].chainid != evmF2PChainid) {
                const initDataURI = decodeURIComponent(bodyInitData)
                const initData = new URLSearchParams( initDataURI );
                initData.sort();
                const hash = initData.get( "hash" );
                initData.delete( "hash" );
                const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
                const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
                if (!checkerTG) {
                    return {
                        code: 401,
                        msg: 'wrong tg init data'
                    }
                }
            }
            if (res.rows[0].chainid == evmF2PChainid) {
                if (!sign_evm) {
                    return {
                        code: 401,
                        msg: 'wrong sign'
                    }
                } else {
                    const recoveredAddress = ethers.utils.verifyMessage(msgSignIn, sign_evm)
                    console.log(recoveredAddress, res.rows[0].owner)
                    if (recoveredAddress != res.rows[0].owner) {
                        return {
                            code: 401,
                            msg: 'wrong sign'
                        }
                    }
                }
            }
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

export async function getFightsWithNullFinish(chainid) {
    try {
        let query = `
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
                g.finishTime IS NULL AND (g.chainid = NULL OR g.chainid = 999999)
            GROUP BY 
                g.gameid;
            `
        if (chainid == evmF2PChainid) {
            query = `
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
                g.finishTime IS NULL AND g.chainid = 999998
            GROUP BY 
                g.gameid;
            `
        }
        const res = await pgClient.query(query)
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

export async function getPastFights(player, chainid) {
    try {
        let query = `
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
                AND (g.chainid = NULL OR g.chainid = 999999)
                AND EXISTS (
                    SELECT 1
                    FROM statistics_f2p s2
                    WHERE s2.gameid = g.gameid 
                    AND s2.player = $1
                )
            GROUP BY 
                g.gameid
            ORDER BY 
                g.createTime;
            `
        if (chainid == evmF2PChainid) {
            query = `
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
                AND g.chainid = 999998
                AND EXISTS (
                    SELECT 1
                    FROM statistics_f2p s2
                    WHERE s2.gameid = g.gameid 
                    AND s2.player = $1
                )
            GROUP BY 
                g.gameid
            ORDER BY 
                g.createTime;
            `
        }
        const res = await pgClient.query(
            query,
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

export async function getBoard(req, res) {
    try {
        const bodyInitData = req.query.initData
        const username = req.query.username
        const chainid = req.query.chainid
        if (appState == appStateTypes.prod && chainid != evmF2PChainid) {
            const initDataURI = decodeURIComponent(bodyInitData)
            const initData = new URLSearchParams( initDataURI );
            initData.sort();
            const hash = initData.get( "hash" );
            initData.delete( "hash" );
            const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
            const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
            if (!checkerTG) {
                res.status(401).send('wrong tg init data')
            } else {
                if (!username) {
                    res.status(401).send('no username')
                } else {
                    const resDB = await pgClient.query("SELECT * FROM board_f2p WHERE player=$1 AND (chainid = NULL || chainid=999999)", [username])
                    res.status(200).json({
                        board: resDB.rows[0]
                    })
                }
            }
        } else if (chainid == evmF2PChainid) {
            if (!username) {
                res.status(401).send('no username')
            } else {
                const resDB = await pgClient.query("SELECT * FROM board_f2p WHERE player=$1 AND chainid=999998", [username])
                res.status(200).json({
                    board: resDB.rows[0]
                })
            }
        } else {
            res.status(200).json({
                board: {
                    player: username,
                    games: 0,
                    wins: 0,
                    amountwon: 0,
                    tokens: 0,
                    kills: 0,
                    deaths: 0
                }
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
}