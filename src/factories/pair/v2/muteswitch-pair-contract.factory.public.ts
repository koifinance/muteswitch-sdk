import {
  ChainIdAndProvider,
  EthereumProvider,
  EthersProvider,
} from '../../../ethers-provider';
import { MuteSwitchContractContext } from '../../../muteswitch-contract-context/muteswitch-contract-context';
import { MuteSwitchPairContractFactory } from './muteswitch-pair-contract.factory';

export class MuteSwitchPairContractFactoryPublic extends MuteSwitchPairContractFactory {
  constructor(
    providerContext: ChainIdAndProvider | EthereumProvider,
    pairAddress: string = MuteSwitchContractContext.pairAddress
  ) {
    super(new EthersProvider(providerContext), pairAddress);
  }
}
