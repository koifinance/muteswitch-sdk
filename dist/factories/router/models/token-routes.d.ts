import { Token } from '../../token/models/token';
export interface TokenRoutes {
    token: Token;
    pairs: {
        fromTokenPairs?: Token[] | undefined;
        fromStable?: boolean[] | undefined;
        toTokenPairs?: Token[] | undefined;
        toStable?: boolean[] | undefined;
    };
}
