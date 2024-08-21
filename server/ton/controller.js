import { Router } from "express";
import { getFights } from "./service.js";

const tonRouter = Router()

tonRouter.get('/ton/fights', async (req, res) => {
    let fights = await getFights()
    fights = fights.map(v => {
        v.id = v.id.toString()
        v.owner = v.owner.toString()
        v.createTime = v.createTime.toString()
        v.finishTime = v.finishTime.toString()
        v.baseAmount = v.baseAmount.toString()
        v.amountPerRound = v.amountPerRound.toString()
        v.rounds = v.rounds.toString()
        v.maxPlayersAmount = v.maxPlayersAmount.toString()
        v.players = v.players.map(v => v.toString())
        return v
    })
    res.status(200).json({fights: fights})
})

export default tonRouter