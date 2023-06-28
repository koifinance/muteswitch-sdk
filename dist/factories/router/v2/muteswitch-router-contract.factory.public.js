"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchRouterContractFactoryPublic = void 0;
const ethers_provider_1 = require("../../../ethers-provider");
const muteswitch_router_contract_factory_1 = require("./muteswitch-router-contract.factory");
class MuteSwitchRouterContractFactoryPublic extends muteswitch_router_contract_factory_1.MuteSwitchRouterContractFactory {
    constructor(providerContext) {
        super(new ethers_provider_1.EthersProvider(providerContext));
    }
}
exports.MuteSwitchRouterContractFactoryPublic = MuteSwitchRouterContractFactoryPublic;
