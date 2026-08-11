// TVM half of the items seam.
//
// Two capabilities shape everything here: TON items carry their own contract
// address (so identity is a single address, not a collection + token id), and
// tonConnectUI.sendTransaction hands back a BOC rather than a confirmed hash —
// there is nothing to wait on and nothing to link to in an explorer, so a new
// NFT is detected by diffing the inventory instead.

import { beginCell, toNano, Address } from '@ton/ton'
import { findNetwork } from '../../modules/networks.js'
import { InventoryTypes } from '../utils/utils.js'

// The shop contract's buy opcode indexes collections in this order.
const nftTypeIndexFor = {
    [InventoryTypes.CHARACTERS]: 0,
    [InventoryTypes.ARMORS]: 1,
    [InventoryTypes.BOOTS]: 2,
    [InventoryTypes.WEAPONS]: 3
}

const inventoryPollMs = 20000

export const getInventory = async (address) => {
    const rawResponse = await fetch('/ton/inventory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({address})
    }).catch(err => {
        console.log(err)
        return {}
    });
    return await rawResponse.json();
}

export const findUniqueNewNftItem = (inventory, newInventory) => {
    inventory = inventory.filter(item => item);
    newInventory = newInventory.filter(item => item);
    const uniqueItem = newInventory.find(newItem =>
      !inventory.some(item => item.address === newItem.address)
    );

    return uniqueItem || null; // Возвращает найденный объект или null, если ничего не найдено
}

const withNftAddress = (item) => ({...item, nftAddress: item.address})

export const tvmItemsChain = (tonConnectUI, tgInitData) => {
    const network = findNetwork(0)

    const send = async (to, amount, body) => tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: Address.parse(to).toString(),
                amount: amount.toString(),
                payload: body.toBoc().toString("base64")
            }
        ]
    })

    const awaitNewNft = async (address) => {
        const before = await getInventory(address)
        return new Promise(resolve => {
            const checker = setInterval(async () => {
                try {
                    const after = await getInventory(address)
                    const newItem = findUniqueNewNftItem(before.nfts, after.nfts)
                    if (newItem) {
                        clearInterval(checker)
                        resolve(withNftAddress(newItem))
                    }
                } catch (error) {
                    console.log(error)
                }
            }, inventoryPollMs)
        })
    }

    return {
        chainid: 0,
        network,
        caps: {
            requiresApproval: false,
            syncReceipt: false,
            explorerTxLinks: false,
            perItemNftAddress: true,
            dismissItemModalOnBackdropClick: false
        },

        route: (name) => `ton/${name}`,

        fetchInventory: getInventory,

        listOwnedNfts: async (address, inventory) => inventory.nfts.filter(v => v).map(withNftAddress),

        equippedNftAddress: (inventory, itemType, itemId) =>
            inventory.nfts.find(v => v && v.type === itemType && v.id === itemId)?.address,

        // sendTransaction resolves with a BOC, not a confirmed tx hash, so
        // there is no explorer URL to offer.
        explorerTxUrl: () => null,

        priceOf: (json) => json.priceTon,

        buyShopItem: ({nftTypeName, index, json}) => send(
            network.shopAddress,
            toNano(json.priceTon) + toNano(0.05) * 2n,
            beginCell()
                .storeUint(0xD0170C90, 32)
                .storeInt(BigInt(nftTypeIndexFor[nftTypeName]), 257)
                .storeInt(BigInt(index), 257)
                .endCell()
        ),

        awaitNewNft,

        // "Buy now" opens a rail picker rather than buying directly. On desktop
        // the button itself also buys, because the dropdown is never mounted
        // there — only the mobile item modal hosts it.
        buildPaymentRails: ({buyButton, buy, nftTypeName, index, isDesktop}) => {
            const dropdown = document.createElement('div')
            dropdown.classList.add('buy-now-btn__wrapper-dropdown')
            const buyTon = document.createElement('span')
            buyTon.id = 'buy-via-ton'
            buyTon.textContent = 'Buy via Ton'
            const line = document.createElement('span')
            line.classList.add('line')
            const buyAeon = document.createElement('span')
            buyAeon.textContent = 'Buy via Aeon'
            ;[buyTon, buyAeon].forEach(rail => rail.addEventListener('click', () => {
                rail.style.backgroundColor = "var(--bs-warning)";
                setTimeout(() => {
                    rail.style.backgroundColor = "transparent";
                }, 250);
            }))
            dropdown.append(buyTon, line, buyAeon)

            buyButton.addEventListener('click', () => {
                dropdown.style.cssText = dropdown.style.display !== "flex"
                    ? 'display: flex !important;'
                    : 'display: none !important;'
            })
            const eventButton = isDesktop ? buyButton : buyTon
            eventButton.addEventListener('click', () => buy(dropdown))
            buyAeon.addEventListener('click', () => payWithAeon(nftTypeName, index, tgInitData))
            return {dropdown}
        },

        lootbox: {
            available: !!network.lootboxAddress,
            loadPricing: async () => ({price: toNano(2), allowance: 0n}),
            buy: (price) => send(
                network.lootboxAddress,
                price + toNano(0.05) * 2n,
                beginCell().storeUint(0, 32).storeStringTail("Buy").endCell()
            )
        }
    }
}

// Card / off-chain rail: the server signs the order, Aeon hosts the checkout.
const payWithAeon = async (nftTypeName, index, tgInitData) => {
    const errorModal = document.querySelector('#new-error-modal')
    const errorModalText = document.querySelector('#new-error-modal-text')
    const response = await fetch('/aeon/sign', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            initData: tgInitData,
            nftType: nftTypeIndexFor[nftTypeName],
            nftId: parseInt(index)
        })
    })
    if (response.status != 200) {
        errorModal.style.display = 'flex'
        errorModalText.textContent = await response.text()
        return
    }
    const resSign = await response.json()
    const responseAeon = await fetch('https://sbx-crypto-payment-api.aeon.xyz/open/api/tg/payment/V2', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resSign)
    })
    const responseAeonJson = await responseAeon.json()
    if (responseAeon.status != 200) {
        errorModal.style.display = 'flex'
        errorModalText.textContent = responseAeonJson.msg
        return
    }
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = responseAeonJson.model.webUrl;
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
