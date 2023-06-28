import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
import { ErrorCodes } from '../errors/error-codes';
import { MuteSwitchError } from '../errors/muteswitch-error';

export const WETH_SYMBOL = 'WETH';
export const WETH_NAME = 'Wrapped Ether';

/**
 * WETH token context (called `WETHContract` so people get a breaking changes if they use the old name of `WETH`)
 */
export class WETHContract {
  public static ZKSYNC_ERA(): Token {
    return {
      chainId: ChainId.ZKSYNC_ERA,
      contractAddress: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
      decimals: 18,
      symbol: WETH_SYMBOL,
      name: WETH_NAME,
    };
  }

  /**
   * Get WETH token info by chain id
   * @param chainId The chain id
   */
  public static token(chainId: ChainId | number): Token {
    switch (chainId) {
      case ChainId.ZKSYNC_ERA:
        return this.ZKSYNC_ERA();
      default:
        throw new MuteSwitchError(
          `${chainId} is not allowed`,
          ErrorCodes.tokenChainIdContractDoesNotExist
        );
    }
  }
}
