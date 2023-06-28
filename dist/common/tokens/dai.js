"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAI = void 0;
const chain_id_1 = require("../../enums/chain-id");
const error_codes_1 = require("../errors/error-codes");
const muteswitch_error_1 = require("../errors/muteswitch-error");
/**
 * DAI token context CHANGE CONTRACT ADDRESS INFO ETC
 */
class DAI {
    static MAINNET() {
        return {
            chainId: chain_id_1.ChainId.MAINNET,
            contractAddress: '0x2e4805d59193e173c9c8125b4fc8f7f9c7a3a3ed',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
        };
    }
    /**
     * Get DAI token info by chain id
     * @param chainId The chain id
     */
    static token(chainId) {
        switch (chainId) {
            case chain_id_1.ChainId.MAINNET:
                return this.MAINNET();
            default:
                throw new muteswitch_error_1.MuteSwitchError(`${chainId} is not allowed`, error_codes_1.ErrorCodes.tokenChainIdContractDoesNotExist);
        }
    }
}
exports.DAI = DAI;
