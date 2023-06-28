import { ChainId } from '../../enums/chain-id';
import { Token } from '../../factories/token/models/token';
import { ErrorCodes } from '../errors/error-codes';
import { MuteSwitchError } from '../errors/muteswitch-error';

/**
 * USDC token context CHANGE CONTRACT ADDRESS INFO ETC
 */
export class USDC {
  public static ZKSYNC_ERA(): Token {
    return {
      chainId: ChainId.ZKSYNC_ERA,
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
