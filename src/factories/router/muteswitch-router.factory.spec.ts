import BigNumber from 'bignumber.js';
import {
  ChainId,
  ErrorCodes,
  ETH,
  MuteSwitchError,
  MuteSwitchPairSettings,
} from '../..';
import { CoinGecko } from '../../coin-gecko';
import { EthersProvider } from '../../ethers-provider';
import { MOCKAAVE } from '../../mocks/aave-token.mock';
import { MockEthereumAddress } from '../../mocks/ethereum-address.mock';
import { MOCKFUN } from '../../mocks/fun-token.mock';
import { MOCKREP } from '../../mocks/rep-token.mock';
import { MOCKUNI } from '../../mocks/uni-token.mock';
import { TradeDirection } from '../pair/models/trade-direction';
import { MuteSwitchRouterFactory } from './muteswitch-router.factory';

describe('MuteSwitchRouterFactory', () => {
  const ethersProvider = new EthersProvider({ chainId: ChainId.MAINNET });

  describe('erc20 > erc20', () => {
    const fromToken = MOCKAAVE();
    const toToken = MOCKUNI();

    const muteswitchRouterFactory = new MuteSwitchRouterFactory(
      new CoinGecko(),
      MockEthereumAddress(),
      fromToken,
      toToken,
      new MuteSwitchPairSettings(),
      ethersProvider
    );

    describe('getAllPossibleRoutes', () => {
      describe('v2', () => {
        it('should get all possible routes', async () => {
          const result = await muteswitchRouterFactory.getAllPossibleRoutes();
          expect(result.length > 0).toEqual(true);
          expect(
            result.filter((c) => c.route.length > 2).length > 0
          ).toEqual(true);
        });

        it('should only return direct routes (in this case return nothing as there is no direct route)', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({ disableMultihops: true }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutes();
          expect(
            result.filter((c) => c.route.length > 2).length === 0
          ).toEqual(true);
        });
      });

    });

    describe('getAllPossibleRoutesWithQuotes', () => {
      describe(TradeDirection.input, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.input
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes (in this case return nothing as there is no direct route)', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({ disableMultihops: true }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.input
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length === 0
          ).toEqual(true);
        });
      });

      describe(TradeDirection.output, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.output
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes (in this case return nothing as there is no direct route)', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({ disableMultihops: true }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.output
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length === 0
          ).toEqual(true);
        });
      });
    });

    describe('findBestRoute', () => {
      describe('v2', () => {
        describe(TradeDirection.input, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              MOCKFUN(),
              MOCKREP(),
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(10000),
              TradeDirection.input
            );
            expect(result.bestRouteQuote.routeText).toEqual('FUN > WETH > REP');
          });
        });

        describe(TradeDirection.output, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              MOCKFUN(),
              MOCKREP(),
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(50),
              TradeDirection.output
            );
            expect(result.bestRouteQuote.routeText).toEqual('FUN > WETH > REP');
          });
        });
      });


      describe(TradeDirection.input, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(10000),
            TradeDirection.input
          );
          if (result.bestRouteQuote) {
            expect(result.bestRouteQuote.routeText).toEqual(
              'AAVE > WETH > UNI'
            );
          } else {
            expect(result.bestRouteQuote.routeText).toEqual('AAVE > UNI');
          }
        });

        it('should throw an error as there is no best route with disableMultihops turned on', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            MOCKFUN(),
            MOCKREP(),
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          await expect(
            factory.findBestRoute(new BigNumber(100), TradeDirection.input)
          ).rejects.toThrowError(
            new MuteSwitchError(
              `No routes found for ${MOCKFUN().symbol} > ${MOCKREP().symbol}`,
              ErrorCodes.noRoutesFound
            )
          );
        });
      });

      describe(TradeDirection.output, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(1000),
            TradeDirection.output
          );
          if (result.bestRouteQuote) {
            expect(result.bestRouteQuote.routeText).toEqual(
              'AAVE > WETH > UNI'
            );
          } else {
            expect(result.bestRouteQuote.routeText).toEqual('AAVE > UNI');
          }
        });

        it('should throw an error as there is no best route with disableMultihops turned on', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            MOCKFUN(),
            MOCKREP(),
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          await expect(
            factory.findBestRoute(new BigNumber(100), TradeDirection.output)
          ).rejects.toThrowError(
            new MuteSwitchError(
              `No routes found for ${MOCKFUN().symbol} > ${MOCKREP().symbol}`,
              ErrorCodes.noRoutesFound
            )
          );
        });
      });
    });
  });

  describe('erc20 > eth', () => {
    const fromToken = MOCKAAVE();
    const toToken = ETH.MAINNET();

    const muteswitchRouterFactory = new MuteSwitchRouterFactory(
      new CoinGecko(),
      MockEthereumAddress(),
      fromToken,
      toToken,
      new MuteSwitchPairSettings(),
      ethersProvider
    );

    describe('getAllPossibleRoutes', () => {
      describe('v2', () => {
        it('should get all possible routes', async () => {
          const result = await muteswitchRouterFactory.getAllPossibleRoutes();
          expect(result.length > 0).toEqual(true);
          expect(
            result.filter((c) => c.route.length > 2).length > 0
          ).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutes();
          expect(result.length === 1).toEqual(true);
          expect(result[0].route[0]).toEqual(fromToken);
          expect(result[0].route[1]).toEqual(toToken);
          expect(
            result.filter((c) => c.route.length > 2).length > 0
          ).toEqual(false);
        });
      });

    });

    describe('getAllPossibleRoutesWithQuotes', () => {
      describe(TradeDirection.output, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.output
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({ disableMultihops: true }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.output
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length > 0
          ).toEqual(false);
        });
      });

      describe(TradeDirection.input, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.input
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({ disableMultihops: true }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.input
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length > 0
          ).toEqual(false);
        });
      });
    });

    describe('findBestRoute', () => {
      describe('v2', () => {
        describe(TradeDirection.input, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              MOCKFUN(),
              toToken,
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(10000000),
              TradeDirection.input
            );
            expect(result.bestRouteQuote.routeText).not.toBeUndefined();
          });
        });

        describe(TradeDirection.output, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              MOCKFUN(),
              toToken,
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(1),
              TradeDirection.output
            );
            expect(result.bestRouteQuote.routeText).toEqual('FUN > ETH');
          });
        });
      });


      describe(TradeDirection.input, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(100),
            TradeDirection.input
          );
          expect(result.bestRouteQuote.routeText).not.toBeUndefined();
        });

        it('should return best route', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings(),
            ethersProvider
          );

          const result = await factory.findBestRoute(
            new BigNumber(100),
            TradeDirection.input
          );

          expect(result.bestRouteQuote.routeText).toEqual('AAVE > ETH');
          expect(
            result.triedRoutesQuote.filter((c) => c.routePathArray.length > 2)
              .length > 0
          ).toEqual(true);
        });
      });

      describe(TradeDirection.output, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(100),
            TradeDirection.output
          );
          expect(result.bestRouteQuote.routeText).toEqual('AAVE > ETH');
        });

        it('should return best route', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings(),
            ethersProvider
          );

          const result = await factory.findBestRoute(
            new BigNumber(100),
            TradeDirection.output
          );

          expect(result.bestRouteQuote.routeText).toEqual('AAVE > ETH');
          expect(
            result.triedRoutesQuote.filter((c) => c.routePathArray.length > 2)
              .length > 0
          ).toEqual(false);
        });
      });
    });
  });

  describe('eth > erc20', () => {
    const fromToken = ETH.MAINNET();
    const toToken = MOCKAAVE();

    const muteswitchRouterFactory = new MuteSwitchRouterFactory(
      new CoinGecko(),
      MockEthereumAddress(),
      fromToken,
      toToken,
      new MuteSwitchPairSettings(),
      ethersProvider
    );

    describe('getAllPossibleRoutes', () => {
      describe('v2', () => {
        it('should get all possible routes', async () => {
          const result = await muteswitchRouterFactory.getAllPossibleRoutes();
          expect(result.length > 0).toEqual(true);
          expect(
            result.filter((c) => c.route.length > 2).length > 0
          ).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutes();
          expect(result.length === 1).toEqual(true);
          expect(result[0].route[0]).toEqual(fromToken);
          expect(result[0].route[1]).toEqual(toToken);
          expect(
            result.filter((c) => c.route.length > 2).length === 0
          ).toEqual(true);
        });
      });
    });

    describe('getAllPossibleRoutesWithQuotes', () => {
      describe(TradeDirection.input, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.input
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.input
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length > 0
          ).toEqual(false);
        });
      });
      describe(TradeDirection.output, () => {
        it('should get all possible routes with quote', async () => {
          const result =
            await muteswitchRouterFactory.getAllPossibleRoutesWithQuotes(
              new BigNumber(1),
              TradeDirection.output
            );
          expect(result.length > 0).toEqual(true);
        });

        it('should only return direct routes', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings({
              disableMultihops: true,
            }),
            ethersProvider
          );

          const result = await factory.getAllPossibleRoutesWithQuotes(
            new BigNumber(1),
            TradeDirection.output
          );
          expect(
            result.filter((c) => c.routePathArray.length > 2).length > 0
          ).toEqual(false);
        });
      });
    });

    describe('findBestRoute', () => {
      describe('v2', () => {
        describe(TradeDirection.input, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              fromToken,
              MOCKFUN(),
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(10000),
              TradeDirection.input
            );
            expect(result.bestRouteQuote.routeText).not.toBeUndefined();
          });
        });

        describe(TradeDirection.output, () => {
          it('should find best route', async () => {
            const factory = new MuteSwitchRouterFactory(
              new CoinGecko(),
              MockEthereumAddress(),
              fromToken,
              MOCKFUN(),
              new MuteSwitchPairSettings(),
              ethersProvider
            );

            const result = await factory.findBestRoute(
              new BigNumber(10000),
              TradeDirection.output
            );
            expect(result.bestRouteQuote.routeText).toEqual('ETH > FUN');
          });
        });
      });

      describe(TradeDirection.input, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(100),
            TradeDirection.input
          );
          expect(result.bestRouteQuote.routeText).not.toBeUndefined();
        });

        it('should return best route', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings(),
            ethersProvider
          );

          const result = await factory.findBestRoute(
            new BigNumber(100),
            TradeDirection.input
          );

          expect(result.bestRouteQuote.routeText).toEqual('ETH > AAVE');
        });
      });

      describe(TradeDirection.output, () => {
        it('should find best route', async () => {
          const result = await muteswitchRouterFactory.findBestRoute(
            new BigNumber(100),
            TradeDirection.output
          );
          expect(result.bestRouteQuote.routeText).toEqual('ETH > AAVE');
        });

        it('should return best route', async () => {
          const factory = new MuteSwitchRouterFactory(
            new CoinGecko(),
            MockEthereumAddress(),
            fromToken,
            toToken,
            new MuteSwitchPairSettings(),
            ethersProvider
          );

          const result = await factory.findBestRoute(
            new BigNumber(100),
            TradeDirection.output
          );

          expect(result.bestRouteQuote.routeText).toEqual('ETH > AAVE');
        });
      });
    });
  });
});
