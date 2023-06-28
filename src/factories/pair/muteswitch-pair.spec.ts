import { providers } from 'ethers';
import { ChainId, ErrorCodes, MuteSwitchError } from '../..';
import { ETH } from '../../common/tokens';
import { MockEthereumAddress } from '../../mocks/ethereum-address.mock';
import { MOCKFUN } from '../../mocks/fun-token.mock';
import { MOCK_PROVIDER_URL } from '../../mocks/provider-url.mock';
import { MOCKREP } from '../../mocks/rep-token.mock';
import {
  MuteSwitchPairContextForChainId,
  MuteSwitchPairContextForEthereumProvider,
  MuteSwitchPairContextForProviderUrl,
} from './models/muteswitch-pair-contexts';
import { MuteSwitchPair } from './muteswitch-pair';

describe('MuteSwitchPair', () => {
  it('should throw if no fromTokenContractAddress is passed in', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {};
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        'Must have a `fromTokenContractAddress` on the context',
        ErrorCodes.fromTokenContractAddressRequired
      )
    );
  });

  it('should throw if fromTokenContractAddress is invalid address', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: '1',
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        '`fromTokenContractAddress` is not a valid contract address',
        ErrorCodes.fromTokenContractAddressNotValid
      )
    );
  });

  it('should throw if no toTokenContractAddress is passed in', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        'Must have a `toTokenContractAddress` on the context',
        ErrorCodes.toTokenContractAddressRequired
      )
    );
  });

  it('should throw if toTokenContractAddress is invalid address', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: '1',
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        '`toTokenContractAddress` is not a valid contract address',
        ErrorCodes.toTokenContractAddressNotValid
      )
    );
  });

  it('should throw if no ethereumAddress is passed in', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        'Must have a `ethereumAddress` on the context',
        ErrorCodes.ethereumAddressRequired
      )
    );
  });

  it('should throw if ethereumAddress is invalid address', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
      ethereumAddress: '1',
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        '`ethereumAddress` is not a valid address',
        ErrorCodes.ethereumAddressNotValid
      )
    );
  });

  it('should throw if no chainId or ethereum provider passed in', () => {
    // @ts-ignore
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
      ethereumAddress: MockEthereumAddress(),
    };
    expect(() => new MuteSwitchPair(context)).toThrowError(
      new MuteSwitchError(
        'Your must supply a chainId or a ethereum provider please look at types `MuteSwitchPairContextForEthereumProvider`, `MuteSwitchPairContextForChainId` and `MuteSwitchPairContextForProviderUrl` to make sure your object is correct in what your passing in',
        ErrorCodes.invalidPairContext
      )
    );
  });

  it('should create ethers provider', () => {
    const context: MuteSwitchPairContextForChainId = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
      ethereumAddress: MockEthereumAddress(),
      chainId: ChainId.MAINNET,
    };

    const muteswitchPair = new MuteSwitchPair(context);

    //@ts-ignore
    expect(typeof muteswitchPair._ethersProvider).not.toBeUndefined();
  });

  it('should create ethers provider', () => {
    const context: MuteSwitchPairContextForProviderUrl = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
      ethereumAddress: MockEthereumAddress(),
      chainId: ChainId.MAINNET,
      providerUrl: MOCK_PROVIDER_URL(),
    };

    const muteswitchPair = new MuteSwitchPair(context);

    //@ts-ignore
    expect(typeof muteswitchPair._ethersProvider).not.toBeUndefined();
  });

  it('should create ethers provider', () => {
    const context: MuteSwitchPairContextForEthereumProvider = {
      fromTokenContractAddress: MOCKFUN().contractAddress,
      toTokenContractAddress: MOCKREP().contractAddress,
      ethereumAddress: MockEthereumAddress(),
      ethereumProvider: new providers.JsonRpcProvider(MOCK_PROVIDER_URL()),
    };

    const muteswitchPair = new MuteSwitchPair(context);

    //@ts-ignore
    expect(typeof muteswitchPair._ethersProvider).not.toBeUndefined();
  });

  describe('createFactory', () => {
    it('erc20 > erc20 > should create a muteswitch pair factory', async () => {
      const context: MuteSwitchPairContextForChainId = {
        fromTokenContractAddress: MOCKFUN().contractAddress,
        toTokenContractAddress: MOCKREP().contractAddress,
        ethereumAddress: MockEthereumAddress(),
        chainId: ChainId.MAINNET,
      };

      const muteswitchPair = new MuteSwitchPair(context);
      const factory = await muteswitchPair.createFactory();
      expect(factory.toToken).toEqual(MOCKREP());
      expect(factory.fromToken).toEqual(MOCKFUN());
    });

    it('eth > erc20 > should create a muteswitch pair factory', async () => {
      const context: MuteSwitchPairContextForChainId = {
        fromTokenContractAddress: ETH.MAINNET().contractAddress,
        toTokenContractAddress: MOCKREP().contractAddress,
        ethereumAddress: MockEthereumAddress(),
        chainId: ChainId.MAINNET,
      };

      const muteswitchPair = new MuteSwitchPair(context);
      const factory = await muteswitchPair.createFactory();
      expect(factory.toToken).toEqual(MOCKREP());
      expect(factory.fromToken).toEqual(ETH.MAINNET());
    });

    it('erc20 > eth > should create a muteswitch pair factory', async () => {
      const context: MuteSwitchPairContextForChainId = {
        fromTokenContractAddress: MOCKFUN().contractAddress,
        toTokenContractAddress: ETH.MAINNET().contractAddress,
        ethereumAddress: MockEthereumAddress(),
        chainId: ChainId.MAINNET,
      };

      const muteswitchPair = new MuteSwitchPair(context);
      const factory = await muteswitchPair.createFactory();
      expect(factory.toToken).toEqual(ETH.MAINNET());
      expect(factory.fromToken).toEqual(MOCKFUN());
    });
  });
});
