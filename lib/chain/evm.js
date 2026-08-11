/*
 * The EVM half of the chain-family seam.
 *
 * This is the ONLY file under lib/ (outside the ImpactJS match client in
 * lib/net/**) that may name `ethers`. Everything the lobby needs from an EVM
 * chain - the wallet session, the fight contract, ERC20 allowances, the NFT
 * collections, address form and decimals - comes out of the object this factory
 * returns.
 *
 * `ethers` is a page-level UMD global, not an npm dependency; that is why there
 * is no import for it.
 *
 * The item half of this file was lib/src/items/evm.js. It is folded in rather
 * than kept beside the new adapter: two files per family, one for fights and
 * one for items, would be the third parallel structure the refactor is trying
 * to remove, and both halves need the same signer, the same Sapphire wrapper
 * and the same allowance code.
 */
import { contractAbi, ERC20, nftAbi, multicallNFTAbi, shopAbi, lootboxAbi } from '../contract.js'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { rpcMapFor } from '../modules/networks.js'
import { tokens } from '../modules/tokens.js'
import { accountHide } from '../modules/accountsHide.js'
import charactersJsons from '../jsons/characters.json'
import armorsJsons from '../jsons/armors.json'
import bootsJsons from '../jsons/boots.json'
import weaponsJsons from '../jsons/weapons.json'
import {
    InventoryTypes, WalletTypes, msgSignIn, createShortAddress,
    addWalletToLocalStorage, addOnlyWalletToLocalStorage,
    getAccountFromLocalStorage, getWalletTypeFromLocalStorage
} from '../src/utils/utils.js'
import { fromBaseUnits, makeCaps, toBaseUnits, MAX_UINT256 } from './index.js'

// ------------------------------------------------------------------- wallets

const WALLET_CONNECT_PROJECT_ID = '9886e2654e7f10b0bcb4e0282fcc696c'
// Chains offered through WalletConnect. The rpcMap used to be pasted verbatim at
// each of four EthereumProvider.init call sites.
const WALLET_CONNECT_CHAINS = [503129905, 42262, 23294, 56, 204, 137, 355113, 97, 42161, 1440002]
const WC_REQUIRED_CHAINS = [23294]
const WC_OPTIONAL_CHAINS = [42262, 503129905, 56, 204, 137, 97, 42161, 1440002]
// The first-connect init asked for fewer optional methods than the resume one.
// Kept distinct so this refactor does not silently widen the session.
const WC_METHODS_CONNECT = ['wallet_switchEthereumChain', 'wallet_addEthereumChain']
const WC_METHODS_RESUME = ['wallet_switchEthereumChain', 'eth_requestAccounts', 'eth_accounts', 'wallet_addEthereumChain']

const initWalletConnect = ({showQrModal, optionalMethods}) => EthereumProvider.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: WC_REQUIRED_CHAINS,
    optionalChains: WC_OPTIONAL_CHAINS,
    showQrModal,
    ...(showQrModal ? {
        qrModalOptions: {
            themeMode: 'light',
            themeVariables: {
                '--wcm-accent-color': '#FF7C06',
                '--wcm-background-color': '#FF7C06'
            }
        }
    } : {}),
    rpcMap: rpcMapFor(WALLET_CONNECT_CHAINS),
    optionalMethods,
    optionalEvents: ['accountsChanged']
})

// ------------------------------------------------------------------- items

// Chains whose shop and lootbox are paid natively, so there is no allowance to
// read and nothing to approve.
const nativePaymentChains = [23294, 355113, 1440002, 31338]
// Chains whose buy() takes the stake as msg.value rather than an ERC20 pull.
const nativeValueChains = [355113, 1440002]

const collectionAddressFor = (network) => ({
    [InventoryTypes.CHARACTERS]: network.charactersAddress,
    [InventoryTypes.ARMORS]: network.armorsAddress,
    [InventoryTypes.WEAPONS]: network.weaponsAddress,
    [InventoryTypes.BOOTS]: network.bootsAddress
})

const jsonsFor = {
    [InventoryTypes.CHARACTERS]: charactersJsons,
    [InventoryTypes.ARMORS]: armorsJsons,
    [InventoryTypes.WEAPONS]: weaponsJsons,
    [InventoryTypes.BOOTS]: bootsJsons
}

// ------------------------------------------------------------------- adapter

export const evmChain = ({network}) => {
    const zero = ethers.constants.AddressZero
    const collections = collectionAddressFor(network)
    const isNativePayment = nativePaymentChains.includes(Number(network.chainid))
    const isSapphire = Number(network.chainid) === 23294
    const nativeDecimals = Number(network.decimals ?? 18)

    // Session state. Mutable because connect/resume happen after construction
    // and everything below reads whatever the current signer is.
    let baseProvider   // window.ethereum, or the WalletConnect provider
    let provider       // ethers.providers.Web3Provider
    let signer
    let contract
    let address = getAccountFromLocalStorage()

    /*
     * Sapphire needs its signer wrapped for confidential transactions. Applied
     * for every write on 23294.
     *
     * NB: this is a behaviour change on Sapphire. `openFights.js` guarded the
     * wrap on finish and withdraw with `if (network == 23294)` - comparing the
     * network *object* to a number, which is never true - so those two writes
     * went out unwrapped while join and approve, on the same chain in the same
     * file, were wrapped correctly. Rather than carry a type-confusion bug
     * across the seam, the wrap is now applied uniformly.
     */
    const txSigner = () => isSapphire ? sapphire.wrap(signer) : signer
    const fightContract = () => contract.connect(txSigner())
    const erc20 = (tokenAddress) => new ethers.Contract(tokenAddress, ERC20, signer)
    const erc20Tx = (tokenAddress) => new ethers.Contract(tokenAddress, ERC20, txSigner())

    const attach = () => {
        contract = new ethers.Contract(network.contractAddress, contractAbi, signer)
    }

    // --------------------------------------------------------------- assets

    const nativeAsset = {
        symbol: network.currency,
        address: null,
        decimals: nativeDecimals,
        src: undefined
    }

    // symbol()/decimals() are two round-trips per token; the lobby asks for the
    // same handful of tokens once per rendered row.
    const assetCache = new Map()
    const assetFor = async (tokenAddress) => {
        if (!tokenAddress || tokenAddress === zero) return nativeAsset
        const key = tokenAddress.toLowerCase()
        if (assetCache.has(key)) return assetCache.get(key)
        const promise = (async () => {
            try {
                const erc = erc20(tokenAddress)
                const [symbol, decimals] = await Promise.all([erc.symbol(), erc.decimals()])
                return {symbol, address: tokenAddress, decimals: Number(decimals)}
            } catch (error) {
                // Same fallback the call sites used: show the chain's own
                // currency at 18 decimals rather than blanking the row.
                console.log(error)
                return {...nativeAsset, address: tokenAddress}
            }
        })()
        assetCache.set(key, promise)
        return promise
    }

    // --------------------------------------------------------------- fights

    const normalizeFight = (raw, id) => ({
        id: (id !== undefined ? id : raw.ID).toString(),
        owner: raw.owner,
        token: raw.token === zero ? null : raw.token,
        amountPerRound: BigInt(raw.amountPerRound.toString()),
        baseAmount: BigInt(raw.baseAmount.toString()),
        rounds: parseInt(raw.rounds.toString()),
        maxPlayers: parseInt(raw.playersAmount.toString()),
        createTime: parseInt(raw.createTime.toString()),
        finishTime: parseInt(raw.finishTime.toString()),
        players: [],
        claimedBy: {}
    })

    const equals = (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase()

    const withPlayers = async (fight) => ({
        ...fight,
        players: await contract.getFightPlayers(fight.id).catch(() => [])
    })

    const chain = {
        family: 'evm',
        // What goes on the wire: the socket room name and every server table are
        // keyed on the real chain id for EVM.
        wireChainId: Number(network.chainid),
        // Kept for the item modules, which tag DOM nodes and server calls with it.
        chainid: network.chainid,
        network,
        nativeAsset,

        caps: makeCaps({
            tokenChoice: true,
            requiresApproval: true,
            liveEvents: true,
            syncReceipt: true,
            chainSwitch: true,
            multiplayerTimer: true,
            perItemNftAddress: false,
            explorerTxLinks: true,
            dismissItemModalOnBackdropClick: true
        }),

        // ----------------------------------------------------------- session

        /** True once there is a signer, i.e. once resume() or connect() worked. */
        get connected() { return !!signer },
        getAccount: () => address,

        /**
         * Re-attach to the wallet the previous session stored. Returns the
         * address, or null when there is nothing stored. Throws only if a
         * WalletConnect session cannot be resumed, which is the case the caller
         * used to answer with a page reload.
         */
        resume: async () => {
            if (address === null) return null
            if (getWalletTypeFromLocalStorage() === WalletTypes.INJECTED) {
                try {
                    provider = new ethers.providers.Web3Provider(window.ethereum)
                    await provider.send('eth_requestAccounts', [])
                    signer = await provider.getSigner()
                    attach()
                    baseProvider = window.ethereum
                } catch (error) {
                    console.log(error)
                }
            } else {
                const wc = await initWalletConnect({showQrModal: false, optionalMethods: WC_METHODS_RESUME})
                await wc.enable()
                baseProvider = wc
                provider = new ethers.providers.Web3Provider(wc)
                signer = await provider.getSigner()
                address = await signer.getAddress()
                addWalletToLocalStorage(address, WalletTypes.WALLET_CONNECT)
                attach()
            }
            return address
        },

        /** Fresh connect. The caller reloads afterwards, as it always did. */
        connect: async (pref) => {
            if (pref === 'injected') {
                provider = new ethers.providers.Web3Provider(window.ethereum)
                await provider.send('eth_requestAccounts', [])
                signer = await provider.getSigner()
                attach()
                address = await signer.getAddress()
                addWalletToLocalStorage(address, WalletTypes.INJECTED)
                return address
            }
            const wc = await initWalletConnect({showQrModal: true, optionalMethods: WC_METHODS_CONNECT})
            await wc.enable()
            baseProvider = wc
            provider = new ethers.providers.Web3Provider(wc)
            signer = await provider.getSigner()
            attach()
            address = await signer.getAddress()
            addWalletToLocalStorage(address, WalletTypes.WALLET_CONNECT)
            return address
        },

        disconnect: async () => {
            if (getWalletTypeFromLocalStorage() === WalletTypes.WALLET_CONNECT) {
                const wc = await initWalletConnect({showQrModal: false, optionalMethods: WC_METHODS_RESUME})
                await wc.enable()
                await wc.disconnect()
            }
            localStorage.clear()
        },

        /** Credential the server accepts for this family: a personal_sign. */
        getSessionProof: async () => {
            let sign = localStorage.getItem('sign_evm')
            if (!sign) {
                sign = await signer.signMessage(msgSignIn)
            } else if (!equals(ethers.utils.verifyMessage(msgSignIn, sign), address)) {
                // Cached signature belongs to a different account.
                sign = await signer.signMessage(msgSignIn)
            }
            if (sign) localStorage.setItem('sign_evm', sign)
            return {sign_evm: sign}
        },

        onAccountChanged: (cb) => {
            if (!baseProvider) return () => {}
            const handler = (accounts) => cb(accounts[0] ?? null)
            baseProvider.on('accountsChanged', handler)
            return () => baseProvider.removeListener?.('accountsChanged', handler)
        },

        onChainChanged: (cb) => {
            if (!baseProvider) return () => {}
            const handler = (data) => cb(parseInt(data))
            baseProvider.on('chainChanged', handler)
            return () => baseProvider.removeListener?.('chainChanged', handler)
        },

        rememberAccount: (account) => addOnlyWalletToLocalStorage(account),

        /**
         * Ask the wallet to move to `chainid`, adding it first if unknown.
         * Swallows failures - including "no wallet at all" - because that is
         * what the inline version did, and the page works read-only without it.
         */
        switchChain: async (chainid = network.chainid) => {
            try {
                await baseProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{chainId: ethers.utils.hexValue(Number(chainid))}]
                })
            } catch (err) {
                console.log(err)
                if (err.code === 4902) {
                    await baseProvider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainName: network.name,
                            chainId: ethers.utils.hexValue(Number(chainid)),
                            nativeCurrency: {name: network.currency, decimals: 18, symbol: network.currency},
                            rpcUrls: [network.publicRpc]
                        }]
                    }).catch(e => console.log(e))
                }
            }
        },

        /** Sapphire routes reads through a confidential provider too. */
        useConfidentialProvider: () => {
            if (isSapphire && provider) provider = sapphire.wrap(provider)
        },

        // ---------------------------------------------------- assets/allowance

        /**
         * The bet assets this chain offers. `address` is null for the native
         * one - tokens.js stores AddressZero there, and AddressZero is a truthy
         * string, so leaving it in place would make every native fight take the
         * ERC20 branch.
         */
        listAssets: () => {
            const entry = tokens.find(v => v.chaindid == network.chainid)
            if (!entry) return [nativeAsset]
            const list = [...entry.list]
            // Emerald/Sapphire/Bitfinity ship a trailing token the lobby never
            // offered as a bet.
            if ([42262, 23294, 355113].includes(Number(network.chainid))) list.pop()
            return list.map(t => ({...t, address: t.address === zero ? null : t.address}))
        },
        assetFor,

        getAllowance: async (who, asset, spender = network.contractAddress) => {
            if (!asset.address) return MAX_UINT256
            return BigInt((await erc20(asset.address).allowance(who, spender)).toString())
        },

        approve: async (asset, spender = network.contractAddress) => {
            if (!asset.address) throw new Error('native assets need no approval')
            return erc20Tx(asset.address).approve(spender, ethers.constants.MaxUint256)
        },

        // ----------------------------------------------------------- fights

        listOpenFights: async () => {
            const chunks = await Promise.all([0, 10, 20, 30, 40].map(
                from => contract.getChunkFights(from, 10).catch(() => [])
            ))
            return [].concat(...chunks)
                .filter(v => v.owner !== zero && v.finishTime == 0 && !accountHide[v.owner.toLowerCase()])
                .map(v => normalizeFight(v))
        },

        getFight: async (id) => withPlayers(normalizeFight(await contract.fights(id), id)),

        getPlayers: (id) => contract.getFightPlayers(id).catch(() => []),

        /**
         * The fight the player is currently in, or null when the chain read
         * fails. Returning null rather than throwing: the previous inline
         * version left `players` undefined and blew up one line later, taking
         * the rest of the lobby render with it.
         */
        getMyLastFight: async (who) => {
            try {
                const id = (await contract.lastPlayerFight(who)).toString()
                const fight = await withPlayers(normalizeFight(await contract.fights(id), id))
                fight.claimedBy = {[who]: await contract.playerClaimed(who, id)}
                return fight
            } catch (error) {
                console.log(error)
                return null
            }
        },

        hasClaimed: (fight, who) =>
            Object.entries(fight.claimedBy || {}).some(([player, claimed]) => claimed && equals(player, who)),

        isPlayer: (fight, who) => (fight.players || []).some(p => equals(p, who)),

        /**
         * Push discovery. `contract.on` fires per event; the callback gets the
         * event kind and id and fetches what it needs. The TVM side polls and
         * emits a single 'refresh' - see tvm.js. The mechanisms are not the
         * same and are not made to look the same.
         */
        watchFights: (cb) => {
            const onCreate = (ID, owner, token) => cb({kind: 'created', id: ID.toString(), owner, token})
            const onJoin = (ID, joiner, token) => cb({kind: 'joined', id: ID.toString(), joiner, token})
            const onWithdraw = (ID) => cb({kind: 'withdrawn', id: ID.toString()})
            contract.on('CreateFight', onCreate)
            contract.on('JoinFight', onJoin)
            contract.on('Withdraw', onWithdraw)
            return () => {
                contract.off('CreateFight', onCreate)
                contract.off('JoinFight', onJoin)
                contract.off('Withdraw', onWithdraw)
            }
        },

        listPastFights: async (who, limit = 30) => {
            const fights = await contract.getPlayerFullFights(who, limit).catch(() => [])
            return fights
                .filter(v => v.owner !== zero && v.finishTime != 0)
                .map(v => normalizeFight(v))
                .sort((a, b) => Number(BigInt(a.id) - BigInt(b.id)))
        },

        createFight: ({amountPerRound, rounds, players, asset}) => {
            const total = amountPerRound * BigInt(rounds)
            const tokenAddress = asset.address || zero
            return asset.address
                ? fightContract().create(amountPerRound.toString(), rounds, players, tokenAddress)
                : fightContract().create(amountPerRound.toString(), rounds, players, tokenAddress,
                    {value: total.toString()})
        },

        joinFight: ({id, stake, asset}) => asset.address
            ? fightContract().join(id)
            : fightContract().join(id, {value: stake.toString()}),

        withdrawFight: (id) => fightContract().withdraw(id),

        /** Wire order is (amount, r, v, s) - not (r, s, v). */
        claimPayout: (id, voucher) =>
            fightContract().finish(id, voucher.amount, voucher.r, voucher.v, voucher.s),

        /** A voucher is claimable on EVM only once the signer has filled r. */
        voucherIsClaimable: (voucher) => voucher.r.length > 0,

        /**
         * The id of the fight a create() just made. Reads it out of the receipt,
         * falling back to the contract's own record of the player's last fight.
         */
        createdFightId: async (submitted, who) => {
            try {
                const receipt = await provider.getTransactionReceipt(submitted.hash)
                return contract.interface.parseLog(receipt.logs[0]).args.ID.toString()
            } catch (error) {
                return (await contract.lastPlayerFight(who)).toString()
            }
        },

        minAmountPerRound: async (asset) =>
            BigInt((await contract.minAmountPerRound(asset.address || zero)).toString()),
        maxRounds: async () => (await contract.maxRounds()).toString(),

        // ------------------------------------------------------------- units

        toBaseUnits: (human, asset) => toBaseUnits(human, asset.decimals),
        fromBaseUnits: (units, asset) => fromBaseUnits(units, asset.decimals),
        formatAmount: (units, asset) => `${fromBaseUnits(units, asset.decimals)} ${asset.symbol}`,

        // --------------------------------------------------------- addresses

        /**
         * EVM addresses are hex and compared case-insensitively, so the
         * canonical form is the checksummed one. Unparseable input is returned
         * unchanged rather than throwing - some of it comes back from the
         * server lowercased.
         */
        canonicalize: (a) => {
            try { return ethers.utils.getAddress(a) } catch (error) { return a }
        },
        equals,
        isValidAddress: (a) => {
            try { ethers.utils.getAddress(a); return true } catch (error) { return false }
        },
        shortAddress: (a) => createShortAddress(a),
        explorerAddressUrl: (a) => `${network.explorer}/address/${a}`,
        explorerTxUrl: (submitted) =>
            submitted && submitted.hash ? `${network.explorer}/tx/${submitted.hash}` : null,

        // ------------------------------------------------------------- items

        route: (name) => name,

        fetchInventory: async (who) => {
            const rawResponse = await fetch('/getinventory', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({address: who, chainid: network.chainid})
            }).catch(err => {
                console.log(err)
                return {}
            });
            return await rawResponse.json();
        },

        // One multicall per collection where the helper is deployed, otherwise
        // one balance call per token id. Order is characters, armors, boots,
        // weapons - the order the slots are laid out in.
        listOwnedNfts: async (who) => {
            const owned = []
            for (const itemType of [InventoryTypes.CHARACTERS, InventoryTypes.ARMORS, InventoryTypes.BOOTS, InventoryTypes.WEAPONS]) {
                const jsons = jsonsFor[itemType]
                const ids = jsons.map((v, i) => i)
                let balances
                if (network.multicallNFT) {
                    const multicall = new ethers.Contract(network.multicallNFT, multicallNFTAbi, signer)
                    balances = await multicall.callPropertyTokensLength(collections[itemType], who, ids).catch(() => [])
                } else {
                    const collection = new ethers.Contract(collections[itemType], nftAbi, signer)
                    balances = await Promise.all(ids.map(i => collection.getOwnerPropertyTokensLength(who, i).catch(() => 0)))
                }
                ids.forEach(i => {
                    try {
                        if (balances[i] == 0) return
                        const data = jsons[i]
                        owned.push({
                            type: itemType,
                            // Character 0 is the free default, so the minted
                            // ones are shifted by one.
                            id: itemType === InventoryTypes.CHARACTERS ? i + 1 : i,
                            image: `/media/${itemType}/${itemType === InventoryTypes.CHARACTERS ? i + 1 : i}.png`,
                            name: data.name,
                            attributes: data.attributes,
                            collection: itemType === InventoryTypes.CHARACTERS ? undefined : data.attributes[1].value,
                            description: data.description
                        })
                    } catch (error) {
                        console.log(error)
                    }
                })
            }
            return owned
        },

        // EVM identity is (collection address, tokenId); there is no per-item
        // address to hang on the slot.
        equippedNftAddress: () => undefined,

        confirm: (submitted) => submitted.wait(),

        approvedAmountFrom: (receipt) => {
            const approveEvent = receipt.events.find(v => v.event === 'Approval')
            return BigInt(approveEvent.args.value.toString())
        }
    }

    // The shop's payment token, and the price/allowance helpers built on it.
    // Kept verbatim from lib/src/items/evm.js: `shopItemUnits` deliberately
    // stays float-then-parseInt, because that number is the amount actually
    // sent on chain today and this step is not the place to shift it.
    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    let usdt = _tokens && _tokens.list.find(v => v.symbol == 'USDT' || v.symbol == 'weUSDT' || v.symbol == 'tUSDT' || v.symbol == 'USDC')
    if (!usdt) usdt = {symbol: 'USDT', decimals: 18, address: zero}
    const usdtContract = () => new ethers.Contract(usdt.address, ERC20, signer)
    const usdtContractTx = () => new ethers.Contract(usdt.address, ERC20, txSigner())
    const shopContract = () => new ethers.Contract(network.shopAddress, shopAbi, txSigner())
    const lootboxContract = () => new ethers.Contract(network.lootboxAddress, lootboxAbi, txSigner())
    const shopItemUnits = (json) => BigInt(parseInt(json.price * 10 ** usdt.decimals).toString())

    const readAllowance = async (who, spender) => {
        if (isNativePayment) return MAX_UINT256
        return BigInt((await usdtContract().allowance(who, spender)).toString())
    }

    Object.assign(chain, {
        priceOf: (json) => json.price,
        shopItemUnits,
        allowanceCovers: (allowance, priceAttribute) =>
            BigInt(allowance) / BigInt(10 ** usdt.decimals) >= parseFloat(priceAttribute),

        loadShopAllowance: (who) => readAllowance(who, network.shopAddress),

        approveShopSpend: () => usdtContractTx().approve(network.shopAddress, ethers.constants.MaxUint256),

        buyShopItem: async ({nftTypeName, index, json}) => {
            const collection = collections[nftTypeName]
            if (isSapphire) {
                // Sapphire pays natively.
                return shopContract().buy(collection, zero, index, {value: shopItemUnits(json).toString()})
            }
            if (nativeValueChains.includes(Number(network.chainid))) {
                return shopContract().buy(collection, usdt.address, index, {
                    value: (parseInt(json.price * 10 ** 18)).toString(),
                    nonce: await signer.getTransactionCount()
                })
            }
            return shopContract().buy(collection, usdt.address, index, {})
        },

        lootbox: {
            available: !!network.lootboxAddress,
            loadPricing: async (who) => {
                const allowance = await readAllowance(who, network.lootboxAddress)
                let price
                try {
                    price = await lootboxContract().price()
                } catch (error) {
                    price = usdt.address ? 10 * 10 ** usdt.decimals : 10 * 10 ** 18
                }
                return {price: BigInt(price.toString()), allowance}
            },
            readAllowance: (who) => readAllowance(who, network.lootboxAddress),
            approve: () => usdtContractTx().approve(network.lootboxAddress, ethers.constants.MaxUint256),
            buy: (price) => {
                if (isSapphire || nativeValueChains.includes(Number(network.chainid))) {
                    return lootboxContract().buyNative({value: price.toString()})
                }
                return lootboxContract().buy()
            },
            lootedItemFrom: (receipt) => {
                const lootEvent = receipt.events.find(v => v.event === 'Loot')
                return nftFromLoot(lootEvent.args.nft, parseInt(lootEvent.args.propertyId), collections)
            }
        }
    })

    return chain
}

// The Loot event names the collection contract and the property id; the rest of
// the item comes out of the json for that collection.
const nftFromLoot = (nftAddress, nftId, collections) => {
    const itemType = Object.keys(collections).find(k => collections[k] === nftAddress)
    if (!itemType) return {type: '', name: '', image: '', id: '', attributes: [], collection: '', description: ''}
    const isCharacter = itemType === InventoryTypes.CHARACTERS
    const json = jsonsFor[itemType][nftId]
    return {
        type: itemType,
        id: isCharacter ? nftId + 1 : nftId,
        image: `/media/${itemType}/${isCharacter ? nftId + 1 : nftId}.png`,
        name: json.name,
        attributes: json.attributes,
        collection: isCharacter ? 'Character' : json.attributes.find(v => v.trait_type === 'Class').value,
        description: json.description
    }
}
