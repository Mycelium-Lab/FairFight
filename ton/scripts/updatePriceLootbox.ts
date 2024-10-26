import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import dotenv from 'dotenv'
import { Lootbox } from '../wrappers/Lootbox';
dotenv.config()


export async function run(provider: NetworkProvider) {
    const lootboxAddress: Address = Address.parse("EQBH6b8Y8_Q8Zu2SKcUNXABEy7GohYR4V9Jeb-rjYVANM_38")
    const lootbox = provider.open(Lootbox.fromAddress(lootboxAddress));
    await lootbox.send(
        provider.sender(),
        {
            value: toNano('0.05')
        },
        {
            $$type: 'SetPrice',
            price: toNano(2)
        }
    )
}
