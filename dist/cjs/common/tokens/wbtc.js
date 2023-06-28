"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WBTC = void 0;
const chain_id_1 = require("../../enums/chain-id");
const error_codes_1 = require("../errors/error-codes");
const muteswitch_error_1 = require("../errors/muteswitch-error");
/**
 * WBTC token context
 */
class WBTC {
    static ZKSYNC_ERA() {
        return {
            chainId: chain_id_1.ChainId.ZKSYNC_ERA,
            contractAddress: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
            decimals: 8,
            symbol: 'WBTC',
            name: 'Wrapped BTC',
        };
    }
    /**
     * Get WBTC token info by chain id
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
exports.WBTC = WBTC;
