# FairFight v2 — handoff

Written for whoever picks this up next, human or agent. Everything below is on
branch `v2` (20 commits, `master..v2` = +14,156 / −17,917 across 165 files).

If you read one thing, read **§1 The one fact that matters** and **§6 What to do
next**.

---

## 1. The one fact that matters

The game's premise is *provably fair wagering*. The architecture does not
deliver it, and no amount of tidying changes that.

Gameplay is peer-to-peer WebRTC between two browsers with **client-local hit
detection**. The victim's own browser decides it died, names its killer, and
reports that over a socket. The server applies it, and that number becomes a
signed on-chain payout.

```
victim's browser decides it died
   → self-reports over socket
      → server moves the stake and signs a payout
         → contract pays whatever the signature says
```

Everything before the contract is a client assertion. The v2 work has closed the
*forgery* holes — you can no longer claim to be someone else, or report someone
else's death — but a **participant can still lie about their own match**. Closing
that needs server-authoritative simulation (the server owns movement, hit
detection and health; clients send inputs only). Estimated 2–4 engineers,
6–9 months. It is the M3 milestone and it has not been started.

**Do not put meaningful money on this until that is done.**

Full analysis: <https://claude.ai/code/artifact/0096c7ab-ff88-4528-b75e-9871e1bd33e6>

---

## 2. Architecture in one page

Five moving parts. Two Node processes, no orchestration between them, sharing one
Postgres and one Redis.

| Piece | Where | Role |
|---|---|---|
| HTTP API + static | `server.js`, `server/**` | REST, serves the client, port 5000 (use 5050 on macOS — AirPlay owns 5000) |
| Match server | `signalling/server.js` | ~1,500 lines. Rooms, WebRTC brokering, **and** the referee: it moves balances and signs payouts. Single instance — room state is in-process memory. Port 8033 |
| Client | `lib/**`, `public/*.html` | ImpactJS game + vanilla-DOM lobby. Bundled by webpack into `lib/dist` (not tracked — you must build) |
| EVM contracts | `evm/contracts/**` | `FairFightV2.sol` is the hardened replacement. Legacy `FairFight.sol` is still in the tree and still exploitable |
| TON contracts | `ton/contracts/*.tact` | `fair_fight.tact`, hardened. Its own product: a Telegram Mini App |

**Chain families are EVM and TVM (TON).** Free-to-play uses two pseudo-chains,
`999998` (EVM-flavoured) and `999999` (TON-flavoured), which hold no escrow —
fights are rows in `game_f2p` / `players_f2p`. That is what makes wallet-free
local play possible.

### Money flow, EVM

`create(stake, token)` → `join(fightId)` → referee signs an **outcome** (EIP-712,
`{fightId, claimant, nonce, deadline}` — *no amount field*) → `finish()` →
`claim()`. The contract computes the payout from escrow it holds. A compromised
signer can pick the wrong winner but cannot invent an amount or touch another
fight's escrow.

### Key files, by "where do I look when…"

| Question | File |
|---|---|
| How does a match start / settle? | `signalling/server.js` — `onJoin`, `onDead`, `onFinishing`, `createSignature` |
| Who is allowed to do what? | `signalling/server.js` — `isJoinAuthentic`, `isDeathReportValid` |
| How does the client talk to a chain? | `lib/chain/{index,evm,tvm}.js` — the ChainAdapter |
| Where is the game loop? | `lib/game/main.js` (`ig.main()` at ~:1697), `lib/game/entities/player.js` |
| Chain metadata | `shared/networks.js` (browser-safe) + `shared/networks.server.js` (keys) |
| Fight row markup | `lib/src/fights/rows.js` |

---

## 3. What v2 changed

### Security (all verified by tests that fail against the old code)

| Fix | Was |
|---|---|
| Path traversal in `/getcharacterimage` | Arbitrary file read — including the `.env` holding every signing key |
| `/playersign` removed | Minted payout signatures for strangers, splitting the pot with `Math.random()` |
| Socket wallet auth | Anyone could join a room claiming to be either participant |
| `onDead` bound to the victim's socket | Any socket could fabricate any result |
| Sign-in nonces | A captured signature was a permanent credential |
| Telegram identity from verified `initData` | Any TG user could spend another's tokens |
| `FairFightV2` | `finish()` had no membership check, no amount bound, one shared balance |
| TON sender binding | The loser could submit the winner's signature |
| socket.io 1.7.4 → 4.8.3 | `ws@1.1.5` CVE; the `cors` option was silently ignored |
| Per-IP cap via `X-Forwarded-For` | Behind nginx, all players counted as one host |

### Runtime

Would not start on any modern Node. Now runs on Node 25: `canvas` → `@napi-rs/canvas`,
`assert {type:"json"}` → `with`, DB/Redis config unified, ports configurable.

### Frontend unification (~8,000 lines, 1.03 MB of HTML)

Steps 0,1,2,3a,4,5,7,8a/b,9 of `docs/frontend-unification-design.md` are done.
Lobby pages went 781 KB → 242 KB and 767 KB → 228 KB.

---

## 4. Run it

Full detail in `docs/LOCAL_DEV.md`. The short version:

```bash
docker start ff-pg ff-redis          # or create them, see LOCAL_DEV.md
npm --prefix lib ci && npm --prefix lib run build   # lib/dist is NOT tracked
PORT=5050 node server.js
FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8033 node signalling/server.js
node bot/sparring-bot.mjs --human you --dies-after 20s --rounds 3
```

Open the URL the bot prints. **Use `localhost`, not `127.0.0.1`.**

Two things that look broken and are not: a single browser sits on "ROUND LOADING"
forever because `ig.main()` waits for both players; and the TON lobby says
"platform not supported" on desktop because it is a mobile-gated Mini App.

The bot is **invisible** (it is a Node process; gameplay is browser-to-browser
WebRTC) and **always loses** (the anti-cheat only accepts a death report from the
socket owning the dying wallet). See `docs/DEV_BOT.md`.

---

## 5. State of play — what is proven, what is not

| | Status |
|---|---|
| EVM contracts | ✅ 119 hardhat tests, incl. differential tests proving the old exploits land and the new contract rejects them |
| TON contract | ✅ 21 tests; the headline bug proven fixed by mutation testing |
| Server security | ✅ validation, nonce replay, socket auth, proxy cap — all run against a live server |
| Wallet-free match | ✅ plays and settles end to end |
| **Step 6 (one lobby entry)** | ⚠️ **compiles, unproven at runtime** — see below |
| Shop / lootbox / equip flows | ⚠️ traced, never executed — needs a funded wallet |

### The one thing left half-done

The last commit (`0a83f68`) restructured `lib/index.js` + `lib/index_ton.js` into
`lib/lobby/{evm,tvm}.js` behind a single `lobby.js` entry, and both pages now load
one `dist/lobby.js`. The webpack build is clean and every file parses — but the
agent doing it stalled, and Docker died before it could be loaded in a browser.

**First job for whoever continues: boot the stack and open both lobbies.** If they
work, the remaining deletions that step was meant to make (duplicate WalletConnect
init blocks, the amount observers, ~545 lines of commented-out mock fixtures) are
still on the table. If they don't, `git revert 0a83f68` loses only that step.

---

## 6. What to do next, in order

1. **Verify `0a83f68`** — both lobbies in a browser. Everything else is blocked
   behind knowing whether it works.
2. **Step 8c — merge the two lobby pages.** Now unblocked: a merged page can point
   at the single `dist/lobby.js`. ~95% of the two pages is already identical after
   the id normalisation in step 2.
3. **Step 3b — unify the fight-row state machines.** The riskiest remaining
   frontend work, and deliberately left alone. TON navigates away *as a side effect
   of rendering a row*; EVM navigates from a contract event handler and from the
   `/sign` branch. Merging them wrong redirects a player into a match they never
   joined. `lib/src/fights/rows.js` already extracted the markup, so the diff is
   small — the *thinking* is the hard part. Write the state table first.
4. **TON socket auth** (task 7, still open). `isJoinAuthentic` returns `true`
   unconditionally for chain 0, because TON wallets cannot `personal_sign`. So the
   money-critical gate covers EVM only. Needs the TonConnect `ton_proof` flow.
5. **Then M3** — server-authoritative simulation. See §1.

### Cheap wins sitting there

- `lib/media/svg/lobby/network-base.svg` is **452 KB** for an icon rendered at
  23×23 px — 88% of all extracted asset bytes. One file.
- A **third** chain registry survives in `lib/net/contract.js` and holds the only
  definitions of chains 0 / 999998 / 999999. It can drift from `shared/networks.js`.
- `lib/src/pastFights.js` is dead code still importing `ethers`.
- All four pages request `/dist/index.js`, which nothing builds — a 404 on every
  load, pre-existing.
- WalletConnect's cloud project id is dead (`Project not found`). Use MetaMask's
  injected connector until it is re-provisioned.

---

## 7. Before this ever takes real money again

Not code — operations. These block a relaunch regardless of how good the code gets.

1. **Assume every key in the old `.env` is compromised.** One key per chain family
   was signer, owner, deployer and proxy admin simultaneously, across 8+ mainnets.
2. **The deployed bytecode is not this source.** The production ABI has
   `grantRole`/`hasRole` and no `transferOwnership`; `FairFight.sol` is `Ownable`.
   Recover the live bytecode before planning any upgrade.
3. **Confirm the proxy admin key still exists and you control it.** If not, the
   old deployment cannot be paused or refunded, and the plan changes materially.
4. **`FairFightV2` is a fresh deployment, not an upgrade.** Any live proxy stays
   vulnerable until funds are migrated. That migration is not written.
5. Legacy `FairFight.sol` is still in the tree and still exploitable exactly as
   the differential tests demonstrate.

---

## 8. Working on this with an agent, cheaply

Hard-won, from doing exactly this:

- **Give agents disjoint file ownership, explicitly.** Every parallel wave here
  worked because each agent got a "yours / not yours" list. The one time an agent
  ran `git add -A` it staged another's in-flight work.
- **Make them verify, and define what that means.** "It compiles" is not
  verification for money code. The best result in this whole effort was an agent
  that rendered 76 fight-row scenarios through both the old and new code and
  diffed the DOM — 71 byte-identical, 5 explained. The worst were agents that
  wrote contracts they could not compile because their sandbox had no network.
- **Make them report what they could NOT do.** Several agents caught their own
  unverified claims that way, which is worth more than a confident summary.
- **Point them at `docs/frontend-unification-design.md`** for frontend work. It was
  written from a full read of the codebase, and it is specific — but it has been
  wrong three times (see below), so tell them to trust the code over the doc and
  say when they disagreed.
- **Don't read the big generated files.** `contract/contract.js` and
  `lib/net/contract.js` are mostly embedded ABIs; `lib/dist/**`, `lib/game.min.js`,
  `ton/build/**`, `evm/artifacts/**` are build output. Grep them, never read them.
  This is the single biggest token sink in the repo.
- **The end-to-end check that has caught the most regressions** is playing a
  wallet-free match with the bot. Three separate bugs surfaced that way and would
  not have shown up in any unit test.

### Where the design doc has been wrong

Worth knowing before you trust it:

- It said the committed EVM bundles were stale. They were **byte-identical** on
  rebuild — a git-timestamp artifact.
- It said only the TON leaderboard was mock data. **Both** were.
- It said "just sed the HTML" for the id normalisation. Those ids are also in 8 CSS
  files and in four **non-F2P** lines driving P2P create-game.
- It said to delete the EVM `/balance` HUD seeding. Its stated precondition is
  false; deleting it breaks respawn.
