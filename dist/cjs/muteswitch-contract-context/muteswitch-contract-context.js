"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchContractContext = void 0;
class MuteSwitchContractContext {
}
exports.MuteSwitchContractContext = MuteSwitchContractContext;
/**
 * The muteswitch router address
 */
MuteSwitchContractContext.routerAddress = '0x8B791913eB07C32779a16750e3868aA8495F5964';
/**
 * The muteswitch factory address
 */
MuteSwitchContractContext.factoryAddress = '0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D';
/**
 * The muteswitch pair address
 */
MuteSwitchContractContext.pairAddress = '0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D';
/**
 * MuteSwitch v2 router
 */
MuteSwitchContractContext.routerAbi = require('../ABI/muteswitch-router.json');
/**
 * MuteSwitch v2 factory
 */
MuteSwitchContractContext.factoryAbi = require('../ABI/muteswitch-factory.json');
/**
 * MuteSwitch v2 pair
 */
MuteSwitchContractContext.pairAbi = require('../ABI/muteswitch-pair.json');
