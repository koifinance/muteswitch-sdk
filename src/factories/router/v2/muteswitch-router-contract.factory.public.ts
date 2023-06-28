import {
  ChainIdAndProvider,
  EthereumProvider,
  EthersProvider,
} from '../../../ethers-provider';
import { MuteSwitchRouterContractFactory } from './muteswitch-router-contract.factory';

export class MuteSwitchRouterContractFactoryPublic extends MuteSwitchRouterContractFactory {
  constructor(providerContext: ChainIdAndProvider | EthereumProvider) {
    super(new EthersProvider(providerContext));
  }
}
