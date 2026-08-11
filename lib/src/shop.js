// EVM entry point into the shared NFT shop. See lib/src/items/.
import { evmItemsChain } from './items/evm.js'
import { renderShop } from './items/shop.js'

export const shop = (address, network, signer, wrap, isMobile) =>
    renderShop(evmItemsChain(network, signer, wrap), address, isMobile)
