import { ChainId } from '../../enums/chain-id';
import { NativeCurrencyInfo } from '../../factories/pair/models/custom-network';
import { Token } from '../../factories/token/models/token';
export declare const ETH_SYMBOL = "ETH";
export declare const ETH_NAME = "Ethers";
export declare const appendEthToContractAddress: (contractAddress: string) => string;
export declare const removeEthFromContractAddress: (contractAddress: string) => string;
export declare const isNativeEth: (contractAddress: string) => boolean;
export declare const turnTokenIntoEthForResponse: (token: Token, nativeCurrencyInfo: NativeCurrencyInfo | undefined) => Token;
/**
 * ETH token info
 */
export declare class ETH {
    static ZKSYNC_ERA(): Token;
    /**
     * Get ETH token info by chain id
     * @param chainId The chain id
     */
    static info(chainId: ChainId | number, customNetworkNativeWrappedTokenInfo?: Token | undefined): Token;
}
