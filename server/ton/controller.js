import { Router } from "express";
import { getFights, getInventory, setArmor, setBoots, setCharacter, setWeapon } from "./service.js";

const tonRouter = Router()

tonRouter.get('/ton/fights', async (req, res) => {
    try {
        let fights = await getFights()
        fights = fights.map(v => {
            v.id = v.id.toString()
            v.owner = v.owner.toString()
            v.createTime = v.createTime.toString()
            v.finishTime = v.finishTime.toString()
            v.baseAmount = v.baseAmount.toString()
            v.amountPerRound = v.amountPerRound.toString()
            v.rounds = v.rounds.toString()
            v.maxPlayersAmount = v.maxPlayersAmount.toString()
            v.players = v.players.map(v => v.toString())
            return v
        })
        res.status(200).json({fights: fights})
    } catch (error) {
        res.status(500).json({fights: []})
    }
})

tonRouter.post('/ton/inventory', async (req, res) => await getInventory(req, res))
tonRouter.post('/ton/setcharacter', async (req, res) => await setCharacter(req, res))
tonRouter.post('/ton/setarmor', async (req, res) =>await setArmor(req, res))
tonRouter.post('/ton/setweapon', async (req, res) =>await setWeapon(req, res))
tonRouter.post('/ton/setboots', async (req, res) =>await setBoots(req, res))

export default tonRouter