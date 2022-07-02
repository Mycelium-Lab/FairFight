// jscs:disable validateIndentation
ig.module(
  'ton.channels'
)
.defines(function() {

    const TonWeb = window.TonWeb;
    const BN = TonWeb.utils.BN;
    const toNano = TonWeb.utils.toNano;
    const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
    const apiKey = 'f6f28cb83ed713758fd55c7af2bcdec80da0a738f4b3f2a82cb4bc615b8fda6f';

    TONChannel = function(walletAddress, publicKey,isA) {
        const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, {apiKey}));

        this.secretKey = TonWeb.utils.hexToBytes(localStorage.getItem("secretKey"));

        this.myWallet = tonweb.wallet.create({
            publicKey: TonWeb.utils.hexToBytes(localStorage.getItem("publicKey"))
        });
        // here the wallet address is supposed to already exist and have funds
        const myWalletAddress = this.myWallet.address;

        console.log(`My wallet address: ${myWalletAddress}`);

        const theirWallet = tonweb.wallet.create({
            publicKey: TonWeb.utils.hexToBytes(publicKey)
        });
        const theirWalletAddress = theirWallet.address;

        const channelInitState = {
            balanceA: toNano('1'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
            balanceB: toNano('1'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
            seqnoA: new BN(0), // initially 0
            seqnoB: new BN(0)  // initially 0
        };
    
        // TODO: channel ID has to be unique for each pair of players
        const channelConfig = {
            channelId: new BN(124),
            addressA: isA?myWalletAddress:theirWalletAddress,
            addressB: isA?theirWalletAddress:myWalletAddress,
            initBalanceA: channelInitState.balanceA,
            initBalanceB: channelInitState.balanceB
        }

        this.channel = tonweb.payments.createChannel({
            ...channelConfig,
            isA: isA,
            myKeyPair: TonWeb.utils.nacl.sign.keyPair.fromSecretKey(this.secretKey),
            hisPublicKey: TonWeb.utils.hexToBytes(publicKey),
        });

        this.channel.getAddress().then((r) => {
            this.channelAddress = r.toString(true, true, true);
            console.log('Channel opened: ', this.channelAddress);
            this.init();
        });

        return this.channel;
    }
    TONChannel.prototype = {
        init: async function() {
            const fromWallet = this.channel.fromWallet({
                wallet: this.myWallet,
                secretKey: this.secretKey
            });
            try {
                await fromWallet.deploy().send(toNano('0.05'));
                console.log('Channel deployed: ', this.channelAddress);
                console.log(await this.channel.getChannelState());
                const data = await this.channel.getData();
                console.log('Channel balance A: ', data.balanceA.toString());
                console.log('Channel balance B: ', data.balanceB.toString());
                // TODO: continue here - top up, init, etc
            } catch (error) {
                console.error('Failed to deploy a channel: ', error);
            }
        }
    };

});