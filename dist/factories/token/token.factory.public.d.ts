import { ChainIdAndProvider, EthereumProvider } from '../../ethers-provider';
import { TokenFactory } from './token.factory';
export declare class TokenFactoryPublic extends TokenFactory {
    constructor(tokenContractAddress: string, providerContext: ChainIdAndProvider | EthereumProvider);
}
