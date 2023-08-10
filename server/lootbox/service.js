import { getAmountOfGames, getAmountOfKills, getAmountOfWinsInARow } from "./service/conditions.js"
import { CONDITION_ID, amountOfGamesForPrize, amountOfKillsForPrize } from "./constants/constants.js"
import { createSignature, getExistedSignature } from "./service/common.js"

export async function getSignature(req, res) {
    if (req.body.condition_id == CONDITION_ID.GAMES_AMOUNT) {
        await getSignatureForAmountOfGames(req, res)
    } else if (req.body.condition_id == CONDITION_ID.KILLS_AMOUNT) {
        await getSignatureForAmountOfKills(req, res)
    } else if (req.body.condition_id == CONDITION_ID.GAMES_WIN_AMOUNT_IN_A_ROW) {
        await getSignatureForWinsInARow(req, res)
    } else {
        res.status(400).send("This condition not exist")
    }
}

async function getSignatureForAmountOfGames(req, res) {
    try {
        const existedSignature = await getExistedSignature(req.body.chainid, req.body.address, CONDITION_ID.GAMES_AMOUNT)
        if (Object.entries(existedSignature.signature).length) {
            res.status(200).json(existedSignature.signature)
        } else {
            const amountOfGames = await getAmountOfGames(req.body.chainid, req.body.address)
            if (amountOfGames.count >= amountOfGamesForPrize) {
                const signature = await createSignature(req.body.chainid, req.body.address, CONDITION_ID.GAMES_AMOUNT)
                if (signature.err) {
                    res.status(signature.status).send(signature.err)
                } else {
                    res.status(signature.status).json(signature.signature)
                }
            } else {
                res.status(401).send("Not enough games")
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
}

async function getSignatureForAmountOfKills(req, res) {
    try {
        const existedSignature = await getExistedSignature(req.body.chainid, req.body.address, CONDITION_ID.KILLS_AMOUNT)
        if (Object.entries(existedSignature.signature).length) {
            res.status(200).json(existedSignature.signature)
        } else {
            const amountOfKills = await getAmountOfKills(req.body.chainid, req.body.address)
            if (amountOfKills.count >= amountOfKillsForPrize) {
                const signature = await createSignature(req.body.chainid, req.body.address, CONDITION_ID.KILLS_AMOUNT)
                if (signature.err) {
                    res.status(signature.status).send(signature.err)
                } else {
                    res.status(signature.status).json(signature.signature)
                }
            } else {
                res.status(401).send("Not enough kills")
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
}

async function getSignatureForWinsInARow(req, res) {
    try {
        const existedSignature = await getExistedSignature(req.body.chainid, req.body.address, CONDITION_ID.GAMES_WIN_AMOUNT_IN_A_ROW)
        if (Object.entries(existedSignature.signature).length) {
            res.status(200).json(existedSignature.signature)
        } else {
            const amountOfWins = await getAmountOfWinsInARow(req.body.chainid, req.body.address)
            if (amountOfWins.allWins) {
                const signature = await createSignature(req.body.chainid, req.body.address, CONDITION_ID.GAMES_WIN_AMOUNT_IN_A_ROW)
                if (signature.err) {
                    res.status(signature.status).send(signature.err)
                } else {
                    res.status(signature.status).json(signature.signature)
                }
            } else {
                res.status(401).send("Not enough wins in a row")
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
}