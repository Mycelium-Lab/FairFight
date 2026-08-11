# FairFight — One Client, Two Chain Families (EVM + TVM)

**Scope:** `~/Documents/Code/FairFight`. Read-only analysis. No files modified.
**Constraint honoured:** no framework migration. Vanilla ESM + DOM throughout.

---

## 0. Executive summary

The four "variants" are not four designs. They are **one design pasted four times, then edited in different places**. Measured overlap:

| Pair | Overlap | Real divergence |
|---|---|---|
| `f2p/openFights.js` ↔ `f2p-evm/openFights.js` | ~90% | DOM id suffix, `initData`→`sign_evm`, `999999`→`999998`. **~6 semantic lines.** |
| `f2p/pastFights.js` ↔ `ton/pastFights.js` | ~95% | Response reshaping, token label. **~40 semantic lines.** |
| `src/inventory.js` ↔ `ton/inventory.js` | ~95% | NFT enumeration + per-item address. **~2 methods.** |
| `src/shop.js` ↔ `ton/shop.js` | ~85% | Approve step, receipt model. **~2 capability flags.** |
| `public/index.html` ↔ `public/index_ton.html` | **87.0%** of non-blank lines identical | 76 EVM-only + 19 TON-only ids out of 453/417 |
| `public/game.html` ↔ `public/game_ton.html` | **94.0%** identical | ~70 lines |

Three facts reframe the whole job:

1. **The match page is already one client.** `lib/net/room-connection.js:32,40,50` already branches `chainid ∉ {0, 999999, 999998} → ethers, else localStorage('tonwallet')`. Only the two thin bootstraps (`index_game.js` / `index_game_ton.js`) and the two HTML files are forked.
2. **The server already unified settlement.** `server/signatures/service.js:29-40` returns one envelope `{player, gameid, token, contract, chainid, amount, v, r, s}` for both chains — EVM fills `r/s/v`, TON fills only `s` (base64 Ed25519). The seam exists; the client just doesn't use it.
3. **73% of each 780 KB page is inline SVG**, and **one single `<svg id="mask0_175_349">` is 452,105 bytes**, byte-identical in both pages. 23 of 24 SVG blocks (569,943 B) are byte-identical across the pair. The HTML problem is 90% an asset-extraction problem, not a templating problem.

There are **three** network registries, not two (the brief said two). And `main_ton.js` is 1.2 MB — the same size as `main.js` — because `lib/src/ton/lootbox.js:5,7` imports from `"../inventory"`, i.e. the **EVM** inventory module, dragging `ethers` and the 2,529-line ABI file into the TON bundle.

---

## 1. Ground truth map

### 1.1 Entry points

| File | Lines | % pure comment | What it actually is |
|---|---|---|---|
| `lib/index.js` | 1,224 | 15% | EVM lobby. Wallet connect, network switch, token selector, create-game form, then delegates to `openFightsFunc`/`pastFightsFunc`/`mainF2PEvm`/`shop`/`inventory`. |
| `lib/index_ton.js` | 977 | **50%** | TON lobby. TonConnect, create-game, F2P tab wiring, NFT claim. Lines 361–832 are commented-out mock fixtures. |
| `lib/index_game.js` | 515 | 9% | EVM match bootstrap. Fullscreen + joystick + on-chain fight fetch + HUD/balance seeding. |
| `lib/index_game_ton.js` | 226 | 0% | TON match bootstrap. Fullscreen + joystick + modal wiring. **Zero chain calls, zero HUD population.** |

`index_game_ton.js` is ~90% a *subset* of `index_game.js`'s non-chain half:
- `index_game.js:31-83` (fullscreen helpers) vs `index_game_ton.js:33-85` — byte-identical apart from indentation and where `fullScreenOpen` is declared.
- `index_game.js:109-183` (joystick + `check()` rAF loop) vs `index_game_ton.js:91-176` — identical.
- `mobileAndTabletCheck` is inlined in **all four** entry points (`index.js:16-20`, `index_ton.js:12-16`, `index_game.js:9-13`, `index_game_ton.js:4-8`) **and** in `lib/net/room-connection.js:25-29` — while already being exported from `lib/src/utils/utils.js:108`. Five copies, zero importers.

The only genuinely different part of `index_game.js` is lines 184–509: fetch `/sign`, `contract.fights(gameID)`, `contract.getFightPlayers(gameID)`, then `/balance` → HUD. TON does none of it; `room-connection.js` feeds the same HUD off the socket `update_balance` event for every chain. **The socket path is the general one.**

### 1.2 Feature-by-feature

#### Wallet connect — *genuinely different, badly duplicated*

- **EVM** (`index.js`): MetaMask via `window.ethereum` (`:317-329`) or WalletConnect v2. The `EthereumProvider.init({...})` object — with its 10-entry `rpcMap` — is pasted **three times** in `index.js` (`:187-215`, `:245-264`, `:280-299`) and a **fourth** time in `index_game.js:225-238` with a *different* `projectId` and only 4 rpc entries. Two live WalletConnect project ids: `9886e2654e7f10b0bcb4e0282fcc696c` and `5b7fc1b6253c0650987fa946f2085162`.
- **TVM** (`index_ton.js:105-108`): `new TonConnectUI({manifestUrl, buttonRootId:'connect'})`. Address recovered from `localStorage['ton-connect-storage_bridge-connection']` (`:346`) or `onStatusChange` (`:349-359`).
- **Session proof:** EVM signs `msgSignIn` and caches `sign_evm` (`index.js:1190-1204`). TVM uses Telegram `initData`. Both are accepted by the same server handlers (`server/f2p/controller.js:38,50,62`).

Verdict: genuinely different **connect mechanism**, but 3 of the 4 EVM copies are pure duplication. Delete three.

#### Read open fights — *genuinely different discovery, identical rendering*

- **EVM** `src/openFights.js:60-66`: five parallel `contract.getChunkFights(n,10)` calls, then live push via `contract.on('CreateFight'|'Withdraw'|'JoinFight')` (`:135`, `:168`, `:188`).
- **TVM** `index_ton.js:286-295`: `fetch('/ton/fights')` polled every 7,500 ms.
- **F2P** (both): `fetch('/f2p?chainid=…')` polled every 7,500 ms (`f2p-evm/index.js:~305`, `index_ton.js:834-841`).

Push vs pull is real and does not unify. **Everything downstream of it does.** `ton/openFights.js:123-333` and `src/openFights.js:743-1013` build the same row: `input.id` → `li.className='games__row border-style'` → `corn1..4`/`dote1..4` → `pID`/`pCreator`/`pMap` (same `mouseover`/`mouseleave` map-preview handlers, same `getMap(mapID)` from the same `/getgamesprops` fetch) → `currentBattleRoundsElem` → `middleDiv` status span → `bottomDiv` bet/deposit → button. Element for element.

**The worst duplication in the repo is not cross-chain.** `src/openFights.js:320-465` hand-inlines a *second* copy of that same row builder for "my current battle", duplicating `:743-1013` almost line for line inside the same file. TON collapses this into one builder via `buttonText ∈ {join, withdraw, finish}` (`ton/openFights.js:64-118`). **The TON design is correct and should win.** ~420 lines of EVM code deleted with zero chain implications.

#### Create fight

| | EVM | TVM | F2P |
|---|---|---|---|
| Call | `contract.create(amountPerRound, rounds, players, token, {value})` `index.js:1014-1023` | cell opcode `0x22FC5B29` + `tonConnectUI.sendTransaction` `index_ton.js:253-270` | `POST /f2p/create` `f2p-evm/index.js:~370`, `index_ton.js:211-227` |
| Map | `POST /setgamesprops` after receipt `index.js:1074-1081` | `POST /ton/map` `index_ton.js:271-278` | in the create body |
| Amount math | `value * 10**decimals` in **float**, then `BigInt(Math.round(...))` `index.js:1007-1008` | `BigInt(v * 10**9)` `index_ton.js:208` | same as TVM |

The amount arithmetic is a genuine precision bug on 18-decimal tokens, present on both chains, and the adapter is the right place to fix it once.

Three copies of the same ~28-line "recompute total / check allowance" block sit in `index.js:888-921`, `:923-957`, `:958-987`, and three more (minus the allowance branch) in `index_ton.js:135-154`, `:155-174`, `:175-189`. **Six copies.**

#### Join fight

- EVM `src/openFights.js:805-830`: allowance check → `approve` **or** `join(id)` / `join(id,{value})`, plus a `chainid==23294` Sapphire-wrap fork at every call site.
- TVM `ton/openFights.js:171-191`: cell opcode `0x45E011DD`, `amount = baseAmount + toNano(0.015)`.
- F2P: `POST /f2p/join` with `{gameid, player, initData}` or `{gameid, player, sign_evm}` — `f2p/openFights.js:~165` vs `f2p-evm/openFights.js:~173`. **That two-word difference is the entire reason `f2p-evm/` exists.**

#### Finish + claim payout — *unifies cleanly, and the server already proves it*

Both read the same `/sign` envelope.

- EVM `src/openFights.js:540-542`: `contract.finish(fightId, data.amount, data.r, data.v, data.s)` — note the wire order is `(amount, r, v, s)`.
- TVM `ton/openFights.js:193-215`: build `finishData` cell (`0xB7766AF2`, int id, addr player, addr contract, coins amount), wrap `Buffer.from(signature,'base64')` in a ref cell, outer opcode `0x65C269F1`. Uses only `s`; `r`/`v` are empty strings.
- Server: `signalling/server.js:600` — `room.getChainId() != 0 ? await signature(...) : await signatureTon(...)`, both INSERTing into the *same* `signatures(player, gameid, amount, chainid, contract, v, r, s, token)` table.

#### Inventory — *~95% identical*

Both files declare the same 24 top-level symbols in the same order. Divergences reduce to four things:

1. **NFT enumeration.** EVM `src/inventory.js:170-181`: `multicallNFTContract.callPropertyTokensLength(collection, address, ids)`, falling back to per-collection `getOwnerPropertyTokensLength`. TVM `ton/inventory.js:174-192`: iterate `inventory.nfts` already returned by `POST /ton/inventory`. **→ one adapter method.**
2. **Item identity.** EVM = `(collection address, tokenId)`. TVM = a per-item contract address. Propagates as a 7th param in `addInventoryItem` (`ton:215` vs `src:288`), an `nftAddress` field in the setter body (`ton:1027` vs `src:1102`), and a `data-nftaddress` attribute. **Genuine — one extra field.**
3. **Endpoint prefix.** `POST /getinventory` vs `POST /ton/inventory`; `setcharacter`/`setweapon`/`setarmor`/`setboots` vs `ton/setcharacter`/… Compare `src/inventory.js:844,860,916,963,1052,1067,1082` with `ton/inventory.js:769,785,841,888,977,992,1007` — **identical call structure, one string prefix.**
4. `network.chainid` vs the literal `0`.

`setInventory` differs by exactly two lines. `getInventory` differs by the URL and one payload key. Everything else — drag/drop, modals, character animation, stat bonuses — is the same code twice.

#### NFT shop — *~85%*

Identical shell: modal-close wiring `src/shop.js:47-51` = `ton/shop.js:54-58` verbatim; the five `new SimpleBar(...)` blocks identical; the price-sort handlers identical apart from TON adding a 200 ms debounce. Real divergences:

- **Approve step.** EVM reads `usdtContract.allowance` (`src/shop.js:122`) and runs approve→buy across six call sites (`:286,300,357,376,428,486,505`). TVM is a single native-TON payment (`ton/shop.js:345-361`).
- **Receipt model.** EVM awaits `tx.wait()`. TVM has no confirmed hash from `tonConnectUI.sendTransaction`, so it polls `getInventory` every 20 s and diffs NFT sets with `findUniqueNewNftItem` (`ton/shop.js:381-401`).
- `ton/shop.js:145` fabricates `const network = { chainid: 0, explorer: 'https://tonscan.org' }` — a local shim for the missing registry entry. **`ton/shop.js:392` then references an undefined `hash`**, so `successModalLink.href` throws inside the interval's `try/catch` and the success-modal explorer link is silently dead. Pure copy-paste damage.

#### Lootbox — *~80%, plus a live cross-wiring bug*

Same modal handles (`src/modules/lootbox.js:18-24` = `ton/lootbox.js:24-30` verbatim). EVM reads `lootboxContract.price()` + allowance + approve + buy + decodes reward from the receipt. TVM hardcodes `price = toNano(2)` (`ton/lootbox.js:17`), sends one opcode-0 `"Buy"` text cell, then runs the same 20 s inventory-diff poll.

**Bug:** `ton/lootbox.js:5` and `:7` import `addInventoryItem` and `showInventoryItemModal` from `"../inventory"` — that resolves to `lib/src/inventory.js`, the **EVM** module. The call at `ton/lootbox.js:84` passes 7 args:

```js
addInventoryItem(listItemId, newItem, newItem.collection, address, 0, firstEmpty, newItem.address)
```

against the EVM signature `(itemListId, item, itemType, address, network, i, settedId, _height, _width)` — so `newItem.address` lands in the `settedId` slot. Two consequences: TON lootbox rewards render wrong, **and the entire EVM inventory module (68.7 KB source, global `ethers`, `../contract.js` = 2,529 lines of ABI) is pulled into `main_ton.js`.** That is a large part of why `main_ton.js` is 1.2 MB.

Also `ton/lootbox.js:8` imports from `"ton-core"` (a *root* package dependency, absent from `lib/package.json`) while every sibling imports `@ton/ton`. It resolves only because webpack walks up to the repo's `node_modules`.

#### Leaderboard — *TON version is fake*

- `lib/modules/leaderboard.js` (194 lines), loaded raw from `index.html:63`. Has 7d/30d **and** multiplayer tabs (`sevenleader-multi`, `thirtyleader-multi`).
- `lib/src/ton/leaderboard.js` (175 lines), loaded raw from `index_ton.html:65`. **Its `fetch('/leaderboard/ton')` is commented out (`:35-37`) and it renders a hardcoded mock `data` object.** Only 7d/30d tabs.
- The DOM-handle preamble (`modules:1-14` vs `ton:1-13`) is line-for-line identical.
- Neither is imported by any entry point — both are `<script type="module">` side-effect scripts.

#### Past games — *~95%*

`f2p/pastFights.js` ↔ `ton/pastFights.js` full diff is 198 lines across 875. Divergences:
- (a) TVM reshapes the flat `/statistics/all` rows into per-`gameid` `stats` (`ton/pastFights.js:6-38`) because that endpoint returns one row per player; `/f2p/pastfights` already returns nested `statistics`. **Genuine — a response-shape normaliser.**
- (b) token label `'TON'` vs `'FAIR'` (`ton:105` vs `f2p:65`). **Genuine, one line.**
- (c) DOM id suffix `-f2p`. Accidental.
- (d) `getMap(fight.map)` vs hardcoded `mapID = 0` (`ton:88`) — TON drops map info **even though `/ton/map` stores it**. A regression, not a design choice.
- (e) `addressMaker(gameid)` vs raw `gameid` — F2P ids are UUIDs, TON ids are ints. Cosmetic, belongs in a formatter.
- (f) three `appendChild`-order swaps and `<span>`→`<img>` for the section title. Pure cosmetics.

#### Balances — *zero divergence*

Neither lobby shows a wallet balance. The only lobby "balance" is the F2P FAIR counter, and **both chains read it from the same `/f2p/board` endpoint into the same `#f2p_balance__value` element** (`index_ton.js:865`, `f2p-evm/index.js:335`). In-match balances go over the socket for every chain via `room-connection.js`; `index_game.js:299-343`'s extra HTTP `/balance` seeding is EVM-only legacy.

#### Handoff into the game page — *same contract, different URL*

EVM → `/game/?ID&network&token&decimals` (`openFights.js:206,237,612,642,861,872`).
TVM/F2P → `/ton_game/?ID&network&token&decimals` (`ton/openFights.js:114`, both f2p variants).

Plus a localStorage side-channel written before navigation: `tonwallet`, `ton_enemies`, `realBalance`, `amountPerRound`, `deposit_<chainid>_<id>`, `rounds`, and on F2P-EVM additionally `underlying_network_id` (so `room-connection.js:401,423` knows where to send the player back). EVM writes `deposit_*` and `rounds` from `index_game.js:272-273` instead — i.e. **after** navigation. Same contract, two write sites.

### 1.3 Network registries — **three**, plus two inline copies

| # | File | Entries | Notes |
|---|---|---|---|
| 1 | `contract/contract.js:10` | 19 | Server. Carries `privateKey: process.env.*`. Has chainid `0` (TON). |
| 2 | `lib/modules/networks.js:1` | 20 | Lobby client. Plus a **dead** `tonNetworkConfig` at `:256` — zero importers, and its `contractAddress` disagrees with the live one. |
| 3 | `lib/net/contract.js:10` | 23 | Match client. ImpactJS globals, not ESM. **The only one with 0 / 999999 / 999998** (`:166-190`). |

Plus the WalletConnect `rpcMap` inline in `index.js` ×3 and `index_game.js` ×1.

Measured drift between #1 and #2 (verified by executing both modules and diffing):

- **`42161` Arbitrum `rpc`** — server `https://arb1.arbitrum.io/rpc`, client `https://arbitrum-mainnet.infura.io` (a keyless Infura host that is not a working RPC endpoint). `index.js:210`'s rpcMap has a *third* value — the correct one.
- **`23294` Sapphire `shopAddress`** — server `0x6B1e14477a78D269d44F9b476Bd39adE1913fa30`, client `0xa32fF84560231318896150fa8E5079BE34DBdE90`. One of these is wrong in production right now.
- Client-only chains `344435`, `355113`; server-only chain `0`.
- `8453` Base: client has all six NFT/shop/lootbox addresses, server has **none**.
- `lootboxAddress` absent server-side on `42262`, `23294`, `503129905`.
- `multicallNFT` exists **only** client-side (7 chains).
- Name drift: `42262` "Emerald Mainnet"/"Emerald", `503129905` "Scale"/"SKALE", `1351057110` "staging-fast-active-bellatrix"/"ScaleT".
- Trailing-slash drift in `explorer` on `56`, `1115`.

**TON address drift:** live address is `EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ` (`index_ton.js:37` **and** `server/ton/service.js:28` — these agree). The dead `tonNetworkConfig` says `EQBW4EpeaS-yyn1XnRCRC4--kF5WvhPS6u-vdEqNOl-9EvOD`. TON shop and lootbox addresses are hardcoded inside `ton/shop.js:25` and `ton/lootbox.js:21`, in neither registry.

### 1.4 HTML

```
public/index.html      781,449 B  4,918 non-blank lines   453 ids
public/index_ton.html  767,278 B  4,602 non-blank lines   417 ids
public/game.html       102,412 B  1,153 non-blank lines
public/game_ton.html   100,952 B  1,115 non-blank lines
```

- **index vs index_ton: 87.0% of non-blank lines identical.** game vs game_ton: **94.0%**.
- **Inline `<svg>` is 571,318 B of index.html (73%)** across 24 blocks; 571,930 B / 25 blocks in index_ton.html. **23 blocks — 569,943 B — are byte-identical across the pair.** The largest single block, `<svg id="mask0_175_349">`, is **452,105 B** = 58% of each page = 904 KB across the two.
- Zero inline `<style>`. Only ~11 KB inline `<script>`, identical in both.
- ids: 346 shared, 76 EVM-only, 19 TON-only. Suffix families in index.html: 16 `-desktop`, 14 `-f2p-evm`, 11 `-f2p-evm-desktop`, 1 `-f2p`, 1 `-f2p-desktop`. **index_ton.html has 25 `-f2p` and zero `-desktop`** — the TON page is mobile-only by construction (`index_ton.js:20-22` shows a "not supported" popup on desktop).
- **Accidental id drift that forced JS forks:** `map-select-selecter` / `players-select-selecter` / `rounds-select-selecter` (EVM) vs `…-selected` (TON). A typo. It is why `index.js:1033` and `index_ton.js:209` cannot share a line.

### 1.5 Build output

`lib/dist/` — 19 tracked files, ~2.5 MB: `main.js` 1.2 MB, `main_ton.js` 1.2 MB, `main_game.js` 397 KB, `main_game_ton.js` 9.2 KB, chunks `289/328/343/663/839/871/979`.

- HTML references chunks **by webpack's numeric id** (`index.html:54-59`, `index_ton.html:56-61`). Any code change renumbers them and the 780 KB HTML must be hand-edited.
- `839.js` (85.8 KB) is referenced by **nothing**.
- `<script src="dist/index.js">` appears in **all four** pages (`index.html:53` etc.) but `dist/index.js` is gitignored (`.gitignore:6`) and does not exist → a 404 in every fresh clone.
- Root `dist/ton.js` and `dist/connector.js` — **2.2 MB each, tracked, referenced by nothing.**
- `lib/webpack.config.js:5-9`: three of four entries commented out. `npm run build` in `lib/` regenerates only `main_ton.js`. **The other three committed bundles cannot be reproduced from the current config.**
- `lib/modules/*.js` and `lib/custom.js` are served **raw** as `<script type="module">` (`index.html:61-65`) while `lib/src/**` is bundled. That split is precisely why `networks.js` had to exist twice.
- `server.js:39` does `express.static('/lib')` — the whole directory, including `lib/src/**` sources and `lib/package.json`.

### 1.6 Dead weight, counted

1,330 pure-comment lines (11%) across the 21 variant files. Worst: `index_ton.js` 492/977 (**50%**), `f2p-evm/index.js` 240/437 (**55%**), `index.js` 186/1,224.

---

## 2. The chain seam

Written as TypeScript signatures for precision; **implement as plain JS ESM** — two files, `lib/chain/evm.js` and `lib/chain/tvm.js`, plus `lib/chain/index.js` for selection.

### 2.1 Core types

```ts
type ChainFamily = 'evm' | 'tvm';
type Addr        = string;   // canonical form for the family
type FightId     = string;   // EVM: decimal uint; TVM: decimal int; F2P: UUID
type Units       = bigint;   // always base units, never floats

interface Asset {
  symbol: string;
  address: Addr | null;      // null = native (EVM: AddressZero; TVM: always null)
  decimals: number;          // EVM 18|6 (read on-chain); TVM 9
  iconUrl: string;
}

interface Fight {
  id: FightId;
  owner: Addr;
  asset: Asset;
  amountPerRound: Units;
  baseAmount: Units;
  rounds: number;
  maxPlayers: number;
  players: Addr[];
  createTime: number;        // unix seconds
  finishTime: number;        // 0 = open
  claimedBy: Record<Addr, boolean>;
  mapId: number | null;      // from /getgamesprops; null until resolved
}

/** Verbatim `/sign` response. The adapter decides which fields it reads. */
interface PayoutVoucher {
  player: Addr; gameid: FightId; token: string; contract: Addr;
  chainid: string; amount: string;
  v: string; r: string; s: string;   // EVM uses r,v,s. TVM uses s only (base64 Ed25519).
}

/** Split because TVM cannot give a confirmed receipt. See §2.4(4). */
interface Submitted { ref: string; }                 // EVM tx hash | TVM BOC
interface Confirmed { ref: string; effects?: unknown; }

interface NftItem {
  id: number;                       // index into jsons/*.json
  type: 'characters'|'weapons'|'armors'|'boots';
  image: string;
  itemAddress: Addr | null;         // TVM: per-item contract. EVM: null.
}

interface ShopItem { id: number; type: NftItem['type']; price: Units; asset: Asset; }
```

### 2.2 The interface

```ts
interface ChainCapabilities {
  tokenChoice:        boolean;  // multi-asset bet selector
  requiresApproval:   boolean;  // ERC20 allowance two-step
  liveEvents:         boolean;  // push discovery vs poll
  syncReceipt:        boolean;  // confirm() returns effects vs must poll for them
  chainSwitch:        boolean;  // wallet can be asked to change network
  multiplayerTimer:   boolean;  // >2-player join countdown + auto-redirect
  perItemNftAddress:  boolean;  // NFT identity carries its own address
  explorerTxLinks:    boolean;  // a tx ref usable in an explorer URL
}

interface ChainAdapter {
  readonly family: ChainFamily;
  readonly caps: ChainCapabilities;
  readonly nativeAsset: Asset;
  readonly wireChainId: number;      // EVM: real chainid. TVM: 0.

  // ---- session ----
  connect(pref?: 'injected' | 'walletconnect'): Promise<Addr>;
  disconnect(): Promise<void>;
  getAccount(): Promise<Addr | null>;
  /** Credential for server calls: EVM -> {sign_evm}. TVM -> {initData}. */
  getSessionProof(): Promise<Record<string, string>>;
  onAccountChanged(cb: (a: Addr | null) => void): () => void;
  onChainChanged(cb: (id: number) => void): () => void;
  switchChain(id: number): Promise<void>;             // no-op when !caps.chainSwitch

  // ---- balances / allowances ----
  listAssets(): Asset[];
  getBalance(who: Addr, asset: Asset): Promise<Units>;
  getAllowance(who: Addr, asset: Asset, spender: Addr): Promise<Units>;   // MaxUint when !requiresApproval
  approve(asset: Asset, spender: Addr): Promise<Submitted>;               // resolves immediately when !requiresApproval

  // ---- fights ----
  listOpenFights(): Promise<Fight[]>;
  watchFights(cb: (ev: {kind:'created'|'joined'|'withdrawn', id: FightId}) => void): () => void;
  getFight(id: FightId): Promise<Fight>;
  getMyLastFight(who: Addr): Promise<Fight | null>;
  createFight(p: {amountPerRound: Units, rounds: number, players: number, asset: Asset}): Promise<Submitted>;
  joinFight(id: FightId, stake: Units, asset: Asset): Promise<Submitted>;
  withdrawFight(id: FightId): Promise<Submitted>;
  /** One signature, two encodings. See §2.4(7). */
  claimPayout(id: FightId, v: PayoutVoucher): Promise<Submitted>;
  confirm(s: Submitted): Promise<Confirmed>;

  // ---- NFT ----
  listOwnedNfts(who: Addr): Promise<NftItem[]>;
  listShopItems(type: NftItem['type']): Promise<ShopItem[]>;
  buyShopItem(item: ShopItem): Promise<Submitted>;
  getLootboxPrice(): Promise<{price: Units, asset: Asset}>;
  buyLootbox(): Promise<Submitted>;
  /** Resolves when a new NFT is observable. EVM: from receipt. TVM: inventory diff poll. */
  awaitNewNft(who: Addr, before: NftItem[], s: Submitted): Promise<NftItem>;
  inventoryRoute(op: 'get'|'character'|'weapon'|'armor'|'boots'): string;

  // ---- formatting ----
  canonicalize(a: string): Addr;
  equals(a: string, b: string): boolean;      // never use .toLowerCase() at call sites
  isValidAddress(a: string): boolean;
  shortAddress(a: Addr): string;
  explorerAddressUrl(a: Addr): string;
  explorerTxUrl(ref: string): string | null;  // null when !caps.explorerTxLinks

  // ---- units (string math; no 10**n on Numbers) ----
  toBaseUnits(human: string, asset: Asset): Units;
  fromBaseUnits(v: Units, asset: Asset): string;
}
```

### 2.3 What maps to what

| Method | EVM source | TVM source |
|---|---|---|
| `connect` | `index.js:187-226` (WC) / `:317-329` (injected) | `index_ton.js:105-108`, `:349-359` |
| `getAccount` | `signer.getAddress()`; cached `utils.js:75` | `localStorage['ton-connect-storage_bridge-connection']` `index_ton.js:346` |
| `getSessionProof` | `index.js:1190-1204` → `{sign_evm}` | `window.Telegram.WebApp.initData` `index_ton.js:118-119` → `{initData}` |
| `switchChain` | `index.js:648-671` | *not implemented* — `caps.chainSwitch=false` |
| `listAssets` | `lib/modules/tokens.js` by chainid `index.js:438-439` | single TON asset |
| `getAllowance` / `approve` | `openFights.js:795`, `index.js:1026-1031`, `shop.js:122` | returns MaxUint / resolves immediately |
| `listOpenFights` | `openFights.js:60-66` | `GET /ton/fights` `index_ton.js:286` |
| `watchFights` | `contract.on(...)` `openFights.js:135,168,188` | `setInterval` 7500 ms `index_ton.js:287-295` |
| `getMyLastFight` | `contract.lastPlayerFight` + `contract.fights` `openFights.js:301-310` | scan `listOpenFights()` for `players.includes(me)` `ton/openFights.js:71` |
| `createFight` | `index.js:1014-1023` | `index_ton.js:253-270` (`0x22FC5B29`) |
| `joinFight` | `openFights.js:810-823` | `ton/openFights.js:171-191` (`0x45E011DD`) |
| `withdrawFight` | `openFights.js:675-680` | `ton/openFights.js:150-170` (`0x1BC3CF3B`) |
| `claimPayout` | `openFights.js:540-542` | `ton/openFights.js:193-215` (`0x65C269F1` wrapping `0xB7766AF2`) |
| `confirm` | `tx.wait()` | poll — see §2.4(4) |
| `listOwnedNfts` | `inventory.js:170-181` | `POST /ton/inventory` → `.nfts` `ton/inventory.js:1075-1088` |
| `buyShopItem` | `shop.js:300` / `:428` | `ton/shop.js:345-361` (`0xD0170C90`) |
| `buyLootbox` | `src/modules/lootbox.js` (`price()` + approve + buy) | `ton/lootbox.js:48-62` (opcode 0 "Buy") |
| `awaitNewNft` | decode receipt | `findUniqueNewNftItem` 20 s poll `ton/shop.js:381-401` |
| `inventoryRoute` | `''` → `/getinventory`, `setarmor`… | `'ton/'` → `/ton/inventory`, `ton/setarmor`… |
| `shortAddress` | `utils.js:30` | same function, different input alphabet |
| `explorerAddressUrl` | `${network.explorer}/address/${a}` `openFights.js:947` | `ton/openFights.js:245` currently hardcodes `href='#'` — a gap to fill |

### 2.4 Where the chains genuinely do **not** unify

Seven places. Do not pretend otherwise — model each as a capability flag.

1. **Discovery is push vs pull.** `caps.liveEvents`. The *interface* unifies (`watchFights(cb): unsubscribe`); the mechanism does not. EVM implements with `contract.on`, TVM with `setInterval`. Don't fake events on TVM by diffing poll results — the row builder does not need to know.
2. **Multi-asset bets are EVM-only.** `caps.tokenChoice`. TON bets are TON. Gate `#tokens-newgame-modal` / `#tokens-divider` — the exact hide/show code already exists in `f2p-evm/index.js:openNewGameModal`.
3. **Approval is EVM-only.** `caps.requiresApproval`. When false, `getAllowance` returns `MaxUint256` and `approve` resolves immediately, so the two-step UI collapses to one step with no branching at the call site.
4. **No synchronous receipt on TVM.** `@tonconnect/ui`'s `sendTransaction` returns a BOC, not a confirmed hash. This is the reason for the 20 s inventory-diff poll and the "we are checking your transaction" pending modal (`ton/shop.js:381`, `ton/lootbox.js:64-90`, `index_ton.js:281`). **This is why `submit` and `confirm` are split.** `caps.syncReceipt=false` also implies `explorerTxLinks=false` — which is exactly the bug at `ton/shop.js:392` where `hash` is undefined.
5. **Chain switching has no TVM analogue.** `caps.chainSwitch`. Hide `#dropdown-change-network` and `#change_netowrk_modal` when false.
6. **Address form is not just cosmetic.** EVM is 0x hex, compared case-insensitively — the codebase `.toLowerCase()`es everywhere (`openFights.js:141,149,249`, `pastFights.js`, the DB inserts). TON is base64url `EQ…`/`UQ…`, **case-significant**, and one account has several textual forms (bounceable / non-bounceable / testnet). Today this is papered over by `Address.parse(...).toString()` at `index_ton.js:346` and by lowercasing on both sides of the DB. `ton/pastFights.js:219-220` lowercases TON addresses to sort players — it works only because the server also lowercases on insert. **Expose `canonicalize` and `equals`; ban `.toLowerCase()` at call sites.**
7. **Decimals.** EVM native 18, ERC20 6 or 18 read on-chain (`openFights.js:794`). TVM always 9. Today decimals leak into UI as float `10**n` arithmetic (`index.js:1007-1008`, `ton/openFights.js:307,318`). `toBaseUnits`/`fromBaseUnits` must own this with string math.

**Things that look chain-specific but are not:** map preview, past-games rendering, F2P balance display, the game-page handoff contract, the `/sign` envelope, and the entire fight-row DOM. All of it can be chain-blind.

---

## 3. Free-to-play

### Recommendation: **a mode flag orthogonal to chain.** Not a third adapter.

```js
const session = { chain: adapter, settlement: 'onchain' | 'free' };
```

`settlement:'free'` swaps only the **fights repository** (HTTP `/f2p/*` instead of adapter calls) and disables the claim button. Identity still comes from `adapter.getAccount()`; the credential from `adapter.getSessionProof()`. The pseudo-chainids stay on the wire, confined to one function:

```js
const wireChainId = (chain, settlement) =>
  settlement === 'onchain' ? chain.wireChainId : (chain.family === 'tvm' ? 999999 : 999998);
```

### Why, from the evidence

**1. The server already treats it as a mode, not a chain.** `signalling/server.js:599`:

```js
if ((room.getChainId() != 999999) && (room.getChainId() != 999998)) {
  const _signature = room.getChainId() != 0 ? await signature(...) : await signatureTon(...)
  // INSERT INTO signatures ... INSERT INTO statistics ...
}
```

F2P **skips signature creation entirely** and writes `statistics_f2p` / `board_f2p` (`:605`, `:622`) instead. A null-chain adapter would implement `claimPayout` as a no-op — but there is no claim at all. The whole settlement leg is absent, which is a *mode* difference, not a *chain* difference.

**2. F2P is already chain-parameterised on the server.** `server/f2p/controller.js:38,50,62` — `createFight(fight, req.body.initData, req.body.sign_evm)`. The same handlers accept either credential. The two client variants differ *only* by which credential they send and which pseudo-id they tag.

**3. The null-chain adapter forces you to build the exact mess you're removing.** It would need `getAccount`, `shortAddress` (a Telegram username is not an address), `explorerAddressUrl`, `listAssets`, `toBaseUnits`, `switchChain` — all faked. Worse: it **cannot express which credential to send**, because that depends on the *real* chain. So you'd need `999999` and `999998` as two adapters — which is exactly how `f2p/` and `f2p-evm/` came to exist.

**4. Line count.**

| Approach | Cost |
|---|---|
| Mode flag | one `f2pFightRepository` module (~120 lines) + ~10 call sites |
| Null-chain adapter | full surface ~250 lines mostly throwing, **×2** because the credential differs per chain ≈ 500 lines |

**Mode flag wins by ~380 lines** and removes the pseudo-chainids from client logic entirely.

**5. It matches the UI.** `#f2p_checker` is already a *toggle on the same page* (`index_ton.js:78-104`), not a network selector. The UI already models F2P as a mode. The code should agree.

**Caveat:** keep `999999`/`999998` on the wire. `signalling/server.js:89-93` parses the chainid out of the socket room name (`ID=<id>&network=<chainid>`), and DB rows are keyed on it. Changing the wire format is a separate, larger migration.

---

## 4. Refactor plan

Every step ships independently and leaves the app working. Sizes are source lines removed net.

**Step 0 — make the build reproducible (prerequisite, ~2 h).**
Uncomment all four entries in `lib/webpack.config.js:5-9`; set `optimization: { splitChunks: false, runtimeChunk: false }` so each entry emits exactly one file; build; **diff the output against the committed `lib/dist/`.** Remove the `<script src="dist/index.js">` tag from all four pages (the file is gitignored and absent). Delete `lib/dist/839.js` and root `dist/ton.js` + `dist/connector.js` (referenced by nothing).
*Verify:* all four pages boot with the freshly built bundles.
*Why first:* three of four committed bundles cannot currently be reproduced from the config. Until you can rebuild, "the app still works" is unverifiable for the EVM pages.

**Step 1 — one network registry (~3 h, −500 lines).**
`shared/networks.js` (plain ESM, no `ethers`, no `process.env`) as the single source. `contract/contract.js` merges in `privateKey`. `lib/modules/networks.js` becomes a re-export. `lib/net/contract.js` gets a generated `networks.generated.js` (it's ImpactJS globals, so emit rather than import). Delete `tonNetworkConfig`. Move the TON shop/lootbox addresses out of `ton/shop.js:25` / `ton/lootbox.js:21` into the registry. Collapse the four WalletConnect `rpcMap` copies into one derived from the registry.
**Resolve the drift explicitly:** Arbitrum RPC (server's is right), Sapphire `shopAddress` (**check on-chain first — one of the two is wrong in production today**), Base's six missing server addresses, `344435`/`355113`.
*Verify:* create a fight on Arbitrum; buy a shop item on Sapphire.

**Step 2 — collapse the two F2P trees (~3 h, −925 lines).**
First `sed` the HTML: `-f2p-evm` → `-f2p` in `index.html`; `-selecter` → `-selected`. Pick the `dote`/`c-border` desktop skin over `corn` and gate it on `isDesktop` (as `f2p-evm/openFights.js` already does). Then `f2p/*` + `f2p-evm/*` (1,425 lines) → one `lib/src/fights/f2p.js` (~500) parameterised by `{chainid, credential}`. Restore the error-modal branches and the "Invite a friend" link that `f2p-evm` dropped.
*Verify:* create/join/withdraw a F2P game on `/ton` and on `/`; past-games renders on both.

**Step 3 — collapse the fight-list renderers (~1 day, −800 lines). ⚠ HIGHEST RISK.** *(details below)*
Extract `renderFightRow(fight, actions)` and `renderPastFightRow(...)` used by all four. Delete `src/openFights.js:320-465` — the hand-inlined duplicate "current battle" renderer — in favour of TON's single-builder + `buttonText` state model.

**Step 4 — introduce `ChainAdapter` (~1 day, −300 lines).**
`lib/chain/evm.js`, `lib/chain/tvm.js`, `lib/chain/index.js`. Entry picks one from `?network=`. After this, no lobby logic references `ethers.` or `beginCell`.
*Verify:* full create→join→play→claim on both chains.

**Step 5 — collapse inventory / shop / lootbox (~1.5 days, −2,375 lines).**
inventory 2,721 → ~1,450; shop 1,862 → ~950; lootbox 476 → ~280. The `ton/lootbox.js:5,7` cross-import into the EVM inventory disappears by construction — expect `main_ton.js` to drop sharply. Fix `ton/shop.js:392`'s undefined `hash` via `explorerTxUrl()` returning `null`.
*Verify:* buy an NFT + open a lootbox on both chains; equip/unequip via drag-drop on both.

**Step 6 — one lobby entry (~0.5 day, −1,600 lines).**
`index.js` (1,224) + `index_ton.js` (977) → ~600. Deletes: 3 of 4 WalletConnect init blocks, 5 of 6 amount-observer blocks, 5 `mobileAndTabletCheck` copies, `index_ton.js:361-832` (460 mock lines), `index.js:40-126` (85 mock lines).

**Step 7 — one match entry + one game page (~0.5 day, −490 JS, −1,100 HTML lines).**
`index_game.js` + `index_game_ton.js` → ~250. Extract the byte-identical fullscreen + joystick blocks to `lib/game/ui-chrome.js`. Delete the EVM-only `/balance` HTTP HUD seeding **after confirming** `room-connection.js`'s socket path covers first paint. `game.html` + `game_ton.html` → one (94% identical, 12 identical SVGs).

**Step 8 — one lobby page (~1 day, −4,700 HTML lines, −1.4 MB).**
(a) Extract all 24 inline `<svg>` to `/media/svg/*.svg` — the 452 KB `mask0_175_349` alone removes 58% of each page. Use `<use href="sprite.svg#id">` rather than `<img>` if any are styled by page-level CSS selectors. (b) After Step 2's id normalisation, overlap is ~95%. (c) Merge into one `index.html`; mark the ~95 chain-specific nodes `data-chain="evm"|"tvm"` and hide the other family at boot. `server.js:53-67` already routes both `/` and `/ton`.

**Step 9 — leaderboard (~1 h, −175 lines).**
Delete `lib/src/ton/leaderboard.js` (mock data behind a commented-out fetch). Point `index_ton.html` at `lib/modules/leaderboard.js`, gating the `-multi` tabs on a capability. Wire `/leaderboard/ton`.

### Delete outright — no replacement needed

| Item | Size |
|---|---|
| `lib/dist/**` (19 files, regenerable after Step 0) | ~2.5 MB |
| root `dist/ton.js` + `dist/connector.js` (zero references) | 4.4 MB |
| `lib/dist/839.js` (zero references) | 85.8 KB |
| `lib/modules/networks.js:256-261` `tonNetworkConfig` (0 importers, wrong address) | 6 lines |
| `lib/src/ton/leaderboard.js` (mock data, fetch commented out) | 175 lines |
| Commented-out mock fixtures: `index_ton.js:361-832`, `f2p-evm/index.js` (×2), `openFights.js:68-102`, `index.js:40-126` | ~1,000 lines |
| 4 inline `mobileAndTabletCheck` copies + the 5th in `room-connection.js` | ~25 lines |
| 3 of 4 WalletConnect `EthereumProvider.init` blocks | ~90 lines |
| 5 of 6 MutationObserver amount blocks | ~140 lines |
| `src/openFights.js:320-465` duplicate current-battle renderer | ~145 lines |

### Estimated total removed

- **JS:** variants 9,800 → ~4,000; entries 2,941 → ~850; registries −500; dead/commented −1,000 → **≈ −9,300 source lines** (of ~17,800 client JS excluding `lib/game/**` and `lib/dist/**`), a **~52% cut**.
- **HTML:** 12,495 → ~6,000 non-blank lines; **1.75 MB → ~0.35 MB**.
- **Committed build output:** **−6.9 MB**.

### ⚠ Highest-risk step: **Step 3**

Why it and not the adapter step:

- It is the only step that touches money-moving buttons (join / withdraw / claim) **on both chains at once**.
- The EVM path's button state machine is driven by `data.r.length > 0` from `/sign` (`openFights.js:499`) **plus** `player2 !== undefined` **plus** `finishTime == 0`, producing four states at `:611` and `:614`. None of it is tested.
- The TVM equivalent is different **in kind**: `ton/openFights.js:64-118` decides state *and navigates away* (`window.location.href = '/ton_game/…'` at `:114`) as a side effect of **rendering a row**. Merging a renderer that navigates with one that doesn't is exactly where a silent regression hides — e.g. an EVM player being redirected into a match they haven't joined, or a TON player never being redirected into one they have.
- The two also disagree on when they redirect: EVM redirects from a *contract event handler* (`:206`, `:237`) and from the current-battle branch (`:612`); TVM from the row builder.

**Mitigation — split Step 3 in two:**
- **3a:** extract the pure DOM builder with *zero* behaviour change. Both existing files call it; actions and navigation stay in the old files as callbacks. Ship, watch a full day of real fights.
- **3b:** only then unify the state machine — and **write the state table down first** (row state × {isOwner, hasOpponent, hasVoucher, isClaimed} → {button label, click action, navigate?}) and diff it against both current implementations before writing a line.

**Second-highest: Step 1**, solely because of the Sapphire `shopAddress` disagreement. Picking the wrong one breaks NFT purchases on Sapphire silently. Read the on-chain shop owner before choosing.

---

## 5. Build

### One bundle or two? — **two entries, one config.** Split by *page*, not by *chain*.

`lobby` and `match`. The match page loads the ImpactJS engine (`game.min.js` + 6,267 lines of `lib/game/**` + 2,221 of `lib/net/**`) through **30 plain `<script>` tags** relying on globals (`ig.module`, `Network`, `Contract`, `GameID`); the lobby loads none of it. Merging would ship the engine to the lobby and the shop to the match page.

Both entries import both chain adapters. `import()`-splitting them is optional and probably not worth it — the TON SDK and `ethers` are already both inside today's 1.2 MB bundles.

### How the entries collapse

```
main       ┐
           ├──► lobby     (Step 6)
main_ton   ┘

main_game       ┐
                ├──► match (Step 7)
main_game_ton   ┘
```

Uncomment all four in `lib/webpack.config.js:5-9` at Step 0 so nothing is unbuildable, then delete two at Steps 6/7.

### Committed `lib/dist`

**Delete it; add `lib/dist/` to `.gitignore`; build at deploy time.**

The blocker is that the HTML references chunks by webpack's numeric id (`index.html:54-59`). Fix with `optimization: { splitChunks: false, runtimeChunk: false }` so each entry emits exactly one file — then each page needs exactly one `<script>`. If you later want cache-busting, add `[contenthash]` **and** `HtmlWebpackPlugin` to inject the tags; but given the pages are hand-maintained 780 KB files, single-file-per-entry is the cheaper first move and it is what unblocks Step 0.

Also: fold `lib/modules/**` into the bundle. Those files are currently served **raw** as `<script type="module">` (`index.html:61-65`) while `lib/src/**` is bundled — that split is the direct cause of the client-side registry duplication. Check `lib/custom.js` before moving it: it defines globals (`toggleMessageModal`, `toggleNftShopModal`, …) that inline `onclick=` attributes in the HTML call, so it may have to stay raw or be explicitly attached to `window`. Note also `lib/modules/tokens.js` reads global `ethers.constants.AddressZero` at module top level, so it must load after the ethers UMD script.

Finally, narrow `server.js:39` from `express.static('/lib')` (which currently exposes `lib/src/**` sources and `lib/package.json`) to serving only `lib/dist` and `lib/media`.

### Two 750 KB pages → one

Three moves, **in this order**:

1. **Extract the inline SVG.** 571 KB per page across 24 blocks; 23 blocks (569,943 B) are byte-identical between the pages. The single `<svg id="mask0_175_349">` at 452,105 B is 58% of each page on its own. Extract to `/media/svg/` and reference via `<use href="…#id">` — prefer `<use>` over `<img>` because some blocks may be styled by page-level CSS selectors, which `<img>` would break. **This one move takes both pages from ~780 KB to ~210 KB before any merging.**
2. **Normalise the accidental id drift.** `-selecter` → `-selected`, `-f2p-evm` → `-f2p` (done as part of Step 2). Overlap goes from 87% to ~95%.
3. **Merge.** One `index.html` with the ~95 chain-specific nodes marked `data-chain="evm"|"tvm"`, hidden at boot from `?network=`. `server.js:53-67` already has both routes and can send the same file. Repeat for `game.html`/`game_ton.html` (94% identical, 12 identical SVGs, ~70 divergent lines).

Combined: **1.75 MB → ~0.35 MB**, four pages → two.

---

## 6. What I could not determine

- **Whether the committed EVM bundles match current source.** `lib/dist/main.js`, `main_game.js`, `main_game_ton.js` cannot be rebuilt from `lib/webpack.config.js` as it stands, and I did not run a build. If they are stale relative to `lib/src/**`, the "app keeps working at every step" guarantee for the EVM pages depends on Step 0's rebuild-and-diff. **Do not trust any later verification until Step 0 passes.**
- **Which Sapphire `shopAddress` is correct** — `0x6B1e14477a78D269d44F9b476Bd39adE1913fa30` (server) or `0xa32fF84560231318896150fa8E5079BE34DBdE90` (client). Needs an on-chain read.
- **Whether `index_game.js:299-343`'s HTTP `/balance` HUD seeding is genuinely redundant** with `room-connection.js`'s socket `update_balance` path, or whether the socket only fires after the first kill (leaving the EVM HUD blank at spawn if you delete the HTTP call). I read both; I did not run a match.
- **Whether the `-desktop` id family is live or half-built.** `index_ton.html` has zero `-desktop` ids and `index_ton.js:20-22` shows a "not supported" popup on desktop, so the TON page appears mobile-only by design — but I could not confirm whether the EVM desktop layout is shipped or in progress.
- **Why `ton/leaderboard.js`'s `/leaderboard/ton` fetch was commented out** — broken endpoint or bad data. Affects whether Step 9 is one hour or a day.
- **Whether `/ton` is currently served in production at all**, and whether `main_ton.js` being the only enabled webpack entry reflects "TON is the active product" or just an uncommitted local state.