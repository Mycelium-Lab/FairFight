// jscs:disable validateIndentation
ig.module(
  'ton.channels'
)
.defines(function() {

    const TonWeb = window.TonWeb;
    const BN = TonWeb.utils.BN;
    const toNano = TonWeb.utils.toNano;
    const DELTA = toNano("0.1")
    const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
    const apiKey = 'f6f28cb83ed713758fd55c7af2bcdec80da0a738f4b3f2a82cb4bc615b8fda6f';


    function updateData()
    {
        const ingameBalance = "Your in-game balance: " + localStorage.getItem("ingameBalance") + " TON"
        const enemyWallet = "Your enemy in-game balance: " + localStorage.getItem("enemyBalance") + " TON"

        const inBalance = window.document.getElementById("ingameBalance")
        inBalance.style.display = "inherit"
        inBalance.innerText = ingameBalance
        const enBalance = window.document.getElementById("enemyBalance")
        enBalance.style.display = "inherit"
        enBalance.innerText = enemyWallet
    }

    function RNG(seed) {

        this.m = 0x80000000;
        this.a = 1103515245;
        this.c = 12345;

        let k = 0;
        for (let i = 0; i < seed.length; i++) {
            k += seed.charCodeAt(i);
        }

        k+=Math.floor(Date.now() / 10000);

      this.state = k ? k : Math.floor(Math.random() * (this.m - 1));
    }
    RNG.prototype.nextInt = function() {
      this.state = (this.a * this.state + this.c) % this.m;
      return this.state;
    }
    RNG.prototype.nextRange = function(start, end) {
      var rangeSize = end - start;
      var randomUnder1 = this.nextInt() / this.m;
      return start + Math.floor(randomUnder1 * rangeSize);
    }
    RNG.prototype.choice = function(array) {
      return array[this.nextRange(0, array.length)];
    }

    TONChannel = function(walletAddress, publicKey, isA) {
        this.isA=isA;
        const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, {apiKey}));

        this.secretKey = TonWeb.utils.hexToBytes(localStorage.getItem("secretKey"));

        this.myWallet = tonweb.wallet.create({
            publicKey: TonWeb.utils.hexToBytes(localStorage.getItem("publicKey"))
        });
        
        return this.myWallet.getAddress().then((address) => {
            this.myWalletAddress = address;
            console.log('Wallet address: ', this.myWalletAddress.toString(true, true, true));

            const theirWallet = tonweb.wallet.create({
                publicKey: TonWeb.utils.hexToBytes(publicKey)
            });
            return theirWallet.getAddress();
        }).then((address) => {
            this.theirWalletAddress = address;

            this.channelInitState = {
                balanceA: toNano('0.5'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
                balanceB: toNano('0.5'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
                seqnoA: new BN(0), // initially 0
                seqnoB: new BN(0)  // initially 0
            };
            this.channelState = this.channelInitState;

            let rnd
            if (isA) rnd = new RNG(`${this.myWalletAddress.toString()}-${this.theirWalletAddress.toString()}`);
            else rnd = new RNG(`${this.theirWalletAddress.toString()}-${this.myWalletAddress.toString()}`);

            let rand = rnd.nextRange(0,10000000);
            console.log(rand)

            this.channelConfig = {
                channelId: new BN(rand),
                addressA: isA?this.myWalletAddress:this.theirWalletAddress,
                addressB: isA?this.theirWalletAddress:this.myWalletAddress,
                initBalanceA: this.channelInitState.balanceA,
                initBalanceB: this.channelInitState.balanceB
            }

            console.log(this.channelConfig);

            this.channel = tonweb.payments.createChannel({
                ...this.channelConfig,
                isA: isA,
                myKeyPair: TonWeb.utils.nacl.sign.keyPair.fromSecretKey(this.secretKey),
                hisPublicKey: TonWeb.utils.hexToBytes(publicKey),
            });

            console.log(this.channel)
            return this.channel.getAddress();
        }).then((address) => {
            this.channelAddress = address.toString(true, true, true);
            console.log('Channel opened: ', this.channelAddress);
            return this;
        });
    }
    TONChannel.prototype = {
        create: async function() {
            const fromWallet = this.channel.fromWallet({
                wallet: this.myWallet,
                secretKey: this.secretKey
            });
            this.fromWallet = fromWallet;
            if (this.isA) {
                try {
                    await fromWallet.deploy().send(toNano('0.05'));
                    console.log('Channel deployed');
                    return 'deployed';
                } catch (error) {
                    console.error('Failed to deploy a channel: ', error);
                }
            }
            return '';
        },
        topUp: async function() {
            if (this.isA) {
                await this.fromWallet
                    .topUp({coinsA: this.channelInitState.balanceA, coinsB: new BN(0)})
                    .send(this.channelInitState.balanceA.add(toNano('0.05')));
                console.log('Channel topped up from A. A: ', this.channelInitState.balanceA.toString(), ', B: 0');
            } else {
                await this.fromWallet
                    .topUp({coinsA: new BN(0), coinsB: this.channelInitState.balanceB})
                    .send(this.channelInitState.balanceB.add(toNano('0.05')));
                console.log('Channel topped up from B. A: 0, B: ', this.channelInitState.balanceB.toString());
            }
        },
        init: async function() {
            if (this.isA) {
                console.log('Initializing the channel...');
                await this.fromWallet.init(this.channelInitState).send(toNano('0.05'));
                localStorage.setItem('ingameBalance', TonWeb.utils.fromNano(this.channelInitState.balanceA));
                localStorage.setItem('enemyBalance', TonWeb.utils.fromNano(this.channelInitState.balanceB));
                updateData();
                return 'initialized';
            } else {
                localStorage.setItem('ingameBalance', TonWeb.utils.fromNano(this.channelInitState.balanceB));
                localStorage.setItem('enemyBalance', TonWeb.utils.fromNano(this.channelInitState.balanceA));
                updateData();
                return '';
            }
        },
        signClose: async function() {
            return TonWeb.utils.bytesToHex(
                await this.channel.signClose(this.channelState)
            );
        },
        signState: async function() {
            return TonWeb.utils.bytesToHex(
                await this.channel.signState(this.channelState)
            );
        },
        closeSigned: async function(signature) {
            signature = TonWeb.utils.hexToBytes(signature);
            if (!(await this.channel.verifyClose(this.channelState, signature))) {
                return console.error('Invalid channel close signature!');
            }
            return await this.fromWallet.close({
                ...this.channelState,
                hisSignature: signature
            }).send(toNano('0.05'));
        },
        getLoseSigendState: async function() {
            if(this.isA){
                console.log(this.channelState)
                this.channelState.balanceA = this.channelState.balanceA.sub(DELTA)
                this.channelState.balanceB = this.channelState.balanceB.add(DELTA)
                this.channelState.seqnoA = this.channelState.seqnoA.add(1);
                localStorage.setItem('ingameBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceA))
                localStorage.setItem('enemyBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceB))

                updateData();
            }else{
                this.channelState.balanceA = this.channelState.balanceA.add(DELTA)
                this.channelState.balanceB = this.channelState.balanceB.sub(DELTA)
                this.channelState.seqnoB = this.channelState.seqnoB.add(1);
                localStorage.setItem('ingameBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceB))
                localStorage.setItem('enemyBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceA))

                updateData();
            }
        },

        getWinSigendState: async function() {
            if(this.isA){
                this.channelState.balanceA = this.channelState.balanceA.add(DELTA)
                this.channelState.balanceB = this.channelState.balanceB.sub(DELTA)
                this.channelState.seqnoB = this.channelState.seqnoB.add(1);
                localStorage.setItem('ingameBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceA))
                localStorage.setItem('enemyBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceB))

                updateData();
            }else{
                this.channelState.balanceA = this.channelState.balanceA.sub(DELTA)
                this.channelState.balanceB = this.channelState.balanceB.add(DELTA)
                this.channelState.seqnoA = this.channelState.seqnoA.add(1);
                localStorage.setItem('ingameBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceB))
                localStorage.setItem('enemyBalance' ,TonWeb.utils.fromNano(this.channelInitState.balanceA))

                updateData();
            }
        }


    };

});