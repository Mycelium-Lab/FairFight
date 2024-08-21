import { Address, Dictionary, TonClient, TupleBuilder, WalletContractV4, beginCell, internal, toNano } from "ton";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import dotenv from 'dotenv'
dotenv.config()

// Create Client
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

const contractAddress = Address.parse('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ');

// Generate new key
let mnemonics = process.env.MNEMONIC_TON.split(' ',',') || await mnemonicNew();
let keyPair = await mnemonicToPrivateKey(mnemonics);

let workchain = 0;
// let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
// let walletContract = client.open(wallet);

function loadFight(slice) {
    try {
        let sc = slice.loadRef().beginParse()
        let _id = sc.loadIntBig(257);
        let _owner = sc.loadAddress();
        let _createTime = sc.loadIntBig(257);
        let sc_0 = sc.loadRef().beginParse();
        let _finishTime = sc_0.loadIntBig(257);
        let _baseAmount = sc_0.loadCoins();
        console.log(_id, _owner, _createTime, _finishTime, _baseAmount)

        // let sc_1 = sc.loadRef().beginParse();
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
        let { stack } = await client.runMethod(contractAddress, 'currentFights');
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
