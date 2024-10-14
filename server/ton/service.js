import { Address, beginCell, Cell, Dictionary, internal, toNano, TonClient, WalletContractV4 } from "ton";
import { fileURLToPath } from 'url';
import path from "path";
import dotenv from 'dotenv'
import charactersJsons from '../../lib/jsons/characters.json' assert { type: "json" };
import armorsJsons from '../../lib/jsons/armors.json' assert { type: "json" };
import bootsJsons from '../../lib/jsons/boots.json' assert { type: "json" };
import weaponsJsons from '../../lib/jsons/weapons.json' assert { type: "json" };

import { createMixingPicture } from '../../mixing/mixing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "../db/db.js"
import { appState, appStateTypes } from "../utils/appState.js";
import { checkSignatureTG } from "../utils/utils.js";
import { mnemonicToWalletKey } from "ton-crypto";
import { bot } from "../f2p/service.js";
import { playersToNotify } from "../constants/constants.js";
const pgClient = db()
await pgClient.connect()

dotenv.config()

const isTest = false

const contractAddressTest = Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ');
const contractAddress = Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ')
const nftAddress = Address.parse('EQC2QSCpztK-_WJoaeYUMsDzs6F-1dGvtOphtKS3_y7gcfn4')
const shopAddress = Address.parse('EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t')

const mnemonic = process.env.MNEMONIC_TON || "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
const key = await mnemonicToWalletKey(mnemonic.split(" "));
const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
const tonClient = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC", apiKey: process.env.TONCENTER_KEY });
const walletContract = tonClient.open(wallet)

const nftIpfsHashes = {
    characters: "QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T",
    armors: "QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci",
    boots: "QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE",
    weapons: "QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV"
}

function loadFight(slice) {
    try {
        let sc = slice.loadRef().beginParse()
        let _id = sc.loadIntBig(257);
        let _owner = sc.loadAddress();
        let _createTime = sc.loadIntBig(257);

        let sc_0 = sc.loadRef().beginParse();
        let _finishTime = sc_0.loadIntBig(257);
        let _baseAmount = sc_0.loadCoins();
        let _amountPerRound = sc_0.loadCoins();
        let _rounds = sc_0.loadIntBig(257);
        let _maxPlayersAmount = sc_0.loadIntBig(257);

        let _players = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_0);

        let sc_1 = sc_0.loadRef().beginParse()
        let _playersCurrentLength = sc_1.loadIntBig(257);
        let _playersClaimed = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_1);

        return {
            id: _id,
            owner: _owner,
            createTime: _createTime,
            finishTime: _finishTime,
            baseAmount: _baseAmount,
            amountPerRound: _amountPerRound,
            rounds: _rounds,
            maxPlayersAmount: _maxPlayersAmount,
            players: _players,
            playersCurrentLength: _playersCurrentLength,
            playersClaimed: _playersClaimed
        };
    } catch (error) {
        console.error('Error parsing Fight:', error);
        throw error;
    }
}

function dictionaryToObject(dictionary) {
    let result = [];
    dictionary._map.forEach((value, key) => {
        let parsedValue = value;
        if (parsedValue.players) {
            parsedValue.players = dictionaryToObject(parsedValue.players)
        }
        result.push(parsedValue)
    });

    return result;
}

function fightPlayersToPlayersClaimed(fight) {
    let playersClaimed = {}
    fight.players.forEach((player, index) => {
        playersClaimed[`${player}`] = fight.playersClaimed[index]
    })
    fight.playersClaimed = playersClaimed
    return fight
}

export async function getFights() {
    try {
        const result = await fetch(`${isTest ? 'https://testnet.toncenter.com/api/v3/runGetMethod' : 'https://toncenter.com/api/v3/runGetMethod'}`, {
            "headers": {
              "accept": "application/json",
              "content-type": "application/json",
            },
            "body": `{\n  \"address\": \"${isTest ? contractAddressTest : contractAddress}\",\n  \"method\": \"currentFights\"\n}`,
            "method": "POST"
        });

        const stack = await result.json()

        // Превращаем stack value в Cell
        let cellOpt = Cell.fromBoc(Buffer.from(stack.stack[0].value, 'base64'))[0];
        if (cellOpt) {
            let dict = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), {
                serialize: function () {},
                parse: function (cs) {
                    return loadFight(cs);  
                },
            }, cellOpt);

            let dictArr = dictionaryToObject(dict)
            dictArr = dictArr.map(fight => {
                let playersClaimed = {}
                if (fight.playersClaimed._map) {
                    fight.playersClaimed._map.forEach(
                        (value, key) => {
                            playersClaimed[`${key.split(':')[1].toString()}`] = value
                        }
                    )
                    fight.playersClaimed = playersClaimed
                }
                return fight
            })
            return dictArr
        } else {
            return []
        }
    } catch (e) {
        if (!e.toString().includes('Error: Index 0 > 0 is out of bounds') || !e.toString().includes('TypeError: Cannot read properties of undefined')) {
            console.log(e)
        }
        return []
    }
}

export async function getInventory(req, response) {
    try {
        const address = req.body.address
        let nfts = []
        if (!req.body.notnft) {
            nfts = await getUserNfts(address)
        }
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
                WHERE player=$1 AND chainid=0
            `,
            [address]
        )
        if (res.rows.length === 0) {
            await createMixingPicture(address, 0, 0, undefined, undefined, undefined)
            await pgClient.query(
                "INSERT INTO inventory (player, chainid, characterid) VALUES($1, $2, $3)",
                [address, 0, 0]
            )
            response.status(200).json({
                address, chainid: 0, characterid:0, nfts
            })
        } else {
            await createMixingPicture(address, 0, res.rows[0].characterid, res.rows[0].armor, res.rows[0].boots, res.rows[0].weapon)
            let data = res.rows[0]
            data.nfts = nfts
            response.status(200).json(data)
        }
    } catch (error) {
        console.log(error)
        response.status(500).json({})
    }
}

export async function getUserNfts(owner) {
    try {
        const result = await fetch(`https://toncenter.com/api/v3/nft/items?owner_address=${owner}&collection_address=${nftAddress}&limit=10&offset=0`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
              "priority": "u=1, i",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-api-key": process.env.TONCENTER_KEY,
            },
            "body": null,
            "method": "GET"
        });
        const resultJson = await result.json()
        let items = resultJson.nft_items
        items = items.map(v => {
            if (v.content.uri.includes(nftIpfsHashes.characters)) {
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.characters}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const characterData = charactersJsons[id]
                const character = {
                    id: id + 1,
                    type: 'characters',
                    image: `/media/characters/${id+1}.png`,
                    name: characterData.name,
                    attributes: characterData.attributes,
                    description: characterData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return character
            } else if (v.content.uri.includes(nftIpfsHashes.armors)) {
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.armors}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const armorsData = armorsJsons[id]
                const armors = {
                    id,
                    type: 'armors',
                    image: `/media/armors/${id}.png`,
                    name: armorsData.name,
                    attributes: armorsData.attributes,
                    collection: armorsData.attributes[1].value,
                    description: armorsData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return armors
            } else if (v.content.uri.includes(nftIpfsHashes.boots)) {
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.boots}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const bootsData = bootsJsons[id]
                const boots = {
                    id,
                    type: 'boots',
                    image: `/media/boots/${id}.png`,
                    name: bootsData.name,
                    attributes: bootsData.attributes,
                    collection: bootsData.attributes[1].value,
                    description: bootsData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return boots
            } else if (v.content.uri.includes(nftIpfsHashes.weapons)) {
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.weapons}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const weaponsData = weaponsJsons[id]
                const weapons = {
                    id,
                    type: 'weapons',
                    image: `/media/weapons/${id}.png`,
                    name: weaponsData.name,
                    attributes: weaponsData.attributes,
                    collection: weaponsData.attributes[1].value,
                    description: weaponsData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return weapons
            }
        })
        return items
    } catch (error) {
        console.log(error)
        return []
    }
}

//TODO заменить setTimeOut на приличное что-то
export async function setCharacter(req, response) {
    try {
        const address = req.body.address
        const nftItemAddress = req.body.nftAddress
        const characterid = req.body.characterid
        let items = []
        if (characterid != 0) {
            const result = await fetch(`https://toncenter.com/api/v3/nft/items?address=${nftItemAddress}&owner_address=${address}&collection_address=${nftAddress}&limit=1&offset=0`, {
                "headers": {
                  "accept": "application/json",
                  "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
                  "priority": "u=1, i",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-api-key": process.env.TONCENTER_KEY,
                },
                "body": null,
                "method": "GET"
            });
            const resultJson = await result.json()
            items = resultJson.nft_items
        }
        if (items.length > 0 || characterid == 0) {
            const res = await pgClient.query(
                "UPDATE inventory SET characterid=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                [address, 0, characterid]
            )
            const inventory = res.rows[0]
            //create mixing picture
            await createMixingPicture(address, 0, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
            setTimeout(() => {
                const imagePath = path.join(__dirname, `../../media/characters/players_preview`, `${address}_${0}.png`)
                response.status(200).sendFile(imagePath)
            }, 2500)
        } else {
            response.status(401).send('Not exist')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}

export async function setArmor(req, response) {
    try {
        const address = req.body.address
        const nftItemAddress = req.body.nftAddress
        const armor = req.body.armor
        const result = await fetch(`https://toncenter.com/api/v3/nft/items?address=${nftItemAddress}&owner_address=${address}&collection_address=${nftAddress}&limit=1&offset=0`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
              "priority": "u=1, i",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-api-key": process.env.TONCENTER_KEY,
            },
            "body": null,
            "method": "GET"
        });
        const resultJson = await result.json()
        let items = resultJson.nft_items
        if (items.length > 0) {
            const res = await pgClient.query(
                "UPDATE inventory SET armor=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                [address, 0, armor]
            )
            const inventory = res.rows[0]
            await createMixingPicture(address, 0, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
            setTimeout(() => {
                const imagePath = path.join(__dirname, `../../media/characters/players_preview`, `${address}_${0}.png`)
                response.status(200).sendFile(imagePath)
            }, 2500)
        } else {
            response.status(401).send('Not exist')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}
export async function setWeapon(req, response) {
    try {
        const address = req.body.address
        const nftItemAddress = req.body.nftAddress
        const weapon = req.body.weapon
        const result = await fetch(`https://toncenter.com/api/v3/nft/items?address=${nftItemAddress}&owner_address=${address}&collection_address=${nftAddress}&limit=1&offset=0`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
              "priority": "u=1, i",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-api-key": process.env.TONCENTER_KEY,
            },
            "body": null,
            "method": "GET"
        });
        const resultJson = await result.json()
        let items = resultJson.nft_items
        if (items.length > 0) {
            const res = await pgClient.query(
                "UPDATE inventory SET weapon=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                [address, 0, weapon]
            )
            const inventory = res.rows[0]
            await createMixingPicture(address, 0, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
            setTimeout(() => {
                const imagePath = path.join(__dirname, `../../media/characters/players_preview`, `${address}_${0}.png`)
                response.status(200).sendFile(imagePath)
            }, 2500)
        } else {
            response.status(401).send('Not exist')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}
export async function setBoots(req, response) {
    try {
        const address = req.body.address
        const nftItemAddress = req.body.nftAddress
        const boot = req.body.boots
        const result = await fetch(`https://toncenter.com/api/v3/nft/items?address=${nftItemAddress}&owner_address=${address}&collection_address=${nftAddress}&limit=1&offset=0`, {
            "headers": {
              "accept": "application/json",
              "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
              "priority": "u=1, i",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-api-key": process.env.TONCENTER_KEY,
            },
            "body": null,
            "method": "GET"
        });
        const resultJson = await result.json()
        let items = resultJson.nft_items
        if (items.length > 0) {
            const res = await pgClient.query(
                "UPDATE inventory SET boots=$3 WHERE player=$1 AND chainid=$2 RETURNING *",
                [address, 0, boot]
            )
            const inventory = res.rows[0]
            await createMixingPicture(address, 0, inventory.characterid, inventory.armor, inventory.boots, inventory.weapon)
            setTimeout(() => {
                const imagePath = path.join(__dirname, `../../media/characters/players_preview`, `${address}_${0}.png`)
                response.status(200).sendFile(imagePath)
            }, 2500)
        } else {
            response.status(401).send('Not exist')
        }
    } catch (error) {
        console.log(error)
        response.status(500).send()
    }
}


export async function setChatId(req, res) {
    try {
        if (appState == appStateTypes.prod) {
            //chat id from initdata
            const initDataURI = decodeURIComponent(req.body.initData)
            const initData = new URLSearchParams( initDataURI );
            initData.sort();
            const hash = initData.get( "hash" );
            initData.delete( "hash" );
            const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
            const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
            if (!checkerTG) {
                res.status(401).send('wrong tg init data')
            } else {
                await pgClient.query(
                    `
                    INSERT INTO tg_chats (chat_id, username)
                    VALUES ($1, $2)
                    ON CONFLICT (chat_id) 
                    DO NOTHING;
                    `,
                    [ req.body.chatid, req.body.username ]
                )
                res.status(200).send('setted')
            }
        } else {
            res.status(200).send('setted (test)')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

export async function setMap(req, res) {
    try {
        const map = req.body.map
        const player = req.body.address
        if (!(map >= 0 && map <= 4)) {
            res.status(400).send('wrong map')
        } else {
            await pgClient.query(
                `
                INSERT INTO last_map_ton (player, map)
                VALUES ($1, $2)
                ON CONFLICT (player) 
                DO UPDATE SET map = $2;
                `,
                [ player, map ]
              )
              res.status(200).send('setted')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

export async function mintNFT(req, res) {
    try {
        if (appState == appStateTypes.prod) {
            const initDataURI = decodeURIComponent(req.body.initData)
            const initData = new URLSearchParams( initDataURI );
            initData.sort();
            const hash = initData.get( "hash" );
            initData.delete( "hash" );
            const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
            const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
            if (!checkerTG) {
                res.status(401).send('wrong tg init data')
            } else {
                //TAKE ADDRESS FROM POSTGRES
                const username = req.body.username
                const address = req.body.address
                const responsePg = await pgClient.query(`SELECT * FROM board_f2p WHERE player = $1`, [username])
                if (responsePg.rows.length === 0) {
                    res.status(401).send('no such player')
                } else {
                    if (responsePg.rows[0].tokens >= 150) {
                        const src = getRandomNftToMint()
                        console.log(address, src.nftType, src.nftId)
                        const mintCell = beginCell()
                            .storeUint(0x5B907D9, 32)
                            .storeAddress(Address.parse(address))
                            .storeInt(src.nftType, 257)
                            .storeInt(src.nftId, 257)
                            .endCell()
                            
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
                        });
                        await pgClient.query(`UPDATE board_f2p SET tokens = tokens - 150 WHERE player = $1`, [username])
                        res.status(200).send('Success')
                    } else {
                        res.status(401).send('not enough tokens')
                    }
                }
            }
        } else {
            res.status(401).send('(test nft)')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

export async function setAddress(req, res) {
    try {
        if (appState == appStateTypes.prod) {
            const chat_id = req.body.chatid
            const username = req.body.username
            const address = req.body.address
            const initDataURI = decodeURIComponent(req.body.initData)
            const initData = new URLSearchParams( initDataURI );
            initData.sort();
            const hash = initData.get( "hash" );
            initData.delete( "hash" );
            const dataToCheck = [...initData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );
            const checkerTG = checkSignatureTG(process.env.TG_BOT_KEY, hash, dataToCheck)
            if (!checkerTG) {
                res.status(401).send('wrong tg init data')
            } else {
                await pgClient.query(
                    `
                    UPDATE tg_chats SET player = $1
                    WHERE chat_id = $2 AND username = $3
                    `,
                    [ address, chat_id, username ]
                )
                res.status(200).send('setted')
            }
        } else {
            res.status(200).send('setted (test)')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}

function getRandomNftToMint() {
    const nftTypeToArrayOfNftIds = {
        '1': [0, 12, 13, 17, 22, 25, 27, 29],
        '2': [0, 8],
        '3': [0, 1, 23, 33, 41, 65, 71, 72, 85, 86, 88, 89, 90, 91, 93, 94, 97, 113, 116, 117, 119]
    }
    const nftType = Math.floor(Math.random() * 3) + 1
    const arrayFromType = nftTypeToArrayOfNftIds[`${nftType}`]
    const randomNft = Math.floor(Math.random() * arrayFromType.length)
    const nftId = arrayFromType[randomNft]
    return {nftType, nftId}
}

async function checkNewFights() {
    try {
        const fights = await getFights();
        const fightIds = fights.map(v => parseInt(v.id, 10)); // Преобразование id в целые числа

        const checkQuery = `
            SELECT games.gameid, n.notified
            FROM UNNEST($1::int[]) AS games(gameid)
            LEFT JOIN new_games_notifications AS n
            ON games.gameid = n.gameid;
        `;

        const checkResult = await pgClient.query(checkQuery, [fightIds]); // Передаем массив fightIds
        let notNotifiedFights = checkResult.rows.filter(v => !v.notified);
        let notifiedFights = checkResult.rows.filter(v => v.notified);

        for (let i = 0; i < notNotifiedFights.length; i++) {
            const fight = fights.find(v => v.id.toString() === notNotifiedFights[i].gameid.toString())
            const fightOwner = fight.owner.toString() 
            for (let j = 0; j < playersToNotify.length; j++) {
                bot.sendMessage(playersToNotify[j], `${fightOwner} have created fight (id: ${fight.id.toString()})`)
                // await pgClient.query(`INSERT INTO notified_players (gameid, player) VALUES ($1, $2)`, [parseInt(fight.id), playersToNotify[j]])
            }
            // const fightOwnerChat = await pgClient.query(`SELECT * FROM tg_chats WHERE player = $1`, [ fightOwner ])  
            // if (fightOwnerChat.rows.length > 0) {
            //     const chat = fightOwnerChat.rows[0]
            //     bot.sendMessage(chat.chat_id, `You have created fight (id: ${fight.id.toString()})`)
            //     await pgClient.query(`INSERT INTO notified_players (gameid, player) VALUES ($1, $2)`, [parseInt(fight.id), fightOwner])
            // }
        }

        for (let i = 0; i < notifiedFights.length; i++) {
            const fight = fights.find(v => v.id.toString() === notifiedFights[i].gameid.toString())
            const fightOwner = fight.owner.toString() 
            const fightPlayers = fight.players.map(v => v.toString())
            for (let j = 0; j < fightPlayers.length; j++) {
                if (fightPlayers[j] == fightOwner) {
                    continue
                } else {
                    const notified = await pgClient.query(`SELECT * FROM notified_players WHERE player = $1 AND gameid = $2`, [fightPlayers[j], parseInt(fight.id)])
                    if (notified.rows.length === 0) {
                        // const chat = await pgClient.query(`SELECT * FROM tg_chats WHERE player = $1`, [ fightPlayers[j] ])
                        // const fightOwnerChat = await pgClient.query(`SELECT * FROM tg_chats WHERE player = $1`, [ fightOwner ])  
                        for (let k = 0; k < playersToNotify.length; k++) {
                            bot.sendMessage(playersToNotify[k], `Player (address: ${createShortAddress(fightPlayers[j])}) joined your fight (id: ${fight.id.toString()})`)
                        }
                        // if (chat.rows.length > 0) {
                        //     const chatId = chat.rows[0].chat_id
                        //     bot.sendMessage(chatId, `You have joined fight (id: ${fight.id.toString()}, owner: ${createShortAddress(fightOwner)})`)
                        // }
                        await pgClient.query(`INSERT INTO notified_players (gameid, player) VALUES ($1, $2)`, [parseInt(fight.id), fightPlayers[j]])
                    }
                }
            } 
        }

        const insertQuery = `
            INSERT INTO new_games_notifications (gameid, notified)
            SELECT games.gameid, TRUE
            FROM UNNEST($1::int[]) AS games(gameid)
            LEFT JOIN new_games_notifications AS n
            ON games.gameid = n.gameid
            WHERE n.gameid IS NULL;
        `;

        await pgClient.query(insertQuery, [fightIds]); // Передаем массив fightIds
    } catch (error) {
        console.error('Error:', error);
    }
}

function createShortAddress(address) {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
}

if (appState === appStateTypes.prod) {
    setInterval(async () => {
        await checkNewFights()
    }, 1000 * 60) 
}