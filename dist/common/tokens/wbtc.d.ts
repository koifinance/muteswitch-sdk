import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
/**
 * WBTC token context
 */
export declare class WBTC {
    static ZKSYNC_ERA(): Token;
    /**
     * Get WBTC token info by chain id
     * @param chainId The chain id
     */
    static token(chainId: ChainId | number): Token;
}
