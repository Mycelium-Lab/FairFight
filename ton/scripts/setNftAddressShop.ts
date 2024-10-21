import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
import { NftShop } from '../wrappers/NFTShop';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const nftShopAddress: Address = Address.parse("EQBrhHw3d6mTuB0VlZu_D6vuJg0frsNpPDFjfs2iKrivLppz")
    const nftCollectionAddress: Address = Address.parse("EQDdlamV1Hvb-P_MFuroP3kDN7o7FIbXbeLw6hDszN10lhjt")
    const nftShop = provider.open(NftShop.fromAddress(nftShopAddress))
    await nftShop.send(
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
