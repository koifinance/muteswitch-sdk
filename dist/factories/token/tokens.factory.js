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
exports.TokensFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const contract_context_1 = require("../../common/contract-context");
const error_codes_1 = require("../../common/errors/error-codes");
const muteswitch_error_1 = require("../../common/errors/muteswitch-error");
const eth_1 = require("../../common/tokens/eth");
const get_address_1 = require("../../common/utils/get-address");
const custom_multicall_1 = require("../../custom-multicall");
const get_muteswitch_contracts_1 = require("../../muteswitch-contract-context/get-muteswitch-contracts");
class TokensFactory {
    constructor(_ethersProvider, _customNetwork, _cloneMuteSwitchContractDetails) {
        var _a;
        this._ethersProvider = _ethersProvider;
        this._customNetwork = _customNetwork;
        this._cloneMuteSwitchContractDetails = _cloneMuteSwitchContractDetails;
        this._multicall = new custom_multicall_1.CustomMulticall(this._ethersProvider.provider, (_a = this._customNetwork) === null || _a === void 0 ? void 0 : _a.multicallContractAddress);
    }
    /**
     * Get the tokens details
     */
    getTokens(tokenContractAddresses) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokens = [];
                const SYMBOL = 0;
                const DECIMALS = 1;
                const NAME = 2;
                const contractCallContexts = [];
                for (let i = 0; i < tokenContractAddresses.length; i++) {
                    if (!(0, eth_1.isNativeEth)(tokenContractAddresses[i])) {
                        const contractCallContext = {
                            reference: `token${i}`,
                            contractAddress: (0, get_address_1.getAddress)(tokenContractAddresses[i]),
                            abi: contract_context_1.ContractContext.erc20Abi,
                            calls: [
                                {
                                    reference: 'symbol',
                                    methodName: 'symbol',
                                    methodParameters: [],
                                },
                                {
                                    reference: 'decimals',
                                    methodName: 'decimals',
                                    methodParameters: [],
                                },
                                {
                                    reference: 'name',
                                    methodName: 'name',
                                    methodParameters: [],
                                },
                            ],
                        };
                        contractCallContexts.push(contractCallContext);
                    }
                    else {
                        tokens.push(eth_1.ETH.info(this._ethersProvider.network().chainId, (_a = this._customNetwork) === null || _a === void 0 ? void 0 : _a.nativeWrappedTokenInfo));
                    }
                }
                const contractCallResults = yield this._multicall.call(contractCallContexts);
                for (const result in contractCallResults.results) {
                    const tokenInfo = contractCallResults.results[result];
                    tokens.push({
                        chainId: this._ethersProvider.network().chainId,
                        contractAddress: tokenInfo.originalContractCallContext.contractAddress,
                        symbol: tokenInfo.callsReturnContext[SYMBOL].returnValues[0],
                        decimals: tokenInfo.callsReturnContext[DECIMALS].returnValues[0],
                        name: tokenInfo.callsReturnContext[NAME].returnValues[0],
                    });
                }
                return tokens;
            }
            catch (error) {
                throw new muteswitch_error_1.MuteSwitchError('invalid from or to contract tokens', error_codes_1.ErrorCodes.invalidFromOrToContractToken);
            }
        });
    }
    /**
     * Get allowance and balance for many contracts
     * @param ethereumAddress The ethereum address
     * @param tokenContractAddresses The token contract addresses
     * @param format If you want it to format it for you to the correct decimal place
     */
    getAllowanceAndBalanceOfForContracts(ethereumAddress, tokenContractAddresses, format = false) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const ALLOWANCE = 0;
            const BALANCEOF = 1;
            const DECIMALS = 2;
            const SYMBOL = 3;
            const NAME = 4;
            const contractCallContexts = [];
            for (let i = 0; i < tokenContractAddresses.length; i++) {
                if (!(0, eth_1.isNativeEth)(tokenContractAddresses[i])) {
                    contractCallContexts.push(this.buildAllowanceAndBalanceContractCallContext(ethereumAddress, tokenContractAddresses[i]));
                    contractCallContexts.push(this.buildAllowanceAndBalanceContractCallContext(ethereumAddress, tokenContractAddresses[i]));
                }
                else {
                    const token = eth_1.ETH.info(this._ethersProvider.network().chainId, (_a = this._customNetwork) === null || _a === void 0 ? void 0 : _a.nativeWrappedTokenInfo);
                    if (format) {
                        results.push({
                            allowanceAndBalanceOf: {
                                allowance: new bignumber_js_1.default('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
                                    .shiftedBy(18 * -1)
                                    .toFixed(),
                                balanceOf: new bignumber_js_1.default(yield this._ethersProvider.balanceOf(ethereumAddress))
                                    .shiftedBy(18 * -1)
                                    .toFixed(),
                            },
                            token,
                        });
                    }
                    else {
                        results.push({
                            allowanceAndBalanceOf: {
                                allowance: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                                balanceOf: yield this._ethersProvider.balanceOf(ethereumAddress),
                            },
                            token: eth_1.ETH.info(this._ethersProvider.network().chainId, (_b = this._customNetwork) === null || _b === void 0 ? void 0 : _b.nativeWrappedTokenInfo),
                        });
                    }
                }
            }
            const contractCallResults = yield this._multicall.call(contractCallContexts);
            for (const result in contractCallResults.results) {
                const overridenTokenInfo = (_c = contractCallResults.results[result].originalContractCallContext.context) === null || _c === void 0 ? void 0 : _c.overridenToken;
                const resultInfo = contractCallResults.results[result];
                if (!format) {
                    results.push({
                        allowanceAndBalanceOf: {
                            allowance: ethers_1.BigNumber.from(resultInfo.callsReturnContext[ALLOWANCE].returnValues[0]).toHexString(),
                            balanceOf: ethers_1.BigNumber.from(resultInfo.callsReturnContext[BALANCEOF].returnValues[0]).toHexString(),
                        },
                        token: overridenTokenInfo !== undefined
                            ? overridenTokenInfo
                            : {
                                chainId: this._ethersProvider.network().chainId,
                                contractAddress: resultInfo.originalContractCallContext.contractAddress,
                                symbol: resultInfo.callsReturnContext[SYMBOL].returnValues[0],
                                decimals: resultInfo.callsReturnContext[DECIMALS].returnValues[0],
                                name: resultInfo.callsReturnContext[NAME].returnValues[0],
                            },
                    });
                }
                else {
                    const decimals = overridenTokenInfo !== undefined
                        ? overridenTokenInfo.decimals
                        : resultInfo.callsReturnContext[DECIMALS].returnValues[0];
                    results.push({
                        allowanceAndBalanceOf: {
                            allowance: new bignumber_js_1.default(ethers_1.BigNumber.from(resultInfo.callsReturnContext[ALLOWANCE].returnValues[0]).toHexString())
                                .shiftedBy(decimals * -1)
                                .toFixed(),
                            balanceOf: new bignumber_js_1.default(ethers_1.BigNumber.from(resultInfo.callsReturnContext[BALANCEOF].returnValues[0]).toHexString())
                                .shiftedBy(decimals * -1)
                                .toFixed(),
                        },
                        token: overridenTokenInfo !== undefined
                            ? overridenTokenInfo
                            : {
                                chainId: this._ethersProvider.network().chainId,
                                contractAddress: resultInfo.originalContractCallContext.contractAddress,
                                symbol: resultInfo.callsReturnContext[SYMBOL].returnValues[0],
                                decimals: resultInfo.callsReturnContext[DECIMALS].returnValues[0],
                                name: resultInfo.callsReturnContext[NAME].returnValues[0],
                            },
                    });
                }
            }
            return results;
        });
    }
    buildAllowanceAndBalanceContractCallContext(ethereumAddress, tokenContractAddress) {
        const defaultCallContext = {
            reference: `${tokenContractAddress}`,
            contractAddress: (0, get_address_1.getAddress)(tokenContractAddress),
            abi: contract_context_1.ContractContext.erc20Abi,
            calls: [
                {
                    reference: 'allowance',
                    methodName: 'allowance',
                    methodParameters: [
                        ethereumAddress,
                        get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._cloneMuteSwitchContractDetails)
                    ],
                },
                {
                    reference: 'balanceOf',
                    methodName: 'balanceOf',
                    methodParameters: [ethereumAddress],
                },
            ],
        };
        defaultCallContext.calls.push({
            reference: 'decimals',
            methodName: 'decimals',
            methodParameters: [],
        }, {
            reference: 'symbol',
            methodName: 'symbol',
            methodParameters: [],
        }, {
            reference: 'name',
            methodName: 'name',
            methodParameters: [],
        });
        return defaultCallContext;
    }
}
exports.TokensFactory = TokensFactory;
