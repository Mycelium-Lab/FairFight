# Agent instructions — FairFight

Read `docs/HANDOFF.md` first. This file is the short operational contract.

## What this project is

A 1v1 crypto-wager browser shooter, dormant Dec 2024 – Aug 2026, being
resurrected on branch `v2`. **It is a money protocol: a bug is a theft.**

## The rule that overrides everything

Gameplay is peer-to-peer WebRTC with client-local hit detection — the victim's
browser decides it died — and that self-report becomes a signed on-chain payout.
Never weaken a check that stands between a client assertion and a payout. In
particular:

- `isDeathReportValid` and `isJoinAuthentic` in `signalling/server.js` are
  load-bearing anti-cheat. Do not add flags that bypass them.
- `FairFightV2`'s EIP-712 payload deliberately has **no amount field**. The
  referee attests *who won*; the contract computes the payout. Do not "simplify"
  by signing amounts.
- If a task seems to require defeating one of these, stop and say so.

## Don't read these — grep them

They are generated or vendored, and they are the biggest token sink here:

```
contract/contract.js      lib/net/contract.js      (mostly embedded ABIs)
lib/dist/**               lib/game.min.js
ton/build/**              evm/artifacts/**
public/index*.html        (~240 KB each)
```

## Verification bar

"It compiles" is not verification. Before claiming something works:

- Run it. `npm test` (server), `cd evm && npx hardhat test` (119), `cd ton && npx jest tests/FairFight.spec.ts` (21).
- For gameplay or lobby changes, play a wallet-free match — see below. Three
  regressions surfaced that way that no unit test caught.
- For a refactor that should not change behaviour, **prove it**: render both the
  old and new path and diff the output. Precedent: `lib/src/fights/rows.js`.
- Report what you could **not** verify, plainly. An honest gap is worth more than
  a confident summary.

## Running it

```bash
docker start ff-pg ff-redis
npm --prefix lib ci && npm --prefix lib run build     # lib/dist is NOT tracked
PORT=5050 node server.js
FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8033 node signalling/server.js
node bot/sparring-bot.mjs --human you --dies-after 20s --rounds 3
```

Open the URL the bot prints, on `localhost` (not `127.0.0.1`).

Not bugs: one browser sits on "ROUND LOADING" (`ig.main()` waits for both
players); the TON lobby refuses desktop (mobile-gated Mini App); the sparring bot
is invisible and always loses (see `docs/DEV_BOT.md`).

## Conventions

- Plain ESM, no framework, no TypeScript in `lib/`. No new dependencies without
  saying why.
- Comment only where the reason is non-obvious; match the surrounding density.
  Explain *why*, not *what*.
- Prefer deleting to abstracting. If two variants differ only cosmetically,
  delete one.
- Never commit `.env` or `deployment.local.json`. The only keys allowed in the
  repo are the well-known public Hardhat test accounts, clearly labelled.

## Parallel work

If several agents run at once, give each an explicit "yours / not yours" file
list, and never run `git add -A` — stage your own paths. `lib/dist` is a shared
build output: only one agent builds at a time.

## Trust the code over the design doc

`docs/frontend-unification-design.md` is detailed and useful, and has been wrong
at least four times (listed at the end of `docs/HANDOFF.md`). When they disagree,
the code wins — and say that you disagreed.
