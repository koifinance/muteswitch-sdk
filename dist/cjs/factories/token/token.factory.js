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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenFactory = void 0;
const ethers_1 = require("ethers");
const contract_context_1 = require("../../common/contract-context");
const eth_1 = require("../../common/tokens/eth");
const get_address_1 = require("../../common/utils/get-address");
const custom_multicall_1 = require("../../custom-multicall");
const get_muteswitch_contracts_1 = require("../../muteswitch-contract-context/get-muteswitch-contracts");
class TokenFactory {
    constructor(_tokenContractAddress, _ethersProvider, _customNetwork, _cloneMuteSwitchContractDetails) {
        var _a;
        this._tokenContractAddress = _tokenContractAddress;
        this._ethersProvider = _ethersProvider;
        this._customNetwork = _customNetwork;
        this._cloneMuteSwitchContractDetails = _cloneMuteSwitchContractDetails;
        this._multicall = new custom_multicall_1.CustomMulticall(this._ethersProvider.provider, (_a = this._customNetwork) === null || _a === void 0 ? void 0 : _a.multicallContractAddress);
        this._erc20TokenContract = this._ethersProvider.getContract(JSON.stringify(contract_context_1.ContractContext.erc20Abi), (0, get_address_1.getAddress)(this._tokenContractAddress));
    }
    /**
     * Get the token details
     */
    getToken() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, eth_1.isNativeEth)(this._tokenContractAddress)) {
                return eth_1.ETH.info(this._ethersProvider.network().chainId, (_a = this._customNetwork) === null || _a === void 0 ? void 0 : _a.nativeWrappedTokenInfo);
            }
            else {
                const SYMBOL = 0;
                const DECIMALS = 1;
                const NAME = 2;
                const contractCallContext = {
                    reference: 'token',
                    contractAddress: (0, get_address_1.getAddress)(this._tokenContractAddress),
                    abi: contract_context_1.ContractContext.erc20Abi,
                    calls: [
                        {
                            reference: `symbol`,
                            methodName: 'symbol',
                            methodParameters: [],
                        },
                        {
                            reference: `decimals`,
                            methodName: 'decimals',
                            methodParameters: [],
                        },
                        {
                            reference: `name`,
                            methodName: 'name',
                            methodParameters: [],
                        },
                    ],
                };
                const contractCallResults = yield this._multicall.call(contractCallContext);
                const results = contractCallResults.results[contractCallContext.reference];
                return {
                    chainId: this._ethersProvider.network().chainId,
                    contractAddress: results.originalContractCallContext.contractAddress,
                    symbol: results.callsReturnContext[SYMBOL].returnValues[0],
                    decimals: results.callsReturnContext[DECIMALS].returnValues[0],
                    name: results.callsReturnContext[NAME].returnValues[0],
                };
            }
        });
    }
    /**
     * Get the allowance for the amount which can be moved from the contract
     * for a user
     * @ethereumAddress The users ethereum address
     */
    allowance(ethereumAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, eth_1.isNativeEth)(this._tokenContractAddress)) {
                return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
            }
            else {
                const allowance = yield this._erc20TokenContract.allowance(ethereumAddress, get_muteswitch_contracts_1.muteswitchContracts.getRouterAddress(this._cloneMuteSwitchContractDetails));
                return allowance.toHexString();
            }
        });
    }
    /**
     * Generate the token approve data allowance to move the tokens.
     * This will return the data for you to send as a transaction
     * @spender The contract address for which you are allowing to move tokens on your behalf
     * @value The amount you want to allow them to do
     */
    generateApproveAllowanceData(spender, value) {
        if ((0, eth_1.isNativeEth)(this._tokenContractAddress)) {
            throw new Error('ETH does not need any allowance data');
        }
        return this._erc20TokenContract.interface.encodeFunctionData('approve', [
            spender,
            value,
        ]);
    }
    /**
     * Get the balance the user has of this token
     * @ethereumAddress The users ethereum address
     */
    balanceOf(ethereumAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, eth_1.isNativeEth)(this._tokenContractAddress)) {
                return yield this._ethersProvider.balanceOf(ethereumAddress);
            }
            else {
                const balance = yield this._erc20TokenContract.balanceOf(ethereumAddress);
                return balance.toHexString();
            }
        });
    }
    /**
     * Get the total supply of tokens which exist
     */
    totalSupply() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalSupply = yield this._erc20TokenContract.totalSupply();
            return totalSupply.toHexString();
        });
    }
    /**
     * Get allowance and balance
     * @param ethereumAddress The ethereum address
     */
    getAllowanceAndBalanceOf(ethereumAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, eth_1.isNativeEth)(this._tokenContractAddress)) {
                return {
                    allowance: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    balanceOf: yield this.balanceOf(ethereumAddress),
                };
            }
            else {
                const ALLOWANCE = 0;
                const BALANCEOF = 1;
                const contractCallContext = [];
                contractCallContext.push(this.buildAllowanceAndBalanceContractCallContext(ethereumAddress));
                const contractCallResults = yield this._multicall.call(contractCallContext);
                const results = contractCallResults.results['main'];
                return {
                    allowance: ethers_1.BigNumber.from(results.callsReturnContext[ALLOWANCE].returnValues[0]).toHexString(),
                    balanceOf: ethers_1.BigNumber.from(results.callsReturnContext[BALANCEOF].returnValues[0]).toHexString(),
                };
            }
        });
    }
    buildAllowanceAndBalanceContractCallContext(ethereumAddress) {
        return {
            reference: 'main',
            contractAddress: (0, get_address_1.getAddress)(this._tokenContractAddress),
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
    }
}
exports.TokenFactory = TokenFactory;
