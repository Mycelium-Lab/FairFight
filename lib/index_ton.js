import { TonConnect, isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';
import TonConnectUI from '@tonconnect/ui';

const main = async () => {
    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'http://localhost:5000/tonconnect-manifest.json',
        buttonRootId: 'connect'
    })
    async function connectToWallet() {
        const connectedWallet = await tonConnectUI.connectWallet();
        // Do something with connectedWallet if needed
        console.log(connectedWallet);
    }
    connectToWallet().catch(error => {
        console.error("Error connecting to wallet:", error);
    });
}

main().catch(err => console.log(err))