import { TradeDirection } from '../../pair/models/trade-direction';
import { Transaction } from '../../pair/models/transaction';
import { Token } from '../../token/models/token';
export interface RouteQuote {
    expectedConvertQuote: string;
    expectedConvertQuoteOrTokenAmountInMaxWithSlippage: string;
    transaction: Transaction;
    tradeExpires: number;
    routePathArrayTokenMap: Token[];
    routeText: string;
    expectedAmounts: string[];
    routePathArray: string[];
    liquidityProviderFee: number[];
    stable: boolean[];
    quoteDirection: TradeDirection;
    gasPriceEstimatedBy?: string | undefined;
}
