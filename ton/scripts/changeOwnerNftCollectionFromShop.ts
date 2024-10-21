import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { NftShop } from '../wrappers/NFTShop';

export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse('EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t')
    const newOwner: Address = provider.sender().address || Address.parse('')
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress));
    await nftShop.send(
        provider.sender(),
        {
            value: toNano(0.05),
        },
        {
            $$type: 'ChangeNftCollectionOwner',
            new_owner: newOwner
        }
    )
}
