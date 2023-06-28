"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETH = exports.turnTokenIntoEthForResponse = exports.isNativeEth = exports.removeEthFromContractAddress = exports.appendEthToContractAddress = exports.ETH_NAME = exports.ETH_SYMBOL = void 0;
const chain_id_1 = require("../../enums/chain-id");
const error_codes_1 = require("../errors/error-codes");
const muteswitch_error_1 = require("../errors/muteswitch-error");
const deep_clone_1 = require("../utils/deep-clone");
const ETH_PREFIX = '_ETH';
exports.ETH_SYMBOL = 'ETH';
exports.ETH_NAME = 'Ethers';
const appendEthToContractAddress = (contractAddress) => {
    return `${contractAddress}${ETH_PREFIX}`;
};
exports.appendEthToContractAddress = appendEthToContractAddress;
const removeEthFromContractAddress = (contractAddress) => {
    return contractAddress
        .replace(ETH_PREFIX, '')
        .replace(ETH_PREFIX.toLowerCase(), '');
};
exports.removeEthFromContractAddress = removeEthFromContractAddress;
const isNativeEth = (contractAddress) => {
    return contractAddress.includes(ETH_PREFIX);
};
exports.isNativeEth = isNativeEth;
const turnTokenIntoEthForResponse = (token, nativeCurrencyInfo) => {
    const clone = (0, deep_clone_1.deepClone)(token);
    // clear down contract address
    clone.contractAddress = 'NO_CONTRACT_ADDRESS';
    if (nativeCurrencyInfo) {
        clone.symbol = nativeCurrencyInfo.symbol;
        clone.name = nativeCurrencyInfo.name;
    }
    else {
        clone.symbol = exports.ETH_SYMBOL;
        clone.name = exports.ETH_NAME;
    }
    return clone;
};
exports.turnTokenIntoEthForResponse = turnTokenIntoEthForResponse;
/**
 * ETH token info
 */
class ETH {
    static ZKSYNC_ERA() {
        return {
            chainId: chain_id_1.ChainId.ZKSYNC_ERA,
            contractAddress: (0, exports.appendEthToContractAddress)('0x0000000000000000000000000000000000000000'),
            decimals: 18,
            symbol: exports.ETH_SYMBOL,
            name: exports.ETH_NAME,
        };
    }
    /**
     * Get ETH token info by chain id
     * @param chainId The chain id
     */
    static info(chainId, customNetworkNativeWrappedTokenInfo = undefined) {
        if (customNetworkNativeWrappedTokenInfo) {
            return Object.assign(Object.assign({}, customNetworkNativeWrappedTokenInfo), { contractAddress: (0, exports.appendEthToContractAddress)(customNetworkNativeWrappedTokenInfo.contractAddress) });
        }
        switch (chainId) {
            case chain_id_1.ChainId.ZKSYNC_ERA:
                return this.ZKSYNC_ERA();
            default:
                throw new muteswitch_error_1.MuteSwitchError(`${chainId} is not allowed`, error_codes_1.ErrorCodes.tokenChainIdContractDoesNotExist);
        }
    }
}
exports.ETH = ETH;
