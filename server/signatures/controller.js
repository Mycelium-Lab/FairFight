import { Router } from "express";
import { getSignature } from "./service.js";

const signatureRouter = Router()

//GETTERS
//Returns a payout signature that was already created by the settlement flow.
//NOTE: still unauthenticated - anyone who knows a gameID can read either player's
//signature. Fixing that needs wallet-bound sessions, tracked separately.
signatureRouter.get('/sign', async (req, res) => {
    const data = await getSignature(req.query.gameID, req.query.address, req.query.chainid)
    res.status(data.code).json(data.signature)
})

export default signatureRouter