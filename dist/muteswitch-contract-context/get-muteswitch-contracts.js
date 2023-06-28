"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.muteswitchContracts = void 0;
const muteswitch_contract_context_1 = require("./muteswitch-contract-context");
exports.muteswitchContracts = {
    getRouterAddress: (cloneMuteSwitchContractDetails) => {
        if (cloneMuteSwitchContractDetails &&
            cloneMuteSwitchContractDetails.v2Override) {
            return cloneMuteSwitchContractDetails.v2Override.routerAddress;
        }
        return muteswitch_contract_context_1.MuteSwitchContractContext.routerAddress;
    },
    getFactoryAddress: (cloneMuteSwitchContractDetails) => {
        if (cloneMuteSwitchContractDetails &&
            cloneMuteSwitchContractDetails.v2Override) {
            return cloneMuteSwitchContractDetails.v2Override.factoryAddress;
        }
        return muteswitch_contract_context_1.MuteSwitchContractContext.factoryAddress;
    },
    getPairAddress: (cloneMuteSwitchContractDetails) => {
        if (cloneMuteSwitchContractDetails &&
            cloneMuteSwitchContractDetails.v2Override) {
            return cloneMuteSwitchContractDetails.v2Override.pairAddress;
        }
        return muteswitch_contract_context_1.MuteSwitchContractContext.pairAddress;
    },
};
