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
exports.MuteSwitchPair = void 0;
const coin_gecko_1 = require("../../coin-gecko");
const error_codes_1 = require("../../common/errors/error-codes");
const muteswitch_error_1 = require("../../common/errors/muteswitch-error");
const get_address_1 = require("../../common/utils/get-address");
const is_address_1 = require("../../common/utils/is-address");
const chain_id_1 = require("../../enums/chain-id");
const ethers_provider_1 = require("../../ethers-provider");
const tokens_factory_1 = require("../token/tokens.factory");
const muteswitch_pair_settings_1 = require("./models/muteswitch-pair-settings");
const muteswitch_pair_factory_1 = require("./muteswitch-pair.factory");
class MuteSwitchPair {
    constructor(_muteswitchPairContext) {
        var _a, _b;
        this._muteswitchPairContext = _muteswitchPairContext;
        if (!this._muteswitchPairContext.fromTokenContractAddress) {
            throw new muteswitch_error_1.MuteSwitchError('Must have a `fromTokenContractAddress` on the context', error_codes_1.ErrorCodes.fromTokenContractAddressRequired);
        }
        if (!(0, is_address_1.isAddress)(this._muteswitchPairContext.fromTokenContractAddress)) {
            throw new muteswitch_error_1.MuteSwitchError('`fromTokenContractAddress` is not a valid contract address', error_codes_1.ErrorCodes.fromTokenContractAddressNotValid);
        }
        this._muteswitchPairContext.fromTokenContractAddress = (0, get_address_1.getAddress)(this._muteswitchPairContext.fromTokenContractAddress, true);
        if (!this._muteswitchPairContext.toTokenContractAddress) {
            throw new muteswitch_error_1.MuteSwitchError('Must have a `toTokenContractAddress` on the context', error_codes_1.ErrorCodes.toTokenContractAddressRequired);
        }
        if (!(0, is_address_1.isAddress)(this._muteswitchPairContext.toTokenContractAddress)) {
            throw new muteswitch_error_1.MuteSwitchError('`toTokenContractAddress` is not a valid contract address', error_codes_1.ErrorCodes.toTokenContractAddressNotValid);
        }
        this._muteswitchPairContext.toTokenContractAddress = (0, get_address_1.getAddress)(this._muteswitchPairContext.toTokenContractAddress, true);
        if (!this._muteswitchPairContext.ethereumAddress) {
            throw new muteswitch_error_1.MuteSwitchError('Must have a `ethereumAddress` on the context', error_codes_1.ErrorCodes.ethereumAddressRequired);
        }
        if (!(0, is_address_1.isAddress)(this._muteswitchPairContext.ethereumAddress)) {
            throw new muteswitch_error_1.MuteSwitchError('`ethereumAddress` is not a valid address', error_codes_1.ErrorCodes.ethereumAddressNotValid);
        }
        this._muteswitchPairContext.ethereumAddress = (0, get_address_1.getAddress)(this._muteswitchPairContext.ethereumAddress);
        const chainId = this._muteswitchPairContext
            .chainId;
        const providerUrl = (this._muteswitchPairContext).providerUrl;
        if (providerUrl && chainId) {
            this._ethersProvider = new ethers_provider_1.EthersProvider({
                chainId,
                providerUrl,
                customNetwork: (_a = this._muteswitchPairContext.settings) === null || _a === void 0 ? void 0 : _a.customNetwork,
            });
            return;
        }
        if (chainId) {
            this._ethersProvider = new ethers_provider_1.EthersProvider({ chainId });
            return;
        }
        const ethereumProvider = (this._muteswitchPairContext).ethereumProvider;
        if (ethereumProvider) {
            this._ethersProvider = new ethers_provider_1.EthersProvider({
                ethereumProvider,
                customNetwork: (_b = this._muteswitchPairContext.settings) === null || _b === void 0 ? void 0 : _b.customNetwork,
            });
            return;
        }
        throw new muteswitch_error_1.MuteSwitchError('Your must supply a chainId or a ethereum provider please look at types `MuteSwitchPairContextForEthereumProvider`, `MuteSwitchPairContextForChainId` and `MuteSwitchPairContextForProviderUrl` to make sure your object is correct in what your passing in', error_codes_1.ErrorCodes.invalidPairContext);
    }
    /**
     * Create factory to be able to call methods on the 2 tokens
     */
    createFactory() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = this._muteswitchPairContext.settings) === null || _a === void 0 ? void 0 : _a.customNetwork) === undefined) {
                const chainId = this._ethersProvider.network().chainId;
                if (chainId !== chain_id_1.ChainId.ZKSYNC_ERA && chainId !== chain_id_1.ChainId.ZKSYNC_ERA_TESTNET) {
                    throw new muteswitch_error_1.MuteSwitchError(`ChainId - ${chainId} is not supported. This lib only supports zksync era(324), zksync era testnet(280)`, error_codes_1.ErrorCodes.chainIdNotSupported);
                }
            }
            const tokensFactory = new tokens_factory_1.TokensFactory(this._ethersProvider, (_b = this._muteswitchPairContext.settings) === null || _b === void 0 ? void 0 : _b.customNetwork);
            const tokens = yield tokensFactory.getTokens([
                this._muteswitchPairContext.fromTokenContractAddress,
                this._muteswitchPairContext.toTokenContractAddress,
            ]);
            const muteswitchFactoryContext = {
                fromToken: tokens.find((t) => t.contractAddress.toLowerCase() ===
                    this._muteswitchPairContext.fromTokenContractAddress.toLowerCase()),
                toToken: tokens.find((t) => t.contractAddress.toLowerCase() ===
                    this._muteswitchPairContext.toTokenContractAddress.toLowerCase()),
                ethereumAddress: this._muteswitchPairContext.ethereumAddress,
                settings: this._muteswitchPairContext.settings || new muteswitch_pair_settings_1.MuteSwitchPairSettings(),
                ethersProvider: this._ethersProvider,
            };
            return new muteswitch_pair_factory_1.MuteSwitchPairFactory(new coin_gecko_1.CoinGecko(), muteswitchFactoryContext);
        });
    }
}
exports.MuteSwitchPair = MuteSwitchPair;
