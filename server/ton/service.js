import { Address, TonClient, WalletContractV4, internal } from "ton";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import dotenv from 'dotenv'
dotenv.config()

// Create Client
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

const contractAddress = Address.parse('EQBW4EpeaS-yyn1XnRCRC4--kF5WvhPS6u-vdEqNOl-9EvOD');

// Generate new key
let mnemonics = process.env.MNEMONIC_TON.split(' ',',') || await mnemonicNew();
let keyPair = await mnemonicToPrivateKey(mnemonics);

let workchain = 0; // Usually you need a workchain 0
let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
let walletContract = client.open(wallet);

(async () => {
	let { stack } = await client.callGetMethod(
		contractAddress, 
		'currentFights'
	);
    console.log(stack)
})().catch(e => console.error(e));


