import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
import { ErrorCodes } from '../errors/error-codes';
import { MuteSwitchError } from '../errors/muteswitch-error';

/**
 * WBTC token context
 */
export class WBTC {
  public static ZKSYNC_ERA(): Token {
    return {
      chainId: ChainId.ZKSYNC_ERA,
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
