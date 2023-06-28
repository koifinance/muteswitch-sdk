import { JsonFragment } from '@ethersproject/abi';

export class MuteSwitchContractContext {
  /**
   * The muteswitch router address
   */
  public static routerAddress = '0x8B791913eB07C32779a16750e3868aA8495F5964';

  /**
   * The muteswitch factory address
   */
  public static factoryAddress = '0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D';

  /**
   * The muteswitch pair address
   */
  public static pairAddress = '0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D';

  /**
   * MuteSwitch v2 router
   */
  public static routerAbi: JsonFragment[] = require('../ABI/muteswitch-router.json');

  /**
   * MuteSwitch v2 factory
   */
  public static factoryAbi: JsonFragment[] = require('../ABI/muteswitch-factory.json');

  /**
   * MuteSwitch v2 pair
   */
  public static pairAbi: JsonFragment[] = require('../ABI/muteswitch-pair.json');
}
