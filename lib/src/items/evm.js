// EVM half of the items seam: enumeration, the ERC20 approval two-step, and
// the per-chain quirks of buying (Sapphire's wrapped signer, the chains that
// pay natively, Bitfinity's explicit nonce).
//
// Nothing outside this file may reference `ethers` — that is what keeps the
// TON bundle free of ethers and the 2,529-line ABI module.

import { nftAbi, multicallNFTAbi, shopAbi, lootboxAbi, ERC20 } from '../../contract.js'
import charactersJsons from '../../jsons/characters.json'
import armorsJsons from '../../jsons/armors.json'
import bootsJsons from '../../jsons/boots.json'
import weaponsJsons from '../../jsons/weapons.json'
import { tokens } from '../../modules/tokens.js'
import { InventoryTypes } from '../utils/utils.js'

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

export const evmItemsChain = (network, signer, wrap) => {
    const collections = collectionAddressFor(network)
    const isNativePayment = nativePaymentChains.includes(Number(network.chainid))

    const _tokens = tokens.find(v => v.chaindid == network.chainid)
    let usdt = _tokens && _tokens.list.find(v => v.symbol == 'USDT' || v.symbol == 'weUSDT' || v.symbol == 'tUSDT' || v.symbol == 'USDC')
    if (!usdt) usdt = {symbol: 'USDT', decimals: 18, address: ethers.constants.AddressZero}
    const usdtContract = () => new ethers.Contract(usdt.address, ERC20, signer)
    const shopContract = () => new ethers.Contract(network.shopAddress, shopAbi, signer)
    const lootboxContract = () => new ethers.Contract(network.lootboxAddress, lootboxAbi, signer)

    // Base units of a shop price. Float-then-parseInt, exactly as before: this
    // number is the amount actually sent on chain and must not shift here.
    const shopItemUnits = (json) => BigInt(parseInt(json.price * 10**usdt.decimals).toString())

    const readAllowance = async (address, spender) => {
        if (isNativePayment) return BigInt(ethers.constants.MaxUint256.toString())
        return BigInt((await usdtContract().allowance(address, spender)).toString())
    }

    return {
        chainid: network.chainid,
        network,
        caps: {
            requiresApproval: true,
            syncReceipt: true,
            explorerTxLinks: true,
            perItemNftAddress: false,
            dismissItemModalOnBackdropClick: true
        },

        route: (name) => name,

        fetchInventory: async (address) => {
            const rawResponse = await fetch('/getinventory', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({address, chainid: network.chainid})
            }).catch(err => {
                console.log(err)
                return {}
            });
            return await rawResponse.json();
        },

        // One multicall per collection where the helper is deployed, otherwise
        // one balance call per token id. Order is characters, armors, boots,
        // weapons — the order the slots are laid out in.
        listOwnedNfts: async (address) => {
            const owned = []
            for (const itemType of [InventoryTypes.CHARACTERS, InventoryTypes.ARMORS, InventoryTypes.BOOTS, InventoryTypes.WEAPONS]) {
                const jsons = jsonsFor[itemType]
                const ids = jsons.map((v, i) => i)
                let balances
                if (network.multicallNFT) {
                    const multicall = new ethers.Contract(network.multicallNFT, multicallNFTAbi, signer)
                    balances = await multicall.callPropertyTokensLength(collections[itemType], address, ids).catch(() => [])
                } else {
                    const collection = new ethers.Contract(collections[itemType], nftAbi, signer)
                    balances = await Promise.all(ids.map(i => collection.getOwnerPropertyTokensLength(address, i).catch(() => 0)))
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

        explorerTxUrl: (submitted) => submitted && submitted.hash ? `${network.explorer}/tx/${submitted.hash}` : null,

        priceOf: (json) => json.price,
        shopItemUnits,
        allowanceCovers: (allowance, priceAttribute) =>
            BigInt(allowance) / BigInt(10**usdt.decimals) >= parseFloat(priceAttribute),

        loadShopAllowance: (address) => readAllowance(address, network.shopAddress),

        approveShopSpend: () => {
            const erc20 = network.chainid == 23294 ? usdtContract().connect(wrap(signer)) : usdtContract()
            return erc20.approve(network.shopAddress, ethers.constants.MaxUint256)
        },

        buyShopItem: async ({nftTypeName, index, json}) => {
            const collection = collections[nftTypeName]
            if (network.chainid == 23294) {
                // Sapphire pays natively and needs the confidential-tx wrapper.
                return shopContract().connect(wrap(signer))
                    .buy(collection, ethers.constants.AddressZero, index, {value: shopItemUnits(json).toString()})
            }
            if (nativeValueChains.includes(Number(network.chainid))) {
                return shopContract().buy(collection, usdt.address, index, {
                    value: (parseInt(json.price * 10**18)).toString(),
                    nonce: await signer.getTransactionCount()
                })
            }
            return shopContract().buy(collection, usdt.address, index, {})
        },

        confirm: (submitted) => submitted.wait(),

        approvedAmountFrom: (receipt) => {
            const approveEvent = receipt.events.find(v => v.event === 'Approval')
            return BigInt(approveEvent.args.value.toString())
        },

        lootbox: {
            available: !!network.lootboxAddress,
            loadPricing: async (address) => {
                const allowance = await readAllowance(address, network.lootboxAddress)
                let price
                try {
                    price = await lootboxContract().price()
                } catch (error) {
                    price = usdt.address ? 10*10**usdt.decimals : 10*10**18
                }
                return {price: BigInt(price.toString()), allowance}
            },
            readAllowance: (address) => readAllowance(address, network.lootboxAddress),
            approve: () => {
                const erc20 = network.chainid == 23294 ? usdtContract().connect(wrap(signer)) : usdtContract()
                return erc20.approve(network.lootboxAddress, ethers.constants.MaxUint256)
            },
            buy: (price) => {
                if (network.chainid == 23294) return lootboxContract().connect(wrap(signer)).buyNative({value: price.toString()})
                if (nativeValueChains.includes(Number(network.chainid))) return lootboxContract().buyNative({value: price.toString()})
                return lootboxContract().buy()
            },
            lootedItemFrom: (receipt) => {
                const lootEvent = receipt.events.find(v => v.event === 'Loot')
                return nftFromLoot(lootEvent.args.nft, parseInt(lootEvent.args.propertyId), collections)
            }
        }
    }
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
