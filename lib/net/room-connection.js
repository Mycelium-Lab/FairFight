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

let decimals;
let token;
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let network = networks.find(n => n.chainid == params.network)
let gameID = params.ID
Network = network
GameID = params.ID
token = params.token
decimals = params.decimals
const mobileAndTabletCheck = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
if (mobileAndTabletCheck()) {
  while (typeof window._provider === 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
const provider = new ethers.providers.Web3Provider(window._provider ? window._provider : window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner()
const address = await signer.getAddress()
let query = new URLSearchParams();
query.append("gameid", gameID)
query.append("chainid", network.chainid)
Contract = new ethers.Contract(network.contractAddress, contractAbi, signer)

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
      'jump': this.onJump,
      'not_user_room': this.onNotUserRoom
    };

    this.peerConnectionHandlers = {
      'open': this.onPeerChannelOpen,
      'close': this.onPeerChannelClose,
      'message': this.onPeerMessage
    };

    Events.on(this.socket, this.socketHandlers, this);

  },

  destroy: function() {
    try {
      this.parent();
      Events.off(this.socket, this.socketHandlers, this);
    } catch (error) {
      
    }
  },

  connect: function(walletAddress, publicKey) {
    try {
      this.sendJoin(this.roomName, walletAddress);
    } catch (error) {
      console.log(error)
    }
  },

  initPeerConnection: function(user, isInitiator) {
    try {
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
    } catch (error) {
      console.log(error)
    }
  },

  onLoseAll: function (data) {
    // alert(data)
  },

  playerDied: async function(address) {
    try {
      this.socket.emit('user_dead', {
        walletAddress: address
      });
    } catch (error) {
      console.log(error)
    }
  },

  playerJump: function() {
    this.socket.emit('jump');
  },

  onJump: function() {
    // console.log('jump listen')
  },

  onSdp: function(message) {
    try {
      var userId = message.userId;
      if (!this.peers[userId]) {
        this.log('Adding pending sdp from another player. id = ' + userId, 'gray');
        this.pendingSdp[userId] = message.sdp;
        return;
      }
      this.peers[userId].setSdp(message.sdp);
    } catch (error) {
      console.log(error)
    }
  },

  onIceCandidate: function(message) {
    try {
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
    } catch (error) {
      console.log(error)
    }
  },

  addressMaker: function(address) {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);  
  },

  calcAmountWithDecimals: function (amount, decimals) {
    return amount / 10**parseInt(decimals)
  },

  shortFloat: function(value) {
    if (!Number.isInteger(value)) {
      let valueAsString = value.toFixed(10)
      return parseFloat(valueAsString)
    }
    return value
  },

  updateFinishingStats: function (data) {
    try {
      const totalDeposit = BigInt(data.amount1.toString()) + BigInt(data.amount2.toString())
      const _deposit = (totalDeposit / BigInt(2) / BigInt(10**parseInt(decimals))).toString()
      const internalBalance = document.getElementsByClassName("internalBalance")
      const enemyBalance = document.getElementsByClassName("enemyBalance")
      const _yourWinLose = this.shortFloat(parseFloat(internalBalance.item(0).textContent) - parseFloat(_deposit))

      const _elemyourAmountWinLose = document.getElementById("yourAmountWinLose")
      const yourAddress = document.getElementById("finish_modal_your_address")
      const enemyAdderss = document.getElementById("finish_modal_enemy_address")

      yourAddress.target = "_blank"
      yourAddress.href = `${network.explorer}/address/${address}`
      yourAddress.textContent = this.addressMaker(address) + ' '

      enemyAdderss.target = "_blank"
      enemyAdderss.href = `${network.explorer}/address/${address == data.address1 ? data.address2 : data.address1}`
      enemyAdderss.textContent = address == data.address1 ? this.addressMaker(data.address2) + ' ' : this.addressMaker(data.address1) + ' '
      if (_yourWinLose > 0) {
        _elemyourAmountWinLose.textContent = `Win: ${_yourWinLose} ${token}`
        _elemyourAmountWinLose.className = 'green'
      } else if (_yourWinLose == 0) {
        _elemyourAmountWinLose.textContent = `Win: ${_yourWinLose} ${token}`
        _elemyourAmountWinLose.className = 'orange'
      } else {
        _elemyourAmountWinLose.textContent = `Lose: ${_yourWinLose * (-1)} ${token}`
        _elemyourAmountWinLose.className = 'red'
      }
      const _enemyWinLose = this.shortFloat(parseFloat(enemyBalance.item(0).textContent) - parseFloat(_deposit))
      const _elemenemyAmountWinLose = document.getElementById("enemyAmountWinLose")
      if (_enemyWinLose > 0) {
        _elemenemyAmountWinLose.textContent = `Win: ${_enemyWinLose} ${token}`
        _elemenemyAmountWinLose.className = 'green'
      } else if (_enemyWinLose == 0) {
        _elemenemyAmountWinLose.textContent = `Win: ${_enemyWinLose} ${token}`
        _elemenemyAmountWinLose.className = 'orange'
      } else {
        _elemenemyAmountWinLose.textContent = `Lose: ${_enemyWinLose * (-1)} ${token}`
        _elemenemyAmountWinLose.className = 'red'
      }
    } catch (error) {
      console.log(error)
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
            internalBalance.item(i).textContent = `${this.shortFloat(this.calcAmountWithDecimals(data.amount1, decimals))} ${token}`  
          } catch (error) {
            
          }
        }
        for (let i = 0; i < 3; i++) {
          try {
          yourKills.item(i).textContent = data.killsAddress1
          yourDeaths.item(i).textContent = data.deathsAddress1
          enemyKills.item(i).textContent = data.killsAddress2
          enemyDeaths.item(i).textContent = data.deathsAddress2
            enemyBalance.item(i).textContent = `${this.shortFloat(this.calcAmountWithDecimals(data.amount2, decimals))} ${token}`
          
          } catch (error) {
            
          }
        }
      } else {
        for (let i = 0; i < 3; i++) {
          try {
            internalBalance.item(i).textContent = `${this.shortFloat(this.calcAmountWithDecimals(data.amount2, decimals))} ${token}`
          } catch (error) {
            
          }
        }
        for (let i = 0; i < 3; i++) {
          try {
          yourKills.item(i).textContent = data.killsAddress2
          yourDeaths.item(i).textContent = data.deathsAddress2
          enemyKills.item(i).textContent = data.killsAddress1
          enemyDeaths.item(i).textContent = data.deathsAddress1
            enemyBalance.item(i).textContent = `${this.shortFloat(this.calcAmountWithDecimals(data.amount1, decimals))} ${token}`  
          } catch (error) {
          }
        }
      }
      this.updateFinishingStats(data)
      if (data.amount1 == '0' || data.amount2 == '0' || gameEndedRounds == _rounds) {
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("wrapper__gradient_game").style.background = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        document.getElementById("over_modal").style.display = "flex";
        document.getElementById("sure_want_end").style.display = 'none'
      }
    } catch (error) {
      console.error(error)
    }
    
  },

  updateBalance: function () {
    try {
      this.socket.emit('user_update_balance');
    } catch (error) {
      console.log(error)
    }
  },

  onEndWaitingAnotherUser: function() {
    try {
      document.getElementById("canvas").style.display = 'inherit'
      document.getElementById("noCanvas").style.display = 'none'
      document.getElementById("wrapper__gradient_game").style.background = '#020202'
      // document.getElementById("wainting_modal").style.display = 'none'
    } catch (error) {
      console.log(error)
    }
  },

  onJoinedRoom: function(roomInfo) {
    try {
      this.emit('joined', roomInfo);
      this.roomInfo = roomInfo;
      if (this.roomInfo.users.length < 2) {
        // setTimeout(() => {
          document.getElementById("canvas").style.display = 'none'
          document.getElementById("noCanvas").style.display = ''
          document.getElementById("wrapper__gradient_game").style.background = ''
          // document.getElementById("wainting_modal").style.display = 'flex'
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
          document.getElementById('confirm_finishgame_modal').style.display = 'none'
          document.getElementById("canvas").style.display = 'none'
          document.getElementById("noCanvas").style.display = ''
           document.getElementById("wrapper__gradient_game").style.background = ''
          document.getElementById("loadingStage").style.display = 'inherit'
          document.getElementById("loadingStage").textContent = 'Finishing game'
          this.socket.emit("finishing", {fromButton: true})
          window.location.href = `/?network=${network.chainid}`
      })
      document.getElementById('finishGame2').addEventListener('click', async () => {
        document.getElementById('confirm_finishgame_modal').style.display = 'none'
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("wrapper__gradient_game").style.background = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        this.socket.emit("finishing", {fromButton: true})
        window.location.href = `/?network=${network.chainid}`
      })
      document.getElementById('finishGame3').addEventListener('click', async () => {
        document.getElementById('confirm_finishgame_modal').style.display = 'none'
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
         document.getElementById("wrapper__gradient_game").style.background = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        this.socket.emit("finishing", {fromButton: true})
        window.location.href = `/?network=${network.chainid}`
      })
       document.getElementById('finishGame4').addEventListener('click', async () => {
        document.getElementById('confirm_finishgame_modal_desktop').style.display = 'none'
        document.getElementById("canvas").style.display = 'none'
        document.getElementById("noCanvas").style.display = ''
        document.getElementById("wrapper__gradient_game").style.background = ''
        document.getElementById("loadingStage").style.display = 'inherit'
        document.getElementById("loadingStage").textContent = 'Finishing game'
        this.socket.emit("finishing", {fromButton: true})
        window.location.href = `/?network=${network.chainid}`
      })
    } catch (error) {
      console.log(error)
    }
  },

  onFinishing: function(data) {
    try {
      document.getElementById("canvas").style.display = 'none'
      document.getElementById("noCanvas").style.display = ''
      document.getElementById("wrapper__gradient_game").style.background = ''
      const over_modal_display = document.getElementById("over_modal").style.display
      if (data.fromButton && (over_modal_display == 'none' || over_modal_display == '')) {
        this.updateFinishingStats(data)
        setTimeout(() => {
          //document.getElementById("enemy_finishing_game_modal").style.display = 'flex'
          document.getElementById("over_modal").style.display = 'flex'
        }, 10)
      }
      // document.getElementById("loadingStage").style.display = 'inherit'
      // document.getElementById("loadingStage").textContent = 'Finishing game'
    } catch (error) {
      console.log(error)
    }
  },

  onEndFinishing: function () {
    try {
      window.location.href = `/?network=${network.chainid}`
    } catch (error) {
      console.log(error)
    }
  },

  onError: function(error) {
    try {
      this.log('Error connecting to room' + error.message, 'red');
    } catch (error) {
      console.log(error)
    }
  },

  onUserJoin: function(user) {
    try {
      console.log('User joined: ', user.user);
      this.log('Another player joined. id = ' + user.userId, 'orange');
      var peerConnection = this.initPeerConnection(user, false);
      this.roomInfo.users.push(user);
      this.peers[user.userId] = peerConnection;
    } catch (error) {
      console.log(error)
    }
  },

  onNotUserRoom: function () {
    try {
      window.location.href = `/?network=${network}`
    } catch (error) {
      
    }
  },

  onUserReady: function(user) {
    try {
      this.log('Another player ready. id = ' + user.userId, 'orange');
      this.emit('user_ready', user);
    } catch (error) {
      console.log(error)
    }
  },

  onPeerChannelOpen: function(peer, user) {
    try {
      this.emit('peer_open', user, peer);
    } catch (error) {
      console.log(error)
    }
  },

  onPeerChannelClose: function(peer, user) {
    try {
      this.emit('peer_close', user, peer);
    } catch (error) {
      console.log(error)
    }
  },

  onPeerMessage: function(peer, user, message) {
    try {
      this.emit('peer_message', message, user, peer);
    } catch (error) {
      console.log(error)
    }
  },

  onUserLeave: function(goneUser) {
    try {
      if (!this.peers[goneUser.userId]) {
        return;
      }
      var cnt = this.peers[goneUser.userId];
      Events.off(cnt, this.peerConnectionHandlers, this);
      cnt.destroy();
      delete this.peers[goneUser.userId];
      delete this.roomInfo.users[goneUser.userId];
      this.emit('user_leave', goneUser);
    } catch (error) {
      console.log(error)
    }
  },

  sendJoin: async function(roomName, walletAddress) {
    try {
      this.socket.emit('join', {
        roomName: roomName,
        walletAddress: walletAddress
      });
    } catch (error) {
      console.log(error)
    }
  },

  sendLeave: function() {
    try {
      this.socket.emit(MessageType.LEAVE);
    } catch (error) {
      console.log(error)
    }
  },

  broadcastMessage: function(message) {
    try {
      this.broadcast(MessageBuilder.serialize(message));
    } catch (error) {
      console.log(error)
    }
  },

  sendMessageTo: function(userId, message) {
    try {
      var peer = this.peers[userId];
      this.peerSend(peer, MessageBuilder.serialize(message));
    } catch (error) {
      console.log(error)
    }
  },

  broadcast: function(arrayBuffer) {
    try {
      for (var p in this.peers) {
        this.peerSend(this.peers[p], arrayBuffer);
      }
    } catch (error) {
      console.log(error)
    }
  },

  peerSend: function(peer, data) {
    try {
      peer.sendMessage(data);
    } catch (error) {
      console.log(error)
    }
  },

  log: function(message, color) {
    try {
      console.log('%c%s', 'color:' + color, message);
    } catch (error) {
      console.log(error)
    }
  }
});

});

} catch (error) {
  console.error(error)
}