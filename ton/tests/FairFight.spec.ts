import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, fromNano, toNano } from '@ton/core';
import { FairFight, storeFinish, storeFinishData } from '../wrappers/FairFight';
import '@ton/test-utils';
import { KeyPair, mnemonicToWalletKey, sign } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';

describe('FairFight', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let fairFight: SandboxContract<FairFight>;
    let wallet: WalletContractV4;
    let key: KeyPair
    let feeCollector: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        const mnemonic = "nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice"
        key = await mnemonicToWalletKey(mnemonic.split(" "));
        wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

        const senders = await blockchain.createWallets(10)
        feeCollector = senders[9]
        fairFight = blockchain.openContract(await FairFight.fromInit(
            deployer.address,
            BigInt('0x' + Buffer.from(wallet.publicKey).toString("hex")),
            feeCollector.address,
            BigInt(500),
            BigInt(5),
            BigInt(10),
            BigInt(100)
        ));
        const deployResult = await fairFight.send(
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
            to: fairFight.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and fairFight are ready to use
    });

    it('should create game', async () => {
        fairFight.getCurrentFights
        const senders = await blockchain.createWallets(1)
        const sender = senders[0]
        const tx = await fairFight.send(
            deployer.getSender(),
            { value: toNano('10') },
            {
                $$type: 'FightMsg',
                amountPerRound: toNano(1),
                rounds: BigInt(10),
                maxPlayersAmount: BigInt(2)
            }
        )
        expect(tx.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        });
        console.log(await fairFight.getCurrentFight(BigInt(0)))
        const tx2 = await fairFight.send(
            deployer.getSender(),
            { value: toNano('0.5') },
            {
                $$type: 'Withdraw',
                id: BigInt(0)
            }
        )
        expect(tx2.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        });        
        const tx3 = await fairFight.send(
            deployer.getSender(),
            { value: toNano('10') },
            {
                $$type: 'FightMsg',
                amountPerRound: toNano(1),
                rounds: BigInt(10),
                maxPlayersAmount: BigInt(2)
            }
        )
        expect(tx3.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        });
        const tx4 = await fairFight.send(
            sender.getSender(),
            { value: toNano('10') },
            {
                $$type: 'Join',
                id: BigInt(1)
            }
        )
        expect(tx4.transactions).toHaveTransaction({
            from: sender.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        console.log(deployer.address, fairFight.address)
        const _signDeployer = sign(
            beginCell()
                .store(
                    storeFinishData({
                        $$type: 'FinishData',
                        id: BigInt(1),
                        address: deployer.address,
                        contract: fairFight.address,
                        amount: toNano(10)
                        }
                    )
                )
                .endCell()
                .hash(),
            key.secretKey,
        );
        const _signSender = sign(
            beginCell()
                .store(
                    storeFinishData({
                        $$type: 'FinishData',
                        id: BigInt(1),
                        address: sender.address,
                        contract: fairFight.address,
                        amount: toNano(10)
                        }
                    )
                )
                .endCell()
                .hash(),
            key.secretKey,
        );
        const tx5 = await fairFight.send(
            blockchain.sender(deployer.address),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Finish',
                data: {
                    $$type: 'FinishData',
                    id: BigInt(1),
                    address: deployer.address,
                    contract: fairFight.address,
                    amount: toNano(10)
                },
                signature: beginCell().storeBuffer(_signDeployer).endCell().asSlice()
            },
        );
        expect(tx5.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        const tx6 = await fairFight.send(
            sender.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Finish',
                data: {
                    $$type: 'FinishData',
                    id: BigInt(1),
                    address: sender.address,
                    contract: fairFight.address,
                    amount: toNano(10)
                },
                signature: beginCell().storeBuffer(_signSender).endCell().asSlice()
            },
        );
        expect(tx6.transactions).toHaveTransaction({
            from: sender.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        console.log(await fairFight.getCurrentFights())
        
    });

    it('should send to collectror', async () => {
        const senders = await blockchain.createWallets(1)
        const sender = senders[0]
        const tx3 = await fairFight.send(
            deployer.getSender(),
            { value: toNano('10') },
            {
                $$type: 'FightMsg',
                amountPerRound: toNano(1),
                rounds: BigInt(10),
                maxPlayersAmount: BigInt(2)
            }
        )
        expect(tx3.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        });
        const tx4 = await fairFight.send(
            sender.getSender(),
            { value: toNano('10') },
            {
                $$type: 'Join',
                id: BigInt(0)
            }
        )
        expect(tx4.transactions).toHaveTransaction({
            from: sender.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        const _signDeployer = sign(
            beginCell()
                .store(
                    storeFinishData({
                        $$type: 'FinishData',
                        id: BigInt(0),
                        address: deployer.address,
                        contract: fairFight.address,
                        amount: toNano(9)
                        }
                    )
                )
                .endCell()
                .hash(),
            key.secretKey,
        );
        const _signSender = sign(
            beginCell()
                .store(
                    storeFinishData({
                        $$type: 'FinishData',
                        id: BigInt(0),
                        address: sender.address,
                        contract: fairFight.address,
                        amount: toNano(11)
                        }
                    )
                )
                .endCell()
                .hash(),
            key.secretKey,
        );
        console.log('collector: ', fromNano(await feeCollector.getBalance()))
        console.log('deployer: ', fromNano(await deployer.getBalance()))
        console.log('sender: ', fromNano(await sender.getBalance()))
        const tx5 = await fairFight.send(
            blockchain.sender(deployer.address),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Finish',
                data: {
                    $$type: 'FinishData',
                    id: BigInt(0),
                    address: deployer.address,
                    contract: fairFight.address,
                    amount: toNano(9)
                },
                signature: beginCell().storeBuffer(_signDeployer).endCell().asSlice()
            },
        );
        expect(tx5.transactions).toHaveTransaction({
            from: deployer.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        const tx6 = await fairFight.send(
            sender.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Finish',
                data: {
                    $$type: 'FinishData',
                    id: BigInt(0),
                    address: sender.address,
                    contract: fairFight.address,
                    amount: toNano(11)
                },
                signature: beginCell().storeBuffer(_signSender).endCell().asSlice()
            },
        );
        expect(tx6.transactions).toHaveTransaction({
            from: sender.getSender().address,
            to: fairFight.address,
            success: true,
        }); 
        console.log('collector: ', fromNano(await feeCollector.getBalance()))
        console.log('deployer:', fromNano(await deployer.getBalance()))
        console.log('sender', fromNano(await sender.getBalance()))
    })
});
