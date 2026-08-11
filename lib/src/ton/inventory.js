// TVM entry point into the shared inventory panel. See lib/src/items/.
//
// The chain is built at module load and registered immediately, because
// index_ton.js calls addInventoryItem straight from the NFT-claim flow, which
// can run before the inventory panel has been rendered.
import { tvmItemsChain } from '../items/tvm.js'
import { renderInventory, setItemsChain, addInventoryItem as addItem } from '../items/inventory.js'

export { getInventory } from '../items/tvm.js'
export { showInventoryItemModal } from '../items/inventory.js'

const chain = tvmItemsChain()
setItemsChain(chain)

export const inventoryTon = (address) => renderInventory(chain, address)

// Kept in the TVM argument order (nftItemAddress before settedId) because
// index_ton.js calls it that way.
export const addInventoryItem = (itemListId, item, itemType, address, chainid, i, nftItemAddress, settedId) =>
    addItem(itemListId, item, itemType, address, chainid, i, settedId, nftItemAddress)
