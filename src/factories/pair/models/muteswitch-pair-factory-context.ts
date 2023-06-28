import { EthersProvider } from '../../../ethers-provider';
import { Token } from '../../token/models/token';
import { MuteSwitchPairSettings } from './muteswitch-pair-settings';

export interface MuteSwitchPairFactoryContext {
  fromToken: Token;
  toToken: Token;
  ethereumAddress: string;
  settings: MuteSwitchPairSettings;
  ethersProvider: EthersProvider;
}
