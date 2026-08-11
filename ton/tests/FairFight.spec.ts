import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { FairFight, FinishData, storeFinishData } from '../wrappers/FairFight';
import '@ton/test-utils';
import { KeyPair, mnemonicToWalletKey, sign } from 'ton-crypto';

describe('FairFight', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let playerTwo: SandboxContract<TreasuryContract>;
    let outsider: SandboxContract<TreasuryContract>;
    let feeCollector: SandboxContract<TreasuryContract>;
    let fairFight: SandboxContract<FairFight>;
    let key: KeyPair;

    const fightId = 0n;
    const stake = toNano('10');
    const gas = toNano('0.1');

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        playerTwo = await blockchain.treasury('player-two');
        outsider = await blockchain.treasury('outsider');
        feeCollector = await blockchain.treasury('fee-collector');

        const mnemonic =
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice';
        key = await mnemonicToWalletKey(mnemonic.split(' '));

        fairFight = blockchain.openContract(
            await FairFight.fromInit(
                deployer.address,
                BigInt('0x' + Buffer.from(key.publicKey).toString('hex')),
                feeCollector.address,
                500n,
                5n,
                10n,
                100n,
            ),
        );

        const deployResult = await fairFight.send(
            deployer.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            deploy: true,
            success: true,
        });
    });

    function finishData(address: Address, amount: bigint, id: bigint = fightId): FinishData {
        return {
            $$type: 'FinishData',
            id,
            address,
            contract: fairFight.address,
            amount,
        };
    }

    function signedFinish(data: FinishData) {
        const signature = sign(beginCell().store(storeFinishData(data)).endCell().hash(), key.secretKey);

        return {
            $$type: 'Finish' as const,
            data,
            signature: beginCell().storeBuffer(signature).endCell().asSlice(),
        };
    }

    function contractBalance(): Promise<bigint> {
        return blockchain.getContract(fairFight.address).then((c) => c.balance);
    }

    /**
     * The contract pays a per-second storage fee out of its own balance, so
     * balance deltas carry a few nanoTON of noise that has nothing to do with
     * the payout logic. Anything under this threshold is that noise.
     */
    const DUST = toNano('0.000001');

    function expectWithinDust(actual: bigint, expected: bigint) {
        const diff = actual > expected ? actual - expected : expected - actual;
        if (diff > DUST) {
            expect(actual).toBe(expected); // fail with a readable diff
        }
    }

    /** Every internal message the contract emitted during `result`. */
    function outgoing(result: { transactions: any[] }) {
        const messages: { to: string; value: bigint; bounced: boolean }[] = [];
        for (const tx of result.transactions) {
            const inMsg = tx.inMessage;
            if (!inMsg || inMsg.info.type !== 'internal') continue;
            if (inMsg.info.src?.toString() !== fairFight.address.toString()) continue;
            messages.push({
                to: inMsg.info.dest.toString(),
                value: inMsg.info.value.coins,
                bounced: inMsg.info.bounced === true,
            });
        }
        return messages;
    }

    /**
     * Messages the contract deliberately sent. Excludes bounces, which are the
     * chain returning a rejected message's own gas to its sender and therefore
     * move no escrow.
     */
    function payouts(result: { transactions: any[] }) {
        return outgoing(result).filter((m) => !m.bounced);
    }

    /** Asserts a rejected claim moved no escrow: only a bounce back to `sender`. */
    function expectNoValueLeftContract(
        result: { transactions: any[] },
        sender: SandboxContract<TreasuryContract>,
        attached: bigint = gas,
    ) {
        expect(payouts(result)).toHaveLength(0);
        for (const bounce of outgoing(result)) {
            expect(bounce.to).toBe(sender.address.toString());
            // A bounce can only ever return part of what that message carried in.
            expect(bounce.value).toBeLessThan(attached);
        }
    }

    async function createFight(
        owner: SandboxContract<TreasuryContract>,
        opts: { amountPerRound?: bigint; rounds?: bigint; maxPlayersAmount?: bigint } = {},
    ) {
        const amountPerRound = opts.amountPerRound ?? toNano('1');
        const rounds = opts.rounds ?? 10n;
        const result = await fairFight.send(
            owner.getSender(),
            { value: amountPerRound * rounds + gas },
            {
                $$type: 'FightMsg',
                amountPerRound,
                rounds,
                maxPlayersAmount: opts.maxPlayersAmount ?? 2n,
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: fairFight.address,
            success: true,
        });
        return result;
    }

    async function joinFight(player: SandboxContract<TreasuryContract>, id: bigint, amount: bigint = stake) {
        const result = await fairFight.send(
            player.getSender(),
            { value: amount + gas },
            { $$type: 'Join', id },
        );
        expect(result.transactions).toHaveTransaction({
            from: player.address,
            to: fairFight.address,
            success: true,
        });
        return result;
    }

    async function createJoinedFight() {
        await createFight(deployer);
        await joinFight(playerTwo, fightId);

        const fight = await fairFight.getCurrentFight(fightId);
        expect(fight.escrowed).toBe(stake * 2n);
        expect(fight.paidOut).toBe(0n);
    }

    async function submitSignedFinish(
        player: SandboxContract<TreasuryContract>,
        authorization: ReturnType<typeof signedFinish>,
        value: bigint = gas,
    ) {
        return fairFight.send(player.getSender(), { value }, authorization);
    }

    async function submitFinish(
        player: SandboxContract<TreasuryContract>,
        data: FinishData,
        value: bigint = gas,
    ) {
        return submitSignedFinish(player, signedFinish(data), value);
    }

    it('deploys', async () => {
        // Deployment is asserted in beforeEach.
    });

    // ---------------------------------------------------------------- security

    it("rejects the loser submitting the winner's signature", async () => {
        await createJoinedFight();
        // The signer authorised the DEPLOYER to take the whole pot. playerTwo
        // relays that exact signed blob from its own wallet.
        const winnerAuthorization = signedFinish(finishData(deployer.address, stake * 2n));

        const result = await submitSignedFinish(playerTwo, winnerAuthorization);

        expect(result.transactions).toHaveTransaction({
            from: playerTwo.address,
            to: fairFight.address,
            success: false,
            exitCode: 8040, // "signed address does not match sender"
        });
        // No escrow left the contract at all.
        expectNoValueLeftContract(result, playerTwo);
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, playerTwo.address)).toBe(false);
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, deployer.address)).toBe(false);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(0n);
    });

    it("rejects the loser replaying the winner's signature even when it names the loser's amount", async () => {
        await createJoinedFight();
        // Same fight, but the blob authorises playerTwo; deployer tries to use it.
        const authorization = signedFinish(finishData(playerTwo.address, stake * 2n));

        const result = await submitSignedFinish(deployer, authorization);

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 8040, // "signed address does not match sender"
        });
        expectNoValueLeftContract(result, deployer);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(0n);
    });

    it('rejects a forged signature', async () => {
        await createJoinedFight();
        const data = finishData(deployer.address, stake * 2n);
        const forged = {
            $$type: 'Finish' as const,
            data,
            signature: beginCell().storeBuffer(Buffer.alloc(64, 7)).endCell().asSlice(),
        };

        const result = await submitSignedFinish(deployer, forged);

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 57400, // "invalid signature"
        });
        expectNoValueLeftContract(result, deployer);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(0n);
    });

    it('rejects a non-participant submitting a valid signature for itself', async () => {
        await createJoinedFight();
        const outsiderAuthorization = finishData(outsider.address, toNano('1'));

        const result = await submitFinish(outsider, outsiderAuthorization);

        expect(result.transactions).toHaveTransaction({
            from: outsider.address,
            to: fairFight.address,
            success: false,
            exitCode: 9617, // "sender is not a participant"
        });
        expectNoValueLeftContract(result, outsider);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(0n);
    });

    it('rejects a signature minted for a different contract', async () => {
        await createJoinedFight();
        const data: FinishData = {
            $$type: 'FinishData',
            id: fightId,
            address: deployer.address,
            contract: outsider.address, // wrong target contract
            amount: stake,
        };

        const result = await submitSignedFinish(deployer, signedFinish(data));

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 55104, // "invalid contract address"
        });
        expectNoValueLeftContract(result, deployer);
    });

    it('rejects the same signed authorization after it has been claimed', async () => {
        await createJoinedFight();
        const authorization = signedFinish(finishData(deployer.address, stake));

        const firstClaim = await submitSignedFinish(deployer, authorization);
        expect(firstClaim.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: true,
        });

        const replay = await submitSignedFinish(deployer, authorization);
        expect(replay.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 44463, // "already claimed"
        });
        expectNoValueLeftContract(replay, deployer);
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, deployer.address)).toBe(true);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(stake);
    });

    it('never allows total payouts to exceed the fight escrow', async () => {
        await createJoinedFight();

        const oversizedClaim = await submitFinish(deployer, finishData(deployer.address, toNano('20.01')));
        expect(oversizedClaim.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 23915, // "fight escrow exceeded"
        });
        expectNoValueLeftContract(oversizedClaim, deployer);

        const firstClaim = await submitFinish(deployer, finishData(deployer.address, toNano('11')));
        expect(firstClaim.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: true,
        });

        const overCumulativeCap = await submitFinish(playerTwo, finishData(playerTwo.address, stake));
        expect(overCumulativeCap.transactions).toHaveTransaction({
            from: playerTwo.address,
            to: fairFight.address,
            success: false,
            exitCode: 23915, // "fight escrow exceeded"
        });
        expectNoValueLeftContract(overCumulativeCap, playerTwo);

        const fight = await fairFight.getCurrentFight(fightId);
        expect(fight.escrowed).toBe(stake * 2n);
        expect(fight.paidOut).toBe(toNano('11'));
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, playerTwo.address)).toBe(false);
    });

    it('rejects the owner setting a fee above 100%', async () => {
        const result = await fairFight.send(
            deployer.getSender(),
            { value: gas },
            { $$type: 'ChangeFee', fee: 10001n },
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 16679, // "fee out of range"
        });
        expect(await fairFight.getFee()).toBe(500n);
    });

    // ----------------------------------------------------------- value / gas

    it('settles valid claims and preserves the fee split', async () => {
        await createJoinedFight();

        // 9 TON <= baseAmount (10) -> no fee is taken.
        const firstClaim = await submitFinish(deployer, finishData(deployer.address, toNano('9')));
        expect(firstClaim.transactions).toHaveTransaction({
            from: fairFight.address,
            to: deployer.address,
            value: toNano('9'),
            success: true,
        });
        expect(firstClaim.transactions).not.toHaveTransaction({
            from: fairFight.address,
            to: feeCollector.address,
        });

        // 11 TON > baseAmount (10) -> 5% fee on the whole amount.
        const secondClaim = await submitFinish(playerTwo, finishData(playerTwo.address, toNano('11')));
        expect(secondClaim.transactions).toHaveTransaction({
            from: fairFight.address,
            to: feeCollector.address,
            value: toNano('0.55'),
            success: true,
        });
        expect(secondClaim.transactions).toHaveTransaction({
            from: fairFight.address,
            to: playerTwo.address,
            value: toNano('10.45'),
            success: true,
        });
    });

    it.each([
        ['0.1', toNano('0.1')],
        ['1', toNano('1')],
        ['5', toNano('5')],
    ])(
        'debits the contract by exactly the claimed amount when %s TON of gas is attached',
        async (_label, attachedGas) => {
            await createJoinedFight();
            const claimed = toNano('11');

            const before = await contractBalance();
            const result = await submitFinish(deployer, finishData(deployer.address, claimed), attachedGas);
            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: fairFight.address,
                success: true,
            });
            const after = await contractBalance();

            // The escrow is debited by the claim and nothing else: gas and forward
            // fees are funded entirely by the value the claimer attached. Critically
            // this does not grow with `attachedGas`.
            expectWithinDust(before - after, claimed);

            const messages = payouts(result);
            const feeMsg = messages.find((m) => m.to === feeCollector.address.toString());
            const toPlayer = messages.filter((m) => m.to === deployer.address.toString());
            expect(feeMsg!.value).toBe(toNano('0.55'));
            // payout + refund of the unspent gas
            expect(toPlayer).toHaveLength(2);
            const payout = toNano('10.45');
            const refund = toPlayer.reduce((sum, m) => sum + m.value, 0n) - payout;
            expect(toPlayer.some((m) => m.value === payout)).toBe(true);
            // The refund can only ever hand back part of what the caller sent in.
            expect(refund).toBeGreaterThan(0n);
            expect(refund).toBeLessThan(attachedGas);

            // Fee + payout is exactly the authorised amount, no more.
            expect(feeMsg!.value + payout).toBe(claimed);
        },
    );

    it('cannot pay one fight out of another fight escrow', async () => {
        const playerThree = await blockchain.treasury('player-three');
        const playerFour = await blockchain.treasury('player-four');

        await createJoinedFight(); // fight 0: deployer + playerTwo, 20 TON escrow
        await createFight(playerThree); // fight 1
        await joinFight(playerFour, 1n); // fight 1: 20 TON escrow

        // A claim capped at fight 0's escrow cannot reach into fight 1's money...
        const overCap = await submitFinish(deployer, finishData(deployer.address, toNano('20.5')));
        expect(overCap.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
            exitCode: 23915, // "fight escrow exceeded"
        });
        expectNoValueLeftContract(overCap, deployer);

        // ...and draining fight 0 completely still leaves fight 1 fully funded.
        const beforeDrain = await contractBalance();
        await submitFinish(deployer, finishData(deployer.address, stake * 2n));
        expectWithinDust(beforeDrain - (await contractBalance()), stake * 2n);

        const threeClaim = await submitFinish(playerThree, finishData(playerThree.address, stake, 1n), gas);
        expect(threeClaim.transactions).toHaveTransaction({
            from: fairFight.address,
            to: playerThree.address,
            value: stake,
            success: true,
        });
        const fourClaim = await submitFinish(playerFour, finishData(playerFour.address, stake, 1n), gas);
        expect(fourClaim.transactions).toHaveTransaction({
            from: fairFight.address,
            to: playerFour.address,
            value: stake,
            success: true,
        });
    });

    it('never pays out more in total than was staked', async () => {
        await createJoinedFight();
        const staked = stake * 2n;

        const first = await submitFinish(deployer, finishData(deployer.address, toNano('12')));
        const second = await submitFinish(playerTwo, finishData(playerTwo.address, toNano('8')));

        const paidToParticipants = [...payouts(first), ...payouts(second)]
            .filter((m) => m.to !== fairFight.address.toString())
            .reduce((sum, m) => sum + m.value, 0n);

        // Payouts + fee + gas refunds, and the refunds are bounded by the 0.2 TON
        // of gas the two claim messages carried.
        expect(paidToParticipants).toBeLessThanOrEqual(staked + gas * 2n);
        expect(paidToParticipants).toBeGreaterThan(staked);
    });

    it('rejects a claim that does not carry enough gas, without any partial payout', async () => {
        await createJoinedFight();
        const before = await contractBalance();

        const result = await submitFinish(deployer, finishData(deployer.address, toNano('11')), toNano('0.005'));

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
        });
        // Crucially: the fee message must not go out while the payout fails.
        expectNoValueLeftContract(result, deployer, toNano('0.005'));
        expectWithinDust(await contractBalance(), before);
        expect((await fairFight.getCurrentFight(fightId)).paidOut).toBe(0n);
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, deployer.address)).toBe(false);
    });

    // ------------------------------------------------------------ happy paths

    it('runs the full lifecycle: create -> join -> both finish -> fight closed', async () => {
        await createFight(deployer);

        // The creator is registered and busy.
        expect(await fairFight.getCurrentPlayerFight(deployer.address)).toBe(fightId);
        let fight = await fairFight.getCurrentFight(fightId);
        expect(fight.playersCurrentLength).toBe(1n);
        expect(fight.escrowed).toBe(stake);
        expect(fight.baseAmount).toBe(stake);

        await joinFight(playerTwo, fightId);

        fight = await fairFight.getCurrentFight(fightId);
        expect(fight.playersCurrentLength).toBe(2n);
        expect(fight.escrowed).toBe(stake * 2n);
        expect(await fairFight.getCurrentPlayerFight(playerTwo.address)).toBe(fightId);

        const players = await fairFight.getCurrentFightPlayers(fightId);
        expect(players.get(0n)!.toString()).toBe(deployer.address.toString());
        expect(players.get(1n)!.toString()).toBe(playerTwo.address.toString());

        // Winner takes 15, loser takes the remaining 5.
        const winner = await submitFinish(deployer, finishData(deployer.address, toNano('15')));
        expect(winner.transactions).toHaveTransaction({
            from: fairFight.address,
            to: feeCollector.address,
            value: toNano('0.75'), // 5% of 15
            success: true,
        });
        expect(winner.transactions).toHaveTransaction({
            from: fairFight.address,
            to: deployer.address,
            value: toNano('14.25'),
            success: true,
        });

        fight = await fairFight.getCurrentFight(fightId);
        expect(fight.paidOut).toBe(toNano('15'));
        expect(fight.finishTime).toBeGreaterThan(0);
        expect(await fairFight.getCurrentFightPlayerClaimed(fightId, deployer.address)).toBe(true);
        // The winner is free to start a new fight immediately.
        await expect(fairFight.getCurrentPlayerFight(deployer.address)).rejects.toThrow();

        const loser = await submitFinish(playerTwo, finishData(playerTwo.address, toNano('5')));
        expect(loser.transactions).toHaveTransaction({
            from: fairFight.address,
            to: playerTwo.address,
            value: toNano('5'), // 5 <= baseAmount, so no fee
            success: true,
        });

        // Everybody claimed -> the fight is removed from storage.
        await expect(fairFight.getCurrentFight(fightId)).rejects.toThrow();
        await expect(fairFight.getCurrentPlayerFight(playerTwo.address)).rejects.toThrow();

        // The contract handed out exactly the 20 TON that was staked.
        expect(await contractBalance()).toBeLessThan(toNano('1'));
    });

    it('lets a lone creator withdraw and frees the player', async () => {
        await createFight(deployer);

        const result = await fairFight.send(deployer.getSender(), { value: gas }, { $$type: 'Withdraw', id: fightId });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: true,
        });
        const refunds = payouts(result).filter((m) => m.to === deployer.address.toString());
        expect(refunds.reduce((sum, m) => sum + m.value, 0n)).toBeGreaterThanOrEqual(stake);

        await expect(fairFight.getCurrentFight(fightId)).rejects.toThrow();
        await expect(fairFight.getCurrentPlayerFight(deployer.address)).rejects.toThrow();
    });

    it('blocks withdrawing a fight that already has an opponent', async () => {
        await createJoinedFight();

        const result = await fairFight.send(deployer.getSender(), { value: gas }, { $$type: 'Withdraw', id: fightId });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
        });
        expect((await fairFight.getCurrentFight(fightId)).escrowed).toBe(stake * 2n);
    });

    it('rejects joining with less than the stake', async () => {
        await createFight(deployer);

        const result = await fairFight.send(
            playerTwo.getSender(),
            { value: toNano('1') },
            { $$type: 'Join', id: fightId },
        );

        expect(result.transactions).toHaveTransaction({
            from: playerTwo.address,
            to: fairFight.address,
            success: false,
        });
        expect((await fairFight.getCurrentFight(fightId)).escrowed).toBe(stake);
    });

    it('rejects creating a fight without covering the stake', async () => {
        const result = await fairFight.send(
            deployer.getSender(),
            { value: toNano('1') },
            { $$type: 'FightMsg', amountPerRound: toNano('1'), rounds: 10n, maxPlayersAmount: 2n },
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: fairFight.address,
            success: false,
        });
        await expect(fairFight.getCurrentFight(fightId)).rejects.toThrow();
    });
});
