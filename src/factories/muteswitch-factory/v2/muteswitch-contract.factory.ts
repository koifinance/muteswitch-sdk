import { BigNumberish } from 'ethers';
import { ContractContext as FactoryContractContext } from '../../../ABI/types/muteswitch-factory';
import { EthersProvider } from '../../../ethers-provider';
import { MuteSwitchContractContext } from '../../../muteswitch-contract-context/muteswitch-contract-context';

export class MuteSwitchContractFactory {
  private _muteswitchFactoryContract =
    this._ethersProvider.getContract<FactoryContractContext>(
      JSON.stringify(MuteSwitchContractContext.factoryAbi),
      this._factoryAddress
    );

  constructor(
    private _ethersProvider: EthersProvider,
    private _factoryAddress: string = MuteSwitchContractContext.factoryAddress
  ) {}

  public async allPairs(parameter0: BigNumberish): Promise<string> {
    return await this._muteswitchFactoryContract.allPairs(parameter0);
  }

  public async allPairsLength(): Promise<string> {
    return (await this._muteswitchFactoryContract.allPairsLength()).toHexString();
  }

  public createPair(tokenA: string, tokenB: string, feeType: string, stable: boolean): string {
    return this._muteswitchFactoryContract.interface.encodeFunctionData(
      'createPair',
      [tokenA, tokenB, feeType, stable]
    );
  }

  public async getPair(token0: string, token1: string, stable: boolean): Promise<string> {
    return await this._muteswitchFactoryContract.getPair(token0, token1, stable);
  }

  public async feeTo(): Promise<string> {
    return await this._muteswitchFactoryContract.feeTo();
  }

  public async feeToSetter(): Promise<string> {
    return await this._muteswitchFactoryContract.feeToSetter();
  }

  public async setFeeTo(_feeTo: string): Promise<string> {
    return this._muteswitchFactoryContract.interface.encodeFunctionData(
      'setFeeTo',
      [_feeTo]
    );
  }

  public async setFeeToSetter(_feeToSetter: string): Promise<string> {
    return this._muteswitchFactoryContract.interface.encodeFunctionData(
      'setFeeToSetter',
      [_feeToSetter]
    );
  }
}
