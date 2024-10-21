import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { NftShop } from '../wrappers/NFTShop';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse("EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t")
    const lootboxAddress: Address = Address.parse("EQBXWhVM_hfYqA9rOidDnGaCBLQ1Hb4bvC6o0Si4brYybo5H")
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress));
    await nftShop.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'SetAllowedMint',
            minter: lootboxAddress,
            allowed: true
        }
    )
}
