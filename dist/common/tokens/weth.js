"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETHContract = exports.WETH_NAME = exports.WETH_SYMBOL = void 0;
const chain_id_1 = require("../../enums/chain-id");
const error_codes_1 = require("../errors/error-codes");
const muteswitch_error_1 = require("../errors/muteswitch-error");
exports.WETH_SYMBOL = 'WETH';
exports.WETH_NAME = 'Wrapped Ether';
/**
 * WETH token context (called `WETHContract` so people get a breaking changes if they use the old name of `WETH`)
 */
class WETHContract {
    static ZKSYNC_ERA() {
        return {
            chainId: chain_id_1.ChainId.ZKSYNC_ERA,
            contractAddress: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            decimals: 18,
            symbol: exports.WETH_SYMBOL,
            name: exports.WETH_NAME,
        };
    }
    /**
     * Get WETH token info by chain id
     * @param chainId The chain id
     */
    static token(chainId) {
        switch (chainId) {
            case chain_id_1.ChainId.ZKSYNC_ERA:
                return this.ZKSYNC_ERA();
            default:
                throw new muteswitch_error_1.MuteSwitchError(`${chainId} is not allowed`, error_codes_1.ErrorCodes.tokenChainIdContractDoesNotExist);
        }
    }
}
exports.WETHContract = WETHContract;
