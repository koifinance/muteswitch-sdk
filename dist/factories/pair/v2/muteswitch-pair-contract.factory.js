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
exports.MuteSwitchPairContractFactory = void 0;
const muteswitch_contract_context_1 = require("../../../muteswitch-contract-context/muteswitch-contract-context");
class MuteSwitchPairContractFactory {
    constructor(_ethersProvider, _pairAddress = muteswitch_contract_context_1.MuteSwitchContractContext.pairAddress) {
        this._ethersProvider = _ethersProvider;
        this._pairAddress = _pairAddress;
        this._muteswitchPairFactory = this._ethersProvider.getContract(JSON.stringify(muteswitch_contract_context_1.MuteSwitchContractContext.pairAbi), this._pairAddress);
    }
    allPairs(parameter0) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchPairFactory.allPairs(parameter0);
        });
    }
    allPairsLength() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._muteswitchPairFactory.allPairsLength()).toHexString();
        });
    }
    createPair(tokenA, tokenB) {
        return this._muteswitchPairFactory.interface.encodeFunctionData('createPair', [
            tokenA,
            tokenB,
        ]);
    }
    feeTo() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchPairFactory.feeTo();
        });
    }
    feeToSetter() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchPairFactory.feeToSetter();
        });
    }
    getPair(parameter0, parameter1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchPairFactory.getPair(parameter0, parameter1);
        });
    }
    setFeeTo(_feeTo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._muteswitchPairFactory.interface.encodeFunctionData('setFeeTo', [
                _feeTo,
            ]);
        });
    }
    setFeeToSetter(_feeToSetter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._muteswitchPairFactory.interface.encodeFunctionData('setFeeToSetter', [_feeToSetter]);
        });
    }
}
exports.MuteSwitchPairContractFactory = MuteSwitchPairContractFactory;
