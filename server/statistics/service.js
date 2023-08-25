import cacheClient from "../db/cache.js"
import db from "../db/db.js"
import { networks } from "../../contract/contract.js"

const pgClient = db()
await pgClient.connect()

const rsClient = cacheClient()
await rsClient.connect()

export async function getCurrentInGameStatistics(gameID, address, chainid) {
    try {
        const remainingRounds = await rsClient.get(`ID=${gameID}&network=${chainid}`)
        const kills = await rsClient.get(`${address.toLowerCase()}_${gameID}_${chainid}_kills`)
        const deaths = await rsClient.get(`${address.toLowerCase()}_${gameID}_${chainid}_deaths`)
        const balance = await rsClient.get(`${address.toLowerCase()}_${gameID}_${chainid}_amount`)
        if (
            remainingRounds == null 
            || 
            kills == null 
            || 
            deaths == null 
        ) {
            const res = await pgClient.query(
                "SELECT * FROM statistics WHERE gameid=$1 AND chainid=$2 AND player=$3",
                [gameID, chainid, address.toLowerCase()]
            )
            if (res.rows.length != 0) {
                const stats = res.rows[0]
                return {
                    code: 200,
                    statistics: {
                        gameid: stats.gameid,
                        address: stats.player,
                        token: stats.token,
                        chainid,
                        contract: stats.contract,
                        amount: stats.amount,
                        kills: stats.kills,
                        deaths: stats.deaths,
                        remainingRounds: remainingRounds == null ? stats.remainingrounds : remainingRounds,
                        balance
                    }
                }
            } else {
                return {
                    code: 200, 
                    statistics: {
                        gameid: gameID,
                        address: address,
                        chainid
                    }
                }
            }
        } else {
            return {
                code: 200,
                statistics: {
                    gameid: gameID,
                    address,
                    chainid,
                    contract: networks.find(n => n.chainid == chainid).contractAddress,
                    amount: 0,
                    kills,
                    deaths,
                    remainingRounds,
                    balance
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            statistics: {}
        }
    }
}

export async function getStatistics(gameID, address, chainid) {
    try {
        const res = await pgClient.query(
            "SELECT * FROM statistics WHERE gameid=$1 AND chainid=$2",
            [gameID, chainid]
        )
        if (res.rows.length === 0) {
            return {
                code: 200,
                statistics: []
            }
        }
        return {
            code: 200,
            statistics: res.rows
        }
    } catch (error) {
        console.error(error)
        return {
            code: 500,
            statistics: []
        }
    }
}