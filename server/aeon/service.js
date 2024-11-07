import { createHash, createHmac } from 'crypto';
import dotenv from 'dotenv'
import charactersJsons from '../../lib/jsons/characters.json' assert { type: "json" };
import armorsJsons from '../../lib/jsons/armors.json' assert { type: "json" };
import bootsJsons from '../../lib/jsons/boots.json' assert { type: "json" };
import weaponsJsons from '../../lib/jsons/weapons.json' assert { type: "json" };
import { checkSignatureTG } from '../utils/utils.js';
import db from "../db/db.js"
import { Address, beginCell, internal, toNano } from 'ton-core';
import { TonClient, WalletContractV4 } from 'ton';
import { mnemonicToWalletKey } from 'ton-crypto';

const pgClient = db()
await pgClient.connect()

dotenv.config()

const mnemonic = process.env.MNEMONIC_TON || "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
const key = await mnemonicToWalletKey(mnemonic.split(" "));
const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
const tonClient = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC", apiKey: process.env.TONCENTER_KEY });
const walletContract = tonClient.open(wallet)
const shopAddress = Address.parse('EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t')

export async function sign(req, res) {
    try {
        const bodyInitData = req.body.initData
        const initDataURI = decodeURIComponent(bodyInitData)
        const initData = new URLSearchParams( initDataURI );
        initData.sort();
        const hash = initData.get( "hash" );
        const user = initData.get( "user" )
        const userObject = JSON.parse(user);
        const username = userObject.username
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
                    nftItem = armorsJsons[nftId]
                } else if (nftType == 2) {
                    nftItem = bootsJsons[nftId]
                } else if (nftType == 3) {
                    nftItem = weaponsJsons[nftId]
                } else if (nftType == 4) {
                    nftItem = { price: 10, name: 'Lootbox' } 
                }
                const wallet = chat.rows[0].player
                if (nftItem && nftItem.name && !isNaN(nftType) && !isNaN(nftId) && !isNaN(nftItem.price)) {
                    const aeon_order = await pgClient.query(
                        `
                        INSERT INTO aeon_orders 
                        (player_wallet, username, order_amount, finished, nft_name, nft_type, nft_id, created_at, sign, finished_at, fail_reason, order_no, order_status, nft_sended) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
                        `,
                        [ wallet, username, nftItem.price, false, nftItem.name, nftType, nftId, Date.now(), null, null, null, null, null, null ]
                    );                    
                    const aeon_order_id = aeon_order.rows[0].id        
                    // JSON data
                        // "customParam": "{\"botName\":\"FairFightBot\",\"orderDetail\":\"${nftItem.name}\"}",
                    const jsonData = `{
                        "appId": "${process.env.AEON_APPID}",
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
                        resultMap.callbackURL = 'https://fairfight.fairprotocol.solutions/aeon/callback'
                        resultMap.redirectURL = 'https://t.me/fairfights_bot?startapp'
                        resultMap.tgModel = 'MINIAPP'
                        console.log('resultMap', resultMap)
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
        console.error(error)
        res.status(500).send('something went wrong')
    }
}

export async function verifyCallback(req, res) {
    try {
        const callbackData = req.body
        console.log('VERIFY CALLBACK DATA', callbackData)
        if (callbackData.merchantOrderNo && callbackData.sign && callbackData.merchantOrderNo.trim() && callbackData.sign.trim()) {
            const merchantOrderNo = parseInt(callbackData.merchantOrderNo, 10)
            const aeon_order = await pgClient.query('SELECT * FROM aeon_orders WHERE id=$1', [ merchantOrderNo ] )
            console.log('AEON ORDER', aeon_order.rows)
            if (aeon_order.rows.length) {
                const aeon_order_data = aeon_order.rows[0]
                // const jsonData = `{
                //     "appId": "${process.env.AEON_APPID}",
                //     "callbackURL": "https://fairfight.fairprotocol.solutions/aeon/callback",
                //     "redirectURL": "https://t.me/fairfights_bot?startapp",
                //     "customParam": "{\"botName\":\"FairFightBot\",\"orderDetail\":\"${aeon_order_data.nft_name}\"}",
                //     "merchantOrderNo": "${callbackData.merchantOrderNo}",
                //     "orderAmount": "${aeon_order_data.order_amount}",
                //     "payCurrency": "USD",
                //     "userId": "${aeon_order_data.username}"
                // }`
                if (aeon_order_data.finished_at) {
                    console.log('AEON ORDER finished_at', aeon_order_data.finished_at)
                    res.status(200).send('success')
                } else {
                    const secret = process.env.AEON_SECRET
                    if (verifySignature(callbackData, secret)) {
                        if (callbackData.orderStatus == 'COMPLETED') {
                            const mintCell = beginCell()
                            .storeUint(0x5B907D9, 32)
                            .storeAddress(Address.parse(aeon_order_data.player_wallet))
                            .storeInt(aeon_order_data.nft_type, 257)
                            .storeInt(aeon_order_data.nft_id, 257)
                            .endCell()
                        
                            let nftSended = true
                            try {
                                await walletContract.sendTransfer({
                                    seqno: await walletContract.getSeqno(), // Получение seqno кошелька
                                    secretKey: key.secretKey,
                                    messages: [
                                        internal({
                                            to: shopAddress,  // Адрес смарт-контракта
                                            value: toNano("0.1"),  // Сумма отправляемая на контракт (обязательно >= минимального значения)
                                            body: mintCell,  // Сообщение с данными
                                            bounce: true,  // Возвращать средства, если ошибка
                                        })
                                    ]
                                })
                            } catch (error) {
                                console.error(error)
                                nftSended = false
                            }
                            console.log('NFT SENDED', nftSended)
                            await pgClient.query(
                                'UPDATE aeon_orders SET finished_at=$2, order_no=$3, order_status=$4, nft_sended=$5  WHERE id=$1', 
                                [ aeon_order_data.id, Date.now(), callbackData.orderNo, callbackData.orderStatus, nftSended ]
                            )
                            console.log('SUCCESS AEON', callbackData)
                            res.status(200).send('success')
                        } else if (callbackData.orderStatus == 'CLOSE') {
                            await pgClient.query(
                                'UPDATE aeon_orders SET finished_at=$2, order_no=$3, order_status=$4, nft_sended=$5, fail_reason=$6  WHERE id=$1', 
                                [ aeon_order_data.id, Date.now(), callbackData.orderNo, callbackData.orderStatus, false, callbackData.failReason ]
                            )
                            console.log('CLOSE AEON', callbackData)
                            res.status(200).send('success')
                        } else {
                            console.log('NO CONTENT AEON', callbackData)
                            res.status(204).send('no content')
                        }
                    } else {
                        console.log('WRONG SIGN AEON', callbackData)
                        res.status(401).send('wrong sign')
                    }
                }
            } else {
                res.status(404).send('order not found')
            }
        } else {
            res.status(400).send('no merchantOrderNo or sign')
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('something went wrong')
    }
}

// SHA512
function SHAEncrypt(data, secret) {
    let dataString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('&');
    
    dataString = dataString + `&key=${secret}`
    
    return createHash('sha512')
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

function generateSignature(params, secretKey) {
    // Список параметров, которые участвуют в подписи согласно документации
    const requiredParams = [
        'orderNo', 'orderStatus', 'userId', 'merchantOrderNo',
        'orderCurrency', 'orderAmount', 'payCryptoRate', 'payFiatRate',
        'payCryptoCurrency', 'payCryptoVolume', 'payCryptoNetwork',
        'hxAddress', 'failReason', 'fee'
    ];

    // Фильтруем параметры: оставляем только нужные, исключаем `null` и `sign`
    const filteredParams = Object.keys(params)
        .filter(key => requiredParams.includes(key) && params[key] !== null)
        .sort() // Сортируем ключи по алфавиту
        .map(key => `${key}=${params[key]}`) // Преобразуем в формат key=value
        .join('&'); // Объединяем с `&`

    // Добавляем секретный ключ в конце строки
    const stringToSign = `${filteredParams}&key=${secretKey}`;

    // Генерируем SHA-512 подпись
    return createHash('sha512').update(stringToSign).digest('hex').toUpperCase();
}

// Функция для верификации подписи
function verifySignature(params, secretKey) {
    const generatedSign = generateSignature(params, secretKey);
    return generatedSign === params.sign;
}