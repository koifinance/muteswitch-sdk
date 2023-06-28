"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenFactoryPublic = void 0;
const ethers_provider_1 = require("../../ethers-provider");
const token_factory_1 = require("./token.factory");
class TokenFactoryPublic extends token_factory_1.TokenFactory {
    constructor(tokenContractAddress, providerContext) {
        super(tokenContractAddress, new ethers_provider_1.EthersProvider(providerContext));
    }
}
exports.TokenFactoryPublic = TokenFactoryPublic;
