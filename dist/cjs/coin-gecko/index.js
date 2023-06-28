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
exports.CoinGecko = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const tokens_1 = require("../common/tokens");
const deep_clone_1 = require("../common/utils/deep-clone");
const get_address_1 = require("../common/utils/get-address");
class CoinGecko {
    constructor() {
        this._fiatPriceCache = undefined;
        // 90 seconds cache
        this._cacheMilliseconds = 90000;
    }
    /**
     * Get the coin gecko fiat price
     * @param contractAddress The array of contract addresses
     */
    getCoinGeckoFiatPrices(contractAddresses) {
        return __awaiter(this, void 0, void 0, function* () {
            contractAddresses = contractAddresses.map((address) => (0, tokens_1.removeEthFromContractAddress)(address));
            if (this._fiatPriceCache) {
                const now = Date.now();
                if ((0, deep_clone_1.deepClone)(this._fiatPriceCache.timestamp) >
                    now - this._cacheMilliseconds) {
                    return this._fiatPriceCache.cachedResponse;
                }
            }
            try {
                const coinGeckoResponse = {};
                const response = yield (yield (0, node_fetch_1.default)(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses.join()}&vs_currencies=usd`)).json();
                for (const [key, value] of Object.entries(response)) {
                    for (let i = 0; i < contractAddresses.length; i++) {
                        const mappedKey = (0, get_address_1.getAddress)(key);
                        // @ts-ignore
                        coinGeckoResponse[mappedKey] = Number(value['usd']);
                    }
                }
                this._fiatPriceCache = {
                    cachedResponse: coinGeckoResponse,
                    timestamp: Date.now(),
                };
                return coinGeckoResponse;
            }
            catch (e) {
                // if coin gecko is down for any reason still allow the swapper to work
                if (this._fiatPriceCache) {
                    return this._fiatPriceCache.cachedResponse;
                }
                return {};
            }
        });
    }
}
exports.CoinGecko = CoinGecko;
