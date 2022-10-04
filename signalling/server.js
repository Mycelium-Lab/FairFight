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
// const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
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

const pgPool = new pg.Pool(
  {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
  }
)

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
  USER_LOSE_ALL: 'user_lose_all',
  USER_UPDATE_BALANCE: 'user_update_balance',
  FINISHING: 'finishing',
  END_FINISHING: 'end_finishing',
  JUMP: 'jump',
  SHOOT: 'shoot',
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
  socket.on(MessageType.SDP, onSdp);
  socket.on(MessageType.ICE_CANDIDATE, onIceCandidate);
  socket.on(MessageType.DISCONNECT, onLeave);
  socket.on(MessageType.USER_DEAD, onDead);
  socket.on(MessageType.FINISHING, onFinishing);
  socket.on(MessageType.JUMP, onJump);
  socket.on(MessageType.SHOOT, onShoot);
  socket.on(MessageType.USER_UPDATE_BALANCE, onUpdateBalance)
  socket.on(MessageType.END_FINISHING, onEndFinishing)

  async function onEndFinishing() {
    console.log('endInfdfkdjflkjsdlkjflksdjflj')
    Object.entries(room.sockets).forEach(([key, value]) => {
      socket.to(value.id).emit("end_finishing")
    })
  }

  async function onJump() {
    Object.entries(room.sockets).forEach(([key, value]) => {
      socket.to(value.id).emit("jump")
    })
  }

  async function onShoot(enemyAddress) {
    console.log(enemyAddress)
    // const key = `${enemyAddress}_health`
    // const health = await redisClient.get(key) 
    // if (health == null) {
    //   await redisClient.set(key, 2)
    // } else {
    //   await redisClient.set(key, parseInt(health) - 1) 
    // }
  }

  async function onUpdateBalance() {
    try {
      const balance1 = await redisClient.get(room.users[0].walletAddress)
      const balance2 = await redisClient.get(room.users[1].walletAddress)
      // const statistics1 = await pgClient.query(
      //   "SELECT * FROM statistics WHERE address=$1 AND gameid=$2",
      //   [room.users[0].walletAddress, room.roomName]
      // )
      // const statistics2 = await pgClient.query(
      //   "SELECT * FROM statistics WHERE address=$1 AND gameid=$2",
      //   [room.users[1].walletAddress, room.roomName]
      // )
      // console.log(statistics1.rows, statistics2.rows)
      if (balance1 == null || balance2 == null) {
        const zeroAddressData = await pgClient.query("SELECT * FROM signatures WHERE address1=$1 AND gameid=$2", [
          room.users[0].walletAddress,
          room.roomName
        ])
        const oneAddressData =await pgClient.query("SELECT * FROM signatures WHERE address1=$1 AND gameid=$2", [
          room.users[1].walletAddress,
          room.roomName
        ])
        console.log(zeroAddressData.rows)
        console.log(oneAddressData.rows)
        socket.emit("update_balance", {
          address1: room.users[1].walletAddress, amount1: '0',
          address2: room.users[0].walletAddress, amount2: '0'
        })
      } else {
        socket.emit("update_balance", {
          address1: room.users[1].walletAddress, amount1: balance2.toString(),
          address2: room.users[0].walletAddress, amount2: balance1.toString()
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onDead(data) {
    try {
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
        // pgPool
        // .connect()
        // .then((client) => {
        //     client
        //         .query("BEGIN")
        //         .then(() => {
        //             return client.query("UPDATE statistics SET kills=kills+1 WHERE address=$1 AND gameid=$2", room.users[1].walletAddress, room.roomName)
        //         })
        //         .then(res => {
        //           return client.query("UPDATE statistics SET deaths=deaths+1 WHERE address=$1 AND gameid=$2", room.users[0].walletAddress, room.roomName)
        //         })
        //         .then(() => {
        //           return client.query("COMMIT")
        //         })
        //         .then(() => {
        //             console.log(`Stats updated`)
        //         })
        //         .catch(() => {
        //             client.query("ROLLBACK")
        //         })
        // })
        //if balance == 0 -> user losed
        //create signature and add data to database
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
              socket.to(value.id).emit("update_balance", {
                address1: data.walletAddress, amount1: newBalance.toString(),
                address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
              })
            })
          })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
        }
        //update balance
        //we send it each user in room
        //but its not works so on frontend we send it again from another user
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("update_balance", {
            address1: data.walletAddress, amount1: newBalance.toString(),
            address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
          })
        })
      } else {
        const balanceWinner = await redisClient.get(room.users[0].walletAddress)
        const newBalanceWinner = parseInt(balanceWinner) + parseInt(room.amountToLose)
        await redisClient.set(room.users[0].walletAddress, newBalanceWinner)
        // pgPool
        // .connect()
        // .then((client) => {
        //     client
        //         .query("BEGIN")
        //         .then(() => {
        //           return client.query("UPDATE statistics SET kills=kills+1 WHERE address=$1 AND gameid=$2", room.users[0].walletAddress, room.roomName)
        //         })
        //         .then(res => {
        //           return client.query("UPDATE statistics SET deaths=deaths+1 WHERE address=$1 AND gameid=$2", room.users[1].walletAddress, room.roomName)
        //         })
        //         .then(() => {
        //           return client.query("COMMIT")
        //         })
        //         .then(() => {
        //             console.log(`Stats updated`)
        //         })
        //         .catch(() => {
        //             client.query("ROLLBACK")
        //         })
        // })
        if (newBalance == 0) {
          await createSignature({
            loserAddress: data.walletAddress,
            winnerAddress: room.users[0].walletAddress,
            loserAmount: newBalance.toString(),
            winnerAmount: newBalanceWinner.toString()
          }).then(() => {
            Object.entries(room.sockets).forEach(([key, value]) => {
              socket.to(value.id).emit("finishing")
              socket.to(value.id).emit("update_balance", {
                address1: data.walletAddress, amount1: newBalance.toString(),
                address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
              })
            })
          })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
        }
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("update_balance", {
            address1: data.walletAddress, amount1: newBalance.toString(),
            address2: room.users[0].walletAddress, amount2: newBalanceWinner.toString()
          })
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onFinishing() {
    try {
      const balance1 = await redisClient.get(room.users[0].walletAddress)
      const balance2 = await redisClient.get(room.users[1].walletAddress)
      //create signatures on finish button
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
      //delete data from redis
      await redisClient.del(data.winnerAddress)
      await redisClient.del(data.loserAddress)
      //get this battle data
      const battle = await contract.battles(room.roomName)
      let message1;
      let message2;
      //create hash message and signatures
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
      //add data to database
      if (data.loserAddress == battle.player1) {
        await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
          data.loserAddress,
          data.winnerAddress,
          data.loserAmount,  
          data.winnerAmount, 
          room.roomName, v1, r1, s1])
        await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
          data.winnerAddress,
          data.loserAddress,
          data.loserAmount,  
          data.winnerAmount, 
          room.roomName,v2, r2, s2])
      } else {
        await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
          data.winnerAddress,
          data.loserAddress,
          data.winnerAmount,  
          data.loserAmount,
          room.roomName, v1, r1, s1])
        await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
          data.loserAddress,
          data.winnerAddress,
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

      if (room.numUsers() > 0) {
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("end_waiting_another_user")
        })
      }
    
      const battle = await contract.battles(room.getName())
      room.amountToLose = battle.amountForOneDeath.toString()
      room.baseAmount = battle.player1Amount.toString()
      if ((battle.player1 == joinData.walletAddress || battle.player2 == joinData.walletAddress) && battle.finished == false) {
        const exists = await redisClient.get(joinData.walletAddress)
        if (exists == null) {
          await redisClient.set(joinData.walletAddress, room.baseAmount)
        }
        const statisticsExist = await pgClient.query(
          "SELECT * FROM statistics WHERE address=$1 AND gameid=$2",
          [joinData.walletAddress, room.roomName]
        )
        if (statisticsExist.rows.length == 0) {
          await pgClient.query(
            "INSERT INTO statistics (gameid, address, kills, deaths) VALUES($1,$2,$3,$4)",
            [room.roomName, joinData.walletAddress, 0, 0]
          )
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
    try {
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
    } catch (error) {
      console.error(error)
    }
    
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

