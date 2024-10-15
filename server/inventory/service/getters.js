import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url';

import db from "../../db/db.js"
import { createMixingPicture } from '../../../mixing/mixing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgClient = db()
await pgClient.connect()

//GETTER/SETTER use for getting if exist, if not - create
export async function getInventory(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        //TODO: добавить проверку chain'a (существует ли)
        const res = await pgClient.query(
            `
            SELECT 
                inventory.characterid, 
                inventory.armor, 
                inventory.weapon, 
                inventory.boots,
                armor_bonuses.health as health_bonus, 
                weapon_bonuses.damage, 
                weapon_bonuses.bullets as bullets_bonus,
                boots_bonuses.speed as speed_bonus,
                boots_bonuses.jump as jump_bonus
                FROM inventory 
                LEFT JOIN armor_bonuses ON inventory.armor=armor_bonuses.id 
                LEFT JOIN weapon_bonuses ON inventory.weapon=weapon_bonuses.id 
                LEFT JOIN boots_bonuses ON inventory.boots=boots_bonuses.id 
                WHERE player=$1 AND chainid=$2
            `,
            [address.toLowerCase(), chainid]
        )
        if (res.rows.length === 0) {
            await createMixingPicture(address.toLowerCase(), chainid, 0, undefined, undefined, undefined)
            await pgClient.query(
                "INSERT INTO inventory (player, chainid, characterid) VALUES($1, $2, $3)",
                [address.toLowerCase(), chainid, 0]
            )
            response.status(200).json({
                address, chainid, characterid:0
            })
        } else {
            await createMixingPicture(address.toLowerCase(), chainid, res.rows[0].characterid, res.rows[0].armor, res.rows[0].boots, res.rows[0].weapon)
            response.status(200).json(res.rows[0])
        }
    } catch (error) {
        console.log(error)
        response.status(500).json({})
    }
}

//GETTERS
export async function getCharacterImage(req, response) {
    try {
        const chainid = req.query.chainid
        let address = req.query.address
        const typeofimage = req.query.typeofimage
        address = chainid == 0 ? address : address.toLowerCase()
        const imagePath = path.join(__dirname, `../../../media/characters/players_${typeofimage}`, `${address}_${chainid}.png`)
        try {
            await fs.access(imagePath)
            response.sendFile(imagePath)
        } catch (error) {
            response.sendFile(path.join(__dirname, `../../../mixing/basic_images/characters_${typeofimage}`, `0.png`))
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}