import BigNumber from 'bignumber.js';
import { Contract, ContractInterface, providers } from 'ethers';
import { ErrorCodes } from './common/errors/error-codes';
import { MuteSwitchError } from './common/errors/muteswitch-error';
import { ChainId, ChainNames } from './enums/chain-id';
import { CustomNetwork } from './factories/pair/models/custom-network';

export interface ChainIdAndProvider {
  chainId: ChainId;
  providerUrl?: string | undefined;
  customNetwork?: CustomNetwork | undefined;
}

export interface EthereumProvider {
  ethereumProvider: any;
  customNetwork?: CustomNetwork | undefined;
}

export class EthersProvider {
  private _ethersProvider:
    | providers.StaticJsonRpcProvider
    | providers.JsonRpcProvider
    | providers.InfuraProvider
    | providers.Web3Provider;
  constructor(private _providerContext: ChainIdAndProvider | EthereumProvider) {
    const chainId = (<ChainIdAndProvider>this._providerContext).chainId;
      const ethereumProvider = (<EthereumProvider>this._providerContext)
        .ethereumProvider;
      if (!ethereumProvider) {
        throw new MuteSwitchError(
          'Wrong ethers provider context',
          ErrorCodes.wrongEthersProviderContext
        );
      }

      if (ethereumProvider._isProvider) {
        this._ethersProvider = ethereumProvider;
      } else {
        this._ethersProvider = new providers.Web3Provider(ethereumProvider);
      }
    
  }

  /**
   * Get the chain name
   * @param chainId The chain id
   * @returns
   */
  private getChainName(chainId: number): string {
    if (this._providerContext.customNetwork) {
      return this._providerContext.customNetwork.nameNetwork;
    }

    const chainName = ChainNames.get(chainId);
    if (!chainName) {
      throw new MuteSwitchError(
        `Can not find chain name for ${chainId}. This lib only supports mainnet(1), ropsten(4), kovan(42), rinkeby(4) and görli(5)`,
        ErrorCodes.canNotFindChainId
      );
    }

    return chainName;
  }

  /**
   * Creates a contract instance
   * @param abi The ABI
   * @param contractAddress The contract address
   */
  public getContract<TGeneratedTypedContext>(
    abi: ContractInterface,
    contractAddress: string
  ): TGeneratedTypedContext {
    const contract = new Contract(contractAddress, abi, this._ethersProvider);

    return contract as unknown as TGeneratedTypedContext;
  }

  /**
   * Get the network
   */
  public network(): providers.Network {
    if (this._ethersProvider.network) {
      return this._ethersProvider.network;
    }

    // @ts-ignore
    if (this._ethersProvider.provider) {
      // @ts-ignore
      const chainId = this._ethersProvider.provider.chainId;
      if (chainId) {
        const chainIdNumber = new BigNumber(chainId).toNumber();
        const chainName = ChainNames.get(chainIdNumber);
        if (chainName) {
          return {
            chainId: chainIdNumber,
            name: chainName,
          };
        }
      }
    }

    throw new MuteSwitchError(
      'chainId can not be found on the provider',
      ErrorCodes.chainIdCanNotBeFound
    );
  }

  /**
   * Get the ethers provider
   */
  public get provider(): providers.BaseProvider {
    return this._ethersProvider;
  }

  /**
   * Get eth amount
   * @param ethereumAddress The ethereum address
   */
  public async balanceOf(ethereumAddress: string): Promise<string> {
    return (
      await this._ethersProvider.getBalance(ethereumAddress)
    ).toHexString();
  }

  /**
   * Get provider url
   */
  public getProviderUrl(): string | undefined {
    const ethereumProvider = (<EthereumProvider>this._providerContext)
      .ethereumProvider;
    if (ethereumProvider) {
      return undefined;
    }

    const providerUrl = (<ChainIdAndProvider>this._providerContext).providerUrl;
    if (providerUrl) {
      return providerUrl;
    }

    const chainId = (<ChainIdAndProvider>this._providerContext).chainId;

    switch (chainId) {
      case ChainId.ZKSYNC_ERA:
        return `https://mainnet.era.zksync.io/${this._getApiKey}`;
      case ChainId.ZKSYNC_ERA_TESTNET:
        return `https://testnet.era.zksync.dev/${this._getApiKey}`;
      default:
        return undefined;
    }
  }

  /**
   * Get the api key
   */
  private get _getApiKey(): string {
    return '';
  }
}
