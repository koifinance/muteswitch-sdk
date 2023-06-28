"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomMulticall = void 0;
const ethereum_multicall_1 = require("ethereum-multicall");
class CustomMulticall extends ethereum_multicall_1.Multicall {
    constructor(ethersProvider, multicallCustomContractAddress) {
        super({
            ethersProvider,
            tryAggregate: true,
            multicallCustomContractAddress,
        });
    }
}
exports.CustomMulticall = CustomMulticall;
