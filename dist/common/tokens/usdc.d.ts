import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
/**
 * USDC token context CHANGE CONTRACT ADDRESS INFO ETC
 */
export declare class USDC {
    static ZKSYNC_ERA(): Token;
    /**
     * Get USDC token info by chain id
     * @param chainId The chain id
     */
    static token(chainId: ChainId | number): Token;
}
