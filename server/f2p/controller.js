import { Router } from "express";
import { createFight, getFightsWithNullFinish, joinFight, withdrawFight } from "./service.js";

const f2pRouter = Router()

f2pRouter.get('/f2p', async (req, res) => {
    try {
        const response = await getFightsWithNullFinish()
        res.status(response.code).json({fights: response.fights})
    } catch (error) {
        console.log(error)
        res.status(500).json({fights: []})
    }
})

f2pRouter.post('/f2p/create', async (req, res) => {
    try {
        const fight = {
            owner: req.body.owner,
            map: req.body.map,
            rounds: req.body.rounds,
            baseAmount: req.body.baseAmount,
            amountPerRound: req.body.amountPerRound,
            players: req.body.players
        }
        const response = await createFight(fight)
        res.status(response.code).send(response.msg)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
})

f2pRouter.post('/f2p/join', async (req, res) => {
    try {
        const gameid = req.body.gameid
        const player = req.body.player
        const response = await joinFight(gameid, player)
        res.status(response.code).send(response.msg)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
})

f2pRouter.post('/f2p/withdraw', async (req, res) => {
    try {
        const gameid = req.body.gameid
        const response = await withdrawFight(gameid)
        res.status(response.code).send(response.msg)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
})

export default f2pRouter