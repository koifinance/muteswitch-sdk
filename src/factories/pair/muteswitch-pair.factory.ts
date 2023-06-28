import BigNumber from 'bignumber.js';
import { Subject } from 'rxjs';
import { CoinGecko } from '../../coin-gecko';
import { Constants } from '../../common/constants';
import { ErrorCodes } from '../../common/errors/error-codes';
import { MuteSwitchError } from '../../common/errors/muteswitch-error';
import {
  removeEthFromContractAddress,
  turnTokenIntoEthForResponse,
} from '../../common/tokens/eth';
import { deepClone } from '../../common/utils/deep-clone';
import { getTradePath } from '../../common/utils/trade-path';
import { TradePath } from '../../enums/trade-path';
import { muteswitchContracts } from '../../muteswitch-contract-context/get-muteswitch-contracts';
import { BestRouteQuotes } from '../router/models/best-route-quotes';
import { RouteQuote } from '../router/models/route-quote';
import { RouteContext } from '../router/models/route-context';
import { MuteSwitchRouterFactory } from '../router/muteswitch-router.factory';
import { AllowanceAndBalanceOf } from '../token/models/allowance-balance-of';
import { Token } from '../token/models/token';
import { TokenFactory } from '../token/token.factory';
import { CurrentTradeContext } from './models/current-trade-context';
import { TradeContext } from './models/trade-context';
import { TradeDirection } from './models/trade-direction';
import { Transaction } from './models/transaction';
import { MuteSwitchPairFactoryContext } from './models/muteswitch-pair-factory-context';

export class MuteSwitchPairFactory {
  private _fromTokenFactory = new TokenFactory(
    this._muteswitchPairFactoryContext.fromToken.contractAddress,
    this._muteswitchPairFactoryContext.ethersProvider,
    this._muteswitchPairFactoryContext.settings.customNetwork,
    this._muteswitchPairFactoryContext.settings.cloneMuteSwitchContractDetails
  );

  private _toTokenFactory = new TokenFactory(
    this._muteswitchPairFactoryContext.toToken.contractAddress,
    this._muteswitchPairFactoryContext.ethersProvider,
    this._muteswitchPairFactoryContext.settings.customNetwork
  );

  private _muteswitchRouterFactory = new MuteSwitchRouterFactory(
    this._coinGecko,
    this._muteswitchPairFactoryContext.ethereumAddress,
    this._muteswitchPairFactoryContext.fromToken,
    this._muteswitchPairFactoryContext.toToken,
    this._muteswitchPairFactoryContext.settings,
    this._muteswitchPairFactoryContext.ethersProvider
  );

  private _watchingBlocks = false;
  private _currentTradeContext: CurrentTradeContext | undefined;
  private _quoteChanged$: Subject<TradeContext> = new Subject<TradeContext>();
  private _updateEveryBlock = 5;
  private _blockCount = 0

  constructor(
    private _coinGecko: CoinGecko,
    private _muteswitchPairFactoryContext: MuteSwitchPairFactoryContext
  ) {}

  /**
   * The to token
   */
  public get toToken(): Token {
    return this._muteswitchPairFactoryContext.toToken;
  }

  /**
   * The from token
   */
  public get fromToken(): Token {
    return this._muteswitchPairFactoryContext.fromToken;
  }

  /**
   * Get the provider url
   */
  public get providerUrl(): string | undefined {
    return this._muteswitchPairFactoryContext.ethersProvider.getProviderUrl();
  }

  /**
   * Get the to token balance
   */
  public async getFromTokenBalance(): Promise<string> {
    if (this.tradePath() === TradePath.ethToErc20) {
      const ethBalanceContext =
        await this._muteswitchRouterFactory.getEthBalance();
      return ethBalanceContext.toFixed();
    }

    const erc20BalanceContext = await this._fromTokenFactory.balanceOf(
      this._muteswitchPairFactoryContext.ethereumAddress
    );

    return new BigNumber(erc20BalanceContext)
      .shiftedBy(this.fromToken.decimals * -1)
      .toFixed();
  }

  /**
   * Get the to token balance
   */
  public async getToTokenBalance(): Promise<string> {
    if (this.tradePath() === TradePath.erc20ToEth) {
      const ethBalanceContext =
        await this._muteswitchRouterFactory.getEthBalance();
      return ethBalanceContext.toFixed();
    }

    const erc20BalanceContext = await this._toTokenFactory.balanceOf(
      this._muteswitchPairFactoryContext.ethereumAddress
    );

    return new BigNumber(erc20BalanceContext)
      .shiftedBy(this.toToken.decimals * -1)
      .toFixed();
  }

  /**
   * Execute the trade path
   * @param amount The amount
   * @param direction The direction you want to get the quote from
   */
  private async executeTradePath(
    amount: BigNumber,
    direction: TradeDirection
  ): Promise<TradeContext> {
    switch (this.tradePath()) {
      case TradePath.erc20ToEth:
        return await this.findBestPriceAndPathErc20ToEth(amount, direction);
      case TradePath.ethToErc20:
        return await this.findBestPriceAndPathEthToErc20(amount, direction);
      case TradePath.erc20ToErc20:
        return await this.findBestPriceAndPathErc20ToErc20(amount, direction);
      default:
        throw new MuteSwitchError(
          `${this.tradePath()} is not defined`,
          ErrorCodes.tradePathIsNotSupported
        );
    }
  }

  /**
   * Destroy the trade instance watchers + subscriptions
   */
  private destroy(): void {
    for (let i = 0; i < this._quoteChanged$.observers.length; i++) {
      this._quoteChanged$.observers[i].complete();
    }
    this.unwatchTradePrice();
  }

  /**
   * Generate trade - this will return amount but you still need to send the transaction
   * if you want it to be executed on the blockchain
   * @param amount The amount you want to swap
   * @param direction The direction you want to get the quote from
   */
  public async trade(
    amount: string,
    direction: TradeDirection = TradeDirection.input
  ): Promise<TradeContext> {
    this.destroy();

    const trade = await this.executeTradePath(new BigNumber(amount), direction);
    this._currentTradeContext = this.buildCurrentTradeContext(trade);

    this.watchTradePrice();

    return trade;
  }

  /**
   * Find the best route rate out of all the route quotes
   * @param amountToTrade The amount to trade
   * @param direction The direction you want to get the quote from
   */
  public async findBestRoute(
    amountToTrade: string,
    direction: TradeDirection
  ): Promise<BestRouteQuotes> {
    return await this._routes.findBestRoute(
      new BigNumber(amountToTrade),
      direction
    );
  }

  /**
   * Find the best route rate out of all the route quotes
   * @param amountToTrade The amount to trade
   * @param direction The direction you want to get the quote from
   */
  public async findAllPossibleRoutesWithQuote(
    amountToTrade: string,
    direction: TradeDirection
  ): Promise<RouteQuote[]> {
    return await this._routes.getAllPossibleRoutesWithQuotes(
      new BigNumber(amountToTrade),
      direction
    );
  }

  /**
   * Find all possible routes
   */
  public async findAllPossibleRoutes(): Promise<RouteContext[]> {
    return await this._routes.getAllPossibleRoutes();
  }

  /**
   * Get the allowance and balance for the from token (erc20 > blah) only
   */
  public async getAllowanceAndBalanceOfForFromToken(): Promise<AllowanceAndBalanceOf> {
    return await this._fromTokenFactory.getAllowanceAndBalanceOf(
      this._muteswitchPairFactoryContext.ethereumAddress
    );
  }

  /**
   * Get the allowance and balance for to from token (eth > erc20) only
   */
  public async getAllowanceAndBalanceOfForToToken(): Promise<AllowanceAndBalanceOf> {
    return await this._toTokenFactory.getAllowanceAndBalanceOf(
      this._muteswitchPairFactoryContext.ethereumAddress
    );
  }

  /**
   * Get the allowance for the amount which can be moved from the `fromToken`
   * on the users behalf. Only valid when the `fromToken` is a ERC20 token.
   */
  public async allowance(): Promise<string> {
    if (this.tradePath() === TradePath.ethToErc20) {
      return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    }

    const allowance = await this._fromTokenFactory.allowance(
      this._muteswitchPairFactoryContext.ethereumAddress
    );

    return allowance;
  }

  /**
   * Generate the from token approve data max allowance to move the tokens.
   * This will return the data for you to send as a transaction
   */
  public async generateApproveMaxAllowanceData(): Promise<Transaction> {
    if (this.tradePath() === TradePath.ethToErc20) {
      throw new MuteSwitchError(
        'You do not need to generate approve muteswitch allowance when doing eth > erc20',
        ErrorCodes.generateApproveMaxAllowanceDataNotAllowed
      );
    }

    const data = this._fromTokenFactory.generateApproveAllowanceData(
      muteswitchContracts.getRouterAddress(
            this._muteswitchPairFactoryContext.settings.cloneMuteSwitchContractDetails
          ),
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    );

    return {
      to: this.fromToken.contractAddress,
      from: this._muteswitchPairFactoryContext.ethereumAddress,
      data,
      value: Constants.EMPTY_HEX_STRING,
    };
  }

  /**
   * Route getter
   */
  private get _routes(): MuteSwitchRouterFactory {
    return this._muteswitchRouterFactory;
  }

  /**
   * Build the current trade context
   * @param trade The trade context
   */
  private buildCurrentTradeContext(trade: TradeContext): CurrentTradeContext {
    return deepClone({
      baseConvertRequest: trade.baseConvertRequest,
      expectedConvertQuote: trade.expectedConvertQuote,
      quoteDirection: trade.quoteDirection,
      fromToken: trade.fromToken,
      toToken: trade.toToken,
      liquidityProviderFee: trade.liquidityProviderFee,
      stable: trade.stable,
      transaction: trade.transaction,
      routeText: trade.routeText,
      tradeExpires: trade.tradeExpires,
    });
  }

  /**
   * finds the best price and path for Erc20ToEth
   * @param baseConvertRequest The base convert request can be both input or output direction
   * @param direction The direction you want to get the quote from
   */
  private async findBestPriceAndPathErc20ToEth(
    baseConvertRequest: BigNumber,
    direction: TradeDirection
  ): Promise<TradeContext> {
    const bestRouteQuotes = await this._routes.findBestRoute(
      baseConvertRequest,
      direction
    );

    const bestRouteQuote = bestRouteQuotes.bestRouteQuote;

    const tradeContext: TradeContext = {
      quoteDirection: direction,
      baseConvertRequest: baseConvertRequest.toFixed(),
      minAmountConvertQuote:
        direction === TradeDirection.input
          ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
          : null,
      maximumSent:
        direction === TradeDirection.input
          ? null
          : bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
      expectedConvertQuote: bestRouteQuote.expectedConvertQuote,
      liquidityProviderFee: bestRouteQuote.liquidityProviderFee,
      liquidityProviderFeePercent: bestRouteQuote.liquidityProviderFee,
      stable: bestRouteQuote.stable,
      tradeExpires: bestRouteQuote.tradeExpires,
      routePathTokenMap: bestRouteQuote.routePathArrayTokenMap,
      routeText: bestRouteQuote.routeText,
      routePath: bestRouteQuote.routePathArray.map((r) =>
        removeEthFromContractAddress(r)
      ),
      hasEnoughAllowance: bestRouteQuotes.hasEnoughAllowance,
      approvalTransaction: !bestRouteQuotes.hasEnoughAllowance
        ? await this.generateApproveMaxAllowanceData()
        : undefined,
      toToken: turnTokenIntoEthForResponse(
        this.toToken,
        this._muteswitchPairFactoryContext.settings?.customNetwork?.nativeCurrency
      ),
      toBalance: new BigNumber(bestRouteQuotes.toBalance)
        .shiftedBy(this.toToken.decimals * -1)
        .toFixed(),
      fromToken: this.fromToken,
      fromBalance: {
        hasEnough: bestRouteQuotes.hasEnoughBalance,
        balance: bestRouteQuotes.fromBalance,
      },
      transaction: bestRouteQuote.transaction,
      gasPriceEstimatedBy: bestRouteQuote.gasPriceEstimatedBy,
      allTriedRoutesQuotes: bestRouteQuotes.triedRoutesQuote,
      quoteChanged$: this._quoteChanged$,
      destroy: () => this.destroy(),
    };

    return tradeContext;
  }

  /**
   * finds the best price and path for Erc20ToErc20
   * @param baseConvertRequest The base convert request can be both input or output direction
   * @param direction The direction you want to get the quote from
   */
  private async findBestPriceAndPathErc20ToErc20(
    baseConvertRequest: BigNumber,
    direction: TradeDirection
  ): Promise<TradeContext> {
    const bestRouteQuotes = await this._routes.findBestRoute(
      baseConvertRequest,
      direction
    );
    const bestRouteQuote = bestRouteQuotes.bestRouteQuote;

    const tradeContext: TradeContext = {
      quoteDirection: direction,
      baseConvertRequest: baseConvertRequest.toFixed(),
      minAmountConvertQuote:
        direction === TradeDirection.input
          ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
          : null,
      maximumSent:
        direction === TradeDirection.input
          ? null
          : bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
      expectedConvertQuote: bestRouteQuote.expectedConvertQuote,
      liquidityProviderFee: bestRouteQuote.liquidityProviderFee,
      liquidityProviderFeePercent: bestRouteQuote.liquidityProviderFee,
      stable: bestRouteQuote.stable,
      tradeExpires: bestRouteQuote.tradeExpires,
      routePathTokenMap: bestRouteQuote.routePathArrayTokenMap,
      routeText: bestRouteQuote.routeText,
      routePath: bestRouteQuote.routePathArray,
      hasEnoughAllowance: bestRouteQuotes.hasEnoughAllowance,
      approvalTransaction: !bestRouteQuotes.hasEnoughAllowance
        ? await this.generateApproveMaxAllowanceData()
        : undefined,
      toToken: this.toToken,
      toBalance: new BigNumber(bestRouteQuotes.toBalance)
        .shiftedBy(this.toToken.decimals * -1)
        .toFixed(),
      fromToken: this.fromToken,
      fromBalance: {
        hasEnough: bestRouteQuotes.hasEnoughBalance,
        balance: bestRouteQuotes.fromBalance,
      },
      transaction: bestRouteQuote.transaction,
      gasPriceEstimatedBy: bestRouteQuote.gasPriceEstimatedBy,
      allTriedRoutesQuotes: bestRouteQuotes.triedRoutesQuote,
      quoteChanged$: this._quoteChanged$,
      destroy: () => this.destroy(),
    };

    return tradeContext;
  }

  /**
   * Find the best price and route path to take (will round down the slippage)
   * @param baseConvertRequest The base convert request can be both input or output direction
   * @param direction The direction you want to get the quote from
   */
  private async findBestPriceAndPathEthToErc20(
    baseConvertRequest: BigNumber,
    direction: TradeDirection
  ): Promise<TradeContext> {
    const bestRouteQuotes = await this._routes.findBestRoute(
      baseConvertRequest,
      direction
    );
    const bestRouteQuote = bestRouteQuotes.bestRouteQuote;

    const tradeContext: TradeContext = {
      quoteDirection: direction,
      baseConvertRequest: baseConvertRequest.toFixed(),
      minAmountConvertQuote:
        direction === TradeDirection.input
          ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
          : null,
      maximumSent:
        direction === TradeDirection.input
          ? null
          : bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
      expectedConvertQuote: bestRouteQuote.expectedConvertQuote,
      liquidityProviderFee: bestRouteQuote.liquidityProviderFee,
      liquidityProviderFeePercent: bestRouteQuote.liquidityProviderFee,
      stable: bestRouteQuote.stable,
      tradeExpires: bestRouteQuote.tradeExpires,
      routePathTokenMap: bestRouteQuote.routePathArrayTokenMap,
      routeText: bestRouteQuote.routeText,
      routePath: bestRouteQuote.routePathArray.map((r) =>
        removeEthFromContractAddress(r)
      ),
      hasEnoughAllowance: true,
      toToken: this.toToken,
      toBalance: new BigNumber(bestRouteQuotes.toBalance)
        .shiftedBy(this.toToken.decimals * -1)
        .toFixed(),
      fromToken: turnTokenIntoEthForResponse(
        this.fromToken,
        this._muteswitchPairFactoryContext.settings?.customNetwork?.nativeCurrency
      ),
      fromBalance: {
        hasEnough: bestRouteQuotes.hasEnoughBalance,
        balance: bestRouteQuotes.fromBalance,
      },
      transaction: bestRouteQuote.transaction,
      gasPriceEstimatedBy: bestRouteQuote.gasPriceEstimatedBy,
      allTriedRoutesQuotes: bestRouteQuotes.triedRoutesQuote,
      quoteChanged$: this._quoteChanged$,
      destroy: () => this.destroy(),
    };

    return tradeContext;
  }

  /**
   * Get the trade path
   */
  private tradePath(): TradePath {
    const network = this._muteswitchPairFactoryContext.ethersProvider.network();
    return getTradePath(
      network.chainId,
      this.fromToken,
      this.toToken,
      this._muteswitchPairFactoryContext.settings.customNetwork
        ?.nativeWrappedTokenInfo
    );
  }

  /**
   * Watch trade price move automatically emitting the stream if it changes
   */
  private watchTradePrice(): void {
    if (!this._watchingBlocks) {
      this._muteswitchPairFactoryContext.ethersProvider.provider.on(
        'block',
        async () => {
          await this.handleNewBlock();
        }
      );
      this._watchingBlocks = true;
    }
  }

  /**
   * unwatch any block streams
   */
  private unwatchTradePrice(): void {
    this._muteswitchPairFactoryContext.ethersProvider.provider.removeAllListeners(
      'block'
    );
    this._watchingBlocks = false;
  }

  /**
   * Handle new block for the trade price moving automatically emitting the stream if it changes
   */
  private async handleNewBlock(): Promise<void> {
    if (this._quoteChanged$.observers.length > 0 && this._currentTradeContext) {
      this._blockCount++

      if(this._updateEveryBlock > this._blockCount)
        return

      this._blockCount = 0;

      const trade = await this.executeTradePath(
        new BigNumber(this._currentTradeContext.baseConvertRequest),
        this._currentTradeContext.quoteDirection
      );

      if (
        trade.fromToken.contractAddress ===
          this._currentTradeContext.fromToken.contractAddress &&
        trade.toToken.contractAddress ===
          this._currentTradeContext.toToken.contractAddress &&
        trade.transaction.from ===
          this._muteswitchPairFactoryContext.ethereumAddress
      ) {
        if (
          trade.expectedConvertQuote !==
            this._currentTradeContext.expectedConvertQuote ||
          trade.routeText !== this._currentTradeContext.routeText ||
          trade.liquidityProviderFee !==
            this._currentTradeContext.liquidityProviderFee ||
          trade.stable !==
            this._currentTradeContext.stable ||
          this._currentTradeContext.tradeExpires >
            this._muteswitchRouterFactory.generateTradeDeadlineUnixTime()
        ) {
          this._currentTradeContext = this.buildCurrentTradeContext(trade);
          this._quoteChanged$.next(trade);
        }
      }
    }
  }
}
