import { Router } from "express";
import { getCurrentInGameStatistics, getStatistics } from "./service.js";

const statisticsRouter = Router()

statisticsRouter.get('/statistics', async (req, res) => {
    const data = await getStatistics(req.query.gameID, req.query.address, req.query.chainid) 
    res.status(data.code).json(data.statistics)
})

statisticsRouter.get('/balance', async (req, res) => {
    const data = await getCurrentInGameStatistics(req.query.gameID, req.query.address, req.query.chainid)
    res.status(data.code).json(data.statistics)
})

export default statisticsRouter