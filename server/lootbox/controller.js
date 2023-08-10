import { Router } from "express";
import { getSignature } from "./service.js";

const lootboxRouter = Router()

lootboxRouter.post('/lootbox_signature', async (req, res) => await getSignature(req, res))

export default lootboxRouter