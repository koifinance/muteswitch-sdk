"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC = void 0;
const chain_id_1 = require("../../enums/chain-id");
const error_codes_1 = require("../errors/error-codes");
const muteswitch_error_1 = require("../errors/muteswitch-error");
/**
 * USDC token context CHANGE CONTRACT ADDRESS INFO ETC
 */
class USDC {
    static ZKSYNC_ERA() {
        return {
            chainId: chain_id_1.ChainId.ZKSYNC_ERA,
            contractAddress: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD Coin',
        };
    }
    /**
     * Get USDC token info by chain id
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
exports.USDC = USDC;
