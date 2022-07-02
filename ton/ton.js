const TonWeb = require('tonweb')
const button = document.getElementById("depositButton")
const {Buffer} = require('buffer')

button.addEventListener ('click', async function() {
    const apiKey = 'df344c315ae71a22ae1e58ceb3158597e78435c7dac009bf30e619e3c6dca9fa'
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: apiKey}));
    const provider = window.ton;
    let userKey
    const storage = localStorage.getItem('myKey')
    if (storage) {
        userKey = storage
    } else {
        const seed = tonweb.utils.newSeed();
        userKey = Buffer.from(seed).toString('base64');
        localStorage.setItem('myKey', userKey);
    }
    
    $.getScript("../lib/net/socket.io.js");
    $.getScript("../lib/net/adapter.js");
    $.getScript("../lib/messages.js");
    $.getScript("../game.min.js");

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas')
    document.body.appendChild(canvas);

})