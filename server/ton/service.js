import { Address, Dictionary, TonClient, TupleBuilder, WalletContractV4, beginCell, internal, toNano } from "ton";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import dotenv from 'dotenv'
dotenv.config()

// Create Client
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

const contractAddress = Address.parse('EQA2Amn-QDbPaxqY4DIerGDiGdTLwOmWTXMqLgaajAHvet9v');

// Generate new key
let mnemonics = process.env.MNEMONIC_TON.split(' ',',') || await mnemonicNew();
let keyPair = await mnemonicToPrivateKey(mnemonics);

let workchain = 0;
// let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
// let walletContract = client.open(wallet);

function loadFight(slice) {
    try {
        let sc = slice.loadRef().beginParse()
        let _owner = sc.loadAddress();
        let _createTime = sc.loadIntBig(257);
        let _finishTime = sc.loadIntBig(257);
        let _baseAmount = sc.loadCoins();

        let sc_1 = sc.loadRef().beginParse();
        let _amountPerRound = sc_1.loadCoins();
        let _rounds = sc_1.loadIntBig(257);
        let _maxPlayersAmount = sc_1.loadIntBig(257);

        let _players = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);

        return {
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

(async () => {
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

            const dictObj = dictionaryToObject(dict)
            console.log(dictObj)
        } else {
            console.error("No cell returned from stack.");
        }
    } catch (e) {
        console.error(e);
    }
})();
