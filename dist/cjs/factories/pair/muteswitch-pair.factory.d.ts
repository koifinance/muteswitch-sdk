import { CoinGecko } from '../../coin-gecko';
import { BestRouteQuotes } from '../router/models/best-route-quotes';
import { RouteQuote } from '../router/models/route-quote';
import { RouteContext } from '../router/models/route-context';
import { AllowanceAndBalanceOf } from '../token/models/allowance-balance-of';
import { Token } from '../token/models/token';
import { TradeContext } from './models/trade-context';
import { TradeDirection } from './models/trade-direction';
import { Transaction } from './models/transaction';
import { MuteSwitchPairFactoryContext } from './models/muteswitch-pair-factory-context';
export declare class MuteSwitchPairFactory {
    private _coinGecko;
    private _muteswitchPairFactoryContext;
    private _fromTokenFactory;
    private _toTokenFactory;
    private _muteswitchRouterFactory;
    private _watchingBlocks;
    private _currentTradeContext;
    private _quoteChanged$;
    private _updateEveryBlock;
    private _blockCount;
    constructor(_coinGecko: CoinGecko, _muteswitchPairFactoryContext: MuteSwitchPairFactoryContext);
    /**
     * The to token
     */
    get toToken(): Token;
    /**
     * The from token
     */
    get fromToken(): Token;
    /**
     * Get the provider url
     */
    get providerUrl(): string | undefined;
    /**
     * Get the to token balance
     */
    getFromTokenBalance(): Promise<string>;
    /**
     * Get the to token balance
     */
    getToTokenBalance(): Promise<string>;
    /**
     * Execute the trade path
     * @param amount The amount
     * @param direction The direction you want to get the quote from
     */
    private executeTradePath;
    /**
     * Destroy the trade instance watchers + subscriptions
     */
    private destroy;
    /**
     * Generate trade - this will return amount but you still need to send the transaction
     * if you want it to be executed on the blockchain
     * @param amount The amount you want to swap
     * @param direction The direction you want to get the quote from
     */
    trade(amount: string, direction?: TradeDirection): Promise<TradeContext>;
    /**
     * Find the best route rate out of all the route quotes
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    findBestRoute(amountToTrade: string, direction: TradeDirection): Promise<BestRouteQuotes>;
    /**
     * Find the best route rate out of all the route quotes
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    findAllPossibleRoutesWithQuote(amountToTrade: string, direction: TradeDirection): Promise<RouteQuote[]>;
    /**
     * Find all possible routes
     */
    findAllPossibleRoutes(): Promise<RouteContext[]>;
    /**
     * Get the allowance and balance for the from token (erc20 > blah) only
     */
    getAllowanceAndBalanceOfForFromToken(): Promise<AllowanceAndBalanceOf>;
    /**
     * Get the allowance and balance for to from token (eth > erc20) only
     */
    getAllowanceAndBalanceOfForToToken(): Promise<AllowanceAndBalanceOf>;
    /**
     * Get the allowance for the amount which can be moved from the `fromToken`
     * on the users behalf. Only valid when the `fromToken` is a ERC20 token.
     */
    allowance(): Promise<string>;
    /**
     * Generate the from token approve data max allowance to move the tokens.
     * This will return the data for you to send as a transaction
     */
    generateApproveMaxAllowanceData(): Promise<Transaction>;
    /**
     * Route getter
     */
    private get _routes();
    /**
     * Build the current trade context
     * @param trade The trade context
     */
    private buildCurrentTradeContext;
    /**
     * finds the best price and path for Erc20ToEth
     * @param baseConvertRequest The base convert request can be both input or output direction
     * @param direction The direction you want to get the quote from
     */
    private findBestPriceAndPathErc20ToEth;
    /**
     * finds the best price and path for Erc20ToErc20
     * @param baseConvertRequest The base convert request can be both input or output direction
     * @param direction The direction you want to get the quote from
     */
    private findBestPriceAndPathErc20ToErc20;
    /**
     * Find the best price and route path to take (will round down the slippage)
     * @param baseConvertRequest The base convert request can be both input or output direction
     * @param direction The direction you want to get the quote from
     */
    private findBestPriceAndPathEthToErc20;
    /**
     * Get the trade path
     */
    private tradePath;
    /**
     * Watch trade price move automatically emitting the stream if it changes
     */
    private watchTradePrice;
    /**
     * unwatch any block streams
     */
    private unwatchTradePrice;
    /**
     * Handle new block for the trade price moving automatically emitting the stream if it changes
     */
    private handleNewBlock;
}
