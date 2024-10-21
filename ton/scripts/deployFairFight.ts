import { toNano } from '@ton/core';
import { FairFight } from '../wrappers/FairFight';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const mnemonic = process.env.MNEMONIC || "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const fairFight = provider.open(await FairFight.fromInit(
        wallet.address,
        BigInt('0x' + Buffer.from(wallet.publicKey).toString("hex")),
        wallet.address,
        BigInt(500),
        BigInt(5),
        BigInt(10),
        BigInt(100)
    ));
    await fairFight.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(fairFight.address);

    console.log(`FairFight deployed to: ${fairFight.address}`)
}
