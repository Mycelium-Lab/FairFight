import { ethers } from "ethers"
import db from "../db/db.js"
import blockchainConfig from "../utils/blockchainConfig.js"

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

export async function getPlayerSignature(gameID, address, chainid) {
    try {
        const res = await pgClient.query(
            'SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$3',
            [address.toLowerCase(), gameID, chainid]
        )
        if (res.rows.length === 0) {
            const config = blockchainConfig(chainid)
            const players = await config.contract.getFightPlayers(gameID)
            if (players[0].toLowerCase() === address.toLowerCase() || players[1].toLowerCase() === address.toLowerCase()) {
                const fight = await config.contract.fights(gameID)
                const resPlayer = await pgClient.query(
                    'SELECT COUNT(*) FROM players WHERE player IN ($1, $2)',
                    [players[0].toLowerCase(), players[1].toLowerCase()]
                )
                console.log(players[0].toLowerCase(), address.toLowerCase(),players[1].toLowerCase())
                console.log(resPlayer.rows[0])
                if (resPlayer.rows[0].count == 2) {
                    const step = fight.amountPerRound
                    const range = (fight.baseAmount - 0) / step
                    const randomIndex = Math.floor(Math.random() * (range + 1))
                    const amount0 = randomIndex * step
                    const amount1 = fight.baseAmount - amount0
                    //player0
                    const message = [gameID, amount0.toString(), fight.token, players[0], config.contract.address]
                    const hashMessage = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint160", "uint160", "uint160"], message)
                    const sign = await config.signer.signMessage(ethers.utils.arrayify(hashMessage));
                    const r = sign.substr(0, 66)
                    const s = '0x' + sign.substr(66, 64);
                    const v = parseInt("0x" + sign.substr(130, 2));
                    //player1
                    const message1 = [gameID, amount1.toString(), fight.token, players[1], config.contract.address]
                    const hashMessage1 = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint160", "uint160", "uint160"], message1)
                    const sign1 = await config.signer.signMessage(ethers.utils.arrayify(hashMessage1));
                    const r1 = sign1.substr(0, 66)
                    const s1 = '0x' + sign1.substr(66, 64);
                    const v1 = parseInt("0x" + sign1.substr(130, 2));
                    await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)", [
                        players[0].toLowerCase(),
                        gameID,
                        amount0.toString(),
                        chainid,
                        config.contract.address,
                        v,
                        r,
                        s,
                        fight.token
                    ])
                    await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)", [
                        players[1].toLowerCase(),
                        gameID,
                        amount1.toString(),
                        chainid,
                        config.contract.address,
                        v1,
                        r1,
                        s1,
                        fight.token
                    ])
                    return {
                        code: 200,
                        signature: {
                            player: address,
                            amount: address.toLowerCase() === players[0].toLowerCase() ? amount0.toString() : amount1.toString(),
                            gameid: gameID,
                            token: fight.token,
                            contract: config.contract.address,
                            chainid,
                            v: address.toLowerCase() === players[0].toLowerCase() ? v : v1,
                            r: address.toLowerCase() === players[0].toLowerCase() ? r : r1,
                            s: address.toLowerCase() === players[0].toLowerCase() ? s : s1
                        }
                    }
                } else if (resPlayer.rows[0].count == 1) {
                    //player0
                    const message = [gameID, fight.baseAmount.toString(), fight.token, players[0], config.contract.address]
                    const hashMessage = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint160", "uint160", "uint160"], message)
                    const sign = await config.signer.signMessage(ethers.utils.arrayify(hashMessage));
                    const r = sign.substr(0, 66)
                    const s = '0x' + sign.substr(66, 64);
                    const v = parseInt("0x" + sign.substr(130, 2));
                    //player1
                    const message1 = [gameID, fight.baseAmount.toString(), fight.token, players[1], config.contract.address]
                    const hashMessage1 = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint160", "uint160", "uint160"], message1)
                    const sign1 = await config.signer.signMessage(ethers.utils.arrayify(hashMessage1));
                    const r1 = sign1.substr(0, 66)
                    const s1 = '0x' + sign1.substr(66, 64);
                    const v1 = parseInt("0x" + sign1.substr(130, 2));
                    await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)", [
                        players[0].toLowerCase(),
                        gameID,
                        fight.baseAmount.toString(),
                        chainid,
                        config.contract.address,
                        v,
                        r,
                        s,
                        fight.token
                    ])
                    await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)", [
                        players[1].toLowerCase(),
                        gameID,
                        fight.baseAmount.toString(),
                        chainid,
                        config.contract.address,
                        v1,
                        r1,
                        s1,
                        fight.token
                    ])
                    return {
                        code: 200,
                        signature: {
                            player: address,
                            amount: fight.baseAmount.toString(),
                            gameid: gameID,
                            token: fight.token,
                            contract: config.contract.address,
                            chainid,
                            v: address.toLowerCase() === players[0].toLowerCase() ? v : v1,
                            r: address.toLowerCase() === players[0].toLowerCase() ? r : r1,
                            s: address.toLowerCase() === players[0].toLowerCase() ? s : s1
                        }
                    }
                } else {
                    return {
                        code: 500,
                        signature: {}
                    }
                }
            } else {
                return {
                    code: 401,
                    signature: {}
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