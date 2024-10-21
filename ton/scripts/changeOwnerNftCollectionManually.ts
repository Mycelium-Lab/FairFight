import { Address, beginCell, Cell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const NftCollectionAddress: Address = Address.parse('EQC2QSCpztK-_WJoaeYUMsDzs6F-1dGvtOphtKS3_y7gcfn4')
    const NftShopAddress: Address = Address.parse('EQCaRsuhnrB6QIsDVD2pbXC9aPbsCQth_ZcQwv0GdJn7bC8t')
    const changeOwner: Cell = beginCell()
        .storeUint(3, 32)
        .storeUint(0, 64)
        .storeAddress(NftShopAddress)
        .endCell();
    await provider.sender().send({
        value: toNano('0.05'),
        to: NftCollectionAddress,
        bounce: false,
        body: changeOwner
    })
}
