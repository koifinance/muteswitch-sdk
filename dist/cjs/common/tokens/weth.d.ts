import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
export declare const WETH_SYMBOL = "WETH";
export declare const WETH_NAME = "Wrapped Ether";
/**
 * WETH token context (called `WETHContract` so people get a breaking changes if they use the old name of `WETH`)
 */
export declare class WETHContract {
    static ZKSYNC_ERA(): Token;
    /**
     * Get WETH token info by chain id
     * @param chainId The chain id
     */
    static token(chainId: ChainId | number): Token;
}
