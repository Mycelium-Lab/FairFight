import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Dictionary, fromNano, Slice, toNano } from '@ton/core';
import { FairFight, storeFinish, storeFinishData } from '../wrappers/FairFight';
import '@ton/test-utils';
import { KeyPair, mnemonicToWalletKey, sign } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';
import { NftCollection } from '../wrappers/NFT';
import { NftItem } from '../wrappers/NFTItem';
import { dictValueParserNftType, NftShop, NftType } from '../wrappers/NFTShop';
import { Lootbox } from '../wrappers/Lootbox';
import { getRarity, getRarityPercent } from './data/lootbox';
import { getDictForShop } from './data/shop';

describe('NFT', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let nftCollection: SandboxContract<NftCollection>;
    let nftShop: SandboxContract<NftShop>;
    let lootbox: SandboxContract<Lootbox>;
    let wallet: WalletContractV4;
    let key: KeyPair
    let feeCollector: SandboxContract<TreasuryContract>;
    let nftPrice = toNano(10)
    let lootboxPrice = toNano(10)

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        const mnemonic = "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
        key = await mnemonicToWalletKey(mnemonic.split(" "));
        wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

        const OFFCHAIN_CONTENT_PREFIX = 0x01;
        const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
        let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
        const senders = await blockchain.createWallets(10)
        feeCollector = senders[9]
        nftCollection = blockchain.openContract(await NftCollection.fromInit(
            deployer.address,
            newContent,
            {
                $$type: "RoyaltyParams",
                numerator: 0n, // 350n = 35%
                denominator: 1000n,
                destination: deployer.address,
            }
        ));
        nftShop = blockchain.openContract(await NftShop.fromInit(
            deployer.address,
            BigInt('0x' + Buffer.from(wallet.publicKey).toString("hex")),
            feeCollector.address,
            getDictForShop()
        ))
        lootbox = blockchain.openContract(await Lootbox.fromInit(
            deployer.address,
            lootboxPrice,
            feeCollector.address,
            nftCollection.address,
            getRarity(),
            getRarityPercent()
        ))
        const deployResult = await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            deploy: true,
            success: true,
        });
        const deployResult1 = await nftShop.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        expect(deployResult1.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftShop.address,
            deploy: true,
            success: true,
        });
        const deployResult2 = await lootbox.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );
        expect(deployResult2.transactions).toHaveTransaction({
            from: deployer.address,
            to: lootbox.address,
            deploy: true,
            success: true,
        });
        await nftShop.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetNftAddress',
                address: nftCollection.address
            }
        )
        await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetAllowedMint',
                minter: nftShop.address,
                allowed: true
            }
        )
        await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'SetAllowedMint',
                minter: lootbox.address,
                allowed: true
            }
        )
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and fairFight are ready to use
    });    

    it('should mint', async () => {
        console.log(fromNano(await feeCollector.getBalance()))
        const senders = await blockchain.createWallets(1)
        const sender = senders[0]
        const tx = await nftCollection.send(
            deployer.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'Mint',
                recipient: sender.address,
                type: 1n,
                type_index: 1n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/1.json'
            }
        )
        expect(tx.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: nftCollection.address,
            success: true,
        });
        const event: any = tx.events[tx.events.length - 1]
        const nftAddress = event.account
        // console.log(await nftCollection.getGetNftAddressByIndex(0n))
        // console.log( tx.events)
        // console.log(nftAddress)
        // console.log(Address.normalize(nftAddress))
        const nft1: SandboxContract<NftItem> = blockchain.openContract(await NftItem.fromAddress(await nftCollection.getGetNftAddressByIndex(0n) as Address))
        // console.log(await nft1.getGetNftItemType())
        // console.log(await nftShop.getPrices())
        console.log(await nft1.getGetNftData())
        const txBuying = await nftShop.send(
            sender.getSender(),
            { value: nftPrice + toNano('0.05') * 2n },
            {
                $$type: 'Buy',
                nftType: 0n,
                nftItem: 0n
            }
        )
        // console.log(txBuying)
        // console.log(deployer.getSender().address, nftCollection.address.toRaw())
        expect(txBuying.transactions).toHaveTransaction({
            from: sender.getSender().address,
            to: nftShop.address,
            success: true,
        });
        const nft2: SandboxContract<NftItem> = blockchain.openContract(await NftItem.fromAddress(await nftCollection.getGetNftAddressByIndex(1n) as Address))
        // console.log(await nft2.getGetNftItemType())
        // console.log(fromNano(await feeCollector.getBalance()))

        for (let i = 0; i < 10; i++) {
            const txLootboxBuying = await lootbox.send(
                sender.getSender(),
                { value: lootboxPrice + toNano('0.05') * 2n },
                "Buy"
            )
            
            expect(txLootboxBuying.transactions).toHaveTransaction({
                from: sender.getSender().address,
                to: lootbox.address,
                success: true,
            });

            const nft3: SandboxContract<NftItem> = blockchain.openContract(await NftItem.fromAddress(await nftCollection.getGetNftAddressByIndex(BigInt(i)) as Address))
            // console.log(await nft3.getGetNftItemType())
        }
    })
})