import { ChainIdAndProvider, EthereumProvider } from '../../../ethers-provider';
import { MuteSwitchPairContractFactory } from './muteswitch-pair-contract.factory';
export declare class MuteSwitchPairContractFactoryPublic extends MuteSwitchPairContractFactory {
    constructor(providerContext: ChainIdAndProvider | EthereumProvider, pairAddress?: string);
}
