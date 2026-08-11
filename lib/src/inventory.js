// EVM entry point into the shared inventory panel. See lib/src/items/.
import { evmItemsChain } from './items/evm.js'
import { renderInventory } from './items/inventory.js'

export { addInventoryItem, showInventoryItemModal } from './items/inventory.js'

export const inventory = (address, network, signer, wrap) =>
    renderInventory(evmItemsChain(network, signer, wrap), address)
