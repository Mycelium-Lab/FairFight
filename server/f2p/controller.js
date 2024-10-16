import { Router } from "express";
import { createFight, getFightsWithNullFinish, joinFight, withdrawFight, getPastFights, getBoard } from "./service.js";

const f2pRouter = Router()

f2pRouter.get('/f2p', async (req, res) => {
    try {
        const chainid = req.query.chainid
        const response = await getFightsWithNullFinish(chainid)
        res.status(response.code).json({fights: response.fights})
    } catch (error) {
        console.log(error)
        res.status(500).json({fights: []})
    }
})

f2pRouter.get('/f2p/pastfights', async (req, res) => {
    try {
        const response = await getPastFights(req.query.player, req.query.chainid)
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
            players: req.body.players,
            chainid: req.body.chainid
        }
        const response = await createFight(fight, req.body.initData)
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
        const response = await joinFight(gameid, player, req.body.initData)
        res.status(response.code).send(response.msg)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
})

f2pRouter.post('/f2p/withdraw', async (req, res) => {
    try {
        const gameid = req.body.gameid
        const response = await withdrawFight(gameid, req.body.initData)
        res.status(response.code).send(response.msg)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal server error')
    }
})

f2pRouter.get('/f2p/board', async (req, res) => await getBoard(req, res))

export default f2pRouter