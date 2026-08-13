# FairFight

> ### Working on this? Start with [`docs/HANDOFF.md`](docs/HANDOFF.md).
>
> This branch (`v2`) is a resurrection of a project dormant since December 2024.
> It now boots on current Node, has hardened settlement contracts with tests, and
> can be played locally with no wallet — see [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md).
>
> **One thing to know before you read the pitch below.** The section on
> decentralization describes the intent, not the current implementation. Match
> outcomes are decided in the players' browsers and reported to a server that
> signs the payout, so a participant can still misreport their own match. The
> forgery holes are closed; that one is not. Making it true needs
> server-authoritative simulation, which has not been started.
>
> **Do not put meaningful money on this yet.** `docs/HANDOFF.md` §1 and §7 explain
> exactly why, and what has to happen first.
>
> Agents: read [`AGENTS.md`](AGENTS.md).

You appear in a locked room with another player. Your goal is to survive and kill the other player. When you die you lose money. When your opponent dies you receive their money.

[![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://discord.gg/S5Q5uErv)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=Follow%20%40FairProtocol)](https://twitter.com/FairProtocol)

# Features

### Decentralization and transparency:

Smart contracts work on the blockchain, which ensures decentralization and reliability. Players can be sure that the rules of the game cannot be changed without the consent of all participants, and the history of the game is available for verification.

### Global availability:

Blockchain and smart contracts are available anywhere with an internet connection, allowing players from all over the world to participate in the game.

### Cross-platform

Cross-platform means that the game can be playable on different types of devices such as computers, smartphones and tablets. This gives players the ability to choose the device of their choice to participate in the game, making it more convenient and accessible to a wider audience.

### NFT Shop
In this shop, players can purchase unique items in the form of NFTs for their characters, or the characters themselves.
Each NFT is a unique item with certain characteristics and properties.
Players use their cryptocurrency wallets to make purchases in the store.

### Inventory

Players have an inventory where they can store their NFT items.
They can equip or unequip these items on their characters.
The inventory can be accessible through the game's interface.

### Lootboxes

Loot boxes introduce an element of randomness into the game.
Players can purchase loot boxes containing random NFT items.
The NFTs are randomized using a random number generator (RNG) based on Sapphire technology or another algorithm on other networks.

# Local deployment

See [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md). It is verified against this branch;
the [wiki page](https://github.com/Mycelium-Lab/FairFight/wiki/For-developers:-launching-the-application)
predates the Node upgrade and no longer applies.

The short version, once Postgres and Redis are up:

```bash
npm --prefix lib ci && npm --prefix lib run build   # lib/dist is not tracked
PORT=5050 node server.js
FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8033 node signalling/server.js
node bot/sparring-bot.mjs --human you --dies-after 20s --rounds 3
```

A match needs two players, so the sparring bot is the second one — no wallet, no
chain, no transactions. See [`docs/DEV_BOT.md`](docs/DEV_BOT.md) for what it can
and cannot do.

# Documentation

| Document | What it covers |
|---|---|
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | **Start here.** Architecture, what v2 changed, what is proven vs unproven, next steps |
| [`AGENTS.md`](AGENTS.md) | Contract for agents: load-bearing checks, files to grep not read, verification bar |
| [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md) | Running the stack, contracts, tests, known gotchas |
| [`docs/DEV_BOT.md`](docs/DEV_BOT.md) | The sparring bot |
| [`docs/frontend-unification-design.md`](docs/frontend-unification-design.md) | The frontend refactor plan (trust the code where they disagree) |
