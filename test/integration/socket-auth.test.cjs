// Integration test: socket wallet-ownership challenge.
//
// Requires a running signalling server and its Postgres/Redis:
//   docker start ff-pg ff-redis
//   SIGNALLING_PORT=8033 node signalling/server.js
//   node test/integration/socket-auth.test.cjs
//
// The private keys below are the well-known public Hardhat test accounts.
const io = require('socket.io-client');
const { ethers } = require('ethers');

const URL = 'http://127.0.0.1:8033';
const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const attacker = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

function connect() {
  return new Promise((res, rej) => {
    const s = io.connect(URL, { forceNew: true, transports: ['websocket', 'polling'] });
    s.on('connect', () => res(s));
    s.on('connect_error', rej);
    setTimeout(() => rej(new Error('connect timeout')), 8000);
  });
}
function getNonce(s) {
  return new Promise((res, rej) => {
    s.once('auth_nonce', d => res(d && d.nonce));
    s.emit('auth_request');
    setTimeout(() => rej(new Error('nonce timeout')), 8000);
  });
}
// Room name format from Room(): "<fightid>&network=<chainid>"
const ROOM = '1&network=42161';

(async () => {
  let pass = 0, fail = 0;
  const t = (n, ok) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}`); };

  // 1. nonce is issued, is unique, and looks right
  const s1 = await connect();
  const n1 = await getNonce(s1);
  const n2 = await getNonce(s1);
  t('server issues a nonce', typeof n1 === 'string' && n1.includes('FairFight login'));
  t('nonce is single-use / rotates', n1 !== n2);

  // 2. join with NO signature is rejected
  const s2 = await connect();
  await getNonce(s2);
  const noSig = await new Promise(res => {
    s2.once('error_auth_required', () => res(true));
    s2.once('room', () => res(false));
    s2.emit('join', { roomName: ROOM, walletAddress: wallet.address });
    setTimeout(() => res(false), 5000);
  });
  t('join without signature rejected', noSig);

  // 3. join with a signature from a DIFFERENT wallet is rejected
  const s3 = await connect();
  const n3 = await getNonce(s3);
  const wrongSig = await attacker.signMessage(n3);
  const impersonation = await new Promise(res => {
    s3.once('error_auth_required', () => res(true));
    s3.once('room', () => res(false));
    s3.emit('join', { roomName: ROOM, walletAddress: wallet.address, signature: wrongSig });
    setTimeout(() => res(false), 5000);
  });
  t('impersonation (signature from other wallet) rejected', impersonation);

  // 4. a correctly signed join passes the AUTH gate (it then fails on-chain lookup, which is expected here)
  const s4 = await connect();
  const n4 = await getNonce(s4);
  const goodSig = await wallet.signMessage(n4);
  const authPassed = await new Promise(res => {
    s4.once('error_auth_required', () => res(false)); // must NOT be auth-rejected
    setTimeout(() => res(true), 5000);
  });
  s4.emit('join', { roomName: ROOM, walletAddress: wallet.address, signature: goodSig });
  t('valid signature passes the auth gate', await authPassed);

  console.log(`\n${fail === 0 ? 'ALL PASS' : fail + ' FAILED'}  (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
