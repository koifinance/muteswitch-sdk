import { ChainId } from '../../enums/chain-id';
import { NativeCurrencyInfo } from '../../factories/pair/models/custom-network';
import { Token } from '../../factories/token/models/token';
import { ErrorCodes } from '../errors/error-codes';
import { MuteSwitchError } from '../errors/muteswitch-error';
import { deepClone } from '../utils/deep-clone';

const ETH_PREFIX = '_ETH';
export const ETH_SYMBOL = 'ETH';
export const ETH_NAME = 'Ethers';

export const appendEthToContractAddress = (contractAddress: string): string => {
  return `${contractAddress}${ETH_PREFIX}`;
};

export const removeEthFromContractAddress = (
  contractAddress: string
): string => {
  return contractAddress
    .replace(ETH_PREFIX, '')
    .replace(ETH_PREFIX.toLowerCase(), '');
};

export const isNativeEth = (contractAddress: string): boolean => {
  return contractAddress.includes(ETH_PREFIX);
};

export const turnTokenIntoEthForResponse = (
  token: Token,
  nativeCurrencyInfo: NativeCurrencyInfo | undefined
): Token => {
  const clone = deepClone(token);
  // clear down contract address
  clone.contractAddress = 'NO_CONTRACT_ADDRESS';
  if (nativeCurrencyInfo) {
    clone.symbol = nativeCurrencyInfo.symbol;
    clone.name = nativeCurrencyInfo.name;
  } else {
    clone.symbol = ETH_SYMBOL;
    clone.name = ETH_NAME;
  }

  return clone;
};

/**
 * ETH token info
 */
export class ETH {
  public static ZKSYNC_ERA(): Token {
    return {
      chainId: ChainId.ZKSYNC_ERA,
      contractAddress: appendEthToContractAddress(
        '0x0000000000000000000000000000000000000000'
      ),
      decimals: 18,
      symbol: ETH_SYMBOL,
      name: ETH_NAME,
    };
  }

  /**
   * Get ETH token info by chain id
   * @param chainId The chain id
   */
  public static info(
    chainId: ChainId | number,
    customNetworkNativeWrappedTokenInfo: Token | undefined = undefined
  ): Token {
    if (customNetworkNativeWrappedTokenInfo) {
      return {
        ...customNetworkNativeWrappedTokenInfo,
        contractAddress: appendEthToContractAddress(
          customNetworkNativeWrappedTokenInfo.contractAddress
        ),
      };
    }
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
