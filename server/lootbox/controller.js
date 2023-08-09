import { Router } from "express";
import { createSignatureForAmountOfGames } from "./service.js";

const lootboxRouter = Router()

lootboxRouter.post('/prizeforamount', async (req, res) => {
    await createSignatureForAmountOfGames(req, res)
})

export default lootboxRouter