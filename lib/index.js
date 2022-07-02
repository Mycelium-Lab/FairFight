const TonWeb = require('tonweb')
const toNano = TonWeb.utils.toNano;
const apiKey = 'df344c315ae71a22ae1e58ceb3158597e78435c7dac009bf30e619e3c6dca9fa'
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: apiKey}));
const provider = window.ton;

if (!window.location.search) {
  $(document).ready(function () {
    var walletConnect = document.getElementById("connect");
    walletConnect.addEventListener("click", async function () {
      const accounts = await provider.send('ton_requestAccounts');
      const account = accounts[0];
      walletConnect.textContent = account.slice(0, 6) + '...' + account.slice(account.length - 4, account.length);
      const wallet = tonweb.wallet.create({address: account});
      const address = await wallet.getAddress();
      const balanceA = await tonweb.getBalance(address);
      const storagePublicKey = localStorage.getItem('publicKey')
      const storagePrivateKey = localStorage.getItem('secretKey')
      const storageWalletAddress = localStorage.getItem('walletAddress')
      if (!storagePublicKey || !storagePrivateKey || !storageWalletAddress) {
        const pair = TonWeb.utils.nacl.sign.keyPair();
        const pubkey = TonWeb.utils.bytesToHex(pair.publicKey);
        const privkey = TonWeb.utils.bytesToHex(pair.secretKey);
        localStorage.setItem("publicKey", pubkey);
        localStorage.setItem("secretKey", privkey);
        const wallet = tonweb.wallet.create({publicKey: pair.publicKey});
        const walletAddress = await wallet.getAddress();
        localStorage.setItem("walletAddress", walletAddress.toString(true, true, true));
      }
      const internalWallet = tonweb.wallet.create({address: localStorage.getItem("walletAddress")});
      const internalAddress = await internalWallet.getAddress();
      const internalBalance = await tonweb.getBalance(internalAddress);
      const internalNumBalance = internalBalance / 10**9
      if (internalNumBalance >= 1) {
        const text = "Your in-game balance: " + internalNumBalance.toString() + " TON"
        document.getElementById("walletHeader").innerText = text  
        document.getElementById("room").style.display = "flex"
        document.getElementById("name").disabled = false;
        document.getElementById("inputName").disabled = false;
        document.getElementById("createGame").disabled = false;
        document.getElementById("connect").disabled = true;
      } else {
        const text = 'Your balance: ' + (balanceA / 10**9).toString() + ' TON'
        document.getElementById("walletHeader").innerText = text  
      }
      document.getElementById("deposit").style.display = "inline-block";
      document.getElementById("depositInput").style.display = "inline"
      document
      .getElementById("deposit")
      .addEventListener("click", async function() {
        try {
          const wallet = localStorage.getItem('walletAddress')
          const amount = document.getElementById("depositInput").value
          const nanoAmount = toNano(amount).toString()
          const tx = await provider.send(
            'ton_sendTransaction',
            [{
                to: wallet,
                value: nanoAmount,
                data: 'wallet deposit',
                dataType: 'text'
            }]
          );
          document.getElementById("deposit").style.display = "none";
          document.getElementById("depositLoad").style.display = "inline-block";
          if (tx) {
            setTimeout(() => {
              document.getElementById("depositLoad").style.display = "none";
              document.getElementById("deposit").style.display = "inline-block"
              // document.getElementById("depositInput").style.display = "none"  
              document.getElementById("room").style.display = "flex"
              document.getElementById("name").disabled = false;
              document.getElementById("inputName").disabled = false;
              document.getElementById("createGame").disabled = false;
              document.getElementById("connect").disabled = true;      
            }, 15000)
          }
        } catch (err) {
          console.log(err)
        }
      })
      document
        .getElementById("name")
        .addEventListener("click", async function () {
          const storageWalletAddress = localStorage.getItem("walletAddress")
          const wallet = tonweb.wallet.create({address: storageWalletAddress});
          const address = await wallet.getAddress();
          const balance = await tonweb.getBalance(address);
          const numBalance = balance / 10**9
          if (numBalance >= 1) {
            window.location.search = document.getElementById("inputName").value;
          }
        });
        document
        .getElementById("createGame")
        .addEventListener("click", async function () {
          const storageWalletAddress = localStorage.getItem("walletAddress")
          const wallet = tonweb.wallet.create({address: storageWalletAddress});
          const address = await wallet.getAddress();
          const balance = await tonweb.getBalance(address);
          const numBalance = balance / 10**9
          if (numBalance >= 1) {
            window.location.search =  Math.random().toString(16).slice(-10);
          }
        });
    });
  });

  //   window.location.search = roomName || Math.random().toString(16).slice(-10);
} else {
  $(document).ready(async function () {
    const storageWalletAddress = localStorage.getItem("walletAddress")
    const wallet = tonweb.wallet.create({address: storageWalletAddress});
    const address = await wallet.getAddress();
    const balance = await tonweb.getBalance(address);
    const numBalance = balance / 10**9
    const textBalance = "Your in-game balance: " + numBalance.toString() + " TON"
    const textWallet = "Your in-game wallet: " + storageWalletAddress
    const internalBalance = document.getElementById("internalBalance")
    internalBalance.style.display = "inherit"
    internalBalance.innerText = textBalance
    const internalWallet = document.getElementById("internalWallet")
    internalWallet.style.display = "inherit"
    internalWallet.innerText = textWallet
    document.getElementById("start").style.display = "none"; // hide
    document.getElementById("info").style.display = "inline";
    document.getElementById("canvas").style.display = "inherit"; //
  });
}

var roomName = window.location.search;
