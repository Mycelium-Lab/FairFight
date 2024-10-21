import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { Lootbox } from '../wrappers/Lootbox';
import { getRarity, getRarityPercent } from '../tests/data/lootbox';
dotenv.config()

export async function run(provider: NetworkProvider) {
    const lootboxPrice = toNano(1)
    const nftShopAddress: Address = Address.parse("EQDxZ9EXVoHl3sXbdI_6kK7GnaJXa4YV9qfq233HQsLyNygZ")
    const lootbox = provider.open(await Lootbox.fromInit(
        provider.sender().address as Address,
        lootboxPrice,
        provider.sender().address as Address,
        nftShopAddress,
        getRarity(),
        getRarityPercent()
    ))
    await lootbox.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    await provider.waitForDeploy(lootbox.address);

    console.log(`Lootbox deployed to: ${lootbox.address}`)
}
