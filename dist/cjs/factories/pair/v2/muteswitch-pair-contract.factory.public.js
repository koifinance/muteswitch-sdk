"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchPairContractFactoryPublic = void 0;
const ethers_provider_1 = require("../../../ethers-provider");
const muteswitch_contract_context_1 = require("../../../muteswitch-contract-context/muteswitch-contract-context");
const muteswitch_pair_contract_factory_1 = require("./muteswitch-pair-contract.factory");
class MuteSwitchPairContractFactoryPublic extends muteswitch_pair_contract_factory_1.MuteSwitchPairContractFactory {
    constructor(providerContext, pairAddress = muteswitch_contract_context_1.MuteSwitchContractContext.pairAddress) {
        super(new ethers_provider_1.EthersProvider(providerContext), pairAddress);
    }
}
exports.MuteSwitchPairContractFactoryPublic = MuteSwitchPairContractFactoryPublic;
