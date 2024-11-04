import { Router } from 'express'
import { sign, verifyCallback } from './service'

const aeonRouter = Router()

aeonRouter.post('/aeon/sign', async (req, res) => {
    try {
        await sign(req, res)
    } catch (error) {
        res.status(500).send('Internal server error')
    }
})

aeonRouter.post('/aeon/callback', async (req, res) => {
    try {
        await verifyCallback(req, res)
    } catch (error) {
        res.status(500).send('Internal server error')
    }
})

export default aeonRouter