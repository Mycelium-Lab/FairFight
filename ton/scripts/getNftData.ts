import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { NftCollection } from '../wrappers/NFT';
import { NftItem } from '../wrappers/NFTItem';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const nftCollectionAddress: Address = Address.parse("EQB1bg9eUSjvqxTr5NX8R2nOevlrzVNZd2Ti3im6YpvlckQE")
    const nftCollection = provider.open(NftCollection.fromAddress(nftCollectionAddress));
    const nftAddress = (await nftCollection.getGetNftAddressByIndex(1n)) as Address
    const nft = provider.open(NftItem.fromAddress(nftAddress))
    console.log(await nftCollection.getGetCollectionData())
    console.log(nftAddress)
    console.log(await nft.getGetNftData())
    console.log(await nft.getGetNftItemType())
}
