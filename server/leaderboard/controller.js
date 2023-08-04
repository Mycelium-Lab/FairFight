import { Router } from "express"

const leaderboardRouter = Router()

//TODO: сделать для мультичейна, а то не работает
leaderboardRouter.get('/leaderboard', async (req, res) => res.status(301).redirect('/'))
leaderboardRouter.get('/createleaderboard', async (req, res) => res.status(301).redirect('/'))

export default leaderboardRouter