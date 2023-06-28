import BigNumber from 'bignumber.js';
import {
  CallReturnContext,
  ContractCallContext,
  ContractCallResults,
} from 'ethereum-multicall';
import { CoinGecko } from '../../coin-gecko';
import { Constants } from '../../common/constants';
import { ErrorCodes } from '../../common/errors/error-codes';
import { MuteSwitchError } from '../../common/errors/muteswitch-error';
//import { DAI } from '../../common/tokens/dai';
import {
  ETH_SYMBOL,
  isNativeEth,
  removeEthFromContractAddress,
  turnTokenIntoEthForResponse,
} from '../../common/tokens/eth';
import { USDC } from '../../common/tokens/usdc';
import { WBTC } from '../../common/tokens/wbtc';
import { WETHContract } from '../../common/tokens/weth';
import { deepClone } from '../../common/utils/deep-clone';
import { formatEther } from '../../common/utils/format-ether';
import { hexlify } from '../../common/utils/hexlify';
import { onlyUnique } from '../../common/utils/only-unique';
import { parseEther } from '../../common/utils/parse-ether';
import { toEthersBigNumber } from '../../common/utils/to-ethers-big-number';
import { getTradePath } from '../../common/utils/trade-path';
import { CustomMulticall } from '../../custom-multicall';
import { ChainId } from '../../enums/chain-id';
import { TradePath } from '../../enums/trade-path';
import { EthersProvider } from '../../ethers-provider';
import { muteswitchContracts } from '../../muteswitch-contract-context/get-muteswitch-contracts';
import { MuteSwitchContractContext } from '../../muteswitch-contract-context/muteswitch-contract-context';
import { TradeDirection } from '../pair/models/trade-direction';
import { Transaction } from '../pair/models/transaction';
import { MuteSwitchPairSettings } from '../pair/models/muteswitch-pair-settings';
import { AllowanceAndBalanceOf } from '../token/models/allowance-balance-of';
import { Token } from '../token/models/token';
import { TokensFactory } from '../token/tokens.factory';
import { RouterDirection } from './enums/router-direction';
import { BestRouteQuotes } from './models/best-route-quotes';
import { RouteContext } from './models/route-context';
import { RouteQuote } from './models/route-quote';
import { RouteQuoteTradeContext } from './models/route-quote-trade-context';
import { TokenRoutes } from './models/token-routes';
import { MuteSwitchRouterContractFactory } from './v2/muteswitch-router-contract.factory';

export class MuteSwitchRouterFactory {
  private _multicall = new CustomMulticall(
    this._ethersProvider.provider,
    this._settings?.customNetwork?.multicallContractAddress
  );

  private _MuteSwitchRouterContractFactory = new MuteSwitchRouterContractFactory(
    this._ethersProvider,
    muteswitchContracts.getRouterAddress(
      this._settings.cloneMuteSwitchContractDetails
    )
  );


  private _tokensFactory = new TokensFactory(
    this._ethersProvider,
    this._settings.customNetwork,
    this._settings.cloneMuteSwitchContractDetails
  );

  private _cachePossibleRoutes: RouteContext[] | undefined;

  constructor(
    private _coinGecko: CoinGecko,
    private _ethereumAddress: string,
    private _fromToken: Token,
    private _toToken: Token,
    private _settings: MuteSwitchPairSettings,
    private _ethersProvider: EthersProvider
  ) {}

  /**
   * Get all possible routes will only go up to 4 due to gas increase the more routes
   * you go.
   */
  public async getAllPossibleRoutes(): Promise<RouteContext[]> {
    let findPairs: Token[][][] = [];

    if(this._cachePossibleRoutes)
      return this._cachePossibleRoutes;

    if (!this._settings.disableMultihops) {
      findPairs = [
        this.mainCurrenciesPairsForFromToken,
        this.mainCurrenciesPairsForToToken,
        //this.mainCurrenciesPairsForDAI,
        this.mainCurrenciesPairsForUSDC,
        this.mainCurrenciesPairsForWETH,
        this.mainCurrenciesPairsForWBTC,
        [[this._fromToken, this._toToken]],
      ];
    } else {
      // multihops turned off so only go direct
      findPairs = [[[this._fromToken, this._toToken]]];
    }

    // console.log(JSON.stringify(findPairs, null, 4));

    const contractCallContext: ContractCallContext[] = [];

    {
      contractCallContext.push({
        reference: 'main',
        contractAddress: muteswitchContracts.getPairAddress(
          this._settings.cloneMuteSwitchContractDetails
        ),
        abi: MuteSwitchContractContext.pairAbi,
        calls: [],
      });

      for (let pairs = 0; pairs < findPairs.length; pairs++) {
        for (
          let tokenPairs = 0;
          tokenPairs < findPairs[pairs].length;
          tokenPairs++
        ) {
          const fromToken = findPairs[pairs][tokenPairs][0];
          const toToken = findPairs[pairs][tokenPairs][1];

          // vol pair
          contractCallContext[0].calls.push({
            reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-false`,
            methodName: 'getPair',
            methodParameters: [
              removeEthFromContractAddress(fromToken.contractAddress),
              removeEthFromContractAddress(toToken.contractAddress),
              false
            ],
          });

          //stable pair
          contractCallContext[0].calls.push({
            reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-true`,
            methodName: 'getPair',
            methodParameters: [
              removeEthFromContractAddress(fromToken.contractAddress),
              removeEthFromContractAddress(toToken.contractAddress),
              true
            ],
          });
        }
      }
    }

    var allPossibleRoutes: RouteContext[] = [];

    const contractCallResults = await this._multicall.call(contractCallContext);

    {
      const results = contractCallResults.results['main'];

      const availablePairs = results.callsReturnContext.filter(
        (c) =>
          c.returnValues[0] !== '0x0000000000000000000000000000000000000000'
      );

      // console.log(JSON.stringify(results.callsReturnContext, null, 4));

      const fromTokenRoutes: TokenRoutes = {
        token: this._fromToken,
        pairs: {
          fromTokenPairs: this.getTokenAvailablePairs(
            this._fromToken,
            availablePairs,
            RouterDirection.from
          )
        },
      };

      const toTokenRoutes: TokenRoutes = {
        token: this._toToken,
        pairs: {
          toTokenPairs: this.getTokenAvailablePairs(
            this._toToken,
            availablePairs,
            RouterDirection.to
          )
        },
      };

      // console.log(JSON.stringify(fromTokenRoutes, null, 4));
      // console.log('break');
      // console.log(JSON.stringify(toTokenRoutes, null, 4));
      // console.log('break');

      const allMainRoutes: TokenRoutes[] = [];

      for (let i = 0; i < this.allMainTokens.length; i++) {
        const fromTokenPairs = this.getTokenAvailablePairs(
          this.allMainTokens[i],
          availablePairs,
          RouterDirection.from
        );

        const toTokenPairs = this.getTokenAvailablePairs(
          this.allMainTokens[i],
          availablePairs,
          RouterDirection.to
        );

        allMainRoutes.push({
          token: this.allMainTokens[i],
          pairs: {
            fromTokenPairs,
            toTokenPairs,
            },
        });
      }

      // console.log(JSON.stringify(allMainRoutes, null, 4));

      allPossibleRoutes = await this.workOutAllPossibleRoutes(
        fromTokenRoutes,
        toTokenRoutes,
        allMainRoutes
      );
    }

    // console.log(JSON.stringify(allPossibleRoutes, null, 4));
    this._cachePossibleRoutes = allPossibleRoutes;
    return this._cachePossibleRoutes;
  }

  /**
   * Get all possible routes with the quotes
   * @param amountToTrade The amount to trade
   * @param direction The direction you want to get the quote from
   */
  public async getAllPossibleRoutesWithQuotes(
    amountToTrade: BigNumber,
    direction: TradeDirection
  ): Promise<RouteQuote[]> {
    const tradeAmount = this.formatAmountToTrade(amountToTrade, direction);

    const routes = await this.getAllPossibleRoutes();

    const contractCallContext: ContractCallContext<RouteContext[]>[] = [];
    {
      contractCallContext.push({
        reference: 'main',
        contractAddress: muteswitchContracts.getRouterAddress(
          this._settings.cloneMuteSwitchContractDetails
        ),
        abi: MuteSwitchContractContext.routerAbi,
        calls: [],
        context: routes,
      });

      for (let i = 0; i < routes.length; i++) {
        const routeCombo = routes[i].route.map((c) => {
          return removeEthFromContractAddress(c.contractAddress);
        });


        contractCallContext[0].calls.push({
          reference: `route${i}`,
          methodName: direction === TradeDirection.input
              ? 'getAmountsOutExpanded'
              : 'getAmountsIn',
          methodParameters: [tradeAmount, routeCombo],
      });

      /*
        //ignore stable pools (tend to break with tiny amounts)
        if(amountToTrade.lte(0.1)){
          contractCallContext[0].calls.push({
              reference: `route${i}`,
              methodName: direction === TradeDirection.input
                  ? 'getAmountsOut'
                  : 'getAmountsIn',
              methodParameters: [tradeAmount, routeCombo, [false, false, false, false]],
          });
      } else {
          contractCallContext[0].calls.push({
              reference: `route${i}`,
              methodName: direction === TradeDirection.input
                  ? 'getAmountsOutExpanded'
                  : 'getAmountsIn',
              methodParameters: [tradeAmount, routeCombo],
          });
      }
      */

      }
    }

    const contractCallResults = await this._multicall.call(contractCallContext);

    return this.buildRouteQuotesFromResults(
      amountToTrade,
      contractCallResults,
      direction
    );
  }

  /**
   * Finds the best route
   * @param amountToTrade The amount they want to trade
   * @param direction The direction you want to get the quote from
   */
  public async findBestRoute(
    amountToTrade: BigNumber,
    direction: TradeDirection
  ): Promise<BestRouteQuotes> {
    let allRoutes = await this.getAllPossibleRoutesWithQuotes(
      amountToTrade,
      direction
    );

    if (allRoutes.length === 0) {
      throw new MuteSwitchError(
        `No routes found for ${this._fromToken.symbol} > ${this._toToken.symbol}`,
        ErrorCodes.noRoutesFound
      );
    }

    const allowanceAndBalances = await this.hasEnoughAllowanceAndBalance(
      amountToTrade,
      allRoutes[0],
      direction
    );


    return {
      bestRouteQuote: allRoutes[0],
      triedRoutesQuote: allRoutes.map((route) => {
        return {
          expectedConvertQuote: route.expectedConvertQuote,
          expectedConvertQuoteOrTokenAmountInMaxWithSlippage:
            route.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
          transaction: route.transaction,
          tradeExpires: route.tradeExpires,
          routePathArrayTokenMap: route.routePathArrayTokenMap,
          routeText: route.routeText,
          expectedAmounts: route.expectedAmounts,
          routePathArray: route.routePathArray,
          liquidityProviderFee: route.liquidityProviderFee,
          stable: route.stable,
          quoteDirection: route.quoteDirection,
          gasPriceEstimatedBy: route.gasPriceEstimatedBy,
        };
      }),
      hasEnoughBalance: allowanceAndBalances.enoughBalance,
      fromBalance: allowanceAndBalances.fromBalance,
      toBalance: allowanceAndBalances.toBalance,
      hasEnoughAllowance: allowanceAndBalances.enoughAllowance
    };
  }

  /**
   * Generates the trade datetime unix time
   */
  public generateTradeDeadlineUnixTime(): number {
    const now = new Date();
    const expiryDate = new Date(
      now.getTime() + this._settings.deadlineMinutes * 60000
    );
    return (expiryDate.getTime() / 1e3) | 0;
  }

  /**
   * Get eth balance
   */
  public async getEthBalance(): Promise<BigNumber> {
    const balance = await this._ethersProvider.balanceOf(this._ethereumAddress);

    return new BigNumber(balance).shiftedBy(Constants.ETH_MAX_DECIMALS * -1);
  }

  /**
   * Generate trade data eth > erc20
   * @param ethAmountIn The eth amount in
   * @param tokenAmount The token amount
   * @param routeQuoteTradeContext The route quote trade context
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataEthToErc20Input(
    ethAmountIn: BigNumber,
    tokenAmount: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    // muteswitch adds extra digits on even if the token is say 8 digits long
    const convertedMinTokens = tokenAmount
      .shiftedBy(this._toToken.decimals)
      .decimalPlaces(0);

        return this._MuteSwitchRouterContractFactory.swapExactETHForTokens(
          hexlify(convertedMinTokens),
          routeQuoteTradeContext.routePathArray.map((r) =>
            removeEthFromContractAddress(r)
          ),
          this._ethereumAddress,
          deadline,
          [false]
        );


  }

  /**
   * Generate trade data eth > erc20
   * @param tokenAmountInMax The amount in max
   * @param ethAmountOut The amount to receive
   * @param routeQuote The route quote
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataEthToErc20Output(
    ethAmountInMax: BigNumber,
    tokenAmountOut: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    const amountOut = tokenAmountOut
      .shiftedBy(this._toToken.decimals)
      .decimalPlaces(0);

        return this._MuteSwitchRouterContractFactory.swapETHForExactTokens(
          hexlify(amountOut),
          routeQuoteTradeContext.routePathArray.map((r) =>
            removeEthFromContractAddress(r)
          ),
          this._ethereumAddress,
          deadline,
          [false]
        );


  }

  /**
   * Generate trade amount erc20 > eth for input direction
   * @param tokenAmount The amount in
   * @param ethAmountOutMin The min amount to receive
   * @param routeQuoteTradeContext The route quote trade context
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataErc20ToEthInput(
    tokenAmount: BigNumber,
    ethAmountOutMin: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    // muteswitch adds extra digits on even if the token is say 8 digits long
    const amountIn = tokenAmount
      .shiftedBy(this._fromToken.decimals)
      .decimalPlaces(0);


        return this._MuteSwitchRouterContractFactory.swapExactTokensForETH(
          hexlify(amountIn),
          hexlify(parseEther(ethAmountOutMin)),
          routeQuoteTradeContext.routePathArray.map((r) =>
            removeEthFromContractAddress(r)
          ),
          this._ethereumAddress,
          deadline,
          [false]
        );

  }

  /**
   * Generate trade amount erc20 > eth for input direction
   * @param tokenAmountInMax The amount in max
   * @param ethAmountOut The amount to receive
   * @param routeQuoteTradeContext The route quote trade context
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataErc20ToEthOutput(
    tokenAmountInMax: BigNumber,
    ethAmountOut: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    // muteswitch adds extra digits on even if the token is say 8 digits long
    const amountInMax = tokenAmountInMax
      .shiftedBy(this._fromToken.decimals)
      .decimalPlaces(0);

        return this._MuteSwitchRouterContractFactory.swapTokensForExactETH(
          hexlify(parseEther(ethAmountOut)),
          hexlify(amountInMax),
          routeQuoteTradeContext.routePathArray.map((r) =>
            removeEthFromContractAddress(r)
          ),
          this._ethereumAddress,
          deadline,
          [false]
        );

  }

  /**
   * Generate trade amount erc20 > erc20 for input
   * @param tokenAmount The token amount
   * @param tokenAmountOut The min token amount out
   * @param routeQuoteTradeContext The route quote trade context
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataErc20ToErc20Input(
    tokenAmount: BigNumber,
    tokenAmountMin: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    // muteswitch adds extra digits on even if the token is say 8 digits long
    const amountIn = tokenAmount
      .shiftedBy(this._fromToken.decimals)
      .decimalPlaces(0);
    const amountMin = tokenAmountMin
      .shiftedBy(this._toToken.decimals)
      .decimalPlaces(0);

        return this._MuteSwitchRouterContractFactory.swapExactTokensForTokens(
          hexlify(amountIn),
          hexlify(amountMin),
          routeQuoteTradeContext.routePathArray,
          this._ethereumAddress,
          deadline,
          [false]
        );

  }

  /**
   * Generate trade amount erc20 > erc20 for output
   * @param tokenAmount The token amount
   * @param tokenAmountOut The min token amount out
   * @param routeQuoteTradeContext The route quote trade context
   * @param deadline The deadline it expiries unix time
   */
  private generateTradeDataErc20ToErc20Output(
    tokenAmountInMax: BigNumber,
    tokenAmountOut: BigNumber,
    routeQuoteTradeContext: RouteQuoteTradeContext,
    deadline: string
  ): string {
    // muteswitch adds extra digits on even if the token is say 8 digits long
    const amountInMax = tokenAmountInMax
      .shiftedBy(this._fromToken.decimals)
      .decimalPlaces(0);

    const amountOut = tokenAmountOut
      .shiftedBy(this._toToken.decimals)
      .decimalPlaces(0);

        return this._MuteSwitchRouterContractFactory.swapTokensForExactTokens(
          hexlify(amountOut),
          hexlify(amountInMax),
          routeQuoteTradeContext.routePathArray,
          this._ethereumAddress,
          deadline,
          [false]
        );

  }

  /**
   * Build up a transaction for erc20 from
   * @param data The data
   */
  private buildUpTransactionErc20(
    data: string
  ): Transaction {
    return {
      to: muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails),
      from: this._ethereumAddress,
      data,
      value: Constants.EMPTY_HEX_STRING,
    };
  }

  /**
   * Build up a transaction for eth from
   * @param ethValue The eth value
   * @param data The data
   */
  private buildUpTransactionEth(
    ethValue: BigNumber,
    data: string
  ): Transaction {
    return {
      to: muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails),
      from: this._ethereumAddress,
      data,
      value: toEthersBigNumber(parseEther(ethValue)).toHexString(),
    };
  }

  /**
   * Get the allowance and balance for the from and to token (will get balance for eth as well)
   */
  private async getAllowanceAndBalanceForTokens(): Promise<{
    fromToken: AllowanceAndBalanceOf;
    toToken: AllowanceAndBalanceOf;
  }> {
    const allowanceAndBalanceOfForTokens =
      await this._tokensFactory.getAllowanceAndBalanceOfForContracts(
        this._ethereumAddress,
        [this._fromToken.contractAddress, this._toToken.contractAddress],
        false
      );

    return {
      fromToken: allowanceAndBalanceOfForTokens.find(
        (c) =>
          c.token.contractAddress.toLowerCase() ===
          this._fromToken.contractAddress.toLowerCase()
      )!.allowanceAndBalanceOf,
      toToken: allowanceAndBalanceOfForTokens.find(
        (c) =>
          c.token.contractAddress.toLowerCase() ===
          this._toToken.contractAddress.toLowerCase()
      )!.allowanceAndBalanceOf,
    };
  }

  /**
   * Has got enough allowance to do the trade
   * @param amount The amount you want to swap
   */
  private hasGotEnoughAllowance(amount: string, allowance: string): boolean {
    if (this.tradePath() === TradePath.ethToErc20) {
      return true;
    }

    const bigNumberAllowance = new BigNumber(allowance).shiftedBy(
      this._fromToken.decimals * -1
    );

    if (new BigNumber(amount).isGreaterThan(bigNumberAllowance)) {
      return false;
    }

    return true;
  }

  private async hasEnoughAllowanceAndBalance(
    amountToTrade: BigNumber,
    bestRouteQuote: RouteQuote,
    direction: TradeDirection
  ): Promise<{
    enoughBalance: boolean;
    fromBalance: string;
    toBalance: string;
    enoughAllowance: boolean;
  }> {
    const allowanceAndBalancesForTokens =
      await this.getAllowanceAndBalanceForTokens();

    let enoughBalance = false;
    let fromBalance = allowanceAndBalancesForTokens.fromToken.balanceOf;

    switch (this.tradePath()) {
      case TradePath.ethToErc20:
        const result = await this.hasGotEnoughBalanceEth(
          direction === TradeDirection.input
            ? amountToTrade.toFixed()
            : bestRouteQuote.expectedConvertQuote
        );
        enoughBalance = result.hasEnough;
        fromBalance = result.balance;
        break;
      case TradePath.erc20ToErc20:
      case TradePath.erc20ToEth:
        if (direction == TradeDirection.input) {
          const result = this.hasGotEnoughBalanceErc20(
            amountToTrade.toFixed(),
            allowanceAndBalancesForTokens.fromToken.balanceOf
          );

          enoughBalance = result.hasEnough;
          fromBalance = result.balance;
        } else {
          const result = this.hasGotEnoughBalanceErc20(
            bestRouteQuote.expectedConvertQuote,
            allowanceAndBalancesForTokens.fromToken.balanceOf
          );

          enoughBalance = result.hasEnough;
          fromBalance = result.balance;
        }
    }

    const enoughAllowance =
      direction === TradeDirection.input
        ? this.hasGotEnoughAllowance(
            amountToTrade.toFixed(),
            allowanceAndBalancesForTokens.fromToken.allowance
          )
        : this.hasGotEnoughAllowance(
            bestRouteQuote.expectedConvertQuote,
            allowanceAndBalancesForTokens.fromToken.allowance
          );

    return {
      enoughAllowance,
      enoughBalance,
      fromBalance,
      toBalance: allowanceAndBalancesForTokens.toToken.balanceOf,
    };
  }

  /**
   * Has got enough balance to do the trade (eth check only)
   * @param amount The amount you want to swap
   */
  private async hasGotEnoughBalanceEth(amount: string): Promise<{
    hasEnough: boolean;
    balance: string;
  }> {
    const balance = await this.getEthBalance();

    if (new BigNumber(amount).isGreaterThan(balance)) {
      return {
        hasEnough: false,
        balance: balance.toFixed(),
      };
    }

    return {
      hasEnough: true,
      balance: balance.toFixed(),
    };
  }

  /**
   * Has got enough balance to do the trade (erc20 check only)
   * @param amount The amount you want to swap
   */
  private hasGotEnoughBalanceErc20(
    amount: string,
    balance: string
  ): {
    hasEnough: boolean;
    balance: string;
  } {
    const bigNumberBalance = new BigNumber(balance).shiftedBy(
      this._fromToken.decimals * -1
    );

    if (new BigNumber(amount).isGreaterThan(bigNumberBalance)) {
      return {
        hasEnough: false,
        balance: bigNumberBalance.toFixed(),
      };
    }

    return {
      hasEnough: true,
      balance: bigNumberBalance.toFixed(),
    };
  }

  /**
   * Work out trade fiat cost
   * @param allRoutes All the routes
   * @param enoughAllowance Has got enough allowance
   */
  private async filterWithTransactionFees(
    allRoutes: RouteQuote[],
    enoughAllowance: boolean,
  ): Promise<RouteQuote[]> {
    if (this._settings.gasSettings && !this._settings.disableMultihops) {
      const ethContract = WETHContract.ZKSYNC_ERA().contractAddress;

      const fiatPrices = await this._coinGecko.getCoinGeckoFiatPrices([
        this._toToken.contractAddress,
        ethContract,
      ]);

      const toUsdValue = fiatPrices[this._toToken.contractAddress];
      const ethUsdValue = fiatPrices[WETHContract.ZKSYNC_ERA().contractAddress];

      if (toUsdValue && ethUsdValue) {
        const bestRouteQuoteHops = this.getBestRouteQuotesHops(
          allRoutes,
          enoughAllowance
        );

        const gasPriceGwei = await this._settings.gasSettings.getGasPrice();
        const gasPrice = new BigNumber(gasPriceGwei).times(1e9);

        let bestRoute:
          | {
              routeQuote: RouteQuote;
              expectedConvertQuoteMinusTxFees: BigNumber;
            }
          | undefined;
        for (let i = 0; i < bestRouteQuoteHops.length; i++) {
          const route = bestRouteQuoteHops[i];
          const expectedConvertQuoteFiatPrice = new BigNumber(
            route.expectedConvertQuote
          ).times(toUsdValue);

          const txFee = formatEther(
            new BigNumber(
              (
                await this._ethersProvider.provider.estimateGas(
                  route.transaction
                )
              ).toHexString()
            ).times(gasPrice)
          ).times(ethUsdValue);

          route.gasPriceEstimatedBy = gasPriceGwei;

          const expectedConvertQuoteMinusTxFees =
            expectedConvertQuoteFiatPrice.minus(txFee);

          if (bestRoute) {
            if (
              expectedConvertQuoteMinusTxFees.isGreaterThan(
                bestRoute.expectedConvertQuoteMinusTxFees
              )
            ) {
              bestRoute = {
                routeQuote: bestRouteQuoteHops[i],
                expectedConvertQuoteMinusTxFees,
              };
            }
          } else {
            bestRoute = {
              routeQuote: bestRouteQuoteHops[i],
              expectedConvertQuoteMinusTxFees,
            };
          }
        }

        if (bestRoute) {
          const routeIndex = allRoutes.findIndex(
            (r) =>
              r.expectedConvertQuote ===
                bestRoute!.routeQuote.expectedConvertQuote &&
              bestRoute!.routeQuote.routeText === r.routeText
          );

          allRoutes.splice(routeIndex, 1);
          allRoutes.unshift(bestRoute.routeQuote);
        }
      }
    }

    return allRoutes;
  }

  /**
   * Work out the best route quote hops aka the best direct, the best 3 hop and the best 4 hop
   * @param allRoutes All the routes
   * @param enoughAllowance Has got enough allowance
   */
  private getBestRouteQuotesHops(
    allRoutes: RouteQuote[],
    enoughAllowance: boolean,
  ): RouteQuote[] {
    const routes: RouteQuote[] = [];
    for (let i = 0; i < allRoutes.length; i++) {
      if (
        routes.find((r) => r.routePathArray.length === 2) &&
        routes.find((r) => r.routePathArray.length === 3) &&
        routes.find((r) => r.routePathArray.length === 4)
      ) {
        break;
      }

      const route = allRoutes[i];
      if (enoughAllowance) {
        if (
          route.routePathArray.length === 2 &&
          !routes.find((r) => r.routePathArray.length === 2)
        ) {
          routes.push(route);
          continue;
        }

        if (
          route.routePathArray.length === 3 &&
          !routes.find((r) => r.routePathArray.length === 3)
        ) {
          routes.push(route);
          continue;
        }

        if (
          route.routePathArray.length === 4 &&
          !routes.find((r) => r.routePathArray.length === 4)
        ) {
          routes.push(route);
          continue;
        }
      }
    }

    return routes;
  }

  /**
   * Works out every possible route it can take
   * @param fromTokenRoutes The from token routes
   * @param toTokenRoutes The to token routes
   * @param allMainRoutes All the main routes
   */
  private async workOutAllPossibleRoutes(
    fromTokenRoutes: TokenRoutes,
    toTokenRoutes: TokenRoutes,
    allMainRoutes: TokenRoutes[]
  ): Promise<RouteContext[]> {
    const jointCompatibleRoutes = toTokenRoutes.pairs.toTokenPairs!.filter(
      (t) =>
        fromTokenRoutes.pairs.fromTokenPairs!.find(
          (f) =>
            f.contractAddress.toLowerCase() === t.contractAddress.toLowerCase()
        )
    );




    const routes: RouteContext[] = [];
    if (
      fromTokenRoutes.pairs.fromTokenPairs!.find(
        (t) =>
          t.contractAddress.toLowerCase() ===
          toTokenRoutes.token.contractAddress.toLowerCase()
      )
    ) {
      routes.push({
        route: [fromTokenRoutes.token, toTokenRoutes.token]
      });
    }

    for (let i = 0; i < allMainRoutes.length; i++) {
      const tokenRoute = allMainRoutes[i];
      if (
        jointCompatibleRoutes.find(
          (c) =>
            c.contractAddress.toLowerCase() ===
            tokenRoute.token.contractAddress.toLowerCase()
        )
      ) {
        routes.push({
          route: [fromTokenRoutes.token, tokenRoute.token, toTokenRoutes.token]
        });

        for (let f = 0; f < fromTokenRoutes.pairs.fromTokenPairs!.length; f++) {
          const fromSupportedToken = fromTokenRoutes.pairs.fromTokenPairs![f];
          if (
            tokenRoute.pairs.toTokenPairs!.find(
              (pair) =>
                pair.contractAddress.toLowerCase() ===
                fromSupportedToken.contractAddress.toLowerCase()
            )
          ) {
            const workedOutFromRoute = [
              fromTokenRoutes.token,
              fromSupportedToken,
              tokenRoute.token,
              toTokenRoutes.token,
            ];
            if (
              workedOutFromRoute.filter(onlyUnique).length ===
              workedOutFromRoute.length
            ) {
              routes.push({
                route: workedOutFromRoute
              });
            }
          }
        }

        for (let f = 0; f < toTokenRoutes.pairs.toTokenPairs!.length; f++) {
          const toSupportedToken = toTokenRoutes.pairs.toTokenPairs![f];
          if (
            tokenRoute.pairs.fromTokenPairs!.find(
              (pair) =>
                pair.contractAddress.toLowerCase() ===
                toSupportedToken.contractAddress.toLowerCase()
            )
          ) {
            const workedOutToRoute = [
              fromTokenRoutes.token,
              tokenRoute.token,
              toSupportedToken,
              toTokenRoutes.token,
            ];

            if (
              workedOutToRoute.filter(onlyUnique).length ===
              workedOutToRoute.length
            ) {
              routes.push({
                route: workedOutToRoute
              });
            }
          }
        }
      }
    }

    return routes;
  }

  private getTokenAvailablePairs(
    token: Token,
    allAvailablePairs: CallReturnContext[],
    direction: RouterDirection
  ) {
    switch (direction) {
      case RouterDirection.from:
        return this.getFromRouterDirectionAvailablePairs(
          token,
          allAvailablePairs
        );
      case RouterDirection.to:
        return this.getToRouterDirectionAvailablePairs(
          token,
          allAvailablePairs
        );
    }
  }

  private getFromRouterDirectionAvailablePairs(
    token: Token,
    allAvailablePairs: CallReturnContext[]
  ): Token[] {
    const fromRouterDirection = allAvailablePairs.filter(
      (c) => c.reference.split('-')[0] === token.contractAddress
    );
    const tokens: Token[] = [];
    const stable: boolean[] = [];

    for (let index = 0; index < fromRouterDirection.length; index++) {
      const context = fromRouterDirection[index];

      tokens.push(
        this.allTokens.find(
          (t) => t.contractAddress === context.reference.split('-')[1]
        )!
      );

      stable.push(context.reference.split('-')[3] == 'true')
    }

    return tokens;
  }

  private getToRouterDirectionAvailablePairs(
    token: Token,
    allAvailablePairs: CallReturnContext[]
  ): Token[]  {
    const toRouterDirection = allAvailablePairs.filter(
      (c) => c.reference.split('-')[1] === token.contractAddress
    );
    const tokens: Token[] = [];
    const stable: boolean[] = [];

    for (let index = 0; index < toRouterDirection.length; index++) {
      const context = toRouterDirection[index];
      tokens.push(
        this.allTokens.find(
          (t) => t.contractAddress === context.reference.split('-')[0]
        )!
      );
      stable.push(context.reference.split('-')[3] == 'true')
    }

    return tokens;
  }

  /**
   * Build up route quotes from results
   * @param contractCallResults The contract call results
   * @param direction The direction you want to get the quote from
   */
  private buildRouteQuotesFromResults(
    amountToTrade: BigNumber,
    contractCallResults: ContractCallResults,
    direction: TradeDirection
  ): RouteQuote[] {
    const tradePath = this.tradePath();

    const result: RouteQuote[] = [];
    for (const key in contractCallResults.results) {
      const contractCallReturnContext = contractCallResults.results[key];
      if (contractCallReturnContext) {
        for (
          let i = 0;
          i < contractCallReturnContext.callsReturnContext.length;
          i++
        ) {
          const callReturnContext =
            contractCallReturnContext.callsReturnContext[i];

          //console.log(JSON.stringify(callReturnContext, null, 4));

          if (!callReturnContext.success) {
            continue;
          }

          switch (tradePath) {
            case TradePath.ethToErc20:
              result.push(
                this.buildRouteQuoteForEthToErc20(
                  amountToTrade,
                  callReturnContext,
                  contractCallReturnContext.originalContractCallContext.context[
                    i
                  ],
                  direction
                )
              );
              break;
            case TradePath.erc20ToEth:
              result.push(
                this.buildRouteQuoteForErc20ToEth(
                  amountToTrade,
                  callReturnContext,
                  contractCallReturnContext.originalContractCallContext.context[
                    i
                  ],
                  direction
                )
              );
              break;
            case TradePath.erc20ToErc20:
              result.push(
                this.buildRouteQuoteForErc20ToErc20(
                  amountToTrade,
                  callReturnContext,
                  contractCallReturnContext.originalContractCallContext.context[
                    i
                  ],
                  direction
                )
              );
              break;
            default:
              throw new MuteSwitchError(
                `${tradePath} not found`,
                ErrorCodes.tradePathIsNotSupported
              );
          }
        }
      }
    }

    if (direction === TradeDirection.input) {
      return result.sort((a, b) => {
        if (
          new BigNumber(a.expectedConvertQuote).isGreaterThan(
            b.expectedConvertQuote
          )
        ) {
          return -1;
        }
        return new BigNumber(a.expectedConvertQuote).isLessThan(
          b.expectedConvertQuote
        )
          ? 1
          : 0;
      });
    } else {
      return result.sort((a, b) => {
        if (
          new BigNumber(a.expectedConvertQuote).isLessThan(
            b.expectedConvertQuote
          )
        ) {
          return -1;
        }
        return new BigNumber(a.expectedConvertQuote).isGreaterThan(
          b.expectedConvertQuote
        )
          ? 1
          : 0;
      });
    }
  }

  /**
   * Build up the route quote for erc20 > eth (not shared with other method for safety reasons)
   * @param callReturnContext The call return context
   * @param routeContext The route context
   * @param direction The direction you want to get the quote from
   */
  private buildRouteQuoteForErc20ToErc20(
    amountToTrade: BigNumber,
    callReturnContext: CallReturnContext,
    routeContext: RouteContext,
    direction: TradeDirection,
  ): RouteQuote {
    const convertQuoteUnformatted = this.getConvertQuoteUnformatted(
      callReturnContext,
      direction
    );

    const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(
      callReturnContext,
      direction
    );

    const expectedConvertQuote =
      direction === TradeDirection.input
        ? convertQuoteUnformatted
            .shiftedBy(this._toToken.decimals * -1)
            .toFixed(this._toToken.decimals)
        : convertQuoteUnformatted
            .shiftedBy(this._fromToken.decimals * -1)
            .toFixed(this._fromToken.decimals);

    const expectedConvertQuoteOrTokenAmountInMaxWithSlippage =
      this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(
        expectedConvertQuote,
        direction
      );

    const tradeExpires = this.generateTradeDeadlineUnixTime();

    const routeQuoteTradeContext: RouteQuoteTradeContext = {
      liquidityProviderFee: [0],
      routePathArray: callReturnContext.methodParameters[1],
    };
    const data =
      direction === TradeDirection.input
        ? this.generateTradeDataErc20ToErc20Input(
            amountToTrade,
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            routeQuoteTradeContext,
            tradeExpires.toString()
          )
        : this.generateTradeDataErc20ToErc20Output(
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            amountToTrade,
            routeQuoteTradeContext,
            tradeExpires.toString()
          );

    const transaction = this.buildUpTransactionErc20(data);


        return {
          expectedConvertQuote,
          expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
          transaction,
          tradeExpires,
          routePathArrayTokenMap: callReturnContext.methodParameters[1].map(
            (c: string) => {
              return this.allTokens.find((t) => t.contractAddress === c);
            }
          ),
          expectedAmounts: callReturnContext.returnValues[0],
          routeText: callReturnContext.methodParameters[1]
            .map((c: string) => {
              return this.allTokens.find((t) => t.contractAddress === c)!
                .symbol;
            })
            .join(' > '),
          // route array is always in the 1 index of the method parameters
          routePathArray: callReturnContext.methodParameters[1],
          liquidityProviderFee: convertQuoteInfoUnformatted.fees,
          stable: convertQuoteInfoUnformatted.stable,
          quoteDirection: direction,
        };

  }

  /**
   * Build up the route quote for eth > erc20 (not shared with other method for safety reasons)
   * @param callReturnContext The call return context
   * @param routeContext The route context
   * @param direction The direction you want to get the quote from
   */
  private buildRouteQuoteForEthToErc20(
    amountToTrade: BigNumber,
    callReturnContext: CallReturnContext,
    routeContext: RouteContext,
    direction: TradeDirection
  ): RouteQuote {
    const convertQuoteUnformatted = this.getConvertQuoteUnformatted(
      callReturnContext,
      direction
    );

    const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(
      callReturnContext,
      direction
    );

    const expectedConvertQuote =
      direction === TradeDirection.input
        ? convertQuoteUnformatted
            .shiftedBy(this._toToken.decimals * -1)
            .toFixed(this._toToken.decimals)
        : new BigNumber(formatEther(convertQuoteUnformatted)).toFixed(
            this._fromToken.decimals
          );

    const expectedConvertQuoteOrTokenAmountInMaxWithSlippage =
      this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(
        expectedConvertQuote,
        direction
      );

    const tradeExpires = this.generateTradeDeadlineUnixTime();
    const routeQuoteTradeContext: RouteQuoteTradeContext = {
      liquidityProviderFee: [0],
      routePathArray: callReturnContext.methodParameters[1],
    };
    const data =
      direction === TradeDirection.input
        ? this.generateTradeDataEthToErc20Input(
            amountToTrade,
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            routeQuoteTradeContext,
            tradeExpires.toString()
          )
        : this.generateTradeDataEthToErc20Output(
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            amountToTrade,
            routeQuoteTradeContext,
            tradeExpires.toString()
          );

    const transaction = this.buildUpTransactionEth(
      direction === TradeDirection.input
        ? amountToTrade
        : new BigNumber(expectedConvertQuote),
      data
    );

        return {
          expectedConvertQuote,
          expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
          transaction,
          tradeExpires,
          routePathArrayTokenMap: callReturnContext.methodParameters[1].map(
            (c: string, index: number) => {
              const token = deepClone(
                this.allTokens.find((t) => t.contractAddress === c)!
              );
              if (index === 0) {
                return turnTokenIntoEthForResponse(
                  token,
                  this._settings?.customNetwork?.nativeCurrency
                );
              }

              return token;
            }
          ),
          expectedAmounts: callReturnContext.returnValues[0],
          routeText: callReturnContext.methodParameters[1]
            .map((c: string, index: number) => {
              if (index === 0) {
                return this.getNativeTokenSymbol();
              }
              return this.allTokens.find((t) => t.contractAddress === c)!
                .symbol;
            })
            .join(' > '),
          // route array is always in the 1 index of the method parameters
          routePathArray: callReturnContext.methodParameters[1],
          liquidityProviderFee: convertQuoteInfoUnformatted.fees,
          stable: convertQuoteInfoUnformatted.stable,
          quoteDirection: direction,
        };

  }

  /**
   * Build up the route quote for erc20 > eth (not shared with other method for safety reasons)
   * @param callReturnContext The call return context
   * @param routeContext The route context
   * @param direction The direction you want to get the quote from
   */
  private buildRouteQuoteForErc20ToEth(
    amountToTrade: BigNumber,
    callReturnContext: CallReturnContext,
    routeContext: RouteContext,
    direction: TradeDirection
  ): RouteQuote {
    const convertQuoteUnformatted = this.getConvertQuoteUnformatted(
      callReturnContext,
      direction
    );

    const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(
      callReturnContext,
      direction
    );

    const expectedConvertQuote =
      direction === TradeDirection.input
        ? new BigNumber(formatEther(convertQuoteUnformatted)).toFixed(
            this._toToken.decimals
          )
        : convertQuoteUnformatted
            .shiftedBy(this._fromToken.decimals * -1)
            .toFixed(this._fromToken.decimals);

    const expectedConvertQuoteOrTokenAmountInMaxWithSlippage =
      this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(
        expectedConvertQuote,
        direction
      );

    const tradeExpires = this.generateTradeDeadlineUnixTime();
    const routeQuoteTradeContext: RouteQuoteTradeContext = {
      liquidityProviderFee: [0],
      routePathArray: callReturnContext.methodParameters[1],
    };
    const data =
      direction === TradeDirection.input
        ? this.generateTradeDataErc20ToEthInput(
            amountToTrade,
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            routeQuoteTradeContext,
            tradeExpires.toString()
          )
        : this.generateTradeDataErc20ToEthOutput(
            new BigNumber(expectedConvertQuoteOrTokenAmountInMaxWithSlippage),
            amountToTrade,
            routeQuoteTradeContext,
            tradeExpires.toString()
          );

    const transaction = this.buildUpTransactionErc20(data);

        return {
          expectedConvertQuote,
          expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
          transaction,
          tradeExpires,
          routePathArrayTokenMap: callReturnContext.methodParameters[1].map(
            (c: string, index: number) => {
              const token = deepClone(
                this.allTokens.find((t) => t.contractAddress === c)!
              );
              if (index === callReturnContext.methodParameters[1].length - 1) {
                return turnTokenIntoEthForResponse(
                  token,
                  this._settings?.customNetwork?.nativeCurrency
                );
              }

              return token;
            }
          ),
          expectedAmounts: callReturnContext.returnValues[0],
          routeText: callReturnContext.methodParameters[1]
            .map((c: string, index: number) => {
              if (index === callReturnContext.methodParameters[1].length - 1) {
                return this.getNativeTokenSymbol();
              }
              return this.allTokens.find((t) => t.contractAddress === c)!
                .symbol;
            })
            .join(' > '),
          // route array is always in the 1 index of the method parameters
          routePathArray: callReturnContext.methodParameters[1],
          liquidityProviderFee: convertQuoteInfoUnformatted.fees,
          stable: convertQuoteInfoUnformatted.stable,
          quoteDirection: direction,
        };
  }

  /**
   * Get the convert quote unformatted from the call return context
   * @param callReturnContext The call return context
   * @param direction The direction you want to get the quote from
   */
  private getConvertQuoteUnformatted(
    callReturnContext: CallReturnContext,
    direction: TradeDirection
  ): BigNumber {
        if (direction === TradeDirection.input) {
          if(callReturnContext.returnValues[0].hex){
            return new BigNumber(callReturnContext.returnValues[0].hex)
          }
          return new BigNumber(
            callReturnContext.returnValues[0][
              callReturnContext.returnValues[0].length - 1
            ].hex
          );
        } else {
          return new BigNumber(callReturnContext.returnValues[0].hex);
        }

  }

  private getConvertQuoteInfoUnformatted(
    callReturnContext: CallReturnContext,
    direction: TradeDirection
  ): {stable: boolean[], fees: number[]} {
      return {
        stable: callReturnContext.returnValues[1],
        fees: callReturnContext.returnValues[2].map((c: any) => new BigNumber(c.hex).toNumber()),
      }
  }

  /**
   * Work out the expected convert quote taking off slippage
   * @param expectedConvertQuote The expected convert quote
   */
  private getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(
    expectedConvertQuote: string,
    tradeDirection: TradeDirection
  ): string {
    const decimals =
      tradeDirection === TradeDirection.input
        ? this._toToken.decimals
        : this._fromToken.decimals;

    return new BigNumber(expectedConvertQuote)
      .minus(
        new BigNumber(expectedConvertQuote)
          .times(this._settings.slippage)
          .toFixed(decimals)
      )
      .toFixed(decimals);
  }

  /**
   * Format amount to trade into callable formats
   * @param amountToTrade The amount to trade
   * @param direction The direction you want to get the quote from
   */
  private formatAmountToTrade(
    amountToTrade: BigNumber,
    direction: TradeDirection
  ): string {
    switch (this.tradePath()) {
      case TradePath.ethToErc20:
        if (direction == TradeDirection.input) {
          const amountToTradeWei = parseEther(amountToTrade);
          return hexlify(amountToTradeWei);
        } else {
          return hexlify(amountToTrade.shiftedBy(this._toToken.decimals));
        }
      case TradePath.erc20ToEth:
        if (direction == TradeDirection.input) {
          return hexlify(amountToTrade.shiftedBy(this._fromToken.decimals));
        } else {
          const amountToTradeWei = parseEther(amountToTrade);
          return hexlify(amountToTradeWei);
        }
      case TradePath.erc20ToErc20:
        if (direction == TradeDirection.input) {
          return hexlify(amountToTrade.shiftedBy(this._fromToken.decimals));
        } else {
          return hexlify(amountToTrade.shiftedBy(this._toToken.decimals));
        }
      default:
        throw new MuteSwitchError(
          `Internal trade path ${this.tradePath()} is not supported`,
          ErrorCodes.tradePathIsNotSupported
        );
    }
  }

  /**
   * Get the trade path
   */
  private tradePath(): TradePath {
    const network = this._ethersProvider.network();
    return getTradePath(
      network.chainId,
      this._fromToken,
      this._toToken,
      this._settings.customNetwork?.nativeWrappedTokenInfo
    );
  }

  private get allTokens(): Token[] {
    return [this._fromToken, this._toToken, ...this.allMainTokens];
  }

  private get allMainTokens(): Token[] {
    if (
      this._ethersProvider.provider.network.chainId === ChainId.ZKSYNC_ERA ||
      this._settings.customNetwork
    ) {
      const tokens: (Token | undefined)[] = [
        this.USDCTokenForConnectedNetwork,
        this.WETHTokenForConnectedNetwork,
        this.WBTCTokenForConnectedNetwork,
      ];

      return tokens.filter((t) => t !== undefined) as Token[];
    }

    return [this.WETHTokenForConnectedNetwork];
  }

  private get mainCurrenciesPairsForFromToken(): Token[][] {

    const pairs = [
      [this._fromToken, this.WETHTokenForConnectedNetwork],
      [this._fromToken, this.USDCTokenForConnectedNetwork!]
    ];
    
    return pairs.filter((t) => t[0].contractAddress !== t[1].contractAddress);
  }

  private get mainCurrenciesPairsForToToken(): Token[][] {

    const pairs: Token[][] = [
      [this.WETHTokenForConnectedNetwork, this._toToken],
      [this.USDCTokenForConnectedNetwork!, this._toToken]
    ];

    return pairs.filter((t) => t[0].contractAddress !== t[1].contractAddress);
  }

  private get mainCurrenciesPairsForUSDC(): Token[][] {
    if (
      this._settings.customNetwork
    ) {
      const pairs: (Token | undefined)[][] = [
        [this.USDCTokenForConnectedNetwork, this.WETHTokenForConnectedNetwork],
      ];

      /*

      if (
        !isNativeEth(this._fromToken.contractAddress) &&
        !isNativeEth(this._toToken.contractAddress)
      ) {
        pairs.push([
          this.USDCTokenForConnectedNetwork,
          this.WETHTokenForConnectedNetwork,
        ]);
      }
      */

      return this.filterUndefinedTokens(pairs);
    }

    return [];
  }

  private get mainCurrenciesPairsForWBTC(): Token[][] {
    if (
      this._ethersProvider.provider.network.chainId === ChainId.ZKSYNC_ERA ||
      this._settings.customNetwork
    ) {
      const tokens: (Token | undefined)[][] = [
        [this.WBTCTokenForConnectedNetwork, this.WETHTokenForConnectedNetwork],
      ];

      return this.filterUndefinedTokens(tokens);
    }

    return [];
  }

  private get mainCurrenciesPairsForWETH(): Token[][] {
    if (
      this._ethersProvider.provider.network.chainId === ChainId.ZKSYNC_ERA ||
      this._settings.customNetwork
    ) {
      const tokens: (Token | undefined)[][] = [
        //[this.WETHTokenForConnectedNetwork, this.DAITokenForConnectedNetwork],
        [this.WETHTokenForConnectedNetwork, this.USDCTokenForConnectedNetwork],
        [this.WETHTokenForConnectedNetwork, this.WBTCTokenForConnectedNetwork],
      ];

      return this.filterUndefinedTokens(tokens);
    }

    return [];
  }

  private filterUndefinedTokens(tokens: (Token | undefined)[][]): Token[][] {
    return tokens.filter(
      (t) => t[0] !== undefined && t[1] !== undefined
    ) as Token[][];
  }

  /*
  private get DAITokenForConnectedNetwork() {
    if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
      return this._settings.customNetwork.baseTokens?.dai;
    }

    return DAI.token(this._ethersProvider.provider.network.chainId);
  }
  */

  private get USDCTokenForConnectedNetwork() {
    if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
      return this._settings.customNetwork.baseTokens?.usdc;
    }

    return USDC.token(this._ethersProvider.provider.network.chainId);
  }

  private get WETHTokenForConnectedNetwork() {
    if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
      return this._settings.customNetwork.nativeWrappedTokenInfo;
    }

    return WETHContract.token(this._ethersProvider.provider.network.chainId);
  }

  private get WBTCTokenForConnectedNetwork() {
    if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
      return this._settings.customNetwork.baseTokens?.wbtc;
    }

    return WBTC.token(this._ethersProvider.provider.network.chainId);
  }

  private getNativeTokenSymbol(): string {
    if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
      return this._settings.customNetwork.nativeCurrency.symbol;
    }

    return ETH_SYMBOL;
  }
}
