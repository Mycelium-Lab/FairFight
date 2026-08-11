# Running FairFight locally

Everything below was verified on Node 25 / macOS. The project could not start on
any modern Node before this; see the `fix(runtime)` commit for what was blocking.

## 1. Dependencies

```bash
docker run -d --name ff-pg    -e POSTGRES_PASSWORD=fairfight -e POSTGRES_USER=fairfight \
                              -e POSTGRES_DB=fairfight -p 55432:5432 postgres:16-alpine
docker run -d --name ff-redis -p 56379:6379 redis:7-alpine
```

Afterwards just `docker start ff-pg ff-redis`.

Load the schema (21 tables):

```bash
PGPASSWORD=fairfight psql -h 127.0.0.1 -p 55432 -U fairfight -d fairfight -f tables.sql
```

## 2. Environment

Copy `.env.org` to `.env` and fill in the local values. Ports 55432/56379 avoid
clashing with any Postgres/Redis you already run.

```
DB=fairfight
DB_USER=fairfight
DB_PASSWORD=fairfight
DB_HOST=127.0.0.1
DB_PORT=55432
REDIS_HOST=127.0.0.1
REDIS_PORT=56379
APP_STATE=test
```

For `PRIVATE_KEY` use the well-known Hardhat account #0
(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`). It is
public and funded only on local chains.

> In any deployment reachable from the internet, keep `.env` **outside** the
> repository root and point at it with `ENV_FILE=/path/to/secrets.env`. It holds
> the settlement signing keys, and the web process should not be able to read
> them.

## 3. Local chain, contracts and a seeded fight

```bash
cd evm
npm install
npx hardhat node --port 8545                                    # terminal 1
npx hardhat run scripts/local/deployAndSeed.js --network localhost   # terminal 2
```

This deploys the `FairFightV2` proxy, creates a 1 ETH fight from Hardhat account
#1 and joins it with account #2, leaving it **Ready** with 2 ETH escrowed. The
addresses land in `deployment.local.json` at the repo root (gitignored).

To prove the whole money path without touching the UI:

```bash
npx hardhat run scripts/local/settleSeededFight.js --network localhost
```

It has the referee sign an outcome attesting only *who won*, claims as the
winner, and asserts the payout, the fee, that the contract balance returns to
zero and that both players are released. Expect `END TO END OK`.

Note this **consumes** the seeded fight — re-run `deployAndSeed.js` to get
another playable one.

## 4. Client bundles

`lib/dist` is build output and is no longer tracked, so a fresh clone has no
bundles and the lobby will not load until you build:

```bash
npm --prefix lib ci
npm --prefix lib run build
```

## 5. Services

```bash
PORT=5050 node server.js                    # HTTP API + static, terminal 3
SIGNALLING_PORT=8033 node signalling/server.js   # match server, terminal 4
```

Port 5000 is taken by AirPlay Receiver on macOS, hence 5050.

Open <http://127.0.0.1:5050/>.

## 6. Playing without a wallet (the quick way)

A match needs two players before anything happens — `ig.main()` is only called
once both are in the room, so one browser sits on "ROUND LOADING" forever. The
sparring bot is the second player.

```bash
FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8033 node signalling/server.js
node bot/sparring-bot.mjs --human yourname --dies-after 10s --rounds 3
```

Open the URL the bot prints. No wallet, no chain, no transactions — the fight is
rows in `game_f2p`/`players_f2p`.

The bot is invisible in the game view and always loses; see `docs/DEV_BOT.md`
for why, before you go looking for a character to shoot at.

## 7. Playing a real wagered match

You need a real wallet extension, so use two browser profiles:

1. Add a network in MetaMask: RPC `http://127.0.0.1:8545`, chain id `31337`.
2. Import the two player keys from `deployment.local.json` (`players.player1`,
   `players.player2`) — one per profile.
3. Both profiles open the lobby and join the seeded fight.

Joining a match room requires signing a nonce, so the wallet will prompt. That
is the wallet-ownership check: without it, anyone could join claiming to be
either participant, since the fight's player list is public on-chain.

## Tests

```bash
npm test                    # server: input validation, sign-in nonce, socket auth
node test/integration/headless-match.test.cjs <gameid>   # a match, no wallet or browser
node test/integration/sparring-bot.test.mjs              # 43 bot assertions
cd evm && npx hardhat test  # 119 contract tests, incl. differential legacy exploits
cd ton && npx jest tests/FairFight.spec.ts   # 21 TON settlement tests
```

The server integration tests need Postgres, Redis and the signalling server
running; the wallet-free ones need `FAIRFIGHT_DEV_NO_WALLET=true` on it.

## Known local gotchas

- Hardhat prints a warning on Node 25 (unsupported). Tests pass regardless.
- `ton/tests/NFT.spec.ts` does not compile — stale against a newer `NftShop`
  contract, pre-existing and unrelated to settlement.
- `evm/artifacts` and `lib/dist` are build output and no longer tracked; run a
  build rather than expecting them in a fresh clone.
- All four pages request `/dist/index.js`, which has never been committed and
  which nothing builds, so it 404s. Pre-existing and harmless — the pages work.
- WalletConnect logs `Project not found`: its cloud project id is dead. Use
  MetaMask's injected connector locally until it is re-provisioned.
- The TON lobby shows "Your platform is not supported!" on a desktop browser.
  That is its Telegram Mini App mobile gate, not a fault — use a mobile viewport.
