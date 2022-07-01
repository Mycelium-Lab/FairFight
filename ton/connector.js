const TonWeb = require('tonweb')
const {Buffer} = require('buffer')
const button = document.getElementById("connect")
button.addEventListener ('click', async function() {
    const apiKey = 'df344c315ae71a22ae1e58ceb3158597e78435c7dac009bf30e619e3c6dca9fa'
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: apiKey}));
    const provider = window.ton;
    const accounts = await provider.send('ton_requestAccounts');
    const account = accounts[0];
    button.textContent = account.slice(0, 6) + '...' + account.slice(account.length - 4, account.length);
    const wallet = tonweb.wallet.create({address: account});
    const address = await wallet.getAddress();
    const balanceA = await tonweb.getBalance(address);
    const userBalance = document.createElement('p')
    const text = 'Your balance: ' + (balanceA / 10**9).toString() + ' TON'
    userBalance.innerText = text
    document.getElementsByClassName('connectWalletContainer')[0].appendChild(userBalance)
    const depositButton = document.createElement('button')
    depositButton.textContent = 'Deposit your TONs'
    depositButton.className = 'connectWallet'
    depositButton.setAttribute('id', 'depositButton')
    document.getElementsByClassName('connectWalletContainer')[0].appendChild(depositButton)
    $.getScript("../dist/ton.js")
    // $.getScript("../lib/net/socket.io.js");
    // $.getScript("../lib/net/adapter.js");
    // $.getScript("../lib/messages.js");
    // $.getScript("../game.min.js");

    // var canvas = document.createElement('canvas');
    // canvas.setAttribute('id', 'canvas')
    // document.body.appendChild(canvas);
});
