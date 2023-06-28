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
exports.MuteSwitchRouterFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const constants_1 = require("../../common/constants");
const error_codes_1 = require("../../common/errors/error-codes");
const muteswitch_error_1 = require("../../common/errors/muteswitch-error");
//import { DAI } from '../../common/tokens/dai';
const eth_1 = require("../../common/tokens/eth");
const usdc_1 = require("../../common/tokens/usdc");
const wbtc_1 = require("../../common/tokens/wbtc");
const weth_1 = require("../../common/tokens/weth");
const deep_clone_1 = require("../../common/utils/deep-clone");
const format_ether_1 = require("../../common/utils/format-ether");
const hexlify_1 = require("../../common/utils/hexlify");
const only_unique_1 = require("../../common/utils/only-unique");
const parse_ether_1 = require("../../common/utils/parse-ether");
const to_ethers_big_number_1 = require("../../common/utils/to-ethers-big-number");
const trade_path_1 = require("../../common/utils/trade-path");
const custom_multicall_1 = require("../../custom-multicall");
const chain_id_1 = require("../../enums/chain-id");
const trade_path_2 = require("../../enums/trade-path");
const get_muteswitch_contracts_1 = require("../../muteswitch-contract-context/get-muteswitch-contracts");
const muteswitch_contract_context_1 = require("../../muteswitch-contract-context/muteswitch-contract-context");
const trade_direction_1 = require("../pair/models/trade-direction");
const tokens_factory_1 = require("../token/tokens.factory");
const router_direction_1 = require("./enums/router-direction");
const muteswitch_router_contract_factory_1 = require("./v2/muteswitch-router-contract.factory");
class MuteSwitchRouterFactory {
    constructor(_coinGecko, _ethereumAddress, _fromToken, _toToken, _settings, _ethersProvider) {
        var _a, _b;
        this._coinGecko = _coinGecko;
        this._ethereumAddress = _ethereumAddress;
        this._fromToken = _fromToken;
        this._toToken = _toToken;
        this._settings = _settings;
        this._ethersProvider = _ethersProvider;
        this._multicall = new custom_multicall_1.CustomMulticall(this._ethersProvider.provider, (_b = (_a = this._settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === null || _b === void 0 ? void 0 : _b.multicallContractAddress);
        this._MuteSwitchRouterContractFactory = new muteswitch_router_contract_factory_1.MuteSwitchRouterContractFactory(this._ethersProvider, get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails));
        this._tokensFactory = new tokens_factory_1.TokensFactory(this._ethersProvider, this._settings.customNetwork, this._settings.cloneMuteSwitchContractDetails);
    }
    /**
     * Get all possible routes will only go up to 4 due to gas increase the more routes
     * you go.
     */
    getAllPossibleRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            let findPairs = [];
            if (this._cachePossibleRoutes)
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
            }
            else {
                // multihops turned off so only go direct
                findPairs = [[[this._fromToken, this._toToken]]];
            }
            // console.log(JSON.stringify(findPairs, null, 4));
            const contractCallContext = [];
            {
                contractCallContext.push({
                    reference: 'main',
                    contractAddress: get_muteswitch_contracts_1.muteswitchContracts.getPairAddress(this._settings.cloneMuteSwitchContractDetails),
                    abi: muteswitch_contract_context_1.MuteSwitchContractContext.pairAbi,
                    calls: [],
                });
                for (let pairs = 0; pairs < findPairs.length; pairs++) {
                    for (let tokenPairs = 0; tokenPairs < findPairs[pairs].length; tokenPairs++) {
                        const fromToken = findPairs[pairs][tokenPairs][0];
                        const toToken = findPairs[pairs][tokenPairs][1];
                        // vol pair
                        contractCallContext[0].calls.push({
                            reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-false`,
                            methodName: 'getPair',
                            methodParameters: [
                                (0, eth_1.removeEthFromContractAddress)(fromToken.contractAddress),
                                (0, eth_1.removeEthFromContractAddress)(toToken.contractAddress),
                                false
                            ],
                        });
                        //stable pair
                        contractCallContext[0].calls.push({
                            reference: `${fromToken.contractAddress}-${toToken.contractAddress}-${fromToken.symbol}/${toToken.symbol}-true`,
                            methodName: 'getPair',
                            methodParameters: [
                                (0, eth_1.removeEthFromContractAddress)(fromToken.contractAddress),
                                (0, eth_1.removeEthFromContractAddress)(toToken.contractAddress),
                                true
                            ],
                        });
                    }
                }
            }
            var allPossibleRoutes = [];
            const contractCallResults = yield this._multicall.call(contractCallContext);
            {
                const results = contractCallResults.results['main'];
                const availablePairs = results.callsReturnContext.filter((c) => c.returnValues[0] !== '0x0000000000000000000000000000000000000000');
                // console.log(JSON.stringify(results.callsReturnContext, null, 4));
                const fromTokenRoutes = {
                    token: this._fromToken,
                    pairs: {
                        fromTokenPairs: this.getTokenAvailablePairs(this._fromToken, availablePairs, router_direction_1.RouterDirection.from)
                    },
                };
                const toTokenRoutes = {
                    token: this._toToken,
                    pairs: {
                        toTokenPairs: this.getTokenAvailablePairs(this._toToken, availablePairs, router_direction_1.RouterDirection.to)
                    },
                };
                // console.log(JSON.stringify(fromTokenRoutes, null, 4));
                // console.log('break');
                // console.log(JSON.stringify(toTokenRoutes, null, 4));
                // console.log('break');
                const allMainRoutes = [];
                for (let i = 0; i < this.allMainTokens.length; i++) {
                    const fromTokenPairs = this.getTokenAvailablePairs(this.allMainTokens[i], availablePairs, router_direction_1.RouterDirection.from);
                    const toTokenPairs = this.getTokenAvailablePairs(this.allMainTokens[i], availablePairs, router_direction_1.RouterDirection.to);
                    allMainRoutes.push({
                        token: this.allMainTokens[i],
                        pairs: {
                            fromTokenPairs,
                            toTokenPairs,
                        },
                    });
                }
                // console.log(JSON.stringify(allMainRoutes, null, 4));
                allPossibleRoutes = yield this.workOutAllPossibleRoutes(fromTokenRoutes, toTokenRoutes, allMainRoutes);
            }
            // console.log(JSON.stringify(allPossibleRoutes, null, 4));
            this._cachePossibleRoutes = allPossibleRoutes;
            return this._cachePossibleRoutes;
        });
    }
    /**
     * Get all possible routes with the quotes
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    getAllPossibleRoutesWithQuotes(amountToTrade, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            const tradeAmount = this.formatAmountToTrade(amountToTrade, direction);
            const routes = yield this.getAllPossibleRoutes();
            const contractCallContext = [];
            {
                contractCallContext.push({
                    reference: 'main',
                    contractAddress: get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails),
                    abi: muteswitch_contract_context_1.MuteSwitchContractContext.routerAbi,
                    calls: [],
                    context: routes,
                });
                for (let i = 0; i < routes.length; i++) {
                    const routeCombo = routes[i].route.map((c) => {
                        return (0, eth_1.removeEthFromContractAddress)(c.contractAddress);
                    });
                    contractCallContext[0].calls.push({
                        reference: `route${i}`,
                        methodName: direction === trade_direction_1.TradeDirection.input
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
            const contractCallResults = yield this._multicall.call(contractCallContext);
            return this.buildRouteQuotesFromResults(amountToTrade, contractCallResults, direction);
        });
    }
    /**
     * Finds the best route
     * @param amountToTrade The amount they want to trade
     * @param direction The direction you want to get the quote from
     */
    findBestRoute(amountToTrade, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            let allRoutes = yield this.getAllPossibleRoutesWithQuotes(amountToTrade, direction);
            if (allRoutes.length === 0) {
                throw new muteswitch_error_1.MuteSwitchError(`No routes found for ${this._fromToken.symbol} > ${this._toToken.symbol}`, error_codes_1.ErrorCodes.noRoutesFound);
            }
            const allowanceAndBalances = yield this.hasEnoughAllowanceAndBalance(amountToTrade, allRoutes[0], direction);
            return {
                bestRouteQuote: allRoutes[0],
                triedRoutesQuote: allRoutes.map((route) => {
                    return {
                        expectedConvertQuote: route.expectedConvertQuote,
                        expectedConvertQuoteOrTokenAmountInMaxWithSlippage: route.expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
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
        });
    }
    /**
     * Generates the trade datetime unix time
     */
    generateTradeDeadlineUnixTime() {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + this._settings.deadlineMinutes * 60000);
        return (expiryDate.getTime() / 1e3) | 0;
    }
    /**
     * Get eth balance
     */
    getEthBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this._ethersProvider.balanceOf(this._ethereumAddress);
            return new bignumber_js_1.default(balance).shiftedBy(constants_1.Constants.ETH_MAX_DECIMALS * -1);
        });
    }
    /**
     * Generate trade data eth > erc20
     * @param ethAmountIn The eth amount in
     * @param tokenAmount The token amount
     * @param routeQuoteTradeContext The route quote trade context
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataEthToErc20Input(ethAmountIn, tokenAmount, routeQuoteTradeContext, deadline) {
        // muteswitch adds extra digits on even if the token is say 8 digits long
        const convertedMinTokens = tokenAmount
            .shiftedBy(this._toToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapExactETHForTokens((0, hexlify_1.hexlify)(convertedMinTokens), routeQuoteTradeContext.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)), this._ethereumAddress, deadline, [false]);
    }
    /**
     * Generate trade data eth > erc20
     * @param tokenAmountInMax The amount in max
     * @param ethAmountOut The amount to receive
     * @param routeQuote The route quote
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataEthToErc20Output(ethAmountInMax, tokenAmountOut, routeQuoteTradeContext, deadline) {
        const amountOut = tokenAmountOut
            .shiftedBy(this._toToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapETHForExactTokens((0, hexlify_1.hexlify)(amountOut), routeQuoteTradeContext.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)), this._ethereumAddress, deadline, [false]);
    }
    /**
     * Generate trade amount erc20 > eth for input direction
     * @param tokenAmount The amount in
     * @param ethAmountOutMin The min amount to receive
     * @param routeQuoteTradeContext The route quote trade context
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataErc20ToEthInput(tokenAmount, ethAmountOutMin, routeQuoteTradeContext, deadline) {
        // muteswitch adds extra digits on even if the token is say 8 digits long
        const amountIn = tokenAmount
            .shiftedBy(this._fromToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapExactTokensForETH((0, hexlify_1.hexlify)(amountIn), (0, hexlify_1.hexlify)((0, parse_ether_1.parseEther)(ethAmountOutMin)), routeQuoteTradeContext.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)), this._ethereumAddress, deadline, [false]);
    }
    /**
     * Generate trade amount erc20 > eth for input direction
     * @param tokenAmountInMax The amount in max
     * @param ethAmountOut The amount to receive
     * @param routeQuoteTradeContext The route quote trade context
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataErc20ToEthOutput(tokenAmountInMax, ethAmountOut, routeQuoteTradeContext, deadline) {
        // muteswitch adds extra digits on even if the token is say 8 digits long
        const amountInMax = tokenAmountInMax
            .shiftedBy(this._fromToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapTokensForExactETH((0, hexlify_1.hexlify)((0, parse_ether_1.parseEther)(ethAmountOut)), (0, hexlify_1.hexlify)(amountInMax), routeQuoteTradeContext.routePathArray.map((r) => (0, eth_1.removeEthFromContractAddress)(r)), this._ethereumAddress, deadline, [false]);
    }
    /**
     * Generate trade amount erc20 > erc20 for input
     * @param tokenAmount The token amount
     * @param tokenAmountOut The min token amount out
     * @param routeQuoteTradeContext The route quote trade context
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataErc20ToErc20Input(tokenAmount, tokenAmountMin, routeQuoteTradeContext, deadline) {
        // muteswitch adds extra digits on even if the token is say 8 digits long
        const amountIn = tokenAmount
            .shiftedBy(this._fromToken.decimals)
            .decimalPlaces(0);
        const amountMin = tokenAmountMin
            .shiftedBy(this._toToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapExactTokensForTokens((0, hexlify_1.hexlify)(amountIn), (0, hexlify_1.hexlify)(amountMin), routeQuoteTradeContext.routePathArray, this._ethereumAddress, deadline, [false]);
    }
    /**
     * Generate trade amount erc20 > erc20 for output
     * @param tokenAmount The token amount
     * @param tokenAmountOut The min token amount out
     * @param routeQuoteTradeContext The route quote trade context
     * @param deadline The deadline it expiries unix time
     */
    generateTradeDataErc20ToErc20Output(tokenAmountInMax, tokenAmountOut, routeQuoteTradeContext, deadline) {
        // muteswitch adds extra digits on even if the token is say 8 digits long
        const amountInMax = tokenAmountInMax
            .shiftedBy(this._fromToken.decimals)
            .decimalPlaces(0);
        const amountOut = tokenAmountOut
            .shiftedBy(this._toToken.decimals)
            .decimalPlaces(0);
        return this._MuteSwitchRouterContractFactory.swapTokensForExactTokens((0, hexlify_1.hexlify)(amountOut), (0, hexlify_1.hexlify)(amountInMax), routeQuoteTradeContext.routePathArray, this._ethereumAddress, deadline, [false]);
    }
    /**
     * Build up a transaction for erc20 from
     * @param data The data
     */
    buildUpTransactionErc20(data) {
        return {
            to: get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails),
            from: this._ethereumAddress,
            data,
            value: constants_1.Constants.EMPTY_HEX_STRING,
        };
    }
    /**
     * Build up a transaction for eth from
     * @param ethValue The eth value
     * @param data The data
     */
    buildUpTransactionEth(ethValue, data) {
        return {
            to: get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._settings.cloneMuteSwitchContractDetails),
            from: this._ethereumAddress,
            data,
            value: (0, to_ethers_big_number_1.toEthersBigNumber)((0, parse_ether_1.parseEther)(ethValue)).toHexString(),
        };
    }
    /**
     * Get the allowance and balance for the from and to token (will get balance for eth as well)
     */
    getAllowanceAndBalanceForTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const allowanceAndBalanceOfForTokens = yield this._tokensFactory.getAllowanceAndBalanceOfForContracts(this._ethereumAddress, [this._fromToken.contractAddress, this._toToken.contractAddress], false);
            return {
                fromToken: allowanceAndBalanceOfForTokens.find((c) => c.token.contractAddress.toLowerCase() ===
                    this._fromToken.contractAddress.toLowerCase()).allowanceAndBalanceOf,
                toToken: allowanceAndBalanceOfForTokens.find((c) => c.token.contractAddress.toLowerCase() ===
                    this._toToken.contractAddress.toLowerCase()).allowanceAndBalanceOf,
            };
        });
    }
    /**
     * Has got enough allowance to do the trade
     * @param amount The amount you want to swap
     */
    hasGotEnoughAllowance(amount, allowance) {
        if (this.tradePath() === trade_path_2.TradePath.ethToErc20) {
            return true;
        }
        const bigNumberAllowance = new bignumber_js_1.default(allowance).shiftedBy(this._fromToken.decimals * -1);
        if (new bignumber_js_1.default(amount).isGreaterThan(bigNumberAllowance)) {
            return false;
        }
        return true;
    }
    hasEnoughAllowanceAndBalance(amountToTrade, bestRouteQuote, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            const allowanceAndBalancesForTokens = yield this.getAllowanceAndBalanceForTokens();
            let enoughBalance = false;
            let fromBalance = allowanceAndBalancesForTokens.fromToken.balanceOf;
            switch (this.tradePath()) {
                case trade_path_2.TradePath.ethToErc20:
                    const result = yield this.hasGotEnoughBalanceEth(direction === trade_direction_1.TradeDirection.input
                        ? amountToTrade.toFixed()
                        : bestRouteQuote.expectedConvertQuote);
                    enoughBalance = result.hasEnough;
                    fromBalance = result.balance;
                    break;
                case trade_path_2.TradePath.erc20ToErc20:
                case trade_path_2.TradePath.erc20ToEth:
                    if (direction == trade_direction_1.TradeDirection.input) {
                        const result = this.hasGotEnoughBalanceErc20(amountToTrade.toFixed(), allowanceAndBalancesForTokens.fromToken.balanceOf);
                        enoughBalance = result.hasEnough;
                        fromBalance = result.balance;
                    }
                    else {
                        const result = this.hasGotEnoughBalanceErc20(bestRouteQuote.expectedConvertQuote, allowanceAndBalancesForTokens.fromToken.balanceOf);
                        enoughBalance = result.hasEnough;
                        fromBalance = result.balance;
                    }
            }
            const enoughAllowance = direction === trade_direction_1.TradeDirection.input
                ? this.hasGotEnoughAllowance(amountToTrade.toFixed(), allowanceAndBalancesForTokens.fromToken.allowance)
                : this.hasGotEnoughAllowance(bestRouteQuote.expectedConvertQuote, allowanceAndBalancesForTokens.fromToken.allowance);
            return {
                enoughAllowance,
                enoughBalance,
                fromBalance,
                toBalance: allowanceAndBalancesForTokens.toToken.balanceOf,
            };
        });
    }
    /**
     * Has got enough balance to do the trade (eth check only)
     * @param amount The amount you want to swap
     */
    hasGotEnoughBalanceEth(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.getEthBalance();
            if (new bignumber_js_1.default(amount).isGreaterThan(balance)) {
                return {
                    hasEnough: false,
                    balance: balance.toFixed(),
                };
            }
            return {
                hasEnough: true,
                balance: balance.toFixed(),
            };
        });
    }
    /**
     * Has got enough balance to do the trade (erc20 check only)
     * @param amount The amount you want to swap
     */
    hasGotEnoughBalanceErc20(amount, balance) {
        const bigNumberBalance = new bignumber_js_1.default(balance).shiftedBy(this._fromToken.decimals * -1);
        if (new bignumber_js_1.default(amount).isGreaterThan(bigNumberBalance)) {
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
    filterWithTransactionFees(allRoutes, enoughAllowance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._settings.gasSettings && !this._settings.disableMultihops) {
                const ethContract = weth_1.WETHContract.ZKSYNC_ERA().contractAddress;
                const fiatPrices = yield this._coinGecko.getCoinGeckoFiatPrices([
                    this._toToken.contractAddress,
                    ethContract,
                ]);
                const toUsdValue = fiatPrices[this._toToken.contractAddress];
                const ethUsdValue = fiatPrices[weth_1.WETHContract.ZKSYNC_ERA().contractAddress];
                if (toUsdValue && ethUsdValue) {
                    const bestRouteQuoteHops = this.getBestRouteQuotesHops(allRoutes, enoughAllowance);
                    const gasPriceGwei = yield this._settings.gasSettings.getGasPrice();
                    const gasPrice = new bignumber_js_1.default(gasPriceGwei).times(1e9);
                    let bestRoute;
                    for (let i = 0; i < bestRouteQuoteHops.length; i++) {
                        const route = bestRouteQuoteHops[i];
                        const expectedConvertQuoteFiatPrice = new bignumber_js_1.default(route.expectedConvertQuote).times(toUsdValue);
                        const txFee = (0, format_ether_1.formatEther)(new bignumber_js_1.default((yield this._ethersProvider.provider.estimateGas(route.transaction)).toHexString()).times(gasPrice)).times(ethUsdValue);
                        route.gasPriceEstimatedBy = gasPriceGwei;
                        const expectedConvertQuoteMinusTxFees = expectedConvertQuoteFiatPrice.minus(txFee);
                        if (bestRoute) {
                            if (expectedConvertQuoteMinusTxFees.isGreaterThan(bestRoute.expectedConvertQuoteMinusTxFees)) {
                                bestRoute = {
                                    routeQuote: bestRouteQuoteHops[i],
                                    expectedConvertQuoteMinusTxFees,
                                };
                            }
                        }
                        else {
                            bestRoute = {
                                routeQuote: bestRouteQuoteHops[i],
                                expectedConvertQuoteMinusTxFees,
                            };
                        }
                    }
                    if (bestRoute) {
                        const routeIndex = allRoutes.findIndex((r) => r.expectedConvertQuote ===
                            bestRoute.routeQuote.expectedConvertQuote &&
                            bestRoute.routeQuote.routeText === r.routeText);
                        allRoutes.splice(routeIndex, 1);
                        allRoutes.unshift(bestRoute.routeQuote);
                    }
                }
            }
            return allRoutes;
        });
    }
    /**
     * Work out the best route quote hops aka the best direct, the best 3 hop and the best 4 hop
     * @param allRoutes All the routes
     * @param enoughAllowance Has got enough allowance
     */
    getBestRouteQuotesHops(allRoutes, enoughAllowance) {
        const routes = [];
        for (let i = 0; i < allRoutes.length; i++) {
            if (routes.find((r) => r.routePathArray.length === 2) &&
                routes.find((r) => r.routePathArray.length === 3) &&
                routes.find((r) => r.routePathArray.length === 4)) {
                break;
            }
            const route = allRoutes[i];
            if (enoughAllowance) {
                if (route.routePathArray.length === 2 &&
                    !routes.find((r) => r.routePathArray.length === 2)) {
                    routes.push(route);
                    continue;
                }
                if (route.routePathArray.length === 3 &&
                    !routes.find((r) => r.routePathArray.length === 3)) {
                    routes.push(route);
                    continue;
                }
                if (route.routePathArray.length === 4 &&
                    !routes.find((r) => r.routePathArray.length === 4)) {
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
    workOutAllPossibleRoutes(fromTokenRoutes, toTokenRoutes, allMainRoutes) {
        return __awaiter(this, void 0, void 0, function* () {
            const jointCompatibleRoutes = toTokenRoutes.pairs.toTokenPairs.filter((t) => fromTokenRoutes.pairs.fromTokenPairs.find((f) => f.contractAddress.toLowerCase() === t.contractAddress.toLowerCase()));
            const routes = [];
            if (fromTokenRoutes.pairs.fromTokenPairs.find((t) => t.contractAddress.toLowerCase() ===
                toTokenRoutes.token.contractAddress.toLowerCase())) {
                routes.push({
                    route: [fromTokenRoutes.token, toTokenRoutes.token]
                });
            }
            for (let i = 0; i < allMainRoutes.length; i++) {
                const tokenRoute = allMainRoutes[i];
                if (jointCompatibleRoutes.find((c) => c.contractAddress.toLowerCase() ===
                    tokenRoute.token.contractAddress.toLowerCase())) {
                    routes.push({
                        route: [fromTokenRoutes.token, tokenRoute.token, toTokenRoutes.token]
                    });
                    for (let f = 0; f < fromTokenRoutes.pairs.fromTokenPairs.length; f++) {
                        const fromSupportedToken = fromTokenRoutes.pairs.fromTokenPairs[f];
                        if (tokenRoute.pairs.toTokenPairs.find((pair) => pair.contractAddress.toLowerCase() ===
                            fromSupportedToken.contractAddress.toLowerCase())) {
                            const workedOutFromRoute = [
                                fromTokenRoutes.token,
                                fromSupportedToken,
                                tokenRoute.token,
                                toTokenRoutes.token,
                            ];
                            if (workedOutFromRoute.filter(only_unique_1.onlyUnique).length ===
                                workedOutFromRoute.length) {
                                routes.push({
                                    route: workedOutFromRoute
                                });
                            }
                        }
                    }
                    for (let f = 0; f < toTokenRoutes.pairs.toTokenPairs.length; f++) {
                        const toSupportedToken = toTokenRoutes.pairs.toTokenPairs[f];
                        if (tokenRoute.pairs.fromTokenPairs.find((pair) => pair.contractAddress.toLowerCase() ===
                            toSupportedToken.contractAddress.toLowerCase())) {
                            const workedOutToRoute = [
                                fromTokenRoutes.token,
                                tokenRoute.token,
                                toSupportedToken,
                                toTokenRoutes.token,
                            ];
                            if (workedOutToRoute.filter(only_unique_1.onlyUnique).length ===
                                workedOutToRoute.length) {
                                routes.push({
                                    route: workedOutToRoute
                                });
                            }
                        }
                    }
                }
            }
            return routes;
        });
    }
    getTokenAvailablePairs(token, allAvailablePairs, direction) {
        switch (direction) {
            case router_direction_1.RouterDirection.from:
                return this.getFromRouterDirectionAvailablePairs(token, allAvailablePairs);
            case router_direction_1.RouterDirection.to:
                return this.getToRouterDirectionAvailablePairs(token, allAvailablePairs);
        }
    }
    getFromRouterDirectionAvailablePairs(token, allAvailablePairs) {
        const fromRouterDirection = allAvailablePairs.filter((c) => c.reference.split('-')[0] === token.contractAddress);
        const tokens = [];
        const stable = [];
        for (let index = 0; index < fromRouterDirection.length; index++) {
            const context = fromRouterDirection[index];
            tokens.push(this.allTokens.find((t) => t.contractAddress === context.reference.split('-')[1]));
            stable.push(context.reference.split('-')[3] == 'true');
        }
        return tokens;
    }
    getToRouterDirectionAvailablePairs(token, allAvailablePairs) {
        const toRouterDirection = allAvailablePairs.filter((c) => c.reference.split('-')[1] === token.contractAddress);
        const tokens = [];
        const stable = [];
        for (let index = 0; index < toRouterDirection.length; index++) {
            const context = toRouterDirection[index];
            tokens.push(this.allTokens.find((t) => t.contractAddress === context.reference.split('-')[0]));
            stable.push(context.reference.split('-')[3] == 'true');
        }
        return tokens;
    }
    /**
     * Build up route quotes from results
     * @param contractCallResults The contract call results
     * @param direction The direction you want to get the quote from
     */
    buildRouteQuotesFromResults(amountToTrade, contractCallResults, direction) {
        const tradePath = this.tradePath();
        const result = [];
        for (const key in contractCallResults.results) {
            const contractCallReturnContext = contractCallResults.results[key];
            if (contractCallReturnContext) {
                for (let i = 0; i < contractCallReturnContext.callsReturnContext.length; i++) {
                    const callReturnContext = contractCallReturnContext.callsReturnContext[i];
                    //console.log(JSON.stringify(callReturnContext, null, 4));
                    if (!callReturnContext.success) {
                        continue;
                    }
                    switch (tradePath) {
                        case trade_path_2.TradePath.ethToErc20:
                            result.push(this.buildRouteQuoteForEthToErc20(amountToTrade, callReturnContext, contractCallReturnContext.originalContractCallContext.context[i], direction));
                            break;
                        case trade_path_2.TradePath.erc20ToEth:
                            result.push(this.buildRouteQuoteForErc20ToEth(amountToTrade, callReturnContext, contractCallReturnContext.originalContractCallContext.context[i], direction));
                            break;
                        case trade_path_2.TradePath.erc20ToErc20:
                            result.push(this.buildRouteQuoteForErc20ToErc20(amountToTrade, callReturnContext, contractCallReturnContext.originalContractCallContext.context[i], direction));
                            break;
                        default:
                            throw new muteswitch_error_1.MuteSwitchError(`${tradePath} not found`, error_codes_1.ErrorCodes.tradePathIsNotSupported);
                    }
                }
            }
        }
        if (direction === trade_direction_1.TradeDirection.input) {
            return result.sort((a, b) => {
                if (new bignumber_js_1.default(a.expectedConvertQuote).isGreaterThan(b.expectedConvertQuote)) {
                    return -1;
                }
                return new bignumber_js_1.default(a.expectedConvertQuote).isLessThan(b.expectedConvertQuote)
                    ? 1
                    : 0;
            });
        }
        else {
            return result.sort((a, b) => {
                if (new bignumber_js_1.default(a.expectedConvertQuote).isLessThan(b.expectedConvertQuote)) {
                    return -1;
                }
                return new bignumber_js_1.default(a.expectedConvertQuote).isGreaterThan(b.expectedConvertQuote)
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
    buildRouteQuoteForErc20ToErc20(amountToTrade, callReturnContext, routeContext, direction) {
        const convertQuoteUnformatted = this.getConvertQuoteUnformatted(callReturnContext, direction);
        const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(callReturnContext, direction);
        const expectedConvertQuote = direction === trade_direction_1.TradeDirection.input
            ? convertQuoteUnformatted
                .shiftedBy(this._toToken.decimals * -1)
                .toFixed(this._toToken.decimals)
            : convertQuoteUnformatted
                .shiftedBy(this._fromToken.decimals * -1)
                .toFixed(this._fromToken.decimals);
        const expectedConvertQuoteOrTokenAmountInMaxWithSlippage = this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(expectedConvertQuote, direction);
        const tradeExpires = this.generateTradeDeadlineUnixTime();
        const routeQuoteTradeContext = {
            liquidityProviderFee: [0],
            routePathArray: callReturnContext.methodParameters[1],
        };
        const data = direction === trade_direction_1.TradeDirection.input
            ? this.generateTradeDataErc20ToErc20Input(amountToTrade, new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), routeQuoteTradeContext, tradeExpires.toString())
            : this.generateTradeDataErc20ToErc20Output(new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), amountToTrade, routeQuoteTradeContext, tradeExpires.toString());
        const transaction = this.buildUpTransactionErc20(data);
        return {
            expectedConvertQuote,
            expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
            transaction,
            tradeExpires,
            routePathArrayTokenMap: callReturnContext.methodParameters[1].map((c) => {
                return this.allTokens.find((t) => t.contractAddress === c);
            }),
            expectedAmounts: callReturnContext.returnValues[0],
            routeText: callReturnContext.methodParameters[1]
                .map((c) => {
                return this.allTokens.find((t) => t.contractAddress === c)
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
    buildRouteQuoteForEthToErc20(amountToTrade, callReturnContext, routeContext, direction) {
        const convertQuoteUnformatted = this.getConvertQuoteUnformatted(callReturnContext, direction);
        const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(callReturnContext, direction);
        const expectedConvertQuote = direction === trade_direction_1.TradeDirection.input
            ? convertQuoteUnformatted
                .shiftedBy(this._toToken.decimals * -1)
                .toFixed(this._toToken.decimals)
            : new bignumber_js_1.default((0, format_ether_1.formatEther)(convertQuoteUnformatted)).toFixed(this._fromToken.decimals);
        const expectedConvertQuoteOrTokenAmountInMaxWithSlippage = this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(expectedConvertQuote, direction);
        const tradeExpires = this.generateTradeDeadlineUnixTime();
        const routeQuoteTradeContext = {
            liquidityProviderFee: [0],
            routePathArray: callReturnContext.methodParameters[1],
        };
        const data = direction === trade_direction_1.TradeDirection.input
            ? this.generateTradeDataEthToErc20Input(amountToTrade, new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), routeQuoteTradeContext, tradeExpires.toString())
            : this.generateTradeDataEthToErc20Output(new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), amountToTrade, routeQuoteTradeContext, tradeExpires.toString());
        const transaction = this.buildUpTransactionEth(direction === trade_direction_1.TradeDirection.input
            ? amountToTrade
            : new bignumber_js_1.default(expectedConvertQuote), data);
        return {
            expectedConvertQuote,
            expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
            transaction,
            tradeExpires,
            routePathArrayTokenMap: callReturnContext.methodParameters[1].map((c, index) => {
                var _a, _b;
                const token = (0, deep_clone_1.deepClone)(this.allTokens.find((t) => t.contractAddress === c));
                if (index === 0) {
                    return (0, eth_1.turnTokenIntoEthForResponse)(token, (_b = (_a = this._settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === null || _b === void 0 ? void 0 : _b.nativeCurrency);
                }
                return token;
            }),
            expectedAmounts: callReturnContext.returnValues[0],
            routeText: callReturnContext.methodParameters[1]
                .map((c, index) => {
                if (index === 0) {
                    return this.getNativeTokenSymbol();
                }
                return this.allTokens.find((t) => t.contractAddress === c)
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
    buildRouteQuoteForErc20ToEth(amountToTrade, callReturnContext, routeContext, direction) {
        const convertQuoteUnformatted = this.getConvertQuoteUnformatted(callReturnContext, direction);
        const convertQuoteInfoUnformatted = this.getConvertQuoteInfoUnformatted(callReturnContext, direction);
        const expectedConvertQuote = direction === trade_direction_1.TradeDirection.input
            ? new bignumber_js_1.default((0, format_ether_1.formatEther)(convertQuoteUnformatted)).toFixed(this._toToken.decimals)
            : convertQuoteUnformatted
                .shiftedBy(this._fromToken.decimals * -1)
                .toFixed(this._fromToken.decimals);
        const expectedConvertQuoteOrTokenAmountInMaxWithSlippage = this.getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(expectedConvertQuote, direction);
        const tradeExpires = this.generateTradeDeadlineUnixTime();
        const routeQuoteTradeContext = {
            liquidityProviderFee: [0],
            routePathArray: callReturnContext.methodParameters[1],
        };
        const data = direction === trade_direction_1.TradeDirection.input
            ? this.generateTradeDataErc20ToEthInput(amountToTrade, new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), routeQuoteTradeContext, tradeExpires.toString())
            : this.generateTradeDataErc20ToEthOutput(new bignumber_js_1.default(expectedConvertQuoteOrTokenAmountInMaxWithSlippage), amountToTrade, routeQuoteTradeContext, tradeExpires.toString());
        const transaction = this.buildUpTransactionErc20(data);
        return {
            expectedConvertQuote,
            expectedConvertQuoteOrTokenAmountInMaxWithSlippage,
            transaction,
            tradeExpires,
            routePathArrayTokenMap: callReturnContext.methodParameters[1].map((c, index) => {
                var _a, _b;
                const token = (0, deep_clone_1.deepClone)(this.allTokens.find((t) => t.contractAddress === c));
                if (index === callReturnContext.methodParameters[1].length - 1) {
                    return (0, eth_1.turnTokenIntoEthForResponse)(token, (_b = (_a = this._settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === null || _b === void 0 ? void 0 : _b.nativeCurrency);
                }
                return token;
            }),
            expectedAmounts: callReturnContext.returnValues[0],
            routeText: callReturnContext.methodParameters[1]
                .map((c, index) => {
                if (index === callReturnContext.methodParameters[1].length - 1) {
                    return this.getNativeTokenSymbol();
                }
                return this.allTokens.find((t) => t.contractAddress === c)
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
    getConvertQuoteUnformatted(callReturnContext, direction) {
        if (direction === trade_direction_1.TradeDirection.input) {
            if (callReturnContext.returnValues[0].hex) {
                return new bignumber_js_1.default(callReturnContext.returnValues[0].hex);
            }
            return new bignumber_js_1.default(callReturnContext.returnValues[0][callReturnContext.returnValues[0].length - 1].hex);
        }
        else {
            return new bignumber_js_1.default(callReturnContext.returnValues[0].hex);
        }
    }
    getConvertQuoteInfoUnformatted(callReturnContext, direction) {
        return {
            stable: callReturnContext.returnValues[1],
            fees: callReturnContext.returnValues[2].map((c) => new bignumber_js_1.default(c.hex).toNumber()),
        };
    }
    /**
     * Work out the expected convert quote taking off slippage
     * @param expectedConvertQuote The expected convert quote
     */
    getExpectedConvertQuoteOrTokenAmountInMaxWithSlippage(expectedConvertQuote, tradeDirection) {
        const decimals = tradeDirection === trade_direction_1.TradeDirection.input
            ? this._toToken.decimals
            : this._fromToken.decimals;
        return new bignumber_js_1.default(expectedConvertQuote)
            .minus(new bignumber_js_1.default(expectedConvertQuote)
            .times(this._settings.slippage)
            .toFixed(decimals))
            .toFixed(decimals);
    }
    /**
     * Format amount to trade into callable formats
     * @param amountToTrade The amount to trade
     * @param direction The direction you want to get the quote from
     */
    formatAmountToTrade(amountToTrade, direction) {
        switch (this.tradePath()) {
            case trade_path_2.TradePath.ethToErc20:
                if (direction == trade_direction_1.TradeDirection.input) {
                    const amountToTradeWei = (0, parse_ether_1.parseEther)(amountToTrade);
                    return (0, hexlify_1.hexlify)(amountToTradeWei);
                }
                else {
                    return (0, hexlify_1.hexlify)(amountToTrade.shiftedBy(this._toToken.decimals));
                }
            case trade_path_2.TradePath.erc20ToEth:
                if (direction == trade_direction_1.TradeDirection.input) {
                    return (0, hexlify_1.hexlify)(amountToTrade.shiftedBy(this._fromToken.decimals));
                }
                else {
                    const amountToTradeWei = (0, parse_ether_1.parseEther)(amountToTrade);
                    return (0, hexlify_1.hexlify)(amountToTradeWei);
                }
            case trade_path_2.TradePath.erc20ToErc20:
                if (direction == trade_direction_1.TradeDirection.input) {
                    return (0, hexlify_1.hexlify)(amountToTrade.shiftedBy(this._fromToken.decimals));
                }
                else {
                    return (0, hexlify_1.hexlify)(amountToTrade.shiftedBy(this._toToken.decimals));
                }
            default:
                throw new muteswitch_error_1.MuteSwitchError(`Internal trade path ${this.tradePath()} is not supported`, error_codes_1.ErrorCodes.tradePathIsNotSupported);
        }
    }
    /**
     * Get the trade path
     */
    tradePath() {
        var _a;
        const network = this._ethersProvider.network();
        return (0, trade_path_1.getTradePath)(network.chainId, this._fromToken, this._toToken, (_a = this._settings.customNetwork) === null || _a === void 0 ? void 0 : _a.nativeWrappedTokenInfo);
    }
    get allTokens() {
        return [this._fromToken, this._toToken, ...this.allMainTokens];
    }
    get allMainTokens() {
        if (this._ethersProvider.provider.network.chainId === chain_id_1.ChainId.ZKSYNC_ERA ||
            this._settings.customNetwork) {
            const tokens = [
                this.USDCTokenForConnectedNetwork,
                this.WETHTokenForConnectedNetwork,
                this.WBTCTokenForConnectedNetwork,
            ];
            return tokens.filter((t) => t !== undefined);
        }
        return [this.WETHTokenForConnectedNetwork];
    }
    get mainCurrenciesPairsForFromToken() {
        const pairs = [
            [this._fromToken, this.WETHTokenForConnectedNetwork],
            [this._fromToken, this.USDCTokenForConnectedNetwork]
        ];
        return pairs.filter((t) => t[0].contractAddress !== t[1].contractAddress);
    }
    get mainCurrenciesPairsForToToken() {
        const pairs = [
            [this.WETHTokenForConnectedNetwork, this._toToken],
            [this.USDCTokenForConnectedNetwork, this._toToken]
        ];
        return pairs.filter((t) => t[0].contractAddress !== t[1].contractAddress);
    }
    get mainCurrenciesPairsForUSDC() {
        if (this._settings.customNetwork) {
            const pairs = [
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
    get mainCurrenciesPairsForWBTC() {
        if (this._ethersProvider.provider.network.chainId === chain_id_1.ChainId.ZKSYNC_ERA ||
            this._settings.customNetwork) {
            const tokens = [
                [this.WBTCTokenForConnectedNetwork, this.WETHTokenForConnectedNetwork],
            ];
            return this.filterUndefinedTokens(tokens);
        }
        return [];
    }
    get mainCurrenciesPairsForWETH() {
        if (this._ethersProvider.provider.network.chainId === chain_id_1.ChainId.ZKSYNC_ERA ||
            this._settings.customNetwork) {
            const tokens = [
                //[this.WETHTokenForConnectedNetwork, this.DAITokenForConnectedNetwork],
                [this.WETHTokenForConnectedNetwork, this.USDCTokenForConnectedNetwork],
                [this.WETHTokenForConnectedNetwork, this.WBTCTokenForConnectedNetwork],
            ];
            return this.filterUndefinedTokens(tokens);
        }
        return [];
    }
    filterUndefinedTokens(tokens) {
        return tokens.filter((t) => t[0] !== undefined && t[1] !== undefined);
    }
    /*
    private get DAITokenForConnectedNetwork() {
      if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
        return this._settings.customNetwork.baseTokens?.dai;
      }
  
      return DAI.token(this._ethersProvider.provider.network.chainId);
    }
    */
    get USDCTokenForConnectedNetwork() {
        var _a;
        if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
            return (_a = this._settings.customNetwork.baseTokens) === null || _a === void 0 ? void 0 : _a.usdc;
        }
        return usdc_1.USDC.token(this._ethersProvider.provider.network.chainId);
    }
    get WETHTokenForConnectedNetwork() {
        if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
            return this._settings.customNetwork.nativeWrappedTokenInfo;
        }
        return weth_1.WETHContract.token(this._ethersProvider.provider.network.chainId);
    }
    get WBTCTokenForConnectedNetwork() {
        var _a;
        if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
            return (_a = this._settings.customNetwork.baseTokens) === null || _a === void 0 ? void 0 : _a.wbtc;
        }
        return wbtc_1.WBTC.token(this._ethersProvider.provider.network.chainId);
    }
    getNativeTokenSymbol() {
        if (this._settings.customNetwork && this._settings.customNetwork.baseTokens) {
            return this._settings.customNetwork.nativeCurrency.symbol;
        }
        return eth_1.ETH_SYMBOL;
    }
}
exports.MuteSwitchRouterFactory = MuteSwitchRouterFactory;
