import { ErrorCodes } from '../../../common/errors/error-codes';
import { MuteSwitchError } from '../../../common/errors/muteswitch-error';
import { CloneMuteSwitchContractDetails } from './clone-muteswitch-contract-details';
import { CustomNetwork } from './custom-network';
import { GasSettings } from './gas-settings';

export class MuteSwitchPairSettings {
  slippage: number;
  deadlineMinutes: number;
  disableMultihops: boolean;
  gasSettings?: GasSettings = undefined;
  cloneMuteSwitchContractDetails?: CloneMuteSwitchContractDetails = undefined;
  customNetwork?: CustomNetwork = undefined;

  constructor(settings?: {
    slippage?: number | undefined;
    deadlineMinutes?: number | undefined;
    disableMultihops?: boolean | undefined;
    gasSettings?: GasSettings | undefined;
    cloneMuteSwitchContractDetails?: CloneMuteSwitchContractDetails | undefined;
    customNetwork?: CustomNetwork | undefined;
  }) {
    this.slippage = settings?.slippage || 0.005;
    this.deadlineMinutes = settings?.deadlineMinutes || 20;
    this.disableMultihops = settings?.disableMultihops || false;
    this.gasSettings = settings?.gasSettings;
    this.cloneMuteSwitchContractDetails = settings?.cloneMuteSwitchContractDetails;
    this.customNetwork = settings?.customNetwork;
  }
}
