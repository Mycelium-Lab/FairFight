//ESM evaluates all imports (including ../server/utils/env.js) before this body runs,
//so process.env is already populated here.
const PORT = parseInt(process.env.SIGNALLING_PORT || '8033', 10);
const MAX_ROOM_USERS = 5;

import fs from 'fs';
import crypto from 'crypto';
const log = console.log.bind(console);
//socket.io 4.x: the callable default export of 1.x is gone, the Server class is the API.
//The vendored browser client (lib/net/socket.io.js) must stay on a matching 4.x major -
//the Engine.IO 4 handshake used here cannot talk to a 1.x/2.x client.
import { Server as SocketIOServer } from 'socket.io';

//A browser sends an Origin of scheme://host[:port] with no trailing slash, so
//'https://fairfight.fairprotocol.solutions/' could never match anything. On socket.io
//1.7.4 that did not matter because the `cors` option did not exist yet and was silently
//dropped, which left the signalling server - the process that signs payouts - open to
//any origin. The option is real on 4.x, so the entries have to be exact.
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5000', //express server.js default
  'http://localhost:5050', //express server.js with PORT=5050 (5000 collides with AirPlay)
  'https://fairfight.fairprotocol.solutions'
];
const ALLOWED_ORIGINS = (process.env.SIGNALLING_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const allowedOrigins = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : DEFAULT_ALLOWED_ORIGINS;

//Abuse limits. This process settles live wagers, so an unauthenticated client must not be
//able to exhaust it. Every value is overridable so a busy fight night can be tuned without
//a code change.
const MAX_CONNECTIONS = parseInt(process.env.SIGNALLING_MAX_CONNECTIONS || '500', 10);
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.SIGNALLING_MAX_CONNECTIONS_PER_IP || '20', 10);
//A join/sdp/ice payload is a few KB; 64KB is generous and still bounds memory per packet.
//The 1.x default was 100MB (engine.io maxHttpBufferSize 10e7).
const MAX_HTTP_BUFFER_SIZE = parseInt(process.env.SIGNALLING_MAX_PAYLOAD_BYTES || '65536', 10);
//Nonce issuing is unauthenticated, so cap it per socket rather than let it spin freely.
const MAX_AUTH_REQUESTS_PER_MINUTE = parseInt(process.env.SIGNALLING_MAX_AUTH_REQUESTS || '30', 10);

const io = new SocketIOServer(PORT, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: false
  },
  //CORS headers only make a browser refuse to read a response; they do not stop the
  //request, and a WebSocket upgrade is not subject to CORS at all. Reject a
  //disallowed Origin outright so the allowlist binds every transport. A missing Origin
  //(native/CLI clients, the integration test) is not a browser request and is allowed -
  //those clients are still gated by the wallet signature check in isJoinAuthentic.
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }
    log('rejected handshake from disallowed origin %s', origin);
    return callback('origin not allowed', false);
  },
  maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
  //Drop a wedged player in ~25s instead of holding the room (and its stake) open.
  pingInterval: 10000,
  pingTimeout: 15000,
  //A socket that connects but never completes the Engine.IO handshake is dead weight.
  connectTimeout: 20000,
  //No need to keep the 1.x-era Flash/JSONP fallbacks alive.
  transports: ['polling', 'websocket'],
  //Compression buys little on tiny signalling frames and is a memory/CPU amplifier.
  perMessageDeflate: false
});

//Concurrency caps. Without these one host can hold every slot in the process and stall
//settlement for everybody else.
const connectionsPerIp = new Map();

io.use((socket, next) => {
  const ip = socket.handshake.address || 'unknown';
  //engine.clientsCount counts transports already open, including sockets still inside this
  //middleware, so a burst cannot slip past the cap the way a namespace count would.
  if (io.engine.clientsCount > MAX_CONNECTIONS) {
    log('rejected connection from %s: server at capacity (%d)', ip, MAX_CONNECTIONS);
    return next(new Error('server at capacity'));
  }
  const forIp = connectionsPerIp.get(ip) || 0;
  if (forIp >= MAX_CONNECTIONS_PER_IP) {
    log('rejected connection from %s: %d concurrent connections', ip, forIp);
    return next(new Error('too many connections'));
  }
  connectionsPerIp.set(ip, forIp + 1);
  //Release on the engine connection's close, not on the namespace 'disconnect' event:
  //if the client goes away while middleware is still running, socket.io drops the socket
  //without ever emitting 'disconnect' and the slot would leak. Only one namespace is in
  //use here, so conn and socket are one-to-one.
  socket.conn.once('close', () => {
    const left = (connectionsPerIp.get(ip) || 1) - 1;
    if (left > 0) {
      connectionsPerIp.set(ip, left);
    } else {
      connectionsPerIp.delete(ip);
    }
  });
  return next();
});

import redis from "redis"
import db from "../server/db/db.js"
import ethers from "ethers"
import web3 from "web3"
import '../server/utils/env.js'

import { contractAbi, contractAddress, networks } from "../contract/contract.js"
import { getFights } from '../server/ton/service.js';
import { Address, beginCell, Builder } from 'ton-core';
import { mnemonicToWalletKey, sign } from 'ton-crypto';

let key

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
})

//Use the shared factory so host/port config cannot drift from the HTTP server's.
const pgClient = db()

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

  // Wallet ownership proof, required before joining a fight room
  AUTH_REQUEST: 'auth_request',
  AUTH_NONCE: 'auth_nonce',

  // Errors... shit happens
  ERROR_ROOM_IS_FULL: 'error_room_is_full',
  ERROR_USER_INITIALIZED: 'error_user_initialized',
  ERROR_AUTH_REQUIRED: 'error_auth_required',
  NOT_USER_ROOM: 'not_user_room'
};

//Set REQUIRE_SOCKET_AUTH=false only for local debugging without a wallet.
const REQUIRE_SOCKET_AUTH = process.env.REQUIRE_SOCKET_AUTH !== 'false';

//The two free-to-play pseudo-chains. They carry no on-chain escrow: fights live in
//game_f2p/players_f2p and settlement writes statistics_f2p instead of signing a payout.
const F2P_CHAIN_IDS = new Set(['999998', '999999']);

//Wallet-free play, for developing the game loop and capturing gameplay fixtures.
//Refuses to arm in prod so it cannot be switched on against real players by mistake.
const DEV_NO_WALLET = process.env.FAIRFIGHT_DEV_NO_WALLET === 'true'
  && process.env.APP_STATE !== 'prod';
if (process.env.FAIRFIGHT_DEV_NO_WALLET === 'true' && process.env.APP_STATE === 'prod') {
  log('REFUSING FAIRFIGHT_DEV_NO_WALLET: APP_STATE is prod');
}

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
  this.playersBaseAmount = 2
  this.finishTime = 0
  this.amountPerRound = 0
  this.baseAmount = 0
}
Room.prototype = {
  getName: function () {
    return this.roomName;
  },
  getPlayerBaseAmount: function () {
    return this.playersBaseAmount;
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
  getUserByWalletAddress: function(walletAddress) {
    try {
      return this.users.find(function (user) {
        return user.getWalletAddress() === walletAddress;
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
  var authNonce = null;

  var authRequestCount = 0;
  var authRequestWindowStart = 0;

  socket.on(MessageType.AUTH_REQUEST, onAuthRequest);
  socket.on(MessageType.JOIN, onJoin);
  socket.on(MessageType.SDP, onSdp);
  socket.on(MessageType.ICE_CANDIDATE, onIceCandidate);
  //Still called 'disconnect' on 4.x; the handler now also receives a reason string, which
  //onLeave ignores. ('disconnecting' is the pre-teardown variant, not needed here because
  //room membership is tracked in `rooms`, not in socket.io rooms.)
  socket.on(MessageType.DISCONNECT, onLeave);
  socket.on(MessageType.USER_DEAD, onDead);
  socket.on(MessageType.FINISHING, onFinishing);
  socket.on(MessageType.JUMP, onJump);
  socket.on(MessageType.SHOOT, onShoot);
  socket.on(MessageType.USER_UPDATE_BALANCE, onUpdateBalance)
  socket.on(MessageType.END_FINISHING, onEndFinishing)

  //Returns true only when this socket is entitled to report the death it is claiming.
  //Rejects: unjoined sockets, reporting someone else's death, killers who are not in
  //the room, and self-kills used to farm the opponent's balance.
  function isDeathReportValid(data) {
    if (user === null || room === null) return false
    if (!data || typeof data.walletAddress !== 'string' || typeof data.killerAddress !== 'string') return false
    const victim = data.walletAddress.toLowerCase()
    const killer = data.killerAddress.toLowerCase()
    if (victim !== `${user.getWalletAddress()}`.toLowerCase()) {
      log('rejected user_dead: socket %s reported a death for %s', user.getWalletAddress(), data.walletAddress)
      return false
    }
    if (victim === killer) {
      log('rejected user_dead: self-kill claimed by %s', data.walletAddress)
      return false
    }
    const inRoom = room.getUsers().some(u => `${u.getWalletAddress()}`.toLowerCase() === killer)
    if (!inRoom) {
      log('rejected user_dead: killer %s is not in room %s', data.killerAddress, room.getName())
      return false
    }
    return true
  }

  //The `socket.to(value.id).emit(...)` pattern used throughout this file survives the
  //1.x -> 4.x move unchanged: a socket still auto-joins a room named after its own id, and
  //`socket.to(...)` still excludes the sender. Rewriting these as `io.to(...)` would start
  //delivering to the sender too, which the client does not expect - leave them alone.
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
      //ВРЕМЕННОЕ РЕШЕНИЕ
      //setTimeout потому что данные еще не успели обновиться
      setTimeout(async () => {
        try {
          let usersStats = []
          for (let i = 0; i < room.users.length; i++) {
            try {
              const balance = await redisClient.get(createAmountRedisLink(room.users[i].walletAddress, room.getChainId(), room.getFightId()))
              const kills = await getKills(room.users[i].walletAddress)
              const deaths = await getDeaths(room.users[i].walletAddress)
              usersStats.push({
                address: room.users[i].walletAddress,
                balance,
                kills,
                deaths
              })
            } catch (error) {
              console.log(error)
            }
          }
          if (usersStats.some(user => Object.values(user).includes(null))) {
            setTimeout(async () => {
              try {
                let usersStatsDB = []
                for (let i = 0; i < room.users.length; i++) {
                  const data = await pgClient.query("SELECT * FROM statistics WHERE player=$1 AND gameid=$2 AND chainid=$3", [
                    room.users[i].walletAddress,
                    room.getFightId(),
                    room.getChainId()
                  ])
                  usersStatsDB.push(
                    {
                      address: room.users[i].walletAddress,
                      amount: data.rows[0].amount,
                      kills: usersStats[i].kills,
                      deaths: usersStats[i].deaths
                    }
                  )
                }
                const remainingRounds = await redisClient.get(room.roomName)
                Object.entries(room.sockets).forEach(([key, value]) => {
                  if (value != null) { 
                    socket.to(value.id).emit("update_balance", {
                      usersStats,
                      remainingRounds: remainingRounds == null ? 0 : remainingRounds,
                      amountToLose: room.amountToLose,
                      rounds: room.getRounds()
                    })
                  }
                })
                room.broadcastFrom(user, "update_balance", {
                  usersStats,
                  remainingRounds: remainingRounds == null ? 0 : remainingRounds,
                  amountToLose: room.amountToLose,
                  rounds: room.getRounds()
                })
              } catch (error) {
                
              }
            }, 1000)
          } else {
            setTimeout(async () => {
              const remainingRounds = await redisClient.get(room.roomName)
              Object.entries(room.sockets).forEach(([key, value]) => {
                if (value != null) { 
                  socket.to(value.id).emit("update_balance", {
                    usersStats,
                    remainingRounds: remainingRounds == null ? 0 : remainingRounds,
                    amountToLose: room.amountToLose,
                    rounds: room.getRounds()
                  })
                }
              })
              room.broadcastFrom(user, "update_balance", {
                usersStats,
                remainingRounds: remainingRounds == null ? 0 : remainingRounds,
                amountToLose: room.amountToLose,
                rounds: room.getRounds()
              })
            }, 1000)
          }
        } catch (error) {
          console.log(error)
        }
      }, 100)
    } catch (error) {
      console.error(error)
    }
  }

  async function onDead(data) {
    try {
      //A death moves stake between players, so it must come from the socket that
      //owns the dying wallet. Previously both addresses were taken from the payload
      //verbatim, so any connected socket could mint an arbitrary result - and the
      //resulting balance is what gets signed into an on-chain payout.
      if (!isDeathReportValid(data)) return
      if (data.killerAddress) {
        console.log(`${data.walletAddress} dead (network: ${room.getChainId()}, fight: ${room.getFightId()}, killer: ${data.killerAddress})`)
        console.log(data.walletAddress, await redisClient.get(createAmountRedisLink(data.walletAddress, room.getChainId(), room.getFightId())))
        const balance = await redisClient.get(createAmountRedisLink(data.walletAddress, room.getChainId(), room.getFightId()))
        const newBalance = BigInt(balance) - BigInt(room.amountToLose)
        await redisClient.set(createAmountRedisLink(data.walletAddress, room.getChainId(), room.getFightId()), newBalance.toString())
        const rounds = await redisClient.get(createRoundsRedisLink())
        if (room.numUsers() == 2) {
          if (rounds != 0 || rounds != null) {
            await redisClient.set(room.roomName, parseInt(rounds) - 1)
          }
        }
        //get from loser
        //paste to winner
        //winner room.users[1].walletAddress
        const balanceWinner = await redisClient.get(createAmountRedisLink(data.killerAddress, room.getChainId(), room.getFightId()))
        const newBalanceWinner = BigInt(balanceWinner) + BigInt(room.amountToLose)
        await redisClient.set(createAmountRedisLink(data.killerAddress, room.getChainId(), room.getFightId()), newBalanceWinner.toString())
        await addKills(data.killerAddress)
        await addDeaths(data.walletAddress)
        const killsAddress1 = await getKills(data.walletAddress)
        const deathsAddress1 = await getDeaths(data.walletAddress)
        const killsAddress2 = await getKills(data.killerAddress)
        const deathsAddress2 = await getDeaths(data.killerAddress)
        //if balance == 0 -> user losed
        //create signature and add data to database
        // || (parseInt(rounds) - 1) == 0
        if (newBalance == 0 && room.numUsers() > 2) {
          await createSignatureOne(data.walletAddress)
          // room.broadcastFrom(user, MessageType.USER_LOSE_ALL, data.walletAddress);
          Object.entries(room.sockets).forEach(([key, value]) => {
            if (value != null) {
              socket.to(value.id).emit(MessageType.USER_LOSE_ALL, data.walletAddress)
            }
          })
          const userToRemoveFromRoom = room.getUserByWalletAddress(data.walletAddress)
          room.removeUser(userToRemoveFromRoom.getId())
        } else if ((newBalance == 0 || (parseInt(rounds) - 1) == 0) && room.numUsers() == 2) {
          setTimeout(async () => {
            await createSignature({
              loserAddress: data.walletAddress,
              winnerAddress: data.killerAddress,
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
                      address2: data.killerAddress, amount2: newBalanceWinner.toString(), rounds: room.getRounds()
                    })
                  }
                })
              })
              .then(() => {
                room.broadcastFrom(user, MessageType.USER_LOSE_ALL, `${data.walletAddress} dead`);
                room.finished = true;
              })
          }, 1000)
          //update balance
          //we send it each user in room
          //but its not works so on frontend we send it again from another user
          Object.entries(room.sockets).forEach(([key, value]) => {
            if (value != null) {
              socket.to(value.id).emit("update_balance", {
                address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) ,
                amountToLose: room.amountToLose, address2: data.killerAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2, rounds: room.getRounds()
              })
            }
          })
        }
        //update balance
        //we send it each user in room
        //but its not works so on frontend we send it again from another user
        Object.entries(room.sockets).forEach(([key, value]) => {
          if (value != null) {
            socket.to(value.id).emit("update_balance", {
              address1: data.walletAddress, amount1: newBalance.toString(), killsAddress1, deathsAddress1, remainingRounds: parseInt(rounds) ,
              amountToLose: room.amountToLose, address2: data.killerAddress, amount2: newBalanceWinner.toString(), killsAddress2, deathsAddress2, rounds: room.getRounds()
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
      //data.address decides which side of the fight the caller is treated as, and
      //feeds signature creation. Take it from the authenticated socket rather than
      //the payload so a client cannot claim to be its opponent. The internal
      //timeout call below passes the same address this socket joined with.
      if (user === null || room === null) return
      data = { ...data, address: user.getWalletAddress() }
      // if (data.fromButton) {
        let fight, players
        if ((room.getChainId() != 0) && (room.chainid != 999999) && (room.chainid != 999998)) {
          fight = await blockchain().contract.fights(room.getFightId())
          players = await blockchain().contract.getFightPlayers(room.getFightId())
        } else if (room.getChainId() == 0){
          fight = await blockchainTon(room.getFightId())
          players = fight.players
        } else {
          let fights = await pgClient.query(
            `
              SELECT 
                  g.gameid, 
                  g.owner, 
                  g.map, 
                  g.rounds, 
                  g.baseAmount, 
                  g.amountPerRound, 
                  g.players, 
                  g.createTime, 
                  g.finishTime, 
                  array_agg(p.player) AS players_list
              FROM 
                  game_f2p g
              LEFT JOIN 
                  players_f2p p ON g.gameid = p.gameid
              WHERE 
                  g.finishTime IS NULL AND g.gameid = $1 AND g.chainid = $2 
              GROUP BY 
                  g.gameid;
              `
            , [room.getFightId(), parseInt(room.chainid)])
          fight = fights.rows[0]
          fight.baseAmount = fight.baseamount
          players = fight.players_list
        }
        if (room.playersBaseAmount == 2) {
          const senderAddress = data.address
          const secondAddress = data.address.toLowerCase() == `${players[0]}`.toLowerCase() ? `${players[1]}` : `${players[0]}`
          const existsSender = await redisClient.get(createAmountRedisLink(senderAddress, room.getChainId(), room.getFightId()))
          const existsSecond = await redisClient.get(createAmountRedisLink(secondAddress, room.getChainId(), room.getFightId()))
          let balanceSender;
          let balanceSecond;
          if (existsSender != null && existsSecond != null) {
            balanceSender = existsSender
            balanceSecond = existsSecond
          } else {
            balanceSender = fight.baseAmount.toString()
            balanceSecond = fight.baseAmount.toString()
          }
          if (room.numUsers() == 1) {
            if (BigInt(balanceSender) > BigInt(fight.baseAmount.toString())) {
              //СОЗДАЕМ с тем что есть
              await createSignatureOne(senderAddress, balanceSender)
              await createSignatureOne(secondAddress, balanceSecond)
            } else {
              //создаем равное
              await createSignatureOne(senderAddress, fight.baseAmount.toString())
              await createSignatureOne(secondAddress, fight.baseAmount.toString())
            }
          } else {
            if (BigInt(balanceSender) < BigInt(fight.baseAmount.toString())) {
              //СОЗДАЕМ с тем что есть
              await createSignatureOne(senderAddress, balanceSender)
              await createSignatureOne(secondAddress, balanceSecond)
            } else {
              //создаем равное
              await createSignatureOne(senderAddress, fight.baseAmount.toString())
              await createSignatureOne(secondAddress, fight.baseAmount.toString())
            }
          }
          Object.entries(room.sockets).forEach(([key, value]) => {
            try {
              if (value != null) {
                socket.to(value.id).emit("finishing", {
                  fromButton: data.fromButton
                })
              }
            } catch (error) {
              console.log(error)
            }
          })
          room.finished = true;
        } else {
          if (room.numUsers() == 2 || room.numUsers() == 1) {
            const balance = await redisClient.get(createAmountRedisLink(data.address, room.getChainId(), room.getFightId()))
            const baseAmount = fight.baseAmount.toString()
            if ((balance && (BigInt(balance) < BigInt(baseAmount))) && room.numUsers() == 2) {
              for (let i = 0; i < players.length; i++) {
                await createSignatureOne(players[i])
              }
            } else if ((balance && (BigInt(balance) > BigInt(baseAmount))) && room.numUsers() == 2) { 
              for (let i = 0; i < players.length; i++) {
                await createSignatureOne(players[i], baseAmount)
              }
            } else if ((balance && (BigInt(balance) > BigInt(baseAmount))) && room.numUsers() == 1) { 
              for (let i = 0; i < players.length; i++) {
                await createSignatureOne(players[i])
              }
            } else if ((balance && (BigInt(balance) < BigInt(baseAmount))) && room.numUsers() == 1) { 
              for (let i = 0; i < players.length; i++) {
                await createSignatureOne(players[i], baseAmount)
              }
            } else {
              for (let i = 0; i < players.length; i++) {
                await createSignatureOne(players[i])
              }
            }
            Object.entries(room.sockets).forEach(([key, value]) => {
              try {
                if (value != null) {
                  socket.to(value.id).emit("finishing", {
                    fromButton: data.fromButton
                  })
                }
              } catch (error) {
                console.log(error)
              }
            })
            room.finished = true;
          }
        }
      // }
    } catch (error) {
      console.error(error)
    }
  }

  async function createSignatureOne(address, givenBalance) {
    try {
      let balance = givenBalance ? givenBalance : await redisClient.get(createAmountRedisLink(address, room.getChainId(), room.getFightId()))
      balance = balance != undefined ? balance : '0'
      let kills = await getKills(address)
      let deaths = await getDeaths(address)
      if ((room.getChainId() != 999999) && (room.getChainId() != 999998)) {
        const _signature = room.getChainId() != 0 ? await signature(balance, address) : await signatureTon(balance, address)
        await pgClient.query("INSERT INTO signatures (player, gameid, amount, chainid, contract, v, r, s, token) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE NOT EXISTS(SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$4 AND contract=$5)",
          [
            _signature.address.toLowerCase(),
            _signature.fightid,
            _signature.amount,
            _signature.chainid,
            _signature.contract,
            _signature.v,
            _signature.r,
            _signature.s,
            _signature.token
          ]
        )
        const rounds = await redisClient.get(createRoundsRedisLink())
  
        await pgClient.query(
          `INSERT INTO statistics (gameid, player, chainid, contract, amount, kills, deaths, remainingRounds, token, finishtime, rounds, amountperround, baseamount) 
          SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11, $12, $13 WHERE NOT EXISTS(SELECT * FROM statistics WHERE player=$2 AND gameid=$1 AND chainid=$3 AND contract=$4)`
          , 
          [
            _signature.fightid, 
            _signature.address.toLowerCase(), 
            _signature.chainid, 
            _signature.contract, 
            balance, 
            kills, 
            deaths, 
            rounds, 
            _signature.token,
            Date.now(),
            room.rounds,
            room.amountToLose,
            room.baseAmount
          ]
        )
      } else {
        const rounds = await redisClient.get(createRoundsRedisLink())
        await pgClient.query(
          `INSERT INTO statistics_f2p (gameid, player, amount, kills, deaths, remainingRounds) 
          SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS(SELECT * FROM statistics_f2p WHERE player=$2 AND gameid=$1)`
          , 
          [
            room.getFightId(), 
            address.toLowerCase(), 
            balance, 
            kills, 
            deaths, 
            rounds
          ]
        )
        const wins = BigInt(room.baseAmount) < BigInt(balance) ? 1 : 0
        const amountWon = wins == 1 ? (parseInt(balance) / 10**9) : 0
        const tokens = wins == 1 ? 10 : 5
        await pgClient.query(
          `
          INSERT INTO board_f2p (player, games, wins, amountWon, tokens, kills, deaths, chainid)
          VALUES ($1, 1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (player) 
          DO UPDATE SET
              games = board_f2p.games + 1,
              wins = board_f2p.wins + $2,
              amountWon = board_f2p.amountWon + $3,
              tokens = board_f2p.tokens + $4,
              kills = board_f2p.kills + $5,
              deaths = board_f2p.deaths + $6;
          `,
          [ address.toLowerCase(), wins, amountWon, tokens, kills, deaths, room.getChainId()]
        )
        // Обновление времени завершения игры
        await pgClient.query("UPDATE game_f2p SET finishtime = $1 WHERE gameid = $2", [Date.now(), room.getFightId()]);
      }
      await removeKills(address)
      await removeDeaths(address)
      await deleteTonWallet(address)
      await redisClient.del(createAmountRedisLink(address, room.getChainId(), room.getFightId()))
    } catch (error) {
      console.log(error)
    }
  }

  async function createSignature(data) {
    try {
      //get this fight data
      const rounds = await redisClient.get(createRoundsRedisLink())
      if (BigInt(room.baseAmount) * BigInt(room.getPlayerBaseAmount()) < BigInt(data.loserAmount) + BigInt(data.winnerAmount)) {
        data.loserAmount = room.baseAmount
        data.winnerAmount = room.baseAmount
      }
      if (room.getChainId() != 999999 && room.getChainId() != 999998) {

        let signatures
        if (room.getChainId() != 0) {
          signatures = [
            await signature(data.loserAmount, data.loserAddress, data.token),
            await signature(data.winnerAmount, data.winnerAddress, data.token)
          ]
        } else {
          signatures = [
            await signatureTon(data.loserAmount, data.loserAddress),
            await signatureTon(data.winnerAmount, data.winnerAddress)
          ]
        }
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
          await pgClient.query(
            `INSERT INTO statistics (gameid, player, chainid, contract, amount, kills, deaths, remainingRounds, token, finishtime, rounds, amountperround, baseamount) 
            SELECT $1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11, $12, $13 WHERE NOT EXISTS(SELECT * FROM statistics WHERE player=$2 AND gameid=$1 AND chainid=$3 AND contract=$4)`, 
          [room.getFightId(), data.loserAddress.toLowerCase(), room.getChainId(), signatures[0].contract, data.loserAmount, killsLoser, deathsLoser, rounds, 
            signatures[0].token,
            Date.now(),
            room.rounds,
            room.amountToLose,
            room.baseAmount
          ])
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
          await pgClient.query("INSERT INTO statistics (gameid, player, chainid, contract, amount, kills, deaths, remainingRounds, token, finishtime, rounds, amountperround, baseamount) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11, $12, $13)", 
          [room.getFightId(), data.winnerAddress.toLowerCase(), room.getChainId(), signatures[0].contract, data.winnerAmount, killsWinner, deathsWinner, rounds, signatures[0].token,
            Date.now(),
            room.rounds,
            room.amountToLose,
            room.baseAmount
          ])
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
      } else {
        try {
          // Начало транзакции
          await pgClient.query('BEGIN');
        
          const killsLoser = await getKills(data.loserAddress);
          const deathsLoser = await getDeaths(data.loserAddress);
          const killsWinner = await getKills(data.winnerAddress);
          const deathsWinner = await getDeaths(data.winnerAddress);
        
          // Вставка данных для проигравшего
          await pgClient.query(
            `INSERT INTO statistics_f2p (gameid, player, amount, kills, deaths, remainingRounds) 
            SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS(SELECT * FROM statistics_f2p WHERE player=$2 AND gameid=$1)`,
            [room.getFightId(), data.loserAddress.toLowerCase(), data.loserAmount, killsLoser, deathsLoser, rounds]
          );
        
          // Вставка данных для победителя
          await pgClient.query(
            `INSERT INTO statistics_f2p (gameid, player, amount, kills, deaths, remainingRounds) 
            SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS(SELECT * FROM statistics_f2p WHERE player=$2 AND gameid=$1)`,
            [room.getFightId(), data.winnerAddress.toLowerCase(), data.winnerAmount, killsWinner, deathsWinner, rounds]
          );
        
          // Обновление времени завершения игры
          await pgClient.query("UPDATE game_f2p SET finishtime = $1 WHERE gameid = $2", [Date.now(), room.getFightId()]);
        
          const winsLoser = 0;
          const amountWonLoser = 0;
          const tokensLoser = 5;
        
          // Вставка/обновление данных для проигравшего
          await pgClient.query(
            `
            INSERT INTO board_f2p (player, games, wins, amountWon, tokens, kills, deaths, chainid)
            VALUES ($1, 1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (player) 
            DO UPDATE SET
                games = board_f2p.games + 1,
                wins = board_f2p.wins + $2,
                amountWon = board_f2p.amountWon + $3,
                tokens = board_f2p.tokens + $4,
                kills = board_f2p.kills + $5,
                deaths = board_f2p.deaths + $6;
            `,
            [data.loserAddress.toLowerCase(), winsLoser, amountWonLoser, tokensLoser, killsLoser, deathsLoser, room.getChainId()]
          );
        
          const winsWinner = 1;
          const amountWonWinner = parseInt(data.winnerAmount) / 10**9;
          const tokensWinner = 10;
        
          // Вставка/обновление данных для победителя
          await pgClient.query(
            `
            INSERT INTO board_f2p (player, games, wins, amountWon, tokens, kills, deaths, chainid)
            VALUES ($1, 1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (player) 
            DO UPDATE SET
                games = board_f2p.games + 1,
                wins = board_f2p.wins + $2,
                amountWon = board_f2p.amountWon + $3,
                tokens = board_f2p.tokens + $4,
                kills = board_f2p.kills + $5,
                deaths = board_f2p.deaths + $6;
            `,
            [data.winnerAddress.toLowerCase(), winsWinner, amountWonWinner, tokensWinner, killsWinner, deathsWinner, room.getChainId()]
          );
        
          // Завершение транзакции
          await pgClient.query('COMMIT');
        } catch (error) {
          // Откат транзакции в случае ошибки
          await pgClient.query('ROLLBACK');
          console.error('Transaction failed:', error);
          throw error;
        }        
      }
      await removeKills(data.loserAddress)
      await removeKills(data.winnerAddress)
      await removeDeaths(data.loserAddress)
      await removeDeaths(data.winnerAddress)
      await redisClient.del(createRoundsRedisLink())
      await redisClient.del(createAmountRedisLink(data.loserAddress, room.getChainId(), room.getFightId()))
      await redisClient.del(createAmountRedisLink(data.winnerAddress, room.getChainId(), room.getFightId()))
      await deleteTonWallet(data.loserAddress)
      await deleteTonWallet(data.winnerAddress)
    } catch (error) {
      console.error(error)
    }
  }

  //Issues a one-time nonce for this socket. The client signs it with the wallet it
  //claims to own, proving control before it can join a fight room.
  //Nonce issuing is pre-authentication, so it is capped per socket: a legitimate client
  //asks once per join, and rotation on every request is the point of the challenge.
  function onAuthRequest() {
    try {
      const now = Date.now()
      if (now - authRequestWindowStart > 60000) {
        authRequestWindowStart = now
        authRequestCount = 0
      }
      if (++authRequestCount > MAX_AUTH_REQUESTS_PER_MINUTE) {
        log('rejected auth_request: socket %s over the nonce rate limit', socket.id)
        return
      }
      authNonce = `FairFight login\nnonce: ${crypto.randomBytes(16).toString('hex')}\nissued: ${Date.now()}`
      socket.emit(MessageType.AUTH_NONCE, { nonce: authNonce })
    } catch (error) {
      console.error(error)
    }
  }

  //The fight's player list is public on-chain, so without this anyone could join a
  //room claiming to be either participant and then report results as that player.
  //TON wallets cannot personal_sign, so chain 0 is not covered yet - see REQUIRE_SOCKET_AUTH.
  function isJoinAuthentic(joinData) {
    if (`${room.getChainId()}` === '0') return true
    //Free-to-play rooms hold no on-chain stake, so a wallet cannot be required to
    //enter one. Only exempt them when dev mode is explicitly on, and never in prod -
    //F2P still awards leaderboard tokens, so this is not a free-for-all.
    if (DEV_NO_WALLET && F2P_CHAIN_IDS.has(`${room.getChainId()}`)) return true
    if (!REQUIRE_SOCKET_AUTH) return true
    if (!authNonce || !joinData || typeof joinData.signature !== 'string') {
      log('rejected join: missing signature for %s', joinData && joinData.walletAddress)
      return false
    }
    try {
      const recovered = ethers.utils.verifyMessage(authNonce, joinData.signature)
      const ok = recovered.toLowerCase() === `${joinData.walletAddress}`.toLowerCase()
      if (!ok) log('rejected join: signature recovers to %s, claimed %s', recovered, joinData.walletAddress)
      return ok
    } catch (error) {
      log('rejected join: bad signature for %s (%s)', joinData.walletAddress, error.message)
      return false
    } finally {
      authNonce = null //single use, whatever the outcome
    }
  }

  async function onJoin(joinData) {
    try {
      // Somehow sent join request twice?
      if (user !== null || room !== null) {
        room.sendTo(user, MessageType.ERROR_USER_INITIALIZED);
        return;
      }

      //Room() parses this string positionally, so reject junk before it becomes a
      //half-built room object. maxHttpBufferSize bounds the packet; this bounds the shape.
      if (!joinData || typeof joinData.roomName !== 'string' || joinData.roomName.length > 128) {
        log('rejected join: malformed roomName');
        return;
      }

      // Let's get a room, or create if none still exists
      room = getOrCreateRoom(joinData.roomName);
      if (room.numUsers() >= MAX_ROOM_USERS) {
        room.sendTo(user, MessageType.ERROR_ROOM_IS_FULL);
        return;
      }

      if (!isJoinAuthentic(joinData)) {
        socket.emit(MessageType.ERROR_AUTH_REQUIRED);
        room = null;
        return;
      }

      if (room.numUsers() > 0) {
        Object.entries(room.sockets).forEach(([key, value]) => {
          socket.to(value.id).emit("end_waiting_another_user")
        })
      }
      let amountPerRound, baseAmount, rounds, playersBaseAmount, finishTime, players
      if ((room.getChainId() != 0) && (room.chainid != 999999) && (room.chainid != 999998)) {
        const fight = await blockchain().contract.fights(room.getFightId())
        players = await blockchain().contract.getFightPlayers(room.getFightId())
        amountPerRound = fight.amountPerRound.toString()
        baseAmount = fight.baseAmount.toString()
        rounds = fight.rounds.toString()
        playersBaseAmount = parseInt(fight.playersAmount)
        finishTime = parseInt(fight.finishTime)
      } else  if (room.getChainId() == 0) {
        const fight = await blockchainTon(room.getFightId())
        if (!fight) {
          room.sendTo(user, MessageType.NOT_USER_ROOM);
          throw Error('User not in this fight or fight finished or not exist')
        }
        players = fight.players
        amountPerRound = fight.amountPerRound.toString()
        baseAmount = fight.baseAmount.toString()
        rounds = fight.rounds.toString()
        playersBaseAmount = parseInt(fight.maxPlayersAmount)
        finishTime = parseInt(fight.finishTime)
      } else {
        const fight = await pgClient.query(
          `
            SELECT 
                g.gameid, 
                g.owner, 
                g.map, 
                g.rounds, 
                g.baseAmount, 
                g.amountPerRound, 
                g.players, 
                g.createTime, 
                g.finishTime, 
                array_agg(p.player) AS players_list
            FROM 
                game_f2p g
            LEFT JOIN 
                players_f2p p ON g.gameid = p.gameid
            WHERE 
                g.finishTime IS NULL AND g.gameid = $1 AND g.chainid = $2
            GROUP BY 
                g.gameid;
            `
          , [room.getFightId(), room.getChainId()])
        if (fight.rows.length == 0) {
          room.sendTo(user, MessageType.NOT_USER_ROOM);
          throw Error('User not in this fight or fight finished or not exist')
        }
        players = fight.rows[0].players_list
        amountPerRound = fight.rows[0].amountperround
        baseAmount = fight.rows[0].baseamount
        rounds = fight.rows[0].rounds
        playersBaseAmount = parseInt(fight.rows[0].players)
        finishTime = 0
      }
      room.amountToLose = amountPerRound
      room.baseAmount = baseAmount
      room.rounds = rounds
      room.playersBaseAmount = playersBaseAmount
      room.finishTime = 0
      let res = {rows: []}
      if (room.getChainId() != 999999 && room.getChainId() != 999998) {
        res = await pgClient.query(
          'SELECT * FROM signatures WHERE player=$1 AND gameid=$2 AND chainid=$3',
          [joinData.walletAddress.toLowerCase(), room.getFightId(), room.getChainId()]
        )
      } else {
        const resStatsF2P = await pgClient.query(
          'SELECT * FROM statistics_f2p WHERE player=$1 AND gameid=$2',
          [joinData.walletAddress.toLowerCase(), room.getFightId()]
        )
        if (resStatsF2P.rows.length) throw Error('Fight ended')
      }
      players = players.map(v => v.toString())
      if (players.includes(joinData.walletAddress) && finishTime == 0 && res.rows.length === 0) {
        if (room.getChainId() == 0) {
          await setTonWallet(joinData.walletAddress)
        }
        const exists = await redisClient.get(createAmountRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()))
        const roundsExists = await redisClient.get(createRoundsRedisLink())
        if (exists == null || isNaN(parseFloat(exists)) || exists == 'NaN') {
          await redisClient.set(createAmountRedisLink(joinData.walletAddress, room.getChainId(), room.getFightId()), room.baseAmount)
        }
        if (roundsExists == null || isNaN(parseFloat(roundsExists))) {
          await redisClient.set(createRoundsRedisLink(), rounds.toString())
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
              await onFinishing({fromButton: false, address: joinData.walletAddress})
              room.sendTo(user, 'update_balance', {});
            }
          }, 1000 * 60 * 3)
        }

        // Send room info to new user
        room.sendTo(user, MessageType.ROOM, {
          userId: user.getId(),
          roomName: room.getName(),
          users: room.getUsers(),
          playersBaseAmount
        });
        // Notify others of a new user joined
        room.broadcastFrom(user, MessageType.USER_JOIN, {
          userId: user.getId(),
          user: user
        });
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

  function createTonWalletRedisLink(address) {
    return `tonwallet_${address.toLowerCase()}`
  }

  async function setTonWallet(address) {
    try {
      await redisClient.set(createTonWalletRedisLink(address), address)
    } catch (error) {
      console.error(error)
    }
  }

  async function getTonWallet(address) {
    try {
      return await redisClient.get(createTonWalletRedisLink(address))
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteTonWallet(address) {
    try {
      await redisClient.del(createTonWalletRedisLink(address))
    } catch (error) {
      console.error(error)
    }
  }

  async function signature(amount, address, token) {
    amount = amount < 0 ? 0 : amount
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

  async function signatureTon(amount, address) {
    try {
      const contractAddress = "EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ"
      let addressFromRedis = await getTonWallet(address)
      if (addressFromRedis) {
        address = addressFromRedis
      }
      amount = amount < 0 ? 0 : amount
      const signPlayer = sign(
        beginCell()
          .storeUint(3077991154, 32)
          .storeInt(BigInt(room.getFightId()), 257)
          .storeAddress(Address.parse(`${address}`))
          .storeAddress(Address.parse(contractAddress))
          .storeCoins(amount)
          .endCell()
          .hash(),
        key.secretKey
      )
      const signString = signPlayer.toString('base64')
      return {
        contract: contractAddress, 
        amount, 
        chainid: room.getChainId(), 
        fightid: room.getFightId(), 
        address, 
        r: 'к', 
        s: signString, 
        v: 0,
        token: ''
      }
    } catch (error) {
      console.log(error)
    }
  }

  function blockchain() {
    const network = networks.find(n => n.chainid == room.getChainId())
    const provider = new ethers.providers.JsonRpcProvider(network.rpc)
    const signer = new ethers.Wallet(network.privateKey, provider)
    const _contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
    return {contract: _contract, signer};
  }

  async function blockchainTon(id) {
    const fights = await getFights()
    const fight = fights.find(v => v.id.toString() === id.toString())
    return fight
  }

}


redisClient
  .connect()
  .then(() => {
    pgClient.connect()
  })
  .then(() => {
    //'connection' is still the event name on 4.x ('connect' remains an alias).
    io.on('connection', handleSocket);
    log('Running room server on port %d', PORT);
    log('Allowed origins: %s', allowedOrigins.join(', '));
    log('Limits: %d connections (%d per IP), %d byte max payload',
      MAX_CONNECTIONS, MAX_CONNECTIONS_PER_IP, MAX_HTTP_BUFFER_SIZE);
  })
  .then(async () => {
    key = await mnemonicToWalletKey(process.env.MNEMONIC_TON.split(" "));
  })
  .catch(err => console.error(err))

