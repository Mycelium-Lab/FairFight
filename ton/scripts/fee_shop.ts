import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { NftShop } from '../wrappers/NFTShop';


export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse('EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t')
    const newCollector: Address = Address.parse('UQDjySDtOVRXck1g71zg5_HtGVOlo5arVIRfPpi8xz7oW1NA') 
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress));
    await nftShop.send(
        provider.sender(),
        {
            value: toNano(0.05),
        },
        {
            $$type: 'SetFeeCollector',
            feeCollector: newCollector
        }
    )
}
