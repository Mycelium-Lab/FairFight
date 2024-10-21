import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/nft_shop.tact',
    options: {
        debug: true,
    },
};
