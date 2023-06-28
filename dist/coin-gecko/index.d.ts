import { CoinGeckoResponse } from './models/coin-gecko-response';
export declare class CoinGecko {
    private _fiatPriceCache;
    private _cacheMilliseconds;
    constructor();
    /**
     * Get the coin gecko fiat price
     * @param contractAddress The array of contract addresses
     */
    getCoinGeckoFiatPrices(contractAddresses: string[]): Promise<CoinGeckoResponse>;
}
