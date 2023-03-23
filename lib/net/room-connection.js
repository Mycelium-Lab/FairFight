// jscs:disable validateIndentation
try {
  
ig.module(
  'net.room-connection'
)
.requires(
  'game.events',
  'net.peer-connection',
  'net.contract'
)
.defines(async function() {

let network = networks.find(n => n.chainid == 42262);
let gameID;
let decimals;
let token;
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
network = networks.find(n => n.chainid == params.network)
gameID = params.ID
token = params.token
decimals = params.decimals

const provider = new ethers.providers.Web3Provider(window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner()
const address = await signer.getAddress()
// const contract = new ethers.Contract(network.contractAddress, contractAbi, signer)

RoomConnection = Events.Emitter.extend({
  peers: null,
  socket: null,
  roomName: null,
  roomInfo: null,
  pendingSdp: null,
  pendidateCandidates: null,
  paymentChannel: null,
  connection: null,
  channelToppedUp: 0,

  init: function(roomName, socket) {
    this.parent();
    this.socket = socket;
    this.roomName = roomName;
    this.pendingSdp = {};
    this.pendingCandidates = {};

    this.socketHandlers = {
      'sdp': this.onSdp,
      'ice_candidate': this.onIceCandidate,
      'room': this.onJoinedRoom,
      'user_join': this.onUserJoin,
      'user_ready': this.onUserReady,
      'user_leave': this.onUserLeave,
      'error': this.onError,
      'user_dead': this.playerDied,
      'user_lose_all': this.onLoseAll,
      'finishing': this.onFinishing,
      'end_finishing': this.onEndFinishing,
      'update_balance': this.onUpdateBalance,
      'end_waiting_another_user': this.onEndWaitingAnotherUser,
      'jump': this.onJump
    };

    this.peerConnectionHandlers = {
      'open': this.onPeerChannelOpen,
      'close': this.onPeerChannelClose,
      'message': this.onPeerMessage
    };

    Events.on(this.socket, this.socketHandlers, this);

  },

  destroy: function() {
    this.parent();
    Events.off(this.socket, this.socketHandlers, this);
  },

  connect: function(walletAddress, publicKey) {
    this.sendJoin(this.roomName, walletAddress);
  },

  initPeerConnection: function(user, isInitiator) {
    // Create connection
    var cnt = new PeerConnection(this.socket, user, isInitiator);
    Events.on(cnt, this.peerConnectionHandlers, this, cnt, user);

    // Sometimes sdp|candidates may arrive before we initialized
    // peer connection, so not to loose the, we save them as pending
    var userId = user.userId;
    var pendingSdp = this.pendingSdp[userId];
    if (pendingSdp) {
      cnt.setSdp(pendingSdp);
      delete this.pendingSdp[userId];
    }
    var pendingCandidates = this.pendingCandidates[userId];
    if (pendingCandidates) {
      pendingCandidates.forEach(cnt.addIceCandidate, cnt);
      delete this.pendingCandidates[userId];
    }
    return cnt;
  },

  onLoseAll: function (data) {
    // alert(data)
  },

  playerDied: async function(address) {
    this.socket.emit('user_dead', {
      walletAddress: address
    });
  },

  playerJump: function() {
    this.socket.emit('jump');
  },

  onJump: function() {
    // console.log('jump listen')
  },

  onSdp: function(message) {
    var userId = message.userId;
    if (!this.peers[userId]) {
      this.log('Adding pending sdp from another player. id = ' + userId, 'gray');
      this.pendingSdp[userId] = message.sdp;
      return;
    }
    this.peers[userId].setSdp(message.sdp);
  },

  onIceCandidate: function(message) {
    var userId = message.userId;
    if (!this.peers[userId]) {
      this.log('Adding pending candidate from another player. id =' + userId, 'gray');
      if (!this.pendingCandidates[userId]) {
        this.pendingCandidates[userId] = [];
      }
      this.pendingCandidates[userId].push(message.candidate);
      return;
    }
    this.peers[userId].addIceCandidate(message.candidate);
  },

  addressMaker: function(address) {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);  
  },

  calcAmountWithDecimals: function (amount, decimals) {
      return amount / 10**parseInt(decimals)
  },

  updateFinishingStats: function (data) {
    const totalDeposit = BigInt(data.amount1.toString()) + BigInt(data.amount2.toString())
    const _deposit = (totalDeposit / BigInt(2) / BigInt(10**parseInt(decimals))).toString()
    const internalBalance = document.getElementsByClassName("internalBalance")
    const enemyBalance = document.getElementsByClassName("enemyBalance")
    const _yourWinLose = parseFloat(internalBalance.item(0).textContent) - parseFloat(_deposit)
    const _elemyourAmountWinLose = document.getElementById("yourAmountWinLose")
    document.getElementById("finish_modal_your_address").textContent = this.addressMaker(address) + ' '
    document.getElementById("finish_modal_enemy_address").textContent = address == data.address1 ? this.addressMaker(data.address2) + ' ' : this.addressMaker(data.address1) + ' '
    if (_yourWinLose > 0) {
      _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ${token}`
      _elemyourAmountWinLose.className = 'green'
    } else if (_yourWinLose == 0) {
      _elemyourAmountWinLose.textContent = `Win ${_yourWinLose} ${token}`
      _elemyourAmountWinLose.className = 'orange'
    } else {
      _elemyourAmountWinLose.textContent = `Lose ${_yourWinLose * (-1)} ${token}`
      _elemyourAmountWinLose.className = 'red'
    }
    const _enemyWinLose = parseFloat(enemyBalance.item(0).textContent) - parseFloat(_deposit)
    const _elemenemyAmountWinLose = document.getElementById("enemyAmountWinLose")
    if (_enemyWinLose > 0) {
      _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ${token}`
      _elemenemyAmountWinLose.className = 'green'
    } else if (_enemyWinLose == 0) {
      _elemenemyAmountWinLose.textContent = `Win ${_enemyWinLose} ${token}`
      _elemenemyAmountWinLose.className = 'orange'
    } else {
      _elemenemyAmountWinLose.textContent = `Lose ${_enemyWinLose * (-1)} ${token}`
      _elemenemyAmountWinLose.className = 'red'
    }
  },

  onUpdateBalance: function (data) {
    try {
      if(data.amount1 == undefined && data.amount2 == undefined) {
        window.location.href = `/?network=${network.chainid}`
      }
      const internalBalance = document.getElementsByClassName("internalBalance")
      const yourKills = document.getElementsByClassName("yourKills")
      const yourDeaths = document.getElementsByClassName("yourDeaths")
      const enemyKills = document.getElementsByClassName("enemyKills")
      const enemyDeaths = document.getElementsByClassName("enemyDeaths")
      const enemyBalance = document.getElementsByClassName("enemyBalance")
      const rounds = document.getElementById("rounds_amount")
      if (data.amount1 == NaN || data.amount2 == NaN || data.amount1 == 'NaN' || data.amount2 == 'NaN' || data.amount1 == null || data.amount2 == null) throw Error;
      let _rounds = parseInt(data.rounds)
      const gameEndedRounds = Math.round(_rounds - parseInt((data.remainingRounds == null || data.remainingRounds == NaN) ? 0 : data.remainingRounds))
      if (rounds == NaN || gameEndedRounds == NaN || rounds == 'NaN' || gameEndedRounds == 'NaN' || rounds == null || gameEndedRounds == null) throw Error;
      rounds.textContent =  `${gameEndedRounds}/${_rounds}`
      if (data.address1 == address) {
        for (let i = 0; i < 3; i++) {
          try {
            internalBalance.item(i).textContent = `${this.calcAmountWithDecimals(data.amount1, decimals)} ${token}`  
          } catch (error) {
            
          }
        }
        for (let i = 0; i < 3; i++) {
          yourKills.item(i).textContent = data.killsAddress1
          yourDeaths.item(i).textContent = data.deathsAddress1
          enemyKills.item(i).textContent = data.killsAddress2
          enemyDeaths.item(i).textContent = data.deathsAddress2
          try {
            enemyBalance.item(i).textContent = `${this.calcAmountWithDecimals(data.amount2, decimals)} ${token}`
          
          } catch (error) {
            
          }
        }
      } else {
        for (let i = 0; i < 3; i++) {
          try {
            internalBalance.item(i).textContent = `${this.calcAmountWithDecimals(data.amount2, decimals)} ${token}`
          } catch (error) {
            
          }
        }
        for (let i = 0; i < 3; i++) {
          yourKills.item(i).textContent = data.killsAddress2
          yourDeaths.item(i).textContent = data.deathsAddress2
          enemyKills.item(i).textContent = data.killsAddress1
          enemyDeaths.item(i).textContent = data.deathsAddress1
          try {
            enemyBalance.item(i).textContent = `${this.calcAmountWithDecimals(data.amount1, decimals)} ${token}`  
          } catch (error) {
          }
        }
      }
      this.updateFinishingStats(data)
      if (data.amount1 == '0' || data.amount2 == '0' || gameEndedRounds == _rounds) {
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        document.getElementById("over_modal").style.display = "block";
        document.getElementById("sure_want_end").style.display = 'none'
      }
    } catch (error) {
      console.error(error)
    }
    
  },

  updateBalance: function () {
    this.socket.emit('user_update_balance');
  },

  onEndWaitingAnotherUser: function() {
    document.getElementById("canvas").style.display = 'inherit'
    document.getElementById("noCanvas").style.display = 'none'
    document.getElementById("wainting_modal").style.display = 'none'
  },

  onJoinedRoom: function(roomInfo) {
    this.emit('joined', roomInfo);
    this.roomInfo = roomInfo;
    if (this.roomInfo.users.length < 2) {
      // setTimeout(() => {
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("wainting_modal").style.display = 'block'
        // document.getElementById("loadingStage").style.display = 'inherit'
        // document.getElementById("loadingStage").textContent = 'Waiting another user(if you are waiting for a long time, try to reload the page)'
      // }, 1000)
    }
    this.peers = {};
    for (var k in this.roomInfo.users) {
      var user = this.roomInfo.users[k];
      if (user.userId !== this.roomInfo.userId) {
        this.peers[user.userId] = this.initPeerConnection(this.roomInfo.users[k], true);
      }
    }
    console.log('Joined the room: ', roomInfo);
    document.getElementById("finishGame").addEventListener('click', async () => {
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        this.socket.emit("finishing", {fromButton: true})
        window.location.href = `/?network=${network.chainid}`
    })
  },

  onFinishing: function(data) {
    document.getElementById("canvas").style.display = 'none'
    document.getElementById("noCanvas").style.display = ''
    const over_modal_display = document.getElementById("over_modal").style.display
    if (data.fromButton && (over_modal_display == 'none' || over_modal_display == '')) {
      this.updateFinishingStats(data)
      setTimeout(() => {
        document.getElementById("enemy_finishing_game_modal").style.display = 'block'
        document.getElementById("over_modal").style.display = 'block'
      }, 10)
    }
    // document.getElementById("loadingStage").style.display = 'inherit'
    // document.getElementById("loadingStage").textContent = 'Finishing game'
  },

  onEndFinishing: function () {
    window.location.href = `/?network=${network.chainid}`
  },

  onError: function(error) {
    this.log('Error connecting to room' + error.message, 'red');
  },

  onUserJoin: function(user) {
    console.log('User joined: ', user.user);
    this.log('Another player joined. id = ' + user.userId, 'orange');
    var peerConnection = this.initPeerConnection(user, false);
    this.roomInfo.users.push(user);
    this.peers[user.userId] = peerConnection;
  },

  onUserReady: function(user) {
    this.log('Another player ready. id = ' + user.userId, 'orange');
    this.emit('user_ready', user);
  },

  onPeerChannelOpen: function(peer, user) {
    this.emit('peer_open', user, peer);
  },

  onPeerChannelClose: function(peer, user) {
    this.emit('peer_close', user, peer);
  },

  onPeerMessage: function(peer, user, message) {
    this.emit('peer_message', message, user, peer);
  },

  onUserLeave: function(goneUser) {
    if (!this.peers[goneUser.userId]) {
      return;
    }
    var cnt = this.peers[goneUser.userId];
    Events.off(cnt, this.peerConnectionHandlers, this);
    cnt.destroy();
    delete this.peers[goneUser.userId];
    delete this.roomInfo.users[goneUser.userId];
    this.emit('user_leave', goneUser);
  },

  sendJoin: async function(roomName, walletAddress) {
    this.socket.emit('join', {
      roomName: roomName,
      walletAddress: walletAddress
    });
  },

  sendLeave: function() {
    this.socket.emit(MessageType.LEAVE);
  },

  broadcastMessage: function(message) {
    this.broadcast(MessageBuilder.serialize(message));
  },

  sendMessageTo: function(userId, message) {
    var peer = this.peers[userId];
    this.peerSend(peer, MessageBuilder.serialize(message));
  },

  broadcast: function(arrayBuffer) {
    for (var p in this.peers) {
      this.peerSend(this.peers[p], arrayBuffer);
    }
  },

  peerSend: function(peer, data) {
    peer.sendMessage(data);
  },

  log: function(message, color) {
    console.log('%c%s', 'color:' + color, message);
  }
});

});

} catch (error) {
  console.error(error)
}