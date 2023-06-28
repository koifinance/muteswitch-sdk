import { Token } from '../../token/models/token';
export interface NativeCurrencyInfo {
    name: string;
    symbol: string;
}
export interface CustomNetwork {
    nameNetwork: string;
    multicallContractAddress: string;
    nativeCurrency: NativeCurrencyInfo;
    nativeWrappedTokenInfo: Token;
    baseTokens?: {
        usdt?: Token | undefined;
        dai?: Token | undefined;
        comp?: Token | undefined;
        usdc?: Token | undefined;
        wbtc?: Token | undefined;
    };
}
