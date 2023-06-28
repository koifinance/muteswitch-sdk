import { JsonFragment } from '@ethersproject/abi';
export declare class MuteSwitchContractContext {
    /**
     * The muteswitch router address
     */
    static routerAddress: string;
    /**
     * The muteswitch factory address
     */
    static factoryAddress: string;
    /**
     * The muteswitch pair address
     */
    static pairAddress: string;
    /**
     * MuteSwitch v2 router
     */
    static routerAbi: JsonFragment[];
    /**
     * MuteSwitch v2 factory
     */
    static factoryAbi: JsonFragment[];
    /**
     * MuteSwitch v2 pair
     */
    static pairAbi: JsonFragment[];
}
