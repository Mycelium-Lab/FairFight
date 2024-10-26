import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
import { NftShop } from '../wrappers/NFTShop';
import { Lootbox } from '../wrappers/Lootbox';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const lootboxAddress: Address = Address.parse("EQC1noa5byu3eN4Mif_oe2zjS1wt61xv7KSBN_PGq4CKWwns")
    const nftCollectionAddress: Address = Address.parse("EQDdlamV1Hvb-P_MFuroP3kDN7o7FIbXbeLw6hDszN10lhjt")
    const lootbox = provider.open(Lootbox.fromAddress(lootboxAddress))
    await lootbox.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'SetNftAddress',
            address: nftCollectionAddress
        }
    )
}
