import db from "../db/db.js"

const pgClient = db()
await pgClient.connect()

export async function getSignature(gameID, address, chainid) {
    try {
        const res = await pgClient.query(
            'SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$3',
            [address.toLowerCase(), gameID, chainid]
        )
        if (res.rows.length === 0) {
            return {
                code: 200,
                signature: {
                    player: '',
                    gameid: '',
                    token: '',
                    amount: '',
                    chainid: '',
                    contract: '',
                    v: '',
                    r: '',
                    s: '' 
                }
            }
        }
        return {
            code: 200,
            signature: {
                player: res.rows[0].player,
                amount: res.rows[0].amount,
                gameid: res.rows[0].gameid,
                token: res.rows[0].token,
                contract: res.rows[0].contract,
                chainid,
                v: res.rows[0].v,
                r: res.rows[0].r,
                s: res.rows[0].s
            }
        }
    } catch (error) {
        console.error(error)
        return {
            code: 500,
            signature: {}
        }
    }
}