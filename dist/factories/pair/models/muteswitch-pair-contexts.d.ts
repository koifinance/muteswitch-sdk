import { ChainId } from '../../../enums/chain-id';
import { MuteSwitchPairSettings } from './muteswitch-pair-settings';
interface MuteSwitchPairContextBase {
    fromTokenContractAddress: string;
    toTokenContractAddress: string;
    ethereumAddress: string;
    settings?: MuteSwitchPairSettings | undefined;
}
export interface MuteSwitchPairContextForEthereumProvider extends MuteSwitchPairContextBase {
    ethereumProvider: any;
}
export interface MuteSwitchPairContextForChainId extends MuteSwitchPairContextBase {
    chainId: ChainId | number;
}
export interface MuteSwitchPairContextForProviderUrl extends MuteSwitchPairContextForChainId {
    providerUrl: string;
}
export {};
