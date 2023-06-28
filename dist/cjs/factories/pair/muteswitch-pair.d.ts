import { MuteSwitchPairContextForChainId, MuteSwitchPairContextForEthereumProvider, MuteSwitchPairContextForProviderUrl } from './models/muteswitch-pair-contexts';
import { MuteSwitchPairFactory } from './muteswitch-pair.factory';
export declare class MuteSwitchPair {
    private _muteswitchPairContext;
    private _ethersProvider;
    constructor(_muteswitchPairContext: MuteSwitchPairContextForChainId | MuteSwitchPairContextForProviderUrl | MuteSwitchPairContextForEthereumProvider);
    /**
     * Create factory to be able to call methods on the 2 tokens
     */
    createFactory(): Promise<MuteSwitchPairFactory>;
}
