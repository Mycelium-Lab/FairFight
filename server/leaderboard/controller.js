import { Router } from "express"
import { createLeaderboard, getLeaderboard } from "./service.js"

const leaderboardRouter = Router()

//TODO: сделать для мультичейна, а то не работает
leaderboardRouter.get('/leaderboard', async (req, res) => await getLeaderboard(res))
leaderboardRouter.get('/createleaderboard', async (req, res) => {
    try {
        await createLeaderboard(31337)
    } catch (error) {
        console.log(error)
    }
})

export default leaderboardRouter