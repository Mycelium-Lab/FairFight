import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { NftCollection } from '../wrappers/NFT';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const lootboxAddress: Address = Address.parse("EQC1noa5byu3eN4Mif_oe2zjS1wt61xv7KSBN_PGq4CKWwns")
    const nftCollectionAddress: Address = Address.parse("EQDdlamV1Hvb-P_MFuroP3kDN7o7FIbXbeLw6hDszN10lhjt")
    const nftCollection = provider.open(NftCollection.fromAddress(nftCollectionAddress));
    await nftCollection.send(
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
