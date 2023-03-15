const PORT = 8033;
const MAX_ROOM_USERS = 2;

import fs from 'fs';
const log = console.log.bind(console);
import socketio from 'socket.io';
const io = socketio(PORT)
import redis from "redis"
import pg from "pg"
import ethers from "ethers"
import web3 from "web3"
import dotenv from "dotenv"
dotenv.config()

import { contractAbi, contractAddress } from "../contract/contract.js"
// const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
// const provider = new ethers.providers.JsonRpcProvider("https://testnet.emerald.oasis.dev") 
// const provider = new ethers.providers.JsonRpcProvider("https://emerald.oasis.dev")
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_TEST, provider)
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
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
  getId: function () {
    return this.userId;
  },
  getWalletAddress: function () {
    return this.walletAddress;
  },
  getPublicKey: function () {
    return this.publicKey;
  }
};

function Room(name) {
  this.roomName = name;
  this.fightid = name.split('&')[0];
  this.chainid = name.split('&')[1].slice(8);
  this.users = [];
  this.sockets = {};
  this.finished = false;
}
Room.prototype = {
  getName: function () {
    return this.roomName;
  },
  getFightId: function () {
    return this.fightid;
  },
  getChainId: function () {
    return this.chainid;
  },
  getUsers: function () {
    return this.users;
  },
  getUserById: function (id) {
    return this.users.find(function (user) {
      return user.getId() === id;
    });
  },
  numUsers: function () {
    return this.users.length;
  },
  isEmpty: function () {
    return this.users.length === 0;
  },
  addUser: function (user, socket) {
    this.users.push(user);
    this.sockets[user.getId()] = socket;
  },
  removeUser: function (id) {
    this.users = this.users.filter(function (user) {
      return user.getId() !== id;
    });
    delete this.sockets[id];
  },
  sendTo: function (user, message, data) {
    try {
      var socket = this.sockets[user.getId()];
      socket.emit(message, data);
    } catch (error) {
      console.error(error)
    }
  },
  sendToId: function (userId, message, data) {
    try {
      return this.sendTo(this.getUserById(userId), message, data);
    } catch (error) {
      console.error(error)
    }
  },
  broadcastFrom: function (fromUser, message, data) {
    this.users.forEach(function (user) {
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
    try {
      Object.entries(room.sockets).forEach(([key, value]) => {
        socket.to(value.id).emit("end_finishing")
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function onJump() {
    try {
      // Object.entries(room.sockets).forEach(([key, value]) => {
      //   socket.to(value.id).emit("jump")
      // })
    } catch (error) {
      console.error(error)
    }
  }

  async function onShoot(enemyAddress) {
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
      const balance1 = await redisClient.get(`${room.users[0].walletAddress}_${room.roomName}`)
      const balance2 = await redisClient.get(`${room.users[1].walletAddress}_${room.roomName}`)
      const killsAddress1 = await getKills(room.users[1].walletAddress)
      const deathsAddress1 = await getDeaths(room.users[1].walletAddress)
      const killsAddress2 = await getKills(room.users[0].walletAddress)
      const deathsAddress2 = await getDeaths(room.users[0].walletAddress)
      const remainingRounds = await redisClient.get(room.roomName)
      if (balance1 == null || balance2 == null) {
        setTimeout(async () => {
          const zeroAddressData = await pgClient.query("SELECT * FROM statistics WHERE address=$1 AND gameid=$2", [
            room.users[0].walletAddress,
            room.roomName
          ])
          const oneAddressData = await pgClient.query("SELECT * FROM statistics WHERE address=$1 AND gameid=$2", [
            room.users[1].walletAddress,
            room.roomName
          ])
          socket.emit("update_balance", {
            address1: room.users[1].walletAddress, amount1: oneAddressData.rows[0].playeramount, killsAddress1, deathsAddress1, remainingRounds: remainingRounds == null ? 0 : remainingRounds,
            amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: zeroAddressData.rows[0].playeramount, killsAddress2, deathsAddress2
          })
        }, 1000)
      } else {
        socket.emit("update_balance", {
          address1: room.users[1].walletAddress, amount1: balance2.toString(), killsAddress1, deathsAddress1, remainingRounds: remainingRounds == null ? 0 : remainingRounds,
          amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: balance1.toString(), killsAddress2, deathsAddress2
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function onDead(data) {
    try {
      console.log(`${data.walletAddress} dead`)
      const balance = await redisClient.get(`${data.walletAddress}_${room.roomName}`)
      const newBalance = parseInt(balance) - parseInt(room.amountToLose)
      await redisClient.set(`${data.walletAddress}_${room.roomName}`, newBalance)
      const rounds = await redisClient.get(room.roomName)
      if (rounds != 0 || rounds != null) {
        await redisClient.set(room.roomName, parseInt(rounds) - 1)
      }
      //get from loser
      if (data.walletAddress == room.users[0].walletAddress) {
        //paste to winner
        const balanceWinner = await redisClient.get(`${room.users[1].walletAddress}_${room.roomName}`)
        const newBalanceWinner = parseInt(balanceWinner) + parseInt(room.amountToLose)
        await redisClient.set(`${room.users[1].walletAddress}_${room.roomName}`, newBalanceWinner)
        if (room.finished == false) {
          await addKills(room.users[1].walletAddress)
          await addDeaths(room.users[0].walletAddress)
        }
        //if balance == 0 -> user losed
        //create signature and add data to database
        if (newBalance == 0 || (parseInt(rounds) - 1) == 0) {
          await createSignature({
            loserAddress: data.walletAddress,
            winnerAddress: room.users[1].walletAddress,
            loserAmount: newBalance.toString(),
            winnerAmount: newBalanceWinner.toString()
          })
            .then(() => {
              Object.entries(room.sockets).forEach(([key, value]) => {
                if (value != null) {
                  socket.to(value.id).emit("finishing")
                  socket.to(value.id).emit("update_balance", {
                    address1: data.walletAddress, amount1: newBalance.toString(), remainingRounds: parseInt(rounds) - 1,
                    amountToLose: room.amountToLose,
                    address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
                  })
                }
              })
            })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
          room.finished = true;
        }
        //update balance
        //we send it each user in room
        //but its not works so on frontend we send it again from another user
        const killsAddress1 = await getKills(data.walletAddress)
        const deathsAddress1 = await getDeaths(data.walletAddress)
        const killsAddress2 = await getKills(room.users[1].walletAddress)
        const deathsAddress2 = await getDeaths(room.users[1].walletAddress)
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("update_balance", {
              address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) - 1,
              amountToLose: room.amountToLose, address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2
            })
          }
        })
      } else {
        const balanceWinner = await redisClient.get(`${room.users[0].walletAddress}_${room.roomName}`)
        const newBalanceWinner = parseInt(balanceWinner) + parseInt(room.amountToLose)
        await redisClient.set(`${room.users[0].walletAddress}_${room.roomName}`, newBalanceWinner)
        if (room.finished == false) {
          await addKills(room.users[0].walletAddress)
          await addDeaths(room.users[1].walletAddress)
        }
        if (newBalance == 0 || (parseInt(rounds) - 1) == 0) {
          await createSignature({
            loserAddress: data.walletAddress,
            winnerAddress: room.users[0].walletAddress,
            loserAmount: newBalance.toString(),
            winnerAmount: newBalanceWinner.toString()
          }).then(() => {
            Object.entries(room.sockets).forEach(([key, value]) => {
              if (value != null) {
                socket.to(value.id).emit("finishing")
                socket.to(value.id).emit("update_balance", {
                  address1: data.walletAddress, amount1: newBalance.toString(), remainingRounds: parseInt(rounds) - 1,
                  amountToLose: room.amountToLose,
                  address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString()
                })
              }
            })
          })
          room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
          room.finished = true;
        }
        const killsAddress1 = await getKills(data.walletAddress)
        const deathsAddress1 = await getDeaths(data.walletAddress)
        const killsAddress2 = await getKills(room.users[0].walletAddress)
        const deathsAddress2 = await getDeaths(room.users[0].walletAddress)
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("update_balance", {
              address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) - 1,
              amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2
            })
          }
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function addKills(address) {
    try {
      const exist = await redisClient.get(createKillsRedisLink(address, room.getChainId(), room.getFightId()))
      await redisClient.set(createKillsRedisLink(address, room.getChainId(), room.getFightId()), parseInt(exist) + 1)
    } catch (error) {
      console.error(error)
    }
  }

  async function addDeaths(address) {
    try {
      const exist = await redisClient.get(`${address}_deaths_${room.roomName}`)
      await redisClient.set(`${address}_deaths_${room.roomName}`, parseInt(exist) + 1)
    } catch (error) {
      console.error(error)
    }
  }

  async function getKills(address) {
    try {
      const exist = await redisClient.get(`${address}_kills_${room.roomName}`)
      if (exist == null) {
        await redisClient.set(`${address}_kills_${room.roomName}`, 0)
      }
      return await redisClient.get(`${address}_kills_${room.roomName}`)
    } catch (error) {
      console.error(error)
    }
  }

  async function getDeaths(address) {
    try {
      const exist = await redisClient.get(`${address}_deaths_${room.roomName}`)
      if (exist == null) {
        await redisClient.set(`${address}_deaths_${room.roomName}`, 0)
      }
      return await redisClient.get(`${address}_deaths_${room.roomName}`)
    } catch (error) {
      console.error(error)
    }
  }

  async function removeKills(address) {
    try {
      await redisClient.del(`${address}_kills_${room.roomName}`)
    } catch (error) {
      console.error(error)
    }
  }

  async function removeDeaths(address) {
    try {
      await redisClient.del(`${address}_deaths_${room.roomName}`)
    } catch (error) {
      console.error(error)
    }
  }

  async function onFinishing(data) {
    try {
      let balance1;
      let balance2;
      let loserAddress;
      let winnerAddress;
      if (room.users[0] == undefined || room.users[1] == undefined) {
        const battle = await contract.fights(room.getFightId())
        const exists1 = await redisClient.get(`${battle.player1}_${room.roomName}`)
        const exists2 = await redisClient.get(`${battle.player2}_${room.roomName}`)
        if (exists1 != null && exists2 != null) {
          balance1 = exists1
          balance2 = exists2
        } else {
          balance1 = battle.player1Amount.toString()
          balance2 = battle.player1Amount.toString()
        }
        loserAddress = battle.player1
        winnerAddress = battle.player2
      } else {
        balance1 = await redisClient.get(`${room.users[0].walletAddress}_${room.roomName}`)
        loserAddress = room.users[0].walletAddress
        balance2 = await redisClient.get(`${room.users[1].walletAddress}_${room.roomName}`)
        winnerAddress = room.users[1].walletAddress
      }
      //create signatures on finish button
      await createSignature({
        loserAddress,
        winnerAddress,
        loserAmount: balance1,
        winnerAmount: balance2
      }).then(() => {
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("finishing", data)
          }
        })
      })
      room.finished = true;
    } catch (error) {
      console.error(error)
    }
  }

  async function createSignature(data) {
    try {
      //delete data from redis
      await redisClient.del(`${data.winnerAddress}_${room.roomName}`)
      await redisClient.del(`${data.loserAddress}_${room.roomName}`)

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
      const hashMessage1 = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint256", "uint160"], message1)
      const sign1 = await signer.signMessage(ethers.utils.arrayify(hashMessage1));
      const r1 = sign1.substr(0, 66)
      const s1 = '0x' + sign1.substr(66, 64);
      const v1 = web3.utils.toDecimal("0x" + sign1.substr(130, 2));
      const hashMessage2 = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint256", "uint160"], message2)
      const sign2 = await signer.signMessage(ethers.utils.arrayify(hashMessage2));
      const r2 = sign2.substr(0, 66)
      const s2 = '0x' + sign2.substr(66, 64);
      const v2 = web3.utils.toDecimal("0x" + sign2.substr(130, 2));
      const rounds = await redisClient.get(room.roomName)
      //add data to database
      if (data.loserAddress == battle.player1) {
        try {
          await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
            data.loserAddress,
            data.winnerAddress,
            data.loserAmount,
            data.winnerAmount,
            room.roomName, v1, r1, s1])
        } catch (error) {
          console.log(error)
          console.log('-------------------'),
            console.log(
              'Error with data signatures:\n',
              `Loser: ${data.loserAddress}\n`,
              `Winner: ${data.winnerAddress}\n`,
              `LoserAmount: ${data.loserAmount}\n`,
              `WinnerAmount: ${data.winnerAmount}\n`,
              `GameID: ${room.roomName}\n`,
              `v1: ${v1}\n`,
              `r1: ${r1}\n`,
              `s1: ${s1}`
            )
          console.log('-------------------')
        }
        try {
          await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
            data.winnerAddress,
            data.loserAddress,
            data.loserAmount,
            data.winnerAmount,
            room.roomName, v2, r2, s2])
        } catch (error) {
          console.log(error)
          console.log('-------------------'),
            console.log(
              'Error with data signatures:\n',
              `Loser: ${data.loserAddress}\n`,
              `Winner: ${data.winnerAddress}\n`,
              `LoserAmount: ${data.loserAmount}\n`,
              `WinnerAmount: ${data.winnerAmount}\n`,
              `GameID: ${room.roomName}\n`,
              `v2: ${v2}\n`,
              `r2: ${r2}\n`,
              `s2: ${s2}`
            )
          console.log('-------------------')
        }

      } else {
        try {
          await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
            data.winnerAddress,
            data.loserAddress,
            data.winnerAmount,
            data.loserAmount,
            room.roomName, v1, r1, s1])
        } catch (error) {
          console.log(error)
          console.log('-------------------'),
            console.log(
              'Error with data signatures:\n',
              `Loser: ${data.loserAddress}\n`,
              `Winner: ${data.winnerAddress}\n`,
              `LoserAmount: ${data.loserAmount}\n`,
              `WinnerAmount: ${data.winnerAmount}\n`,
              `GameID: ${room.roomName}\n`,
              `v1: ${v1}\n`,
              `r1: ${r1}\n`,
              `s1: ${s1}`
            )
          console.log('-------------------')
        }
        try {
          await pgClient.query("INSERT INTO signatures (address1, address2, player1amount, player2amount, gameid, v, r, s) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
            data.loserAddress,
            data.winnerAddress,
            data.winnerAmount,
            data.loserAmount,
            room.roomName, v2, r2, s2])
        } catch (error) {
          console.log(error)
          console.log('-------------------'),
            console.log(
              'Error with data signatures:\n',
              `Loser: ${data.loserAddress}\n`,
              `Winner: ${data.winnerAddress}\n`,
              `LoserAmount: ${data.loserAmount}\n`,
              `WinnerAmount: ${data.winnerAmount}\n`,
              `GameID: ${room.roomName}\n`,
              `v2: ${v2}\n`,
              `r2: ${r2}\n`,
              `s2: ${s2}`
            )
          console.log('-------------------')
        }
      }
      const killsLoser = await getKills(data.loserAddress)
      const deathsLoser = await getDeaths(data.loserAddress)
      const killsWinner = await getKills(data.winnerAddress)
      const deathsWinner = await getDeaths(data.winnerAddress)
      try {
        await pgClient.query("INSERT INTO statistics (gameid, address, playerAmount, kills, deaths, remainingRounds) VALUES($1,$2,$3,$4,$5,$6)", [room.roomName, data.loserAddress, data.loserAmount, killsLoser, deathsLoser, rounds])
      } catch (error) {
        console.log(error)
        console.log('-------------------')
        console.log(
          'Error with data statistics:\n',
          `GameID: ${room.roomName}`,
          `Address: ${data.loserAddress}`,
          `Amount: ${data.loserAmount}`,
          `Kills: ${killsLoser}`,
          `Deaths: ${deathsLoser}`,
          `Rounds: ${rounds}`,
        )
        console.log('-------------------')
      }
      try {
        await pgClient.query("INSERT INTO statistics (gameid, address, playerAmount, kills, deaths, remainingRounds) VALUES($1,$2,$3,$4,$5,$6)", [room.roomName, data.winnerAddress, data.winnerAmount, killsWinner, deathsWinner, rounds])
      } catch (error) {
        console.log(error)
        console.log('-------------------')
        console.log(
          'Error with data statistics:\n',
          `GameID: ${room.roomName}`,
          `Address: ${data.winnerAddress}`,
          `Amount: ${data.winnerAmount}`,
          `Kills: ${killsWinner}`,
          `Deaths: ${deathsWinner}`,
          `Rounds: ${rounds}`,
        )
        console.log('-------------------')
      }
      await removeKills(data.loserAddress)
      await removeKills(data.winnerAddress)
      await removeDeaths(data.loserAddress)
      await removeDeaths(data.winnerAddress)
      await redisClient.del(room.roomName)
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

      const fight = await contract.fights(room.getFightId())
      const player2 = await contract.players(room.getFightId(), 1)
      room.amountToLose = fight.amountPerRound.toString()
      room.baseAmount = fight.baseAmount.toString()
      if ((fight.owner == joinData.walletAddress || player2 == joinData.walletAddress) && fight.finishTime == 0) {
        const exists = await redisClient.get(`${joinData.walletAddress}_${room.roomName}`)
        const roundsExists = await redisClient.get(room.roomName)
        if (exists == null || isNaN(parseFloat(exists)) || exists == 'NaN') {
          await redisClient.set(createAmountRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()), room.baseAmount)
        }
        if (roundsExists == null || isNaN(parseFloat(roundsExists))) {
          await redisClient.set(createRoundsRedisLink(), fight.rounds.toString())
        }

        const existKills = await redisClient.get(createKillsRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()))
        if (existKills == null || isNaN(parseFloat(existKills)) || existKills == 'NaN') {
          await redisClient.set(createKillsRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()), 0)
        }

        const existDeath = await redisClient.get(createDeathsRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()))
        if (existDeath == null || isNaN(parseFloat(existDeath)) || existDeath == 'NaN') {
          await redisClient.set(createDeathsRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()), 0)
        }

        // Add a new user
        room.addUser(user = new User(joinData.walletAddress, joinData.publicKey), socket);

        if (room.users.length === 1) {
          setTimeout(async () => {
            if (room.numUsers() === 1) {
              await onFinishing()
              room.sendTo(user, 'update_balance', {});
            }
          }, 1000 * 60 * 3)
        }

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
        throw Error('User not in this fight or fight finished')
      }

    } catch (error) {
      console.error(error)
    }

  }


  function getOrCreateRoom(name) {
    try {
      var room;
      if (!name) {
        name = ++lastRoomId + '_room';
      }
      if (!rooms[name]) {
        room = new Room(name);
        rooms[name] = room;
      }
      return rooms[name];
    } catch (error) {
      console.error(error)
    }
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

  function createAmountRedisLink(address, chainid, gameid) {
    return `${address}_${gameid}_${chainid}_amount`
  }

  function createKillsRedisLink(address, chainid, gameid) {
    return `${address}_${gameid}_${chainid}_kills`;
  }

  function createDeathsRedisLink(address, chainid, gameid) {
    return `${address}_${gameid}_${chainid}_deaths`;
  }

  function createRoundsRedisLink() {
    return room.getName()
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

