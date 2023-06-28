"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchPairFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const rxjs_1 = require("rxjs");
const constants_1 = require("../../common/constants");
const error_codes_1 = require("../../common/errors/error-codes");
const muteswitch_error_1 = require("../../common/errors/muteswitch-error");
const eth_1 = require("../../common/tokens/eth");
const deep_clone_1 = require("../../common/utils/deep-clone");
const trade_path_1 = require("../../common/utils/trade-path");
const trade_path_2 = require("../../enums/trade-path");
const get_muteswitch_contracts_1 = require("../../muteswitch-contract-context/get-muteswitch-contracts");
const muteswitch_router_factory_1 = require("../router/muteswitch-router.factory");
const token_factory_1 = require("../token/token.factory");
const trade_direction_1 = require("./models/trade-direction");
class MuteSwitchPairFactory {
    constructor(_coinGecko, _muteswitchPairFactoryContext) {
        this._coinGecko = _coinGecko;
        this._muteswitchPairFactoryContext = _muteswitchPairFactoryContext;
        this._fromTokenFactory = new token_factory_1.TokenFactory(this._muteswitchPairFactoryContext.fromToken.contractAddress, this._muteswitchPairFactoryContext.ethersProvider, this._muteswitchPairFactoryContext.settings.customNetwork, this._muteswitchPairFactoryContext.settings.cloneMuteSwitchContractDetails);
        this._toTokenFactory = new token_factory_1.TokenFactory(this._muteswitchPairFactoryContext.toToken.contractAddress, this._muteswitchPairFactoryContext.ethersProvider, this._muteswitchPairFactoryContext.settings.customNetwork);
        this._muteswitchRouterFactory = new muteswitch_router_factory_1.MuteSwitchRouterFactory(this._coinGecko, this._muteswitchPairFactoryContext.ethereumAddress, this._muteswitchPairFactoryContext.fromToken, this._muteswitchPairFactoryContext.toToken, this._muteswitchPairFactoryContext.settings, this._muteswitchPairFactoryContext.ethersProvider);
        this._watchingBlocks = false;
        this._quoteChanged$ = new rxjs_1.Subject();
        this._updateEveryBlock = 5;
        this._blockCount = 0;
    }
    /**
     * The to token
     */
    get toToken() {
        return this._muteswitchPairFactoryContext.toToken;
    }
    /**
     * The from token
     */
    get fromToken() {
        return this._muteswitchPairFactoryContext.fromToken;
    }
    /**
     * Get the provider url
     */
    get providerUrl() {
        return this._muteswitchPairFactoryContext.ethersProvider.getProviderUrl();
    }
    /**
     * Get the to token balance
     */
    getFromTokenBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tradePath() === trade_path_2.TradePath.ethToErc20) {
                const ethBalanceContext = yield this._muteswitchRouterFactory.getEthBalance();
                return ethBalanceContext.toFixed();
            }
            const erc20BalanceContext = yield this._fromTokenFactory.balanceOf(this._muteswitchPairFactoryContext.ethereumAddress);
            return new bignumber_js_1.default(erc20BalanceContext)
                .shiftedBy(this.fromToken.decimals * -1)
                .toFixed();
        });
    }
    /**
     * Get the to token balance
     */
    getToTokenBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tradePath() === trade_path_2.TradePath.erc20ToEth) {
                const ethBalanceContext = yield this._muteswitchRouterFactory.getEthBalance();
                return ethBalanceContext.toFixed();
            }
            const erc20BalanceContext = yield this._toTokenFactory.balanceOf(this._muteswitchPairFactoryContext.ethereumAddress);
            return new bignumber_js_1.default(erc20BalanceContext)
                .shiftedBy(this.toToken.decimals * -1)
                .toFixed();
        });
    }
    /**
     * Execute the trade path
     * @param amount The amount
     * @param direction The direction you want to get the quote from
     */
    executeTradePath(amount, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.tradePath()) {
                case trade_path_2.TradePath.erc20ToEth:
                    return yield this.findBestPriceAndPathErc20ToEth(amount, direction);
                case trade_path_2.TradePath.ethToErc20:
                    return yield this.findBestPriceAndPathEthToErc20(amount, direction);
                case trade_path_2.TradePath.erc20ToErc20:
                    return yield this.findBestPriceAndPathErc20ToErc20(amount, direction);
                default:
                    throw new muteswitch_error_1.MuteSwitchError(`${this.tradePath()} is not defined`, error_codes_1.ErrorCodes.tradePathIsNotSupported);
            }
        });
    }
    /**
     * Destroy the trade instance watchers + subscriptions
     */
    destroy() {
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
    trade(amount, direction = trade_direction_1.TradeDirection.input) {
        return __awaiter(this, void 0, void 0, function* () {
            this.destroy();
            const trade = yield this.executeTradePath(new bignumber_js_1.default(amount), direction);
            this._currentTradeContext = this.buildCurrentTradeContext(trade);
            this.watchTradePrice();
            return trade;
        });
    }
    /**
     * Find the best route rate out of all the route quotes
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    findBestRoute(amountToTrade, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._routes.findBestRoute(new bignumber_js_1.default(amountToTrade), direction);
        });
    }
    /**
     * Find the best route rate out of all the route quotes
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    findAllPossibleRoutesWithQuote(amountToTrade, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._routes.getAllPossibleRoutesWithQuotes(new bignumber_js_1.default(amountToTrade), direction);
        });
    }
    /**
     * Find all possible routes
     */
    findAllPossibleRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._routes.getAllPossibleRoutes();
        });
    }
    /**
     * Get the allowance and balance for the from token (erc20 > blah) only
     */
    getAllowanceAndBalanceOfForFromToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._fromTokenFactory.getAllowanceAndBalanceOf(this._muteswitchPairFactoryContext.ethereumAddress);
        });
    }
    /**
     * Get the allowance and balance for to from token (eth > erc20) only
     */
    getAllowanceAndBalanceOfForToToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._toTokenFactory.getAllowanceAndBalanceOf(this._muteswitchPairFactoryContext.ethereumAddress);
        });
    }
    /**
     * Get the allowance for the amount which can be moved from the `fromToken`
     * on the users behalf. Only valid when the `fromToken` is a ERC20 token.
     */
    allowance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tradePath() === trade_path_2.TradePath.ethToErc20) {
                return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
            }
            const allowance = yield this._fromTokenFactory.allowance(this._muteswitchPairFactoryContext.ethereumAddress);
            return allowance;
        });
    }
    /**
     * Generate the from token approve data max allowance to move the tokens.
     * This will return the data for you to send as a transaction
     */
    generateApproveMaxAllowanceData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tradePath() === trade_path_2.TradePath.ethToErc20) {
                throw new muteswitch_error_1.MuteSwitchError('You do not need to generate approve muteswitch allowance when doing eth > erc20', error_codes_1.ErrorCodes.generateApproveMaxAllowanceDataNotAllowed);
            }
            const data = this._fromTokenFactory.generateApproveAllowanceData(get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._muteswitchPairFactoryContext.settings.cloneMuteSwitchContractDetails), '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
            return {
                to: this.fromToken.contractAddress,
                from: this._muteswitchPairFactoryContext.ethereumAddress,
                data,
                value: constants_1.Constants.EMPTY_HEX_STRING,
            };
        });
    }
    /**
     * Route getter
     */
    get _routes() {
        return this._muteswitchRouterFactory;
    }
    /**
     * Build the current trade context
     * @param trade The trade context
     */
    buildCurrentTradeContext(trade) {
        return (0, deep_clone_1.deepClone)({
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
    findBestPriceAndPathErc20ToEth(baseConvertRequest, direction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const bestRouteQuotes = yield this._routes.findBestRoute(baseConvertRequest, direction);
            const bestRouteQuote = bestRouteQuotes.bestRouteQuote;
            const tradeContext = {
                quoteDirection: direction,
                baseConvertRequest: baseConvertRequest.toFixed(),
                minAmountConvertQuote: direction === trade_direction_1.TradeDirection.input
                    ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
                    : null,
                maximumSent: direction === trade_direction_1.TradeDirection.input
                    ? null
                    : bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
                expectedConvertQuote: bestRouteQuote.expectedConvertQuote,
                liquidityProviderFee: bestRouteQuote.liquidityProviderFee,
                liquidityProviderFeePercent: bestRouteQuote.liquidityProviderFee,
                stable: bestRouteQuote.stable,
                tradeExpires: bestRouteQuote.tradeExpires,
                routePathTokenMap: bestRouteQuote.routePathArrayTokenMap,
                routeText: bestRouteQuote.routeText,
                routePath: bestRouteQuote.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)),
                hasEnoughAllowance: bestRouteQuotes.hasEnoughAllowance,
                approvalTransaction: !bestRouteQuotes.hasEnoughAllowance
                    ? yield this.generateApproveMaxAllowanceData()
                    : undefined,
                toToken: (0, eth_1.turnTokenIntoEthForResponse)(this.toToken, (_b = (_a = this._muteswitchPairFactoryContext.settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === null || _b === void 0 ? void 0 : _b.nativeCurrency),
                toBalance: new bignumber_js_1.default(bestRouteQuotes.toBalance)
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
        });
    }
    /**
     * finds the best price and path for Erc20ToErc20
     * @param baseConvertRequest The base convert request can be both input or output direction
     * @param direction The direction you want to get the quote from
     */
    findBestPriceAndPathErc20ToErc20(baseConvertRequest, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            const bestRouteQuotes = yield this._routes.findBestRoute(baseConvertRequest, direction);
            const bestRouteQuote = bestRouteQuotes.bestRouteQuote;
            const tradeContext = {
                quoteDirection: direction,
                baseConvertRequest: baseConvertRequest.toFixed(),
                minAmountConvertQuote: direction === trade_direction_1.TradeDirection.input
                    ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
                    : null,
                maximumSent: direction === trade_direction_1.TradeDirection.input
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
                    ? yield this.generateApproveMaxAllowanceData()
                    : undefined,
                toToken: this.toToken,
                toBalance: new bignumber_js_1.default(bestRouteQuotes.toBalance)
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
        });
    }
    /**
     * Find the best price and route path to take (will round down the slippage)
     * @param baseConvertRequest The base convert request can be both input or output direction
     * @param direction The direction you want to get the quote from
     */
    findBestPriceAndPathEthToErc20(baseConvertRequest, direction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const bestRouteQuotes = yield this._routes.findBestRoute(baseConvertRequest, direction);
            const bestRouteQuote = bestRouteQuotes.bestRouteQuote;
            const tradeContext = {
                quoteDirection: direction,
                baseConvertRequest: baseConvertRequest.toFixed(),
                minAmountConvertQuote: direction === trade_direction_1.TradeDirection.input
                    ? bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage
                    : null,
                maximumSent: direction === trade_direction_1.TradeDirection.input
                    ? null
                    : bestRouteQuote.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
                expectedConvertQuote: bestRouteQuote.expectedConvertQuote,
                liquidityProviderFee: bestRouteQuote.liquidityProviderFee,
                liquidityProviderFeePercent: bestRouteQuote.liquidityProviderFee,
                stable: bestRouteQuote.stable,
                tradeExpires: bestRouteQuote.tradeExpires,
                routePathTokenMap: bestRouteQuote.routePathArrayTokenMap,
                routeText: bestRouteQuote.routeText,
                routePath: bestRouteQuote.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)),
                hasEnoughAllowance: true,
                toToken: this.toToken,
                toBalance: new bignumber_js_1.default(bestRouteQuotes.toBalance)
                    .shiftedBy(this.toToken.decimals * -1)
                    .toFixed(),
                fromToken: (0, eth_1.turnTokenIntoEthForResponse)(this.fromToken, (_b = (_a = this._muteswitchPairFactoryContext.settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === null || _b === void 0 ? void 0 : _b.nativeCurrency),
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
        });
    }
    /**
     * Get the trade path
     */
    tradePath() {
        var _a;
        const network = this._muteswitchPairFactoryContext.ethersProvider.network();
        return (0, trade_path_1.getTradePath)(network.chainId, this.fromToken, this.toToken, (_a = this._muteswitchPairFactoryContext.settings.customNetwork) === null || _a === void 0 ? void 0 : _a.nativeWrappedTokenInfo);
    }
    /**
     * Watch trade price move automatically emitting the stream if it changes
     */
    watchTradePrice() {
        if (!this._watchingBlocks) {
            this._muteswitchPairFactoryContext.ethersProvider.provider.on('block', () => __awaiter(this, void 0, void 0, function* () {
                yield this.handleNewBlock();
            }));
            this._watchingBlocks = true;
        }
    }
    /**
     * unwatch any block streams
     */
    unwatchTradePrice() {
        this._muteswitchPairFactoryContext.ethersProvider.provider.removeAllListeners('block');
        this._watchingBlocks = false;
    }
    /**
     * Handle new block for the trade price moving automatically emitting the stream if it changes
     */
    handleNewBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._quoteChanged$.observers.length > 0 && this._currentTradeContext) {
                this._blockCount++;
                if (this._updateEveryBlock > this._blockCount)
                    return;
                this._blockCount = 0;
                const trade = yield this.executeTradePath(new bignumber_js_1.default(this._currentTradeContext.baseConvertRequest), this._currentTradeContext.quoteDirection);
                if (trade.fromToken.contractAddress ===
                    this._currentTradeContext.fromToken.contractAddress &&
                    trade.toToken.contractAddress ===
                        this._currentTradeContext.toToken.contractAddress &&
                    trade.transaction.from ===
                        this._muteswitchPairFactoryContext.ethereumAddress) {
                    if (trade.expectedConvertQuote !==
                        this._currentTradeContext.expectedConvertQuote ||
                        trade.routeText !== this._currentTradeContext.routeText ||
                        trade.liquidityProviderFee !==
                            this._currentTradeContext.liquidityProviderFee ||
                        trade.stable !==
                            this._currentTradeContext.stable ||
                        this._currentTradeContext.tradeExpires >
                            this._muteswitchRouterFactory.generateTradeDeadlineUnixTime()) {
                        this._currentTradeContext = this.buildCurrentTradeContext(trade);
                        this._quoteChanged$.next(trade);
                    }
                }
            }
        });
    }
}
exports.MuteSwitchPairFactory = MuteSwitchPairFactory;
