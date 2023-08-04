import { Router } from "express";
import { getCharacterImage, getInventory, setArmor, setBoots, setCharacter, setWeapon, tryOn } from "../service/service.js";

const inventoryRouter = Router()

//GETTERS
inventoryRouter.get('/getcharacterimage', async (req, res) => await getCharacterImage(req, res))

//SETTERS
inventoryRouter.post('/getinventory', async (req, res) => await getInventory(req, res))
inventoryRouter.post('/setcharacter', async (req, res) => await setCharacter(req, res))
inventoryRouter.post('/tryon', async (req, res) =>await tryOn(req, res))
inventoryRouter.post('/setarmor', async (req, res) =>await setArmor(req, res))
inventoryRouter.post('/setweapon', async (req, res) =>await setWeapon(req, res))
inventoryRouter.post('/setboots', async (req, res) =>await setBoots(req, res))

export default inventoryRouter