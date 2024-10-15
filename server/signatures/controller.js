import { Router } from "express";
import { getPlayerSignature, getSignature } from "./service.js";

const signatureRouter = Router()

//GETTERS
signatureRouter.get('/sign', async (req, res) => {
    const data = await getSignature(req.query.gameID, req.query.address, req.query.chainid)
    res.status(data.code).json(data.signature)
})

//GETTER/SETTER
signatureRouter.get('/playersign', async (req, res) => {
    const data = await getPlayerSignature(req.query.gameID, req.query.address, req.query.chainid)
    res.status(data.code).json(data.signature)
})

export default signatureRouter