const PORT = 8033;
const MAX_ROOM_USERS = 2;

import fs from 'fs';
const log = console.log.bind(console);
import socketio from 'socket.io';
const io = socketio(PORT, {
  cors: {
    origin: [
      'http://localhost:5000',
      'https://fairfight.fairprotocol.solutions/'
    ],
  }
})
import redis from "redis"
import pg from "pg"
import ethers from "ethers"
import web3 from "web3"
import dotenv from "dotenv"
dotenv.config()

import { contractAbi, contractAddress, networks } from "../contract/contract.js"

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
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
  ERROR_USER_INITIALIZED: 'error_user_initialized',
  NOT_USER_ROOM: 'not_user_room',
  SPAWN_USER: 'spawn_user',
  MOVEMENT: 'movement',
  COLLECT_WEAPON: 'collect_weapon',
};

function User(walletAddress) {
  this.userId = ++lastUserId;
  this.walletAddress = walletAddress;
}
User.prototype = {
  getId: function () {
    return this.userId;
  },
  getWalletAddress: function () {
    return this.walletAddress;
  }
};

function Room(name) {
  const fightid = name.split('&')[0]
  const chainid = name.split('&')[1].slice(8)
  this.roomName = `ID=${fightid}&network=${chainid}`;
  this.fightid = fightid;
  this.chainid = chainid;
  this.rounds = 0;
  this.users = [];
  this.sockets = {};
  this.finished = false;
}
Room.prototype = {
  getName: function () {
    return this.roomName;
  },
  getRounds: function () {
    return this.rounds;
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
    try {
      return this.users.find(function (user) {
        return user.getId() === id;
      });
    } catch (error) {
      console.log(error)
    }
  },
  numUsers: function () {
    try {
      return this.users.length;
    } catch (error) {
      console.log(error)
    }
  },
  isEmpty: function () {
    return this.users.length === 0;
  },
  addUser: function (user, socket) {
    try {
      this.users.push(user);
      this.sockets[user.getId()] = socket;
    } catch (error) {
      console.log(error)
    }
  },
  removeUser: function (id) {
    try {
      this.users = this.users.filter(function (user) {
        return user.getId() !== id;
      });
      delete this.sockets[id];
    } catch (error) {
      console.log(error)
    }
  },
  sendTo: function (user, message, data) {
    try {
      if (user != null) {
        var socket = this.sockets[user.getId()];
        socket.emit(message, data);
      }
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
    try {
      this.users.forEach(function (user) {
        if (user.getId() !== fromUser.getId()) {
          this.sendTo(user, message, data);
        }
      }, this);
    } catch (error) {
      console.log(error)
    }
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
  socket.on(MessageType.SPAWN_USER, onSpawnUser)
  socket.on(MessageType.MOVEMENT, onMovement)
  socket.on(MessageType.COLLECT_WEAPON, onCollectWeapon)

  async function onMovement(data) {
    try {
      Object.entries(room.sockets).forEach(([key, value]) => {
        socket.to(value.id).emit(MessageType.MOVEMENT, data)
      })
    } catch (error) {}
  }

  async function onSpawnUser(user) {
    try {
      Object.entries(room.sockets).forEach(([key, value]) => {
        socket.to(value.id).emit(MessageType.SPAWN_USER, user)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function onCollectWeapon(data) {
    try {
      Object.entries(room.sockets).forEach(([key, value]) => {
        socket.to(value.id).emit(MessageType.COLLECT_WEAPON, data)
      })
    } catch (error) {
      console.error(error)
    }
  }

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

  async function onShoot(data) {
    /*
          data: {
            address,
            x,
            y,
            flip: isFlip
          }
    */
    try {
      Object.entries(room.sockets).forEach(([key, value]) => {
        socket.to(value.id).emit(MessageType.SHOOT, data)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function onUpdateBalance() {
    try {
      //ВРЕМЕННОЕ РЕШЕНИЕ
      //setTimeout потому что данные еще не успели обновиться
      setTimeout(async () => {
        try {
          const balance1 = await redisClient.get(createAmountRedisLink(room.users[0].walletAddress, room.getChainId(), room.getFightId()))
          const balance2 = await redisClient.get(createAmountRedisLink(room.users[1].walletAddress, room.getChainId(), room.getFightId()))
          const killsAddress1 = await getKills(room.users[1].walletAddress)
          const deathsAddress1 = await getDeaths(room.users[1].walletAddress)
          const killsAddress2 = await getKills(room.users[0].walletAddress)
          const deathsAddress2 = await getDeaths(room.users[0].walletAddress)
          const remainingRounds = await redisClient.get(room.roomName)
          if (balance1 == null || balance2 == null) {
            setTimeout(async () => {
              try {
                const zeroAddressData = await pgClient.query("SELECT * FROM statistics WHERE player=$1 AND gameid=$2 AND chainid=$3", [
                  room.users[0].walletAddress,
                  room.getFightId(),
                  room.getChainId()
                ])
                const oneAddressData = await pgClient.query("SELECT * FROM statistics WHERE player=$1 AND gameid=$2 AND chainid=$3", [
                  room.users[1].walletAddress,
                  room.getFightId(),
                  room.getChainId()
                ])
                socket.emit("update_balance", {
                  address1: room.users[1].walletAddress, amount1: oneAddressData.rows[0].amount, killsAddress1, deathsAddress1, remainingRounds: remainingRounds == null ? 0 : remainingRounds,
                  amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: zeroAddressData.rows[0].amount, killsAddress2, deathsAddress2, rounds: room.getRounds()
                })
              } catch (error) {
                
              }
            }, 1000)
          } else {
            socket.emit("update_balance", {
              address1: room.users[1].walletAddress, amount1: balance2.toString(), killsAddress1, deathsAddress1, remainingRounds: remainingRounds == null ? 0 : remainingRounds,
              amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: balance1.toString(), killsAddress2, deathsAddress2, rounds: room.getRounds()
            })
          }
        } catch (error) {
          
        }
      }, 100)
    } catch (error) {
      console.error(error)
    }
  }

  async function onDead(data) {
    try {
      console.log(`${data.walletAddress} dead (network: ${room.getChainId()}, fight: ${room.getFightId()})`)
      const balance = await redisClient.get(createAmountRedisLink(data.walletAddress, room.getChainId(), room.getFightId()))
      const newBalance = BigInt(balance) - BigInt(room.amountToLose)
      await redisClient.set(createAmountRedisLink(data.walletAddress, room.getChainId(), room.getFightId()), newBalance.toString())
      const rounds = await redisClient.get(createRoundsRedisLink())
      if (rounds != 0 || rounds != null) {
        await redisClient.set(room.roomName, parseInt(rounds) - 1)
      }
      //get from loser
      if (data.walletAddress == room.users[0].walletAddress) {
        //paste to winner
        const balanceWinner = await redisClient.get(createAmountRedisLink(room.users[1].walletAddress, room.getChainId(), room.getFightId()))
        const newBalanceWinner = BigInt(balanceWinner) + BigInt(room.amountToLose)
        await redisClient.set(createAmountRedisLink(room.users[1].walletAddress, room.getChainId(), room.getFightId()), newBalanceWinner.toString())
        if (room.finished == false) {
          await addKills(room.users[1].walletAddress)
          await addDeaths(room.users[0].walletAddress)
        }
        const killsAddress1 = await getKills(data.walletAddress)
        const deathsAddress1 = await getDeaths(data.walletAddress)
        const killsAddress2 = await getKills(room.users[1].walletAddress)
        const deathsAddress2 = await getDeaths(room.users[1].walletAddress)
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
                    address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString(), rounds: room.getRounds()
                  })
                }
              })
            })
            .then(() => {
              room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
              room.finished = true;
            })
        }
        //update balance
        //we send it each user in room
        //but its not works so on frontend we send it again from another user
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("update_balance", {
              address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) - 1,
              amountToLose: room.amountToLose, address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2, rounds: room.getRounds()
            })
          }
        })
      } else {
        const balanceWinner = await redisClient.get(createAmountRedisLink(room.users[0].walletAddress, room.getChainId(), room.getFightId()))
        const newBalanceWinner = BigInt(balanceWinner) + BigInt(room.amountToLose)
        await redisClient.set(createAmountRedisLink(room.users[0].walletAddress, room.getChainId(), room.getFightId()), newBalanceWinner.toString())
        if (room.finished == false) {
          await addKills(room.users[0].walletAddress)
          await addDeaths(room.users[1].walletAddress)
        }
        const killsAddress1 = await getKills(data.walletAddress)
        const deathsAddress1 = await getDeaths(data.walletAddress)
        const killsAddress2 = await getKills(room.users[0].walletAddress)
        const deathsAddress2 = await getDeaths(room.users[0].walletAddress)
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
                  address2: room.users[1].walletAddress, amount2: newBalanceWinner.toString(), rounds: room.getRounds()
                })
              }
            })
          })
          .then(() => {
            room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
            room.finished = true;
          })
        }
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("update_balance", {
              address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) - 1,
              amountToLose: room.amountToLose, address2: room.users[0].walletAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2, rounds: room.getRounds()
            })
          }
        })
      }
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
      const fight = await blockchain().contract.fights(room.getFightId())
      if (room.users[0] == undefined || room.users[1] == undefined) {
        const players = await blockchain().contract.getFightPlayers(room.getFightId())
        const player2 = players[1]
        const exists1 = await redisClient.get(createAmountRedisLink(fight.owner, room.getChainId(), room.getFightId()))
        const exists2 = await redisClient.get(createAmountRedisLink(player2, room.getChainId(), room.getFightId()))
        if (exists1 != null && exists2 != null) {
          balance1 = exists1
          balance2 = exists2
        } else {
          balance1 = fight.baseAmount.toString()
          balance2 = fight.baseAmount.toString()
        }
        loserAddress = fight.owner
        winnerAddress = player2
      } else {
        balance1 = await redisClient.get(createAmountRedisLink(room.users[0].walletAddress, room.getChainId(), room.getFightId()))
        loserAddress = room.users[0].walletAddress
        balance2 = await redisClient.get(createAmountRedisLink(room.users[1].walletAddress, room.getChainId(), room.getFightId()))
        winnerAddress = room.users[1].walletAddress
      }
      //create signatures on finish button
      await createSignature({
        loserAddress,
        winnerAddress,
        loserAmount: balance1,
        winnerAmount: balance2,
        token: fight.token
      }).then(() => {
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("finishing", {
              address1: loserAddress,
              address2: winnerAddress,
              amount1: balance1,
              amount2: balance2,
              fromButton: data.fromButton
            })
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
      //get this fight data
      const rounds = await redisClient.get(createRoundsRedisLink())
      if (BigInt(room.baseAmount) * BigInt(2) < BigInt(data.loserAmount) + BigInt(data.winnerAmount)) {
        data.loserAmount = room.baseAmount
        data.winnerAmount = room.baseAmount
      }
      const signatures = [
        await signature(data.loserAmount, data.loserAddress, data.token),
        await signature(data.winnerAmount, data.winnerAddress, data.token)
      ]
      for (let i = 0; i < signatures.length; i++) {
        try {
          await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)", [
            signatures[i].address.toLowerCase(),
            signatures[i].fightid,
            signatures[i].amount,
            signatures[i].chainid,
            signatures[i].contract,
            signatures[i].v,
            signatures[i].r,
            signatures[i].s,
            signatures[i].token
          ])
        } catch (error) {
          console.log(error)
          console.log('-------------------'),
            console.log(
              'Error with data signatures:\n',
              `Address: ${signatures[i].address}\n`,
              `GameID: ${signatures[i].fightid}\n`,
              `Amount: ${signatures[i].amount}\n`,
              `ChainID: ${signatures[i].chainid}`,
              `v: ${signatures[i].v}\n`,
              `r: ${signatures[i].r}\n`,
              `s: ${signatures[i].s}`
            )
          console.log('-------------------')
        }
      }
      const killsLoser = await getKills(data.loserAddress)
      const deathsLoser = await getDeaths(data.loserAddress)
      const killsWinner = await getKills(data.winnerAddress)
      const deathsWinner = await getDeaths(data.winnerAddress)
      try {
        await pgClient.query("INSERT INTO statistics (gameid, player, chainid, contract, amount, kills, deaths, remainingRounds, token) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)", 
        [room.getFightId(), data.loserAddress.toLowerCase(), room.getChainId(), blockchain().contract.address, data.loserAmount, killsLoser, deathsLoser, rounds, signatures[0].token])
      } catch (error) {
        console.log(error)
        console.log('-------------------')
        console.log(
          'Error with data statistics:\n',
          `GameID: ${room.getFightId()}`,
          `ChainID: ${room.getChainId()}`,
          `Address: ${data.loserAddress}`,
          `Amount: ${data.loserAmount}`,
          `Kills: ${killsLoser}`,
          `Deaths: ${deathsLoser}`,
          `Rounds: ${rounds}`,
        )
        console.log('-------------------')
      }
      try {
        await pgClient.query("INSERT INTO statistics (gameid, player, chainid, contract, amount, kills, deaths, remainingRounds, token) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)", 
        [room.getFightId(), data.winnerAddress.toLowerCase(), room.getChainId(), blockchain().contract.address, data.winnerAmount, killsWinner, deathsWinner, rounds, signatures[0].token])
      } catch (error) {
        console.log(error)
        console.log('-------------------')
        console.log(
          'Error with data statistics:\n',
          `GameID: ${room.getFightId()}`,
          `ChainID: ${room.getChainId()}`,
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
      await redisClient.del(createRoundsRedisLink())
      await redisClient.del(createAmountRedisLink(data.loserAddress, room.getChainId(), room.getFightId()))
      await redisClient.del(createAmountRedisLink(data.winnerAddress, room.getChainId(), room.getFightId()))
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
        room.sendTo(user, MessageType.ERROR_ROOM_IS_FULL);
        return;
      }

      if (room.numUsers() > 0) {
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("end_waiting_another_user")
        })
      }

      const fight = await blockchain().contract.fights(room.getFightId())
      const players = await blockchain().contract.getFightPlayers(room.getFightId())
      const player2 = players[1]
      room.amountToLose = fight.amountPerRound.toString()
      room.baseAmount = fight.baseAmount.toString()
      room.rounds = fight.rounds.toString()
      if ((fight.owner == joinData.walletAddress || player2 == joinData.walletAddress) && fight.finishTime == 0) {
        const exists = await redisClient.get(createAmountRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()))
        const roundsExists = await redisClient.get(createRoundsRedisLink())
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
        room.addUser(user = new User(joinData.walletAddress), socket);

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
        log(`User ${user.getId()} wallet address: ${user.getWalletAddress()}`);
      } else {
        room.sendTo(user, MessageType.NOT_USER_ROOM);
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
      if (user != null) {
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
      } else {
        return;
      }
    } catch (error) {
      console.error(error)
    }

  }

  function onSdp(message) {
    try {
      room.sendToId(message.userId, MessageType.SDP, {
        userId: user.getId(),
        sdp: message.sdp
      });
    } catch (error) {
      
    }
  }

  function onIceCandidate(message) {
    try {
      room.sendToId(message.userId, MessageType.ICE_CANDIDATE, {
        userId: user.getId(),
        candidate: message.candidate
      });
    } catch (error) {
      
    }
  }

  function createAmountRedisLink(address, chainid, gameid) {
    return `${address.toLowerCase()}_${gameid}_${chainid}_amount`
  }

  function createKillsRedisLink(address, chainid, gameid) {
    return `${address.toLowerCase()}_${gameid}_${chainid}_kills`;
  }

  function createDeathsRedisLink(address, chainid, gameid) {
    return `${address.toLowerCase()}_${gameid}_${chainid}_deaths`;
  }

  function createRoundsRedisLink() {
    //remaining rounds
    return room.getName()
  }


  async function addKills(address) {
    try {
      const link = createKillsRedisLink(address, room.getChainId(), room.getFightId())
      const exist = await redisClient.get(link)
      await redisClient.set(link, parseInt(exist) + 1)
    } catch (error) {
      console.error(error)
    }
  }

  async function addDeaths(address) {
    try {
      const link = createDeathsRedisLink(address, room.getChainId(), room.getFightId())
      const exist = await redisClient.get(link)
      await redisClient.set(link, parseInt(exist) + 1)
    } catch (error) {
      console.error(error)
    }
  }

  async function getKills(address) {
    try {
      const link = createKillsRedisLink(address, room.getChainId(), room.getFightId())
      const exist = await redisClient.get(link)
      if (exist == null) {
        await redisClient.set(link, 0)
      }
      return await redisClient.get(link)
    } catch (error) {
      console.error(error)
    }
  }

  async function getDeaths(address) {
    try {
      const link = createDeathsRedisLink(address, room.getChainId(), room.getFightId())
      const exist = await redisClient.get(link)
      if (exist == null) {
        await redisClient.set(link, 0)
      }
      return await redisClient.get(link)
    } catch (error) {
      console.error(error)
    }
  }

  async function removeKills(address) {
    try {
      await redisClient.del(createKillsRedisLink(address, room.getChainId(), room.getFightId()))
    } catch (error) {
      console.error(error)
    }
  }

  async function removeDeaths(address) {
    try {
      await redisClient.del(createDeathsRedisLink(address, room.getChainId(), room.getFightId()))
    } catch (error) {
      console.error(error)
    }
  }

  async function signature(amount, address, token) {
    if (token == undefined) {
      const fight = await blockchain().contract.fights(room.getFightId())
      token = fight.token
    }
    const network = networks.find(n => n.chainid == room.getChainId())
    const message = [room.getFightId(), amount, token, address, network.contractAddress]
    const hashMessage = ethers.utils.solidityKeccak256(["uint256", "uint256", "uint160", "uint160", "uint160"], message)
    const sign = await blockchain().signer.signMessage(ethers.utils.arrayify(hashMessage));
    const r = sign.substr(0, 66)
    const s = '0x' + sign.substr(66, 64);
    const v = parseInt("0x" + sign.substr(130, 2));
    return {
      contract: network.contractAddress, 
      amount, 
      chainid: room.getChainId(), 
      fightid: room.getFightId(), 
      address, 
      r, s, v,
      token
    }
  }

  function blockchain() {
    const network = networks.find(n => n.chainid == room.getChainId())
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    const signer = new ethers.Wallet(network.privateKey, provider)
    const _contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
    return {contract: _contract, signer};
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

