import { Observable as MuteSwitchStream } from 'rxjs';
import { RouteQuote } from '../../router/models/route-quote';
import { Token } from '../../token/models/token';
import { TradeDirection } from './trade-direction';
import { Transaction } from './transaction';

export interface TradeContext {
  quoteDirection: TradeDirection;
  baseConvertRequest: string;
  minAmountConvertQuote: string | null;
  maximumSent: string | null;
  expectedConvertQuote: string;
  liquidityProviderFee: number[];
  liquidityProviderFeePercent: number[];
  stable: boolean[];
  tradeExpires: number;
  routePathTokenMap: Token[];
  routeText: string;
  routePath: string[];
  allTriedRoutesQuotes: RouteQuote[];
  hasEnoughAllowance: boolean;
  approvalTransaction?: Transaction | undefined;
  fromToken: Token;
  fromBalance: {
    hasEnough: boolean;
    balance: string;
  };
  toToken: Token;
  toBalance: string;
  transaction: Transaction;
  gasPriceEstimatedBy: string | undefined;
  quoteChanged$: MuteSwitchStream<TradeContext>;
  destroy: () => void;
}
