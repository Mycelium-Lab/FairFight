import { createHmac } from 'crypto';
import dotenv from 'dotenv'
import charactersJsons from '../../lib/jsons/characters.json' assert { type: "json" };
import armorsJsons from '../../lib/jsons/armors.json' assert { type: "json" };
import bootsJsons from '../../lib/jsons/boots.json' assert { type: "json" };
import weaponsJsons from '../../lib/jsons/weapons.json' assert { type: "json" };
dotenv.config()

async function sign(req, res) {
    try {
        //TODO CHECK TG INIT DATA
        //TODO CHECK IF ADDRESS TON EXIST AND IT IS VALID

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
            nftItem = { price: 10 } 
        }
        // Данные JSON
        const jsonData = `{
            "appId": "${process.env.AEON_APPID}",
            "callbackURL": "https://fairfight.fairprotocol.solutions/ton/aeon/callback",
            "redirectURL": "https://t.me/fairfights_bot?startapp",
            "customParam": "{\"botName\":\"FairFightBot\",\"orderDetail\":\"${nftItem.name}\"}",
            "merchantOrderNo": "ID БРАТЬ ИЗ СОЗДАННОГО postgres",
            "orderAmount": "${nftItem.price}",
            "payCurrency": "USD",
            "sign": "SIGN создать",
            "userId": "username брать из tgData"
        }`;

        // Преобразуем JSON в объект
        const resultMap = JSON.parse(jsonData);

        // Подписываем данные
        const secret = process.env.AEON_SECRET;
        const result = SHAEncrypt(resultMap, secret);
        console.log("Подпись:", result);

        // Добавляем подпись в объект и проверяем
        resultMap.sign = result;
        console.log("Верификация:", verifySHA(resultMap, secret));
    } catch (error) {
        
    }
}

// Функция для подписи данных с использованием SHA512
function SHAEncrypt(data, secret) {
    // Создаем строку из данных объекта для хеширования
    const dataString = Object.keys(data)
        .sort() // Сортировка ключей
        .map(key => `${key}=${data[key]}`)
        .join('&');
    
    // Создаем SHA512-хеш
    return createHmac('sha512', secret)
        .update(dataString)
        .digest('hex')
        .toUpperCase();
}

// Функция для проверки подписи
function verifySHA(data, secret) {
    const sign = data.sign;
    delete data.sign; // Удаляем поле "sign" для проверки
    const calculatedSign = SHAEncrypt(data, secret);
    return sign === calculatedSign;
}