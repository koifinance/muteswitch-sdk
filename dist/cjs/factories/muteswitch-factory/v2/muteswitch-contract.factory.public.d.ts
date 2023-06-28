import { ChainIdAndProvider, EthereumProvider } from '../../../ethers-provider';
import { MuteSwitchContractFactory } from './muteswitch-contract.factory';
export declare class MuteSwitchContractFactoryPublic extends MuteSwitchContractFactory {
    constructor(providerContext: ChainIdAndProvider | EthereumProvider, factoryAddress?: string);
}
