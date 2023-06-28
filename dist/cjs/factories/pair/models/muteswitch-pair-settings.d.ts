import { CloneMuteSwitchContractDetails } from './clone-muteswitch-contract-details';
import { CustomNetwork } from './custom-network';
import { GasSettings } from './gas-settings';
export declare class MuteSwitchPairSettings {
    slippage: number;
    deadlineMinutes: number;
    disableMultihops: boolean;
    gasSettings?: GasSettings;
    cloneMuteSwitchContractDetails?: CloneMuteSwitchContractDetails;
    customNetwork?: CustomNetwork;
    constructor(settings?: {
        slippage?: number | undefined;
        deadlineMinutes?: number | undefined;
        disableMultihops?: boolean | undefined;
        gasSettings?: GasSettings | undefined;
        cloneMuteSwitchContractDetails?: CloneMuteSwitchContractDetails | undefined;
        customNetwork?: CustomNetwork | undefined;
    });
}
