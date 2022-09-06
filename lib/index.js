import { contractAbi, contractAddress } from "./contract.js";
if (window.location.search.length == 0) {
  $(document).ready(async function () {
    if (!window.localStorage.getItem("signer")) {
        let walletConnect = document.getElementById("connect");
        let walletHeader= document.getElementById("walletHeader")
        walletConnect.style.display = ''
        walletHeader.style.display = ''
        walletConnect.addEventListener("click", async function () {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        if(!provider){
          var modal = document.getElementById("myModal");
          modal.style.display = "block";
          document.getElementById("myModal").style.color = "black"
          document.getElementById("reload").addEventListener("click",()=>{location.reload()})
        }  
        else{
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        window.localStorage.setItem('signer', address)
        walletConnect.textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
        const balanceA = ethers.utils.formatEther((await provider.getBalance(address)).toString())
        document.getElementById("walletHeader").style.display = "none"
        const internalNumBalance = parseFloat(balanceA)
        const text = "Your balance: " + internalNumBalance.toString() + " ETH"
        const contract = new ethers.Contract(contractAddress, contractAbi, signer)
        document.getElementById("startInternalBalance").style.display = 'inline-block'  
        document.getElementById("startInternalBalance").innerText = text  
        document.getElementById("room").style.display = "flex"
        document.getElementById("name").disabled = false;
        document.getElementById("inputName").disabled = false;
        document.getElementById("createGame").disabled = false;
        document.getElementById("connect").disabled = true;
        document
        .getElementById("deposit")
        .addEventListener("click", async function() {
          try {
            let internalBalanceBefore = await tonweb.getBalance(internalAddress);
            internalBalanceBefore = internalBalanceBefore.toString()
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
            document.getElementById("feeInfo").innerText = "Depositing..."
            if (tx) {
              let wait = async function(){
                const internalBalanceNow = await tonweb.getBalance(internalAddress);
                console.log(internalBalanceBefore, internalBalanceNow)
                if(internalBalanceNow === internalBalanceBefore) {
                  ///
                } else {
                  const balanceA = await tonweb.getBalance(address);
                  const text = 'Your balance: ' + (balanceA / 10**9).toString() + ' TON'
                  document.getElementById("startTonBalance").innerText = text
                  const textBalance = "Your in-game balance: " + (internalBalanceNow/10**9).toString() + " TON"
                  const internalBalance = document.getElementById("startInternalBalance")
                  internalBalance.style.display = "inherit"
                  internalBalance.innerText = textBalance
                  document.getElementById("depositInput").value = ''
                  clearInterval(intervalId);
                  if (deploy) {
                    document.getElementById("feeInfo").innerText = "Deploying..."
                    console.log("deploy")
                    await deploy.send()
                    let waitDeploy = async () => {
                      const seqno = await internalWallet.methods.seqno().call()
                      console.log("seqno:", seqno)
                      if (seqno) {
                        console.log("deployed")
                        clearInterval(deployInterval)
                        document.getElementById("withdrawInput").style.display = "inline-block"
                        document.getElementById("withdraw").style.display = "inline-block"                        
                        document.getElementById("feeInfo").style.display = "none"
                        document.getElementById("depositLoad").style.display = "none";
                        document.getElementById("deposit").style.display = "inline-block"
                        // document.getElementById("depositInput").style.display = "none"  
                        document.getElementById("room").style.display = "flex"
                        document.getElementById("name").disabled = false;
                        document.getElementById("inputName").disabled = false;
                        document.getElementById("createGame").disabled = false;
                        document.getElementById("connect").disabled = true;      
                      }
                    }
                    deployInterval = setInterval(waitDeploy, 5000)
                  } else {
                    document.getElementById("depositInput").value = ''
                    document.getElementById("withdrawInput").style.display = "inline-block"
                    document.getElementById("withdraw").style.display = "inline-block"                    
                    document.getElementById("feeInfo").style.display = "none"
                    document.getElementById("depositLoad").style.display = "none";
                    document.getElementById("deposit").style.display = "inline-block"
                    // document.getElementById("depositInput").style.display = "none"  
                    document.getElementById("room").style.display = "flex"
                    document.getElementById("name").disabled = false;
                    document.getElementById("inputName").disabled = false;
                    document.getElementById("createGame").disabled = false;
                    document.getElementById("connect").disabled = true;  
                  } 
                }
              };
              intervalId = setInterval(wait, 5000);
            } else { 
              document.getElementById("depositLoad").style.display = "none";
              document.getElementById("deposit").style.display = "inline-block"
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
            }else{
              document.getElementById("allertBalance").style.display = "inline";
            }
          });
  
        }
      });
    } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        if(!provider){
          var modal = document.getElementById("myModal");
          modal.style.display = "block";
          document.getElementById("myModal").style.color = "black"
          document.getElementById("reload").addEventListener("click",()=>{location.reload()})
        }  
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, contractAbi, signer)
        const address = await signer.getAddress()
        const walletDisconnect = document.getElementById("disconnect")
        walletDisconnect.textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
        walletDisconnect.style.display = ''
        const balanceA = ethers.utils.formatEther((await provider.getBalance(address)).toString())
        document.getElementById("walletHeader").style.display = "none"
        const internalNumBalance = parseFloat(balanceA)
        const text = "Your balance: " + internalNumBalance.toString() + " ETH"
        document.getElementById("startInternalBalance").style.display = 'inline-block'  
        document.getElementById("startInternalBalance").innerText = text  
        // document.getElementById("room").style.display = "flex"
        // document.getElementById("name").disabled = false;
        // document.getElementById("inputName").disabled = false;
        document.getElementById("createGame").disabled = false;
        document.getElementById("connect").disabled = true;
        document
          .getElementById("createGame")
          .addEventListener("click", async function () {
            const amountToPlay = await contract.amountToPlay()
            await contract.createBattle({value: amountToPlay.toString()})
          });
        const openBattles = await contract.getOpenBattles()
        let openGamesList = document.getElementById("opengames-list")
        openBattles.forEach(v => {
          let li = document.createElement('li')
          let button = document.createElement("button")
          button.value = v.ID.toString()
          button.textContent = "Join"
          button.addEventListener('click', async (event) => {
            const amountToPlay = await contract.amountToPlay()
            await contract.joinBattle(event.target.value, {value: amountToPlay.toString()}) 
          })
          li.textContent = `ID: ${v.ID.toString()} `
          li.appendChild(button)
          openGamesList.appendChild(li)
        })
    }
    if (localStorage.getItem("userTonWalletAddress")) {
      $('#connect').trigger('click');
    }
  });

  //   window.location.search = roomName || Math.random().toString(16).slice(-10);
} else {
  // const apiKey = 'df344c315ae71a22ae1e58ceb3158597e78435c7dac009bf30e619e3c6dca9fa'
  // const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: apiKey}));
  console.log(`ss`)
  $(document).ready(async function () {
    console.log(`ss`)
    // const tonWalletAddress = localStorage.getItem("userTonWalletAddress")
    // const tonWallet = tonweb.wallet.create({address: tonWalletAddress});
    // const tonAddress = await tonWallet.getAddress();
    // const balanceA = await tonweb.getBalance(tonAddress);
    // const text = 'Your balance: ' + (balanceA / 10**9).toString() + ' TON'
    // const tonBalance = document.getElementById("tonBalance")
    // tonBalance.style.display = "inherit"
    // tonBalance.innerText = text
    // const storageWalletAddress = localStorage.getItem("walletAddress")
    // const wallet = tonweb.wallet.create({address: storageWalletAddress});
    // const address = await wallet.getAddress();
    // const balance = await tonweb.getBalance(address);
    // const numBalance = balance / 10**9
    // const textBalance = "Your in-game balance: " + numBalance.toString() + " TON"
    // const textWallet = `Your in-game wallet: <a target="_blank" href="https://testnet.tonscan.org/address/${storageWalletAddress}">${storageWalletAddress}</a>`
    // const internalBalance = document.getElementById("internalBalance")
    // internalBalance.style.display = "inherit"
    // internalBalance.innerHTML = textBalance
    // const internalWallet = document.getElementById("internalWallet")
    // internalWallet.style.display = "inherit"
    // internalWallet.innerText = textWallet
    // document.getElementById("loadingStage").innerText = "Waiting another user..."    
    // document.getElementById("canvasLoad").style.display = "flex"
    // internalWallet.innerHTML = textWallet
    // const gameName = document.getElementById("gameName")
    // gameName.style.display = "inherit"
    // gameName.innerHTML ="Game name: " + window.location.search.slice(1);
    // document.getElementById("start").style.display = "none"; // hide
    // document.getElementById("info").style.display = "inline";
    // document.getElementById("finishGame").style.display = "inline-block";
    // document.getElementById("finishGame").addEventListener("click", async function () {
    //   this.innerText = 'Finishing...';
    //   await window.gameRoom.finishGame();
    //   window.location.search = "";
    // });
  });
}

var roomName = window.location.search;
