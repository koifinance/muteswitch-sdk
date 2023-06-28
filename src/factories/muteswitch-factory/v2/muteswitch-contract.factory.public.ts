import {
  ChainIdAndProvider,
  EthereumProvider,
  EthersProvider,
} from '../../../ethers-provider';
import { MuteSwitchContractContext } from '../../../muteswitch-contract-context/muteswitch-contract-context';
import { MuteSwitchContractFactory } from './muteswitch-contract.factory';

export class MuteSwitchContractFactoryPublic extends MuteSwitchContractFactory {
  constructor(
    providerContext: ChainIdAndProvider | EthereumProvider,
    factoryAddress: string = MuteSwitchContractContext.factoryAddress
  ) {
    super(new EthersProvider(providerContext), factoryAddress);
  }
}
