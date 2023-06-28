"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchContractFactoryPublic = void 0;
const ethers_provider_1 = require("../../../ethers-provider");
const muteswitch_contract_context_1 = require("../../../muteswitch-contract-context/muteswitch-contract-context");
const muteswitch_contract_factory_1 = require("./muteswitch-contract.factory");
class MuteSwitchContractFactoryPublic extends muteswitch_contract_factory_1.MuteSwitchContractFactory {
    constructor(providerContext, factoryAddress = muteswitch_contract_context_1.MuteSwitchContractContext.factoryAddress) {
        super(new ethers_provider_1.EthersProvider(providerContext), factoryAddress);
    }
}
exports.MuteSwitchContractFactoryPublic = MuteSwitchContractFactoryPublic;
