"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchPairSettings = void 0;
class MuteSwitchPairSettings {
    constructor(settings) {
        this.gasSettings = undefined;
        this.cloneMuteSwitchContractDetails = undefined;
        this.customNetwork = undefined;
        this.slippage = (settings === null || settings === void 0 ? void 0 : settings.slippage) || 0.005;
        this.deadlineMinutes = (settings === null || settings === void 0 ? void 0 : settings.deadlineMinutes) || 20;
        this.disableMultihops = (settings === null || settings === void 0 ? void 0 : settings.disableMultihops) || false;
        this.gasSettings = settings === null || settings === void 0 ? void 0 : settings.gasSettings;
        this.cloneMuteSwitchContractDetails = settings === null || settings === void 0 ? void 0 : settings.cloneMuteSwitchContractDetails;
        this.customNetwork = settings === null || settings === void 0 ? void 0 : settings.customNetwork;
    }
}
exports.MuteSwitchPairSettings = MuteSwitchPairSettings;
