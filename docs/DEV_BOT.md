# The sparring bot

A FairFight match needs two players before anything happens at all. You cannot
join a room alone and get anywhere: the signalling server refuses a death whose
killer is not in the room, and it only settles a fight with two players present.
So working on the game by yourself means driving a second browser by hand, every
single run.

`bot/sparring-bot.mjs` is that second player.

```bash
docker start ff-pg ff-redis
FAIRFIGHT_DEV_NO_WALLET=true node signalling/server.js   # terminal 1
PORT=5050 node server.js                                 # terminal 2
node bot/sparring-bot.mjs                                # terminal 3
```

The bot seeds a free-to-play fight, prints the URL to open, waits for you to
turn up, and then dies on a timer so you can watch a whole match run through to
settlement without a second pair of hands.

---

## Read this before you run it

**The bot is invisible in your game view. That is not a bug.**

Gameplay in FairFight is peer-to-peer WebRTC between two *browsers*. Movement,
shooting and hit detection travel on an `RTCDataChannel` and never touch the
signalling server. A Node process cannot realistically join that mesh, and this
bot does not try.

So the bot:

- has no position, no health and no weapon,
- cannot shoot you, and cannot be shot,
- will **not** be drawn as a character on your screen,
- ignores the `sdp` / `ice_candidate` frames your client sends it, so your
  client's `PeerConnection` for the bot never opens (it says so in its log the
  first time this happens).

What it *does* hold up is the match **lifecycle**, all of which is plain
socket.io and all of which is reachable from Node:

| you get | you don't get |
| --- | --- |
| a real second member in the room | a character to fight |
| `user_join` / `user_leave` | position or animation |
| deaths, and stake moving between players | hit detection |
| `update_balance`, `finishing`, `user_lose_all` | anything on the data channel |
| a settled fight in `statistics_f2p` / `board_f2p` | a fair fight |

Think of it as a lifecycle opponent, not a gameplay AI. If you need something to
aim at, you still need a second browser.

---

## Quick start

```bash
node bot/sparring-bot.mjs
```

That seeds a 3-round free-to-play fight between `sparring-bot` and
`devplayer1`, prints something like:

```
  1. On http://127.0.0.1:5050, open the browser console and claim your name:

       localStorage.setItem('tonwallet', 'devplayer1')

  2. Then open:

       http://127.0.0.1:5050/game?ID=cc7f4c51-…&network=999999
```

…and then sits in the room. Thirty seconds after you arrive it starts dying, one
death per round, until the fight settles. Then it prints the result and exits.

Free-to-play identity really is just that string: for chains `999999` and
`999998`, `lib/net/room-connection.js` reads `localStorage.tonwallet` instead of
asking a wallet who you are. Set it to whatever `--human` says (default
`devplayer1`) and the server will accept you as that player.

Useful variations:

```bash
# a fast match, so you are not waiting around
node bot/sparring-bot.mjs --human alice --rounds 1 --dies-after 5s

# a warm body that never dies; press d to kill it on cue
node bot/sparring-bot.mjs --immortal

# you create the fight in the lobby, the bot takes the free seat
node bot/sparring-bot.mjs join --watch
```

`--help` lists everything.

---

## The two modes

### `create` (default)

Seeds a fight directly into `game_f2p` / `players_f2p` — the same insert
`scripts/seedDevFight.mjs` does — with the bot and `--human` as the two players,
then joins the room and waits.

This is the one you want most of the time: one command, one URL to open.

### `join`

Finds a free-to-play fight that nobody has settled and that still has a seat
free, writes the bot into `players_f2p`, and joins the room. Use it when you
created the fight yourself from the lobby, so the flow you are testing is the
real one.

- `--fight <gameid>` targets one exact fight.
- `--watch` polls until an open fight appears, so you can start the bot first
  and create the fight afterwards.

---

## Dying on cue

A bot that never dies is useless for testing the end of a match, so the death
schedule is the interesting knob:

| flag | meaning |
| --- | --- |
| `--dies-after 30s` | delay from *your* arrival to the first death (default 30s) |
| `--death-interval 10s` | gap between deaths (default: same as `--dies-after`) |
| `--deaths 2` | stop after this many (default: one per round, i.e. enough to settle) |
| `--immortal` | never die on a timer |

On a terminal you also get keys:

```
d    die now, naming the opponent as the killer
f    emit 'finishing' - end the match immediately and settle
s    print what the bot currently believes about the room
q    leave the room and quit
```

The clock only starts once you are actually in the room, and pauses if you
leave — the server rejects a death whose killer is absent, so there is no point
firing into an empty room.

---

## Why the bot always loses

`signalling/server.js` accepts a death report **only** from the socket that owns
the dying wallet. `isDeathReportValid` rejects a socket reporting someone else's
death, rejects self-kills, and rejects a killer who is not in the room. That
check is load-bearing: the resulting balance is what gets signed into an on-chain
payout on a paid chain.

So the bot can only ever emit:

```js
socket.emit('user_dead', { walletAddress: '<the bot>', killerAddress: '<you>' })
```

which moves stake *away* from the bot. There is no way for it to make you lose,
and it does not try — your own client is what reports your death. If you want to
watch the bot *win*, make the other side die: use `bot/fake-human.mjs --die-after`
(below), or lose a round yourself in the browser.

This is deliberate. If you find yourself wanting a flag that lets the bot report
your death, what you are actually asking for is a hole in the anti-cheat.

---

## What the bot's log is showing you

The log doubles as a readable trace of the match protocol:

```
--> join       {"roomName":"cc7f4c51-…&network=999999","walletAddress":"sparring-bot"}
<-- room       {"userId":7,"users":[…],"playersBaseAmount":2}
<-- user_join  {"userId":8,"user":{"userId":8,"walletAddress":"alice"}}
--> user_dead  {"walletAddress":"sparring-bot","killerAddress":"alice"}
```

`-->` is a frame the bot sent, `<--` is one the server pushed at it. `--verbose`
prints payloads in full and annotates each event with what it means.

One asymmetry worth knowing, because it looks like a bug the first time you see
it: **the bot gets nothing back from its own death.** Every `update_balance` the
server sends goes out with `socket.to(...)`, which excludes the socket that
reported the death. Your client sees the balance move; the reporting client does
not.

That has a sharper consequence. Rounds are shared, so if you have been dying too,
the fight can run out of rounds earlier than the bot's own death quota — and when
it is the bot's death that spends the last round, the `finishing` frame goes to
you and not to it. The bot would happily sit in a finished room forever. So it
does not rely on being told: after each death it checks `statistics_f2p` itself,
and that is how it knows to wrap up and print the result.

---

## A stand-in for your browser

If you want to watch the whole thing with no browser at all:

```bash
node bot/sparring-bot.mjs --human alice --rounds 3 --dies-after 4s
# in another terminal, using the room the bot printed:
node bot/fake-human.mjs '<gameid>&network=999999' --name alice
```

`bot/fake-human.mjs` joins as you and prints every frame it is handed. It also
sends a placeholder WebRTC offer, exactly as a real client would, which is a
convenient way to see the bot decline it.

`--die-after 5s` makes the stand-in report *its own* death, naming the bot as
killer. That is the only legitimate way to make the bot win, and it exercises
the other direction of the balance code.

---

## Gotchas

- **`FAIRFIGHT_DEV_NO_WALLET=true` is required.** Free-to-play rooms otherwise
  demand a wallet signature the bot cannot produce. It refuses to arm when
  `APP_STATE=prod`. Do **not** reach for `REQUIRE_SOCKET_AUTH=false` instead —
  that disables the wallet-ownership check for *every* room on the server,
  including ones holding real stake.
- **A fight is single-use.** Once it settles, `statistics_f2p` has a row for
  each player and the server refuses to let them re-enter ("Fight ended"). Seed
  a new one — which `create` mode does every run anyway.
- **Names are lowercased.** The server's roster check is a case-sensitive
  `players.includes()`, while settlement writes `statistics_f2p` and `board_f2p`
  lowercased. The bot normalises both names so the two halves agree; type
  lowercase into `localStorage.tonwallet` too.
- **Three minutes alone and the fight settles itself.** The server starts a
  timer when a room's first player arrives and auto-finishes if they are still
  alone when it fires. If you wander off before opening the URL, you will come
  back to a fight that quietly ended. The bot warns about this on startup.
- **Free-to-play only.** `--chain` accepts `999999` and `999998` and nothing
  else. Paid chains hold real escrow and need a real wallet; the bot has neither
  and refuses rather than pretending.
- **The browser half needs `lib/dist` built.** The bot does not care, but your
  game page does.

---

## Tests

```bash
docker start ff-pg ff-redis
FAIRFIGHT_DEV_NO_WALLET=true SIGNALLING_PORT=8044 node signalling/server.js
SIGNALLING_URL=http://127.0.0.1:8044 node test/integration/sparring-bot.test.mjs
```

It runs the real CLI as a subprocess and plays the human side with a bare
socket.io client, covering: the fight is created and entered, a second player
genuinely sees the bot in the room, a death moves stake and settles the fight in
the database, an ignored WebRTC offer is reported rather than swallowed, and —
the one that matters — every `user_dead` frame the bot ever sends names the bot
itself as the victim.

`test/integration/headless-match.test.cjs` is the lower-level version of the
same loop: two sockets, no bot, no CLI.
