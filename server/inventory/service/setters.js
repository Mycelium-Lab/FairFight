import path from 'path'
import { fileURLToPath } from 'url';

import db from "../../db/db.js"
import blockchainConfig from "../../utils/blockchainConfig.js"
import { createMixingPicture } from '../../../mixing/mixing.js';
import { isValidAddress, isValidChainId, safeJoin } from '../../utils/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgClient = db()
await pgClient.connect()

//address and chainid come from the request body and end up in a filename,
//so resolve through safeJoin and let the caller 400 on null.
function previewImagePath(address, chainid) {
    return safeJoin(path.join(__dirname, '../../../media/characters'), 'players_preview', `${address}_${chainid}.png`)
}

//TODO заменить setTimeOut на приличное что-то
export async function setCharacter(req, response) {
    try {
        const chainid = req.body.chainid
        if (!isValidChainId(chainid) || !isValidAddress(req.body.address, chainid)) {
            return response.status(400).send()
        }
        const address = req.body.address.toLowerCase()
        const characterid = req.body.characterid
        const { characters, contract } = blockchainConfig(chainid)
        //check if player is busy now
        //prevents changing innventory by another player during game
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            const exist = await characters.getOwnerPropertyTokensLength(address, characterid == 0 ? characterid : characterid-1)
            if (characterid == 0 || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET characterid=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, characterid]
                )
                const inventory = res.rows[0]
                //create mixing picture
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = previewImagePath(address, chainid)
                    if (imagePath === null) return response.status(400).send()
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
        const chainid = req.body.chainid
        if (!isValidChainId(chainid) || !isValidAddress(req.body.address, chainid)) {
            return response.status(400).send()
        }
        const address = req.body.address.toLowerCase()
        const armor = req.body.armor
        const { armors, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (armor !== null) {
                exist = await armors.getOwnerPropertyTokensLength(address, armor)
            }
            if (armor === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET armor=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, armor]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = previewImagePath(address, chainid)
                    if (imagePath === null) return response.status(400).send()
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
        const chainid = req.body.chainid
        if (!isValidChainId(chainid) || !isValidAddress(req.body.address, chainid)) {
            return response.status(400).send()
        }
        const address = req.body.address.toLowerCase()
        const weapon = req.body.weapon
        const { weapons, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (weapon !== null) {
                exist = await weapons.getOwnerPropertyTokensLength(address, weapon)
            }
            if (weapon === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET weapon=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, weapon]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = previewImagePath(address, chainid)
                    if (imagePath === null) return response.status(400).send()
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
        const chainid = req.body.chainid
        if (!isValidChainId(chainid) || !isValidAddress(req.body.address, chainid)) {
            return response.status(400).send()
        }
        const address = req.body.address.toLowerCase()
        const boot = req.body.boots
        const { boots, contract } = blockchainConfig(chainid)
        const busy = await contract.currentlyBusy(address)
        if (!busy) {
            let exist
            if (boot !== null) {
                exist = await boots.getOwnerPropertyTokensLength(address, boot)
            }
            if (boot === null || exist.toString() !== '0') {
                const res = await pgClient.query(
                    "UPDATE inventory SET boots=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                    [address, chainid, boot]
                )
                const inventory = res.rows[0]
                await createMixingPicture(address, chainid, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
                setTimeout(() => {
                    const imagePath = previewImagePath(address, chainid)
                    if (imagePath === null) return response.status(400).send()
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