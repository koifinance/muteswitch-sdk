import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
/**
 * DAI token context CHANGE CONTRACT ADDRESS INFO ETC
 */
export declare class DAI {
    static MAINNET(): Token;
    /**
     * Get DAI token info by chain id
     * @param chainId The chain id
     */
    static token(chainId: ChainId | number): Token;
}
