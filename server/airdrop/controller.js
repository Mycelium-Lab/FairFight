import { Router } from "express";

const airdropRouter = Router()

airdropRouter.post('/airdrop_first_sign', async (req, res) => res.status(301).redirect('/'))
airdropRouter.post('/airdrop_second_sign', async (req, res) => res.status(301).redirect('/'))

export default airdropRouter