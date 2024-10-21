import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { NftShop } from '../wrappers/NFTShop';
dotenv.config()


export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse("EQAGQw6jbA4dCNreyd49rB5ztAPslr487KRxXed-Dzd_lXv9")
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress));
    await nftShop.send(
        provider.sender(),
        {
            value: toNano('0.11') + toNano(0.1),
        },
        {
            $$type: 'Buy',
            nftType: 0n,
            nftItem: 0n
        }
    )
}
