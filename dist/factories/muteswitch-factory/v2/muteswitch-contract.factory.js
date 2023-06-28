"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchContractFactory = void 0;
const muteswitch_contract_context_1 = require("../../../muteswitch-contract-context/muteswitch-contract-context");
class MuteSwitchContractFactory {
    constructor(_ethersProvider, _factoryAddress = muteswitch_contract_context_1.MuteSwitchContractContext.factoryAddress) {
        this._ethersProvider = _ethersProvider;
        this._factoryAddress = _factoryAddress;
        this._muteswitchFactoryContract = this._ethersProvider.getContract(JSON.stringify(muteswitch_contract_context_1.MuteSwitchContractContext.factoryAbi), this._factoryAddress);
    }
    allPairs(parameter0) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchFactoryContract.allPairs(parameter0);
        });
    }
    allPairsLength() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._muteswitchFactoryContract.allPairsLength()).toHexString();
        });
    }
    createPair(tokenA, tokenB, feeType, stable) {
        return this._muteswitchFactoryContract.interface.encodeFunctionData('createPair', [tokenA, tokenB, feeType, stable]);
    }
    getPair(token0, token1, stable) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchFactoryContract.getPair(token0, token1, stable);
        });
    }
    feeTo() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchFactoryContract.feeTo();
        });
    }
    feeToSetter() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchFactoryContract.feeToSetter();
        });
    }
    setFeeTo(_feeTo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._muteswitchFactoryContract.interface.encodeFunctionData('setFeeTo', [_feeTo]);
        });
    }
    setFeeToSetter(_feeToSetter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._muteswitchFactoryContract.interface.encodeFunctionData('setFeeToSetter', [_feeToSetter]);
        });
    }
}
exports.MuteSwitchContractFactory = MuteSwitchContractFactory;
