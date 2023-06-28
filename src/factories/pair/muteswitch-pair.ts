import { CoinGecko } from '../../coin-gecko';
import { ErrorCodes } from '../../common/errors/error-codes';
import { MuteSwitchError } from '../../common/errors/muteswitch-error';
import { getAddress } from '../../common/utils/get-address';
import { isAddress } from '../../common/utils/is-address';
import { ChainId } from '../../enums/chain-id';
import { EthersProvider } from '../../ethers-provider';
import { TokensFactory } from '../token/tokens.factory';
import {
  MuteSwitchPairContextForChainId,
  MuteSwitchPairContextForEthereumProvider,
  MuteSwitchPairContextForProviderUrl,
} from './models/muteswitch-pair-contexts';
import { MuteSwitchPairFactoryContext } from './models/muteswitch-pair-factory-context';
import { MuteSwitchPairSettings } from './models/muteswitch-pair-settings';
import { MuteSwitchPairFactory } from './muteswitch-pair.factory';

export class MuteSwitchPair {
  private _ethersProvider: EthersProvider;

  constructor(
    private _muteswitchPairContext:
      | MuteSwitchPairContextForChainId
      | MuteSwitchPairContextForProviderUrl
      | MuteSwitchPairContextForEthereumProvider
  ) {
    if (!this._muteswitchPairContext.fromTokenContractAddress) {
      throw new MuteSwitchError(
        'Must have a `fromTokenContractAddress` on the context',
        ErrorCodes.fromTokenContractAddressRequired
      );
    }

    if (!isAddress(this._muteswitchPairContext.fromTokenContractAddress)) {
      throw new MuteSwitchError(
        '`fromTokenContractAddress` is not a valid contract address',
        ErrorCodes.fromTokenContractAddressNotValid
      );
    }

    this._muteswitchPairContext.fromTokenContractAddress = getAddress(
      this._muteswitchPairContext.fromTokenContractAddress,
      true
    );

    if (!this._muteswitchPairContext.toTokenContractAddress) {
      throw new MuteSwitchError(
        'Must have a `toTokenContractAddress` on the context',
        ErrorCodes.toTokenContractAddressRequired
      );
    }

    if (!isAddress(this._muteswitchPairContext.toTokenContractAddress)) {
      throw new MuteSwitchError(
        '`toTokenContractAddress` is not a valid contract address',
        ErrorCodes.toTokenContractAddressNotValid
      );
    }

    this._muteswitchPairContext.toTokenContractAddress = getAddress(
      this._muteswitchPairContext.toTokenContractAddress,
      true
    );

    if (!this._muteswitchPairContext.ethereumAddress) {
      throw new MuteSwitchError(
        'Must have a `ethereumAddress` on the context',
        ErrorCodes.ethereumAddressRequired
      );
    }

    if (!isAddress(this._muteswitchPairContext.ethereumAddress)) {
      throw new MuteSwitchError(
        '`ethereumAddress` is not a valid address',
        ErrorCodes.ethereumAddressNotValid
      );
    }

    this._muteswitchPairContext.ethereumAddress = getAddress(
      this._muteswitchPairContext.ethereumAddress
    );

    const chainId = (<MuteSwitchPairContextForChainId>this._muteswitchPairContext)
      .chainId;

    const providerUrl = (<MuteSwitchPairContextForProviderUrl>(
      this._muteswitchPairContext
    )).providerUrl;

    if (providerUrl && chainId) {
      this._ethersProvider = new EthersProvider({
        chainId,
        providerUrl,
        customNetwork: this._muteswitchPairContext.settings?.customNetwork,
      });
      return;
    }

    if (chainId) {
      this._ethersProvider = new EthersProvider({ chainId });
      return;
    }

    const ethereumProvider = (<MuteSwitchPairContextForEthereumProvider>(
      this._muteswitchPairContext
    )).ethereumProvider;

    if (ethereumProvider) {
      this._ethersProvider = new EthersProvider({
        ethereumProvider,
        customNetwork: this._muteswitchPairContext.settings?.customNetwork,
      });
      return;
    }

    throw new MuteSwitchError(
      'Your must supply a chainId or a ethereum provider please look at types `MuteSwitchPairContextForEthereumProvider`, `MuteSwitchPairContextForChainId` and `MuteSwitchPairContextForProviderUrl` to make sure your object is correct in what your passing in',
      ErrorCodes.invalidPairContext
    );
  }

  /**
   * Create factory to be able to call methods on the 2 tokens
   */
  public async createFactory(): Promise<MuteSwitchPairFactory> {
    if (this._muteswitchPairContext.settings?.customNetwork === undefined) {
      const chainId = this._ethersProvider.network().chainId;
      if (chainId !== ChainId.ZKSYNC_ERA && chainId !== ChainId.ZKSYNC_ERA_TESTNET ) {
        throw new MuteSwitchError(
          `ChainId - ${chainId} is not supported. This lib only supports zksync era(324), zksync era testnet(280)`,
          ErrorCodes.chainIdNotSupported
        );
      }
    }

    const tokensFactory = new TokensFactory(
      this._ethersProvider,
      this._muteswitchPairContext.settings?.customNetwork
    );
    const tokens = await tokensFactory.getTokens([
      this._muteswitchPairContext.fromTokenContractAddress,
      this._muteswitchPairContext.toTokenContractAddress,
    ]);

    const muteswitchFactoryContext: MuteSwitchPairFactoryContext = {
      fromToken: tokens.find(
        (t) =>
          t.contractAddress.toLowerCase() ===
          this._muteswitchPairContext.fromTokenContractAddress.toLowerCase()
      )!,
      toToken: tokens.find(
        (t) =>
          t.contractAddress.toLowerCase() ===
          this._muteswitchPairContext.toTokenContractAddress.toLowerCase()
      )!,
      ethereumAddress: this._muteswitchPairContext.ethereumAddress,
      settings: this._muteswitchPairContext.settings || new MuteSwitchPairSettings(),
      ethersProvider: this._ethersProvider,
    };

    return new MuteSwitchPairFactory(new CoinGecko(), muteswitchFactoryContext);
  }
}
