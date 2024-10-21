import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { NftShop } from '../wrappers/NFTShop';
import { getDictForShop } from '../tests/data/shop';
dotenv.config()


export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse("EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t")
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress));
    await nftShop.send(
        provider.sender(),
        {
            value: toNano(0.05),
        },
        {
            $$type: 'SetPrices',
            prices: getDictForShop()
        }
    )
}
