import {
  ChainId,
  ErrorCodes,
  ETH,
  MuteSwitchError,
  MuteSwitchPairFactory,
  MuteSwitchPairSettings,
} from '../..';
import { CoinGecko } from '../../coin-gecko';
import { EthersProvider } from '../../ethers-provider';
import { MockEthereumAddress } from '../../mocks/ethereum-address.mock';
import { MOCKFUN } from '../../mocks/fun-token.mock';
import { MOCK_PROVIDER_URL } from '../../mocks/provider-url.mock';
import { MOCKREP } from '../../mocks/rep-token.mock';
import { TradeDirection } from './models/trade-direction';
import { MuteSwitchPairFactoryContext } from './models/muteswitch-pair-factory-context';

describe('MuteSwitchPairFactory', () => {
  const ethersProvider = new EthersProvider({
    chainId: ChainId.MAINNET,
    providerUrl: MOCK_PROVIDER_URL(),
  });
  describe('erc20 > erc20', () => {
    const muteswitchPairFactoryContext: MuteSwitchPairFactoryContext = {
      fromToken: MOCKFUN(),
      toToken: MOCKREP(),
      ethereumAddress: MockEthereumAddress(),
      settings: new MuteSwitchPairSettings(),
      ethersProvider,
    };

    const muteswitchPairFactory = new MuteSwitchPairFactory(
      new CoinGecko(),
      muteswitchPairFactoryContext
    );

    it('`toToken` should retun correctly', () => {
      expect(muteswitchPairFactory.toToken).toEqual(
        muteswitchPairFactoryContext.toToken
      );
    });

    it('`fromToken` should retun correctly', () => {
      expect(muteswitchPairFactory.fromToken).toEqual(
        muteswitchPairFactoryContext.fromToken
      );
    });

    describe('trade', () => {
      it('should return trade info', async () => {
        const result = await muteswitchPairFactory.trade('1');
        expect(result).not.toBeUndefined();
      });
    });

    describe('findBestRoute', () => {
      describe(TradeDirection.input, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.input
          );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.output
          );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutesWithQuote', () => {
      describe(TradeDirection.input, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.input
            );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.output
            );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutes', () => {
      it('should return all possible routes', async () => {
        const result = await muteswitchPairFactory.findAllPossibleRoutes();
        expect(result).not.toBeUndefined();
      });
    });

    describe('allowance', () => {
      describe('v2', () => {
        it('should return more then 0', async () => {
          const factory = new MuteSwitchPairFactory(new CoinGecko(), {
            fromToken: MOCKFUN(),
            toToken: MOCKREP(),
            ethereumAddress: '0x5ab9d116a53ef41063e3eae26a7ebe736720e9ba',
            settings: new MuteSwitchPairSettings(),
            ethersProvider,
          });

          const result = await factory.allowance();
          expect(result).not.toEqual('0x00');
        });

        it('should return 0 allowance', async () => {
          const factory = new MuteSwitchPairFactory(new CoinGecko(), {
            fromToken: MOCKREP(),
            toToken: MOCKFUN(),
            ethereumAddress: MockEthereumAddress(),
            settings: new MuteSwitchPairSettings(),
            ethersProvider,
          });

          const result = await factory.allowance();
          expect(result).toEqual('0x00');
        });
      });
    });

    describe('generateApproveMaxAllowanceData', () => {
      describe('v2', () => {
        it('should generate the approve max allowance data', async () => {
          const result =
            await muteswitchPairFactory.generateApproveMaxAllowanceData(

            );
          expect(result).toEqual({
            data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            from: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
            to: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
            value: '0x00',
          });
        });
      });

      describe('v2', () => {
        it('should generate the approve max allowance data', async () => {
          const result =
            await muteswitchPairFactory.generateApproveMaxAllowanceData();
          expect(result).toEqual({
            data: '0x095ea7b3000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            from: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
            to: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
            value: '0x00',
          });
        });
      });
    });
  });

  describe('erc20 > eth', () => {
    const muteswitchPairFactoryContext: MuteSwitchPairFactoryContext = {
      fromToken: MOCKFUN(),
      toToken: ETH.MAINNET(),
      ethereumAddress: MockEthereumAddress(),
      settings: new MuteSwitchPairSettings(),
      ethersProvider,
    };

    const muteswitchPairFactory = new MuteSwitchPairFactory(
      new CoinGecko(),
      muteswitchPairFactoryContext
    );

    it('`toToken` should retun correctly', () => {
      expect(muteswitchPairFactory.toToken).toEqual(
        muteswitchPairFactoryContext.toToken
      );
    });

    it('`fromToken` should retun correctly', () => {
      expect(muteswitchPairFactory.fromToken).toEqual(
        muteswitchPairFactoryContext.fromToken
      );
    });

    describe('trade', () => {
      it('should return trade info', async () => {
        const result = await muteswitchPairFactory.trade('1');
        expect(result).not.toBeUndefined();
      });
    });

    describe('findBestRoute', () => {
      describe(TradeDirection.input, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.input
          );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.output
          );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutesWithQuote', () => {
      describe(TradeDirection.input, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.input
            );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.output
            );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutes', () => {
      it('should return all possible routes', async () => {
        const result = await muteswitchPairFactory.findAllPossibleRoutes();
        expect(result).not.toBeUndefined();
      });
    });

    describe('allowance', () => {
      describe('v2', () => {
        it('should return more then 0', async () => {
          const factory = new MuteSwitchPairFactory(new CoinGecko(), {
            fromToken: MOCKFUN(),
            toToken: ETH.MAINNET(),
            ethereumAddress: '0x5ab9d116a53ef41063e3eae26a7ebe736720e9ba',
            settings: new MuteSwitchPairSettings(),
            ethersProvider,
          });

          const result = await factory.allowance();
          expect(result).not.toEqual('0x00');
        });

        it('should return 0 allowance', async () => {
          const factory = new MuteSwitchPairFactory(new CoinGecko(), {
            fromToken: MOCKREP(),
            toToken: ETH.MAINNET(),
            ethereumAddress: MockEthereumAddress(),
            settings: new MuteSwitchPairSettings(),
            ethersProvider,
          });

          const result = await factory.allowance();
          expect(result).toEqual('0x00');
        });
      });
    });

    describe('generateApproveMaxAllowanceData', () => {
      describe('v2', () => {
        it('should generate the approve max allowance data', async () => {
          const result =
            await muteswitchPairFactory.generateApproveMaxAllowanceData(

            );
          expect(result).toEqual({
            data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            from: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
            to: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
            value: '0x00',
          });
        });
      });
    });
  });

  describe('eth > erc20', () => {
    const muteswitchPairFactoryContext: MuteSwitchPairFactoryContext = {
      fromToken: ETH.MAINNET(),
      toToken: MOCKFUN(),
      ethereumAddress: MockEthereumAddress(),
      settings: new MuteSwitchPairSettings(),
      ethersProvider,
    };

    const muteswitchPairFactory = new MuteSwitchPairFactory(
      new CoinGecko(),
      muteswitchPairFactoryContext
    );

    it('`toToken` should retun correctly', () => {
      expect(muteswitchPairFactory.toToken).toEqual(
        muteswitchPairFactoryContext.toToken
      );
    });

    it('`fromToken` should retun correctly', () => {
      expect(muteswitchPairFactory.fromToken).toEqual(
        muteswitchPairFactoryContext.fromToken
      );
    });

    describe('trade', () => {
      it('should return trade info', async () => {
        const result = await muteswitchPairFactory.trade('1');
        expect(result).not.toBeUndefined();
      });
    });

    describe('findBestRoute', () => {
      describe(TradeDirection.input, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.input
          );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return the best route', async () => {
          const result = await muteswitchPairFactory.findBestRoute(
            '1',
            TradeDirection.output
          );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutesWithQuote', () => {
      describe(TradeDirection.input, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.input
            );
          expect(result).not.toBeUndefined();
        });
      });

      describe(TradeDirection.output, () => {
        it('should return all possible routes with quotes', async () => {
          const result =
            await muteswitchPairFactory.findAllPossibleRoutesWithQuote(
              '1',
              TradeDirection.output
            );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('findAllPossibleRoutes', () => {
      it('should return all possible routes', async () => {
        const result = await muteswitchPairFactory.findAllPossibleRoutes();
        expect(result).not.toBeUndefined();
      });
    });

    describe('allowance', () => {
      describe('v2', () => {
        it('should always return max hex', async () => {
          const result = await muteswitchPairFactory.allowance();
          expect(result).toEqual(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          );
        });
      });
    });

    describe('generateApproveMaxAllowanceData', () => {
      describe('v2', () => {
        it('should throw when generating the approve max allowance data', async () => {
          await expect(
            muteswitchPairFactory.generateApproveMaxAllowanceData(

            )
          ).rejects.toThrowError(
            new MuteSwitchError(
              'You do not need to generate approve muteswitch allowance when doing eth > erc20',
              ErrorCodes.generateApproveMaxAllowanceDataNotAllowed
            )
          );
        });
      });
    });
  });
});
