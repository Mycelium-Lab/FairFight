import { Address, Dictionary, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { mnemonicToWalletKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
import { NftShop } from '../wrappers/NFTShop';
import { getDictForShop } from '../tests/data/shop';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const NftCollectionAddress: Address = Address.parse('EQC2QSCpztK-_WJoaeYUMsDzs6F-1dGvtOphtKS3_y7gcfn4')

    let allowedMint: Dictionary<Address, boolean> = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool());
    if (provider.sender().address) {
        allowedMint.set(provider.sender().address as Address, true);
    }

    const nftShop = provider.open(await NftShop.fromInit(
        provider.sender().address as Address,
        provider.sender().address as Address,
        NftCollectionAddress,
        getDictForShop(),
        3n,
        allowedMint
    ))

    await nftShop.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    await provider.waitForDeploy(nftShop.address);
    console.log(`NFT Shop deployed to: ${nftShop.address}`)
}
