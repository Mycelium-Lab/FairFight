import db from "../../db/db.js"

import blockchainConfig from "../../utils/blockchainConfig.js"
import { signLootbox } from "./utils.js"
import { ERRORS } from "../constants/errors.js"

const pgClient = db()
await pgClient.connect()

export async function createSignature(chainid, address, condition_id) {
    try {
        const config = blockchainConfig(chainid)
        if (config.lootbox) {
            const currentUserCounter = parseInt(await config.lootbox.currentUserLoot(address))
            const signature = await signLootbox(address, config.lootbox.address, currentUserCounter, config.signer)
            await pgClient.query(
                "INSERT INTO lootbox_signatures (player, chainid, condition_id, random_number, v, r, s) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
                [address, chainid, condition_id, signature.randomNumber, signature.v, signature.r, signature.s]
            )
            return { err: null, status: 200, signature }
        }
        return { err: ERRORS.LOOTBOX_NOT_EXIST, status: 404, signature: {}}
    } catch (error) {
        console.log(error)
        return { err: error.message, status: 500, signature: {}}
    }
}

export async function getExistedSignature(chainid, address, conditionId) {
    try {
        const res = await pgClient.query("SELECT * FROM lootbox_signatures WHERE player=$1 AND chainid=$2 AND condition_id=$3", [address, chainid, conditionId])
        if (res.rows.length) return { err: null, signature: res.rows[0] }
        return { err: ERRORS.SIGNATURE_NOT_EXIST, signature: {} }
    } catch (error) {
        console.log(error)
        return { err: error.message, signature: {} }
    }
}