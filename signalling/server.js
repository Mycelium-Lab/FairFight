const PORT = 8033;
const MAX_ROOM_USERS = 2;

const fs = require('fs');
const log = console.log.bind(console);
const io = require('socket.io')(PORT);
const redis = require("redis")
const pg = require("pg")
const ethers = require("ethers")
const web3 = require("web3")
require("dotenv").config()

const { contractAbi, contractAddress } = require("../contract/contract.js")
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const contract = new ethers.Contract(contractAddress, contractAbi, signer)
const redisClient = redis.createClient({
  socket: {
      host: 'localhost',
      port: 6379
  }
})

const pgClient = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
})


const rooms = {};
let lastUserId = 0;
let lastRoomId = 0;

const MessageType = {
  // A messages you send to server, when want to join or leave etc.
  JOIN: 'join',
  DISCONNECT: 'disconnect',

  // You receive room info as a response for join command. It contains information about
  // the room you joined, and it's users
  ROOM: 'room',

  // A messages you receive from server when another user want to join or leave etc.
  USER_JOIN: 'user_join',
  USER_READY: 'user_ready',
  USER_DEAD: 'user_dead',
  USER_LEAVE: 'user_leave',
  CHANNEL_DEPLOYED: 'channel_deployed',
  USER_TOPPED_UP_CHANNEL: 'user_topped_up_channel',
  USER_INITED_CHANNEL: 'user_inited_channel',
  USER_SIGNED_CHANNEL_CLOSE: 'user_signed_channel_close',
  USER_EDIT_PAYMENT_CHANNEL: 'user_edit_payment_channel',
  USER_CLOSED_CHANNEL: 'user_closed_channel',
  USER_LOSE_ALL: 'user_lose_all',
  FINISHING: 'finishing',

  // WebRtc signalling info, session and ice-framework related
  SDP: 'sdp',
  ICE_CANDIDATE: 'ice_candidate',

  // Errors... shit happens
  ERROR_ROOM_IS_FULL: 'error_room_is_full',
  ERROR_USER_INITIALIZED: 'error_user_initialized'
};

function User(walletAddress, publicKey) {
  this.userId = ++lastUserId;
  this.walletAddress = walletAddress;
  this.publicKey = publicKey;
}
User.prototype = {
  getId: function() {
    return this.userId;
  },
  getWalletAddress: function() {
    return this.walletAddress;
  },
  getPublicKey: function() {
    return this.publicKey;
  }
};

function Room(name) {
  this.roomName = name;
  this.users = [];
  this.sockets = {};
}
Room.prototype = {
  getName: function() {
    return this.roomName;
  },
  getUsers: function() {
    return this.users;
  },
  getUserById: function(id) {
    return this.users.find(function(user) {
      return user.getId() === id;
    });
  },
  numUsers: function() {
    return this.users.length;
  },
  isEmpty: function() {
    return this.users.length === 0;
  },
  addUser: function(user, socket) {
    this.users.push(user);
    this.sockets[user.getId()] = socket;
  },
  removeUser: function(id) {
    this.users = this.users.filter(function(user) {
      return user.getId() !== id;
    });
    delete this.sockets[id];
  },
  sendTo: function(user, message, data) {
    var socket = this.sockets[user.getId()];
    socket.emit(message, data);
  },
  sendToId: function(userId, message, data) {
    return this.sendTo(this.getUserById(userId), message, data);
  },
  broadcastFrom: function(fromUser, message, data) {
    this.users.forEach(function(user) {
      if (user.getId() !== fromUser.getId()) {
        this.sendTo(user, message, data);
      }
    }, this);
  }
};

// socket
function handleSocket(socket) {
  var user = null;
  var room = null;

  socket.on(MessageType.JOIN, onJoin);
  socket.on(MessageType.CHANNEL_DEPLOYED, onChannelDeployed);
  socket.on(MessageType.USER_TOPPED_UP_CHANNEL, onUserToppedUpChannel);
  socket.on(MessageType.USER_INITED_CHANNEL, onUserInitedChannel);
  socket.on(MessageType.USER_SIGNED_CHANNEL_CLOSE, onUserSignedChannelClose);
  socket.on(MessageType.USER_EDIT_PAYMENT_CHANNEL, onUserEditPaymentChannel);
  socket.on(MessageType.USER_CLOSED_CHANNEL, onUserClosedChannel);
  socket.on(MessageType.SDP, onSdp);
  socket.on(MessageType.ICE_CANDIDATE, onIceCandidate);
  socket.on(MessageType.DISCONNECT, onLeave);
  socket.on(MessageType.USER_DEAD, onDead);
  socket.on(MessageType.FINISHING, onFinishing)


  async function onDead(data) {
    try {
      //прайс снижения разный
      console.log(`${data.walletAddress} dead`)
      const balance = await redisClient.get(data.walletAddress)
      const newBalance = parseInt(balance) - parseInt(room.amountToLose)
      await redisClient.set(data.walletAddress, newBalance)
      //get from loser
      if (data.walletAddress == room.users[0].walletAddress) {
        //paste to winner
        const balanceWinner = await redisClient.get(room.users[1].walletAddress)
        const newBalanceWinner = parseInt(balanceWinner) + parseInt(room.amountToLose)
        await redisClient.set(room.users[1].walletAddress, newBalanceWinner)
        if (newBalance == 0) {
          await createSignature({
            loserAddress: data.walletAddress,
            winnerAddress: room.users[1].walletAddress,
            loserAmount: newBalance.toString(),
            winnerAmount: newBalanceWinner.toString()
          })
          .then(() => {
            Object.entries(room.sockets).forEach(([key, value]) => {
              socket.to(value.id).emit("finishing")
            })
          })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
        }
        // let players = []
        // Object.entries(room.sockets).forEach(([key, value]) => {
        //   players.push(value.id)
        // })
        // socket.to(players[1]).emit("update_balance", {
        //   address1: data.walletAddress, amount1: newBalance.toString(),
        //   address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
        // })
        // socket.to(players[0]).emit("update_balance", {
        //   address1: data.walletAddress, amount1: newBalance.toString(),
        //   address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
        // })
      } else {
        const balanceWinner = await redisClient.get(room.users[0].walletAddress)
        const newBalanceWinner = parseInt(balanceWinner) + parseInt(room.amountToLose)
        await redisClient.set(room.users[0].walletAddress, newBalanceWinner)
        if (newBalance == 0) {
          await createSignature({
            loserAddress: data.walletAddress,
            winnerAddress: room.users[0].walletAddress,
            loserAmount: newBalance.toString(),
            winnerAmount: newBalanceWinner.toString()
          }).then(() => {
            Object.entries(room.sockets).forEach(([key, value]) => {
              socket.to(value.id).emit("finishing")
            })
          })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
        }
        // let players = []
        // Object.entries(room.sockets).forEach(([key, value]) => {
        //   players.push(value.id)
        // })
        // socket.to(players[0]).emit("update_balance", {
        //   address1: data.walletAddress, amount1: newBalance.toString(),
        //   address2: room.users[0].walletAddress, amount2: newBalanceWinner.toString()
        // })
        // socket.to(players[1]).emit("update_balance", {
        //   address1: data.walletAddress, amount1: newBalance.toString(),
        //   address2: room.users[0].walletAddress, amount2: newBalanceWinner.toString()
        // })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onFinishing() {
    try {
      //если не существуют то создать по контракту
      const balance1 = await redisClient.get(room.users[0].walletAddress)
      const balance2 = await redisClient.get(room.users[1].walletAddress)
      // balance1 = '1000000000000000000'
      // balance2 = '1000000000000000000'
      await createSignature({
        loserAddress: room.users[0].walletAddress,
        winnerAddress: room.users[1].walletAddress,
        loserAmount: balance1,
        winnerAmount: balance2
      }).then(() => {
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("finishing")
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function createSignature(data) {
    try {
      await redisClient.del(data.winnerAddress)
      await redisClient.del(data.loserAddress)
      const battle = await contract.battles(room.roomName)
      let message1;
      let message2;
      if (data.loserAddress == battle.player1) {
        message1 = [room.roomName, data.loserAmount, data.winnerAmount, data.loserAddress]
        message2 = [room.roomName, data.loserAmount, data.winnerAmount, data.winnerAddress]
      } else {
        message1 = [room.roomName, data.winnerAmount, data.loserAmount, data.winnerAddress]
        message2 = [room.roomName, data.winnerAmount, data.loserAmount, data.loserAddress]
      }
      const hashMessage1 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message1)
      const sign1 = await signer.signMessage(ethers.utils.arrayify(hashMessage1));
      const r1 = sign1.substr(0, 66)
      const s1 = '0x' + sign1.substr(66, 64);
      const v1 = web3.utils.toDecimal("0x" + sign1.substr(130,2));
      const hashMessage2 = ethers.utils.solidityKeccak256(["uint256","uint256","uint256","uint160"], message2)
      const sign2 = await signer.signMessage(ethers.utils.arrayify(hashMessage2));
      const r2 = sign2.substr(0, 66)
      const s2 = '0x' + sign2.substr(66, 64);
      const v2 = web3.utils.toDecimal("0x" + sign2.substr(130,2));
      if (data.loserAddress == battle.player1) {
        await pgClient.query("INSERT INTO signatures (address, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7)", [
          data.loserAddress, 
          data.loserAmount,  
          data.winnerAmount, 
          room.roomName, v1, r1, s1])
        await pgClient.query("INSERT INTO signatures (address, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7)", [
          data.winnerAddress, 
          data.loserAmount,  
          data.winnerAmount, 
          room.roomName,v2, r2, s2])
      } else {
        await pgClient.query("INSERT INTO signatures (address, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7)", [
          data.winnerAddress,  
          data.winnerAmount,  
          data.loserAmount,
          room.roomName, v1, r1, s1])
        await pgClient.query("INSERT INTO signatures (address, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7)", [
          data.loserAddress,   
          data.winnerAmount,  
          data.loserAmount,
          room.roomName,v2, r2, s2])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onJoin(joinData) {
    try {
      
      // await redisClient.del(joinData.walletAddress)
      // Somehow sent join request twice?
      if (user !== null || room !== null) {
        room.sendTo(user, MessageType.ERROR_USER_INITIALIZED);
        return;
      }

      // Let's get a room, or create if none still exists
      room = getOrCreateRoom(joinData.roomName);
      if (room.numUsers() >= MAX_ROOM_USERS) {
        console.log(user)
        room.sendTo(user, MessageType.ERROR_ROOM_IS_FULL);
        return;
      }
    
      const battle = await contract.battles(room.getName())
      room.amountToLose = battle.amountForOneDeath.toString()
      room.baseAmount = battle.player1Amount.toString()
      if ((battle.player1 == joinData.walletAddress || battle.player2 == joinData.walletAddress) && battle.finished == false) {
        const exists = await redisClient.get(joinData.walletAddress)
        if (exists == null) {
          await redisClient.set(joinData.walletAddress, room.baseAmount)
        }

        // Add a new user
        room.addUser(user = new User(joinData.walletAddress, joinData.publicKey), socket);

        // Send room info to new user
        room.sendTo(user, MessageType.ROOM, {
          userId: user.getId(),
          roomName: room.getName(),
          users: room.getUsers()
        });
        // Notify others of a new user joined
        room.broadcastFrom(user, MessageType.USER_JOIN, {
          userId: user.getId(),
          user: user
        });
        console.log(user)
        log('User %s joined room %s. Users in room: %d',
          user.getId(), room.getName(), room.numUsers());
        log(`User ${user.getId()} wallet address: ${user.getWalletAddress()}, public key: ${user.getPublicKey()}`);
      } else {
        throw Error('User not in this battle or battle finished')
      }
      
    } catch (error) {
      console.error(error)
    }
    
  }

  function onChannelDeployed(data) {
    log(`User ${user.getId()} deployed channel`);
    room.broadcastFrom(user, MessageType.CHANNEL_DEPLOYED, data);
  }

  function onUserToppedUpChannel() {
    log(`User ${user.getId()} topped up channel`);
    room.broadcastFrom(user, MessageType.USER_TOPPED_UP_CHANNEL);
  }

  function onUserInitedChannel() {
    log(`User ${user.getId()} initialized channel`);
    room.broadcastFrom(user, MessageType.USER_INITED_CHANNEL);
  }

  function onUserSignedChannelClose(data) {
    log(`User ${user.getId()} signed channel close`);
    room.broadcastFrom(user, MessageType.USER_SIGNED_CHANNEL_CLOSE, data);
  }
  function onUserEditPaymentChannel(data) {
    log(`User ${user.getId()} edit payment channel`);
    room.broadcastFrom(user, MessageType.USER_EDIT_PAYMENT_CHANNEL, data);
  }

  function onUserClosedChannel(data) {
    log(`User ${user.getId()} closed the channel`);
    room.broadcastFrom(user, MessageType.USER_CLOSED_CHANNEL, data);
  }

  function getOrCreateRoom(name) {
    var room;
    if (!name) {
      name =  ++lastRoomId + '_room';
    }
    if (!rooms[name]) {
      room = new Room(name);
      rooms[name] = room;
    }
    return rooms[name];
  }

  function onLeave() {
    if (room === null) {
      return;
    }
    room.removeUser(user.getId());
    log('User %d left room %s. Users in room: %d',
      user.getId(), room.getName(), room.numUsers());
    if (room.isEmpty()) {
      log('Room is empty - dropping room %s', room.getName());
      delete rooms[room.getName()];
    }
    room.broadcastFrom(user, MessageType.USER_LEAVE, {
      userId: user.getId()
    });
  }

  function onSdp(message) {
    room.sendToId(message.userId, MessageType.SDP, {
      userId: user.getId(),
      sdp: message.sdp
    });
  }

  function onIceCandidate(message) {
    room.sendToId(message.userId, MessageType.ICE_CANDIDATE, {
      userId: user.getId(),
      candidate: message.candidate
    });
  }
}


redisClient
  .connect()
  .then(() => {
    pgClient.connect()
  })
  .then(() => {
    io.on('connection', handleSocket);
    log('Running room server on port %d', PORT);
  })
  .catch(err => console.error(err))

