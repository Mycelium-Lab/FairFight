import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
import { NftCollection } from '../wrappers/NFT';
import { NftShop } from '../wrappers/NFTShop';
import { Lootbox } from '../wrappers/Lootbox';
import { getDictForShop } from '../tests/data/shop';
import { getRarity, getRarityPercent } from '../tests/data/lootbox';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const lootboxPrice = toNano(10)
    const mnemonic = process.env.MNEMONIC || "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    const nftCollection = provider.open(await NftCollection.fromInit(
        provider.sender().address as Address,
        newContent,
        {
            $$type: "RoyaltyParams",
            numerator: 0n, // 350n = 35%
            denominator: 1000n,
            destination: provider.sender().address as Address,
        }
    ));
    await nftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    await provider.waitForDeploy(nftCollection.address);
    console.log(`NFT Collection deployed to: ${nftCollection.address}`)
}
