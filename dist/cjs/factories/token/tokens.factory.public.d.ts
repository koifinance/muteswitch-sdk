import { ChainIdAndProvider, EthereumProvider } from '../../ethers-provider';
import { TokensFactory } from './tokens.factory';
export declare class TokensFactoryPublic extends TokensFactory {
    constructor(providerContext: ChainIdAndProvider | EthereumProvider);
}
