import { createHmac } from 'crypto';
import dotenv from 'dotenv'
import charactersJsons from '../../lib/jsons/characters.json' assert { type: "json" };
import armorsJsons from '../../lib/jsons/armors.json' assert { type: "json" };
import bootsJsons from '../../lib/jsons/boots.json' assert { type: "json" };
import weaponsJsons from '../../lib/jsons/weapons.json' assert { type: "json" };
import { checkSignatureTG } from '../utils/utils';
import db from "../db/db.js"

const pgClient = db()
await pgClient.connect()

dotenv.config()

export async function sign(req, res) {
    try {
        const bodyInitData = req.body.initData
        const initDataURI = decodeURIComponent(bodyInitData)
        const initData = new URLSearchParams( initDataURI );
        initData.sort();
        const hash = initData.get( "hash" );
        const username = initData.get( "username" )
        initData.delete( "hash" );
        const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
        const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
        if (!checkerTG) {
            res.status(401).send('wrong tg init data')
        } else {
            const chat = await pgClient.query('SELECT * FROM tg_chats WHERE username = $1', [username])
            if (!chat.rows.length) {
                res.status(401).send('you dont have ton address')
            } else {
                // --  nft_type: 0 - character, 1 - weapon, 2 - armors, 3 - boots, 4 - lootbox
                // --  nft_id: if lootbox - 0, others by order
                let nftType = req.body.nftType
                let nftId = req.body.nftId
                let nftItem = null
                if (nftType == 0) {
                    nftItem = charactersJsons[nftId]
                } else if (nftType == 1) {
                    nftItem = weaponsJsons[nftId]
                } else if (nftType == 2) {
                    nftItem = armorsJsons[nftId]
                } else if (nftType == 3) {
                    nftItem = bootsJsons[nftId]
                } else if (nftType == 4) {
                    nftItem = { price: 10, name: 'Lootbox' } 
                }
                const wallet = chat.rows[0].player
                if (nftItem && nftItem.name && !isNaN(nftType) && !isNaN(nftId) && !isNaN(nftItem.price)) {
                    const aeon_order = await pgClient.query(
                        `
                        INSERT INTO aeon_orders 
                        ( player_wallet, username, order_amount, finished, nft_type, nft_id, created_at ) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                        `,
                        [ wallet,  username, nftItem.price, false, nftType, nftId, Date.now() ]
                    )
                    const aeon_order_id = aeon_order.rows[0].id        
                    // JSON data
                    const jsonData = `{
                        "appId": "${process.env.AEON_APPID}",
                        "callbackURL": "https://fairfight.fairprotocol.solutions/aeon/callback",
                        "redirectURL": "https://t.me/fairfights_bot?startapp",
                        "customParam": "{\"botName\":\"FairFightBot\",\"orderDetail\":\"${nftItem.name}\"}",
                        "merchantOrderNo": "${aeon_order_id}",
                        "orderAmount": "${nftItem.price}",
                        "payCurrency": "USD",
                        "userId": "${username}"
                    }`;
                    // JSON to Object
                    const resultMap = JSON.parse(jsonData);
                    // Signing data
                    const secret = process.env.AEON_SECRET;
                    const result = SHAEncrypt(resultMap, secret);
                    // Add sign to Object and verify
                    resultMap.sign = result;
                    if (verifySHA({ ...resultMap }, secret)) {
                        await pgClient.query('UPDATE aeon_orders SET sign=$1 WHERE id=$2', [ result, aeon_order_id ])
                        res.status(200).json(resultMap)
                    } else {
                        await pgClient.query(`DELETE FROM aeon_orders WHERE id=$1`, [ aeon_order_id ])
                        res.status(401).send('wrong sign verification')
                    }
                } else {
                    res.status(404).send('nft item not found')
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('something went wrong')
    }
}

// SHA512
function SHAEncrypt(data, secret) {
    const dataString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('&');
    
    return createHmac('sha512', secret)
        .update(dataString)
        .digest('hex')
        .toUpperCase();
}

function verifySHA(data, secret) {
    const sign = data.sign;
    delete data.sign; 
    const calculatedSign = SHAEncrypt(data, secret);
    return sign === calculatedSign;
}