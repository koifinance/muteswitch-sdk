"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddress = void 0;
const ethers_1 = require("ethers");
const eth_1 = require("../tokens/eth");
function getAddress(address, keepEthPrefix = false) {
    const parsedAddress = ethers_1.ethers.utils.getAddress((0, eth_1.removeEthFromContractAddress)(address));
    if (!keepEthPrefix) {
        return parsedAddress;
    }
    if (!(0, eth_1.isNativeEth)(address)) {
        return parsedAddress;
    }
    return (0, eth_1.appendEthToContractAddress)(parsedAddress);
}
exports.getAddress = getAddress;
