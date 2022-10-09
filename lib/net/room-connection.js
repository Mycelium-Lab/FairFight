// jscs:disable validateIndentation
ig.module(
  'net.room-connection'
)
.requires(
  'game.events',
  'net.peer-connection',
  'net.contract'
)
.defines(async function() {

const provider = new ethers.providers.Web3Provider(window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner()
const address = await signer.getAddress()
const contract = new ethers.Contract(contractAddress, contractAbi, signer)

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
    this.sendJoin(this.roomName, walletAddress, publicKey);
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
      roomName: window.location.search.slice(4),
      walletAddress: address,
      // publicKey: publicKey,
      inGameBalance: ethers.utils.parseEther('1').toString()
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

  onUpdateBalance: function (data) {
    const internalBalance = document.getElementById("internalBalance")
    const yourKills = document.getElementById("yourKills")
    const yourDeaths = document.getElementById("yourDeaths")
    const enemyKills = document.getElementById("enemyKills")
    const enemyDeaths = document.getElementById("enemyDeaths")
    const enemyBalance = document.getElementById("enemyBalance")
    const rounds = document.getElementById("rounds_amount")
    const totalDeposit = parseInt(data.amount1.toString()) + parseInt(data.amount2.toString())
    const _rounds = Math.round(totalDeposit / parseInt(data.amountToLose.toString()) / 2)
    const gameEndedRounds = Math.round(_rounds - parseInt(data.remainingRounds))
    rounds.textContent =  `${gameEndedRounds}/${_rounds}`
    if (data.amount1 == '0' || data.amount2 == '0' || gameEndedRounds == _rounds) {
      document.getElementById("canvas").style.display = 'none'
      document.getElementById("loadingStage").style.display = 'inherit'
      document.getElementById("loadingStage").textContent = 'Finishing game'
    }
    if (data.address1 == address) {
      internalBalance.textContent = `${ethers.utils.formatEther(data.amount1)} `
      yourKills.textContent = data.killsAddress1
      yourDeaths.textContent = data.deathsAddress1
      enemyBalance.textContent = `${ethers.utils.formatEther(data.amount2)} `
      enemyKills.textContent = data.killsAddress2
      enemyDeaths.textContent = data.deathsAddress2
    } else {
      internalBalance.textContent = `${ethers.utils.formatEther(data.amount2)} `
      yourKills.textContent = data.killsAddress2
      yourDeaths.textContent = data.deathsAddress2
      enemyBalance.textContent = `${ethers.utils.formatEther(data.amount1)} `
      enemyKills.textContent = data.killsAddress1
      enemyDeaths.textContent = data.deathsAddress1
    }
  },

  updateBalance: function () {
    this.socket.emit('user_update_balance');
  },

  onEndWaitingAnotherUser: function() {
    document.getElementById("canvas").style.display = 'inherit'
    document.getElementById("loadingStage").style.display = 'none'
    document.getElementById("loadingStage").textContent = ''
  },

  onJoinedRoom: function(roomInfo) {
    this.emit('joined', roomInfo);
    this.roomInfo = roomInfo;
    if (this.roomInfo.users.length < 2) {
      // setTimeout(() => {
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Waiting another user(if you are waiting for a long time, try to reload the page)'
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
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        this.socket.emit("finishing")
        setTimeout(() => {
          let querySignExist = new URLSearchParams();
          querySignExist.append("gameID", this.roomName)
          querySignExist.append("address", address)
          fetch('/sign?' + querySignExist.toString())
          .then(async(res) => {
            const data = await res.json()
            try {
                const modalConfirm = document.getElementById("confirm_modal")
                const modalPending = document.getElementById("pending_modal")
                if (data.r.length == 0) {throw Error('Signature does not exist')}
                else {
                const dataToContract = ethers.utils.defaultAbiCoder.encode(
                  [
                      'uint256',
                      'uint256',
                      'uint256',
                      'bytes32',
                      'uint8',
                      'bytes32'
                  ], 
                  [
                      this.roomName, 
                      data.player1Amount, 
                      data.player2Amount,
                      data.r,
                      data.v,
                      data.s
                  ]
                )
                document.getElementById("confirmation_modal").style.display = 'none'
                modalConfirm.style.display = 'block'
                await contract.finishBattle(dataToContract)
                  .then(async (tx) => {
                    modalConfirm.style.display = 'none'
                    modalPending.style.display = 'block'
                    await tx.wait().then(() => {
                      modalPending.style.display = 'none'
                    })
                  })
                  .catch(err => {
                    modalConfirm.style.display = 'none'
                    modalPending.style.display = 'none'
                    if (err.reason != undefined) {
                      alert(err.reason)
                    }
                  })
                }
              } catch(err){
                alert(err)
              }
          })
          .then(() => {
            this.socket.emit('end_finishing')
            window.location.href = '/'
          })
          .catch((err) => {
            console.error(err)
          })
        }, 1000)
          
    })
  },

  onFinishing: function() {
    document.getElementById("canvas").style.display = 'none'
    document.getElementById("loadingStage").style.display = 'inherit'
    document.getElementById("loadingStage").textContent = 'Finishing game'
  },

  onEndFinishing: function () {
    console.log('ssssssss')
    window.location.href = '/'
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

  sendJoin: async function(roomName, walletAddress, publicKey) {
    this.socket.emit('join', {
      roomName: roomName,
      walletAddress: walletAddress,
      publicKey: publicKey,
      inGameBalance: ethers.utils.parseEther('1').toString()
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
