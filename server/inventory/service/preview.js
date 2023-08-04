import path from 'path'
import { fileURLToPath } from 'url';

import db from "../../db/db.js"
import { createMixingPicture } from '../../../mixing/mixing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgClient = db()
await pgClient.connect()

//TryOn in NFT Shop
//Testing new items on the character
export async function tryOn(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        /*
            {
                characters: undefined | number
                weapons: undefined | number
                armors: undefined | number
                boots: undefined | number
            }
        */
        let inventory = req.body.inventory 
        if (isNaN(parseInt(inventory.characters)) && isNaN(parseInt(inventory.weapons)) && isNaN(parseInt(inventory.armors))&& isNaN(parseInt(inventory.boots))) {
            response.status(400).send('All cant be undefined')
        }
        const currentInventoryRes = await pgClient.query('SELECT * FROM inventory WHERE player=$1 AND chainid=$2', [address, chainid])
        const currentInventory = currentInventoryRes.rows[0]
        if (isNaN(parseInt(inventory.characters))) inventory.characters = currentInventory.characterid
        if (isNaN(parseInt(inventory.weapons))) inventory.weapons = currentInventory.weapon
        if (isNaN(parseInt(inventory.armors))) inventory.armors = currentInventory.armor
        if (isNaN(parseInt(inventory.boots))) inventory.boots = currentInventory.boots
        const isTryOn = true
        await createMixingPicture(address, chainid, inventory.characters, inventory.armors, inventory.boots, inventory.weapons, isTryOn)
        setTimeout(() => {
            const imagePath = path.join(__dirname, `../../../media/characters/tryon`, `${address}_${chainid}.png`)
            response.status(200).sendFile(imagePath)
        }, 2500)
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}
