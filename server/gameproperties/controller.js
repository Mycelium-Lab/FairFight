import { Router } from "express";
import { getGamesProperties, getGamesPropertiesAll, setGamesProperties } from "./service.js";

const gamePropertiesRouter = Router()

//GETTERS
gamePropertiesRouter.get('/getgamesprops', async (req, res) => await getGamesProperties(req, res))

//SETTERS
gamePropertiesRouter.post('/setgamesprops', async (req, res) => await setGamesProperties(req, res))

gamePropertiesRouter.get('/getgamespropsall', async (req, res) => await getGamesPropertiesAll(req, res))

export default gamePropertiesRouter
