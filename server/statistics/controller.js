import { Router } from "express";
import { getCurrentInGameStatistics, getStatistics, getStatisticsAll, getStatisticsByAddress } from "./service.js";

const statisticsRouter = Router()

statisticsRouter.get('/statistics/all', async (req, res) => {
    const data = await getStatisticsByAddress(req.query.address, req.query.chainid) 
    res.status(data.code).json(data.statistics)
})

statisticsRouter.get('/statistics', async (req, res) => {
    const data = await getStatistics(req.query.gameID, req.query.address, req.query.chainid) 
    res.status(data.code).json(data.statistics)
})

statisticsRouter.get('/statisticsmulti', async (req, res) => {
    const data = await getStatisticsAll(req.query.gameids.split(',').map(Number), req.query.address, req.query.chainid)
    res.status(data.code).json(data.statistics)
})

statisticsRouter.get('/balance', async (req, res) => {
    const data = await getCurrentInGameStatistics(req.query.gameID, req.query.address, req.query.chainid)
    res.status(data.code).json(data.statistics)
})

export default statisticsRouter