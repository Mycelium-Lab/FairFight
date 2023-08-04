import path from 'path'
import { fileURLToPath } from 'url';

import db from "../../db/db.js"
import blockchainConfig from "../../utils/blockchainConfig.js"
import { createMixingPicture } from '../../../mixing/mixing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgClient = db()
await pgClient.connect()

//TODO заменить setTimeOut на приличное что-то
export async function setCharacter(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        const characterid = req.body.characterid
        const { characters, contract } = blockchainConfig(chainid)
        //check if player is busy now
        //prevents changing innventory by another player during game
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            const exist = await characters.propertyToken(address, characterid == 0 ? characterid : characterid-1)
            if (characterid == 0 || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET characterid=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, characterid]
                )
                const inventory = res.rows[0]
                //create mixing picture
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = path.join(__dirname, `../../../media/characters/players_preview`, `${address}_${chainid}.png`)
                    response.status(200).sendFile(imagePath)
                }, 2500)
            } else {
                response.status(401).send('Not exist')
            }
        } else {
            response.status(400).send('Busy')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}

export async function setArmor(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        const armor = req.body.armor
        const { armors, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (armor !== null) {
                exist = await armors.propertyToken(address, armor)
            }
            if (armor === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET armor=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, armor]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = path.join(__dirname, `../../../media/characters/players_preview`, `${address}_${chainid}.png`)
                    response.status(200).sendFile(imagePath)
                }, 2500)
            } else {
                response.status(401).send('Not exist')
            }
        } else {
            response.status(400).send('Busy')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}
export async function setWeapon(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        const weapon = req.body.weapon
        const { weapons, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (weapon !== null) {
                exist = await weapons.propertyToken(address, weapon)
            }
            if (weapon === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET weapon=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, weapon]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = path.join(__dirname, `../../../media/characters/players_preview`, `${address}_${chainid}.png`)
                    response.status(200).sendFile(imagePath)
                }, 2500)
            } else {
                response.status(401).send('Not exist')
            }
        } else {
            response.status(400).send('Busy')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}
export async function setBoots(req, response) {
    try {
        const address = req.body.address
        const chainid = req.body.chainid
        const boot = req.body.boots
        const { boots, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (boot !== null) {
                exist = await boots.propertyToken(address, boot)
            }
            if (boot === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET boots=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, boot]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = path.join(__dirname, `../../../media/characters/players_preview`, `${address}_${chainid}.png`)
                    response.status(200).sendFile(imagePath)
                }, 2500)
            } else {
                response.status(401).send('Not exist')
            }
        } else {
            response.status(400).send('Busy')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}