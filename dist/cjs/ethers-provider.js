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
exports.EthersProvider = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const error_codes_1 = require("./common/errors/error-codes");
const muteswitch_error_1 = require("./common/errors/muteswitch-error");
const chain_id_1 = require("./enums/chain-id");
class EthersProvider {
    constructor(_providerContext) {
        this._providerContext = _providerContext;
        const chainId = this._providerContext.chainId;
        const ethereumProvider = this._providerContext
            .ethereumProvider;
        if (!ethereumProvider) {
            throw new muteswitch_error_1.MuteSwitchError('Wrong ethers provider context', error_codes_1.ErrorCodes.wrongEthersProviderContext);
        }
        if (ethereumProvider._isProvider) {
            this._ethersProvider = ethereumProvider;
        }
        else {
            this._ethersProvider = new ethers_1.providers.Web3Provider(ethereumProvider);
        }
    }
    /**
     * Get the chain name
     * @param chainId The chain id
     * @returns
     */
    getChainName(chainId) {
        if (this._providerContext.customNetwork) {
            return this._providerContext.customNetwork.nameNetwork;
        }
        const chainName = chain_id_1.ChainNames.get(chainId);
        if (!chainName) {
            throw new muteswitch_error_1.MuteSwitchError(`Can not find chain name for ${chainId}. This lib only supports mainnet(1), ropsten(4), kovan(42), rinkeby(4) and görli(5)`, error_codes_1.ErrorCodes.canNotFindChainId);
        }
        return chainName;
    }
    /**
     * Creates a contract instance
     * @param abi The ABI
     * @param contractAddress The contract address
     */
    getContract(abi, contractAddress) {
        const contract = new ethers_1.Contract(contractAddress, abi, this._ethersProvider);
        return contract;
    }
    /**
     * Get the network
     */
    network() {
        if (this._ethersProvider.network) {
            return this._ethersProvider.network;
        }
        // @ts-ignore
        if (this._ethersProvider.provider) {
            // @ts-ignore
            const chainId = this._ethersProvider.provider.chainId;
            if (chainId) {
                const chainIdNumber = new bignumber_js_1.default(chainId).toNumber();
                const chainName = chain_id_1.ChainNames.get(chainIdNumber);
                if (chainName) {
                    return {
                        chainId: chainIdNumber,
                        name: chainName,
                    };
                }
            }
        }
        throw new muteswitch_error_1.MuteSwitchError('chainId can not be found on the provider', error_codes_1.ErrorCodes.chainIdCanNotBeFound);
    }
    /**
     * Get the ethers provider
     */
    get provider() {
        return this._ethersProvider;
    }
    /**
     * Get eth amount
     * @param ethereumAddress The ethereum address
     */
    balanceOf(ethereumAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._ethersProvider.getBalance(ethereumAddress)).toHexString();
        });
    }
    /**
     * Get provider url
     */
    getProviderUrl() {
        const ethereumProvider = this._providerContext
            .ethereumProvider;
        if (ethereumProvider) {
            return undefined;
        }
        const providerUrl = this._providerContext.providerUrl;
        if (providerUrl) {
            return providerUrl;
        }
        const chainId = this._providerContext.chainId;
        switch (chainId) {
            case chain_id_1.ChainId.ZKSYNC_ERA:
                return `https://mainnet.era.zksync.io/${this._getApiKey}`;
            case chain_id_1.ChainId.ZKSYNC_ERA_TESTNET:
                return `https://testnet.era.zksync.dev/${this._getApiKey}`;
            default:
                return undefined;
        }
    }
    /**
     * Get the api key
     */
    get _getApiKey() {
        return '';
    }
}
exports.EthersProvider = EthersProvider;
