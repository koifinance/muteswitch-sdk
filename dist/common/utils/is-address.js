"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAddress = void 0;
const ethers_1 = require("ethers");
const eth_1 = require("../tokens/eth");
function isAddress(address) {
    return ethers_1.ethers.utils.isAddress((0, eth_1.removeEthFromContractAddress)(address));
}
exports.isAddress = isAddress;
