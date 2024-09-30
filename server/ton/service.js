import { Address, Dictionary, TonClient, TupleBuilder, WalletContractV4, beginCell, internal, toNano } from "ton";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
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
const pgClient = db()
await pgClient.connect()

dotenv.config()

const isTest = true
// Create Client
const client = isTest ? new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v3/jsonRPC',
    apiKey: process.env.TONCENTER_TEST_KEY
}) : new TonClient({
    endpoint: 'https://toncenter.com/api/v3/jsonRPC',
    apiKey: process.env.TONCENTER_KEY
});

const contractAddressTest = Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ');
const contractAddress = Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ')
const nftAddress = Address.parse('EQC2QSCpztK-_WJoaeYUMsDzs6F-1dGvtOphtKS3_y7gcfn4')

// Generate new key
let mnemonics = process.env.MNEMONIC_TON.split(' ',',') || await mnemonicNew();
let keyPair = await mnemonicToPrivateKey(mnemonics);

let workchain = 0;
// let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
// let walletContract = client.open(wallet);

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

        return {
            id: _id,
            owner: _owner,
            createTime: _createTime,
            finishTime: _finishTime,
            baseAmount: _baseAmount,
            amountPerRound: _amountPerRound,
            rounds: _rounds,
            maxPlayersAmount: _maxPlayersAmount,
            players: _players
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

export async function getFights() {
    try {
        let { stack } = await client.runMethod(isTest ? contractAddressTest : contractAddress, 'currentFights');
        let cellOpt = stack.readCellOpt();

        if (cellOpt) {
            let dict = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), {
                serialize: function () {},
                parse: function (cs) {
                    return loadFight(cs);  
                },
            }, cellOpt);

            const dictArr = dictionaryToObject(dict)
            return dictArr
        } else {
            return []
        }
    } catch (e) {
        console.error(e);
    }
}

export async function getInventory(req, response) {
    try {
        const address = req.body.address
        const nfts = await getUserNfts(address)
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
            [address.toLowerCase()]
        )
        if (res.rows.length === 0) {
            await createMixingPicture(address.toLowerCase(), 0, 0, undefined, undefined, undefined)
            await pgClient.query(
                "INSERT INTO inventory (player, chainid, characterid) VALUES($1, $2, $3)",
                [address.toLowerCase(), 0, 0]
            )
            response.status(200).json({
                address, chainid: 0, characterid:0, nfts
            })
        } else {
            await createMixingPicture(address.toLowerCase(), 0, res.rows[0].characterid, res.rows[0].armor, res.rows[0].boots, res.rows[0].weapon)
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
                console.log('here')
                v.type = 'characters'
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.characters}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const characterData = charactersJsons[id]
                const character = {
                    id,
                    image: `/media/characters/${id}.png`,
                    name: characterData.name,
                    attributes: characterData.attributes,
                    description: characterData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return character
            } else if (v.content.uri.includes(nftIpfsHashes.armors)) {
                v.type = 'armors'
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.armors}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const armorsData = armorsJsons[id]
                const armors = {
                    id,
                    image: `/media/armors/${id}.png`,
                    name: armorsData.name,
                    attributes: armorsData.attributes,
                    collection: armorsData.attributes[1].value,
                    description: armorsData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return armors
            } else if (v.content.uri.includes(nftIpfsHashes.boots)) {
                v.type = 'boots'
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.boots}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const bootsData = bootsJsons[id]
                const boots = {
                    id,
                    image: `/media/boots/${id}.png`,
                    name: bootsData.name,
                    attributes: bootsData.attributes,
                    collection: bootsData.attributes[1].value,
                    description: bootsData.description,
                    address: resultJson.address_book[`${v.address}`].user_friendly
                }
                return boots
            } else if (v.content.uri.includes(nftIpfsHashes.weapons)) {
                v.type = 'weapons'
                const url = v.content.uri
                const searchString = `${nftIpfsHashes.weapons}/`;
                const jsonExtension = '.json';
                const startIndex = url.indexOf(searchString) + searchString.length;
                const endIndex = url.indexOf(jsonExtension, startIndex);
                const id = parseInt(url.slice(startIndex, endIndex));

                const weaponsData = weaponsJsons[id]
                const weapons = {
                    id,
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

// (async () => {
//     try {
//         let builder = new TupleBuilder();
//         builder.writeNumber(BigInt(2));
//         builder.writeAddress(Address.parse("EQArx7VGkRVmKKHA1mQUpbRa1ob9xm_iZsljFMkipj61GotQ"));
//         let { stack } = await client.runMethod(contractAddress, 'currentFightPlayerClaimed', builder.build());
//         console.log(stack)
        
//     } catch (error) {
//         console.log(error)
//     }
// })()