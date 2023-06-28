import { CloneMuteSwitchContractDetails } from '../factories/pair/models/clone-muteswitch-contract-details';
export declare const muteswitchContracts: {
    getRouterAddress: (cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined) => string;
    getFactoryAddress: (cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined) => string;
    getPairAddress: (cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined) => string;
};
