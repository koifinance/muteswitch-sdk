import { CloneMuteSwitchContractDetails } from '../factories/pair/models/clone-muteswitch-contract-details';
import { MuteSwitchContractContext } from './muteswitch-contract-context';

export const muteswitchContracts = {
    getRouterAddress: (
      cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined
    ) => {
      if (
        cloneMuteSwitchContractDetails &&
        cloneMuteSwitchContractDetails.v2Override
      ) {
        return cloneMuteSwitchContractDetails.v2Override.routerAddress;
      }

      return MuteSwitchContractContext.routerAddress;
    },

    getFactoryAddress: (
      cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined
    ) => {
      if (
        cloneMuteSwitchContractDetails &&
        cloneMuteSwitchContractDetails.v2Override
      ) {
        return cloneMuteSwitchContractDetails.v2Override.factoryAddress;
      }

      return MuteSwitchContractContext.factoryAddress;
    },

    getPairAddress: (
      cloneMuteSwitchContractDetails: CloneMuteSwitchContractDetails | undefined
    ) => {
      if (
        cloneMuteSwitchContractDetails &&
        cloneMuteSwitchContractDetails.v2Override
      ) {
        return cloneMuteSwitchContractDetails.v2Override.pairAddress;
      }

      return MuteSwitchContractContext.pairAddress;
    },

};
