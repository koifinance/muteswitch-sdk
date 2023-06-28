import { ChainId, ErrorCodes, MuteSwitchError } from '.';
import { ContractContext as PairContractContext } from './ABI/types/muteswitch-pair';
import { EthersProvider } from './ethers-provider';
import { MockEthereumAddress } from './mocks/ethereum-address.mock';
import { MOCK_PROVIDER_URL } from './mocks/provider-url.mock';
import { MuteSwitchContractContextV2 } from './muteswitch-contract-context/muteswitch-contract-context';

describe('EthersProvider', () => {
  describe('with chain id', () => {
    const ethersProvider = new EthersProvider({ chainId: ChainId.MAINNET });

    it('getContract', () => {
      const result = ethersProvider.getContract<PairContractContext>(
        JSON.stringify(MuteSwitchContractContextV2.pairAbi),
        MuteSwitchContractContextV2.pairAddress
      );

      expect(result).not.toBeUndefined();
    });

    it('network', () => {
      const result = ethersProvider.network();

      expect(result.chainId).toEqual(ChainId.MAINNET);
    });

    it('provider', () => {
      const result = ethersProvider.provider;

      expect(result.network.chainId).toEqual(ChainId.MAINNET);
    });

    it('balanceOf', () => {
      const result = ethersProvider.balanceOf(MockEthereumAddress());

      expect(result).not.toBeUndefined();
    });
  });

  describe('with chain id and providerUrl', () => {
    const ethersProvider = new EthersProvider({
      chainId: ChainId.MAINNET,
      providerUrl: MOCK_PROVIDER_URL(),
    });

    it('should throw error if chainId not be found', () => {
      expect(() => {
        new EthersProvider({
          chainId: 10293,
          providerUrl: MOCK_PROVIDER_URL(),
        });
      }).toThrowError(
        new MuteSwitchError(
          'Can not find chain name for 10293. This lib only supports mainnet(1), ropsten(4), kovan(42), rinkeby(4) and görli(5)',
          ErrorCodes.canNotFindChainId
        )
      );
    });

    it('getContract', () => {
      const result = ethersProvider.getContract<PairContractContext>(
        JSON.stringify(MuteSwitchContractContextV2.pairAbi),
        MuteSwitchContractContextV2.pairAddress
      );

      expect(result).not.toBeUndefined();
    });

    it('network', () => {
      const result = ethersProvider.network();

      expect(result.chainId).toEqual(ChainId.MAINNET);
    });

    it('provider', () => {
      const result = ethersProvider.provider;

      expect(result.network.chainId).toEqual(ChainId.MAINNET);
    });

    it('balanceOf', () => {
      const result = ethersProvider.balanceOf(MockEthereumAddress());

      expect(result).not.toBeUndefined();
    });
  });
});
