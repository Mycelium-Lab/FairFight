import { Address, beginCell, internal, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { FairFight } from '../wrappers/FairFight';
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const mnemonic = process.env.MNEMONIC || "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const fairFightAddress: Address = Address.parse("EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ")
    const feeCollector: Address = Address.parse("UQDjySDtOVRXck1g71zg5_HtGVOlo5arVIRfPpi8xz7oW1NA")
    const walletContract = provider.open(wallet)
    const feeCell = beginCell()
        .storeUint(723028610, 32)
        .storeAddress(feeCollector)
        .endCell()
    await walletContract.sendTransfer({
        seqno: await walletContract.getSeqno(), // Получение seqno кошелька
        secretKey: key.secretKey,
        messages: [
            internal({
                to: fairFightAddress,  // Адрес смарт-контракта
                value: toNano("0.05"),  // Сумма отправляемая на контракт (обязательно >= минимального значения)
                body: feeCell,  // Сообщение с данными
                bounce: true,  // Возвращать средства, если ошибка
            })
        ]
    });
}
