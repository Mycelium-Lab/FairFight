// TVM entry point into the shared NFT shop. See lib/src/items/.
import { tvmItemsChain } from '../items/tvm.js'
import { renderShop } from '../items/shop.js'

export { findUniqueNewNftItem } from '../items/tvm.js'

export const shopTon = (address, isMobile, tonConnectUI, tgInitData) =>
    renderShop(tvmItemsChain(tonConnectUI, tgInitData), address, isMobile)
