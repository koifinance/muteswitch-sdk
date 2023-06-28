import { BigNumberish } from 'ethers';
import { ContractContext as PairContractContext } from '../../../ABI/types/muteswitch-pair';
import { EthersProvider } from '../../../ethers-provider';
import { MuteSwitchContractContext } from '../../../muteswitch-contract-context/muteswitch-contract-context';

export class MuteSwitchPairContractFactory {
  private _muteswitchPairFactory =
    this._ethersProvider.getContract<PairContractContext>(
      JSON.stringify(MuteSwitchContractContext.pairAbi),
      this._pairAddress
    );

  constructor(
    private _ethersProvider: EthersProvider,
    private _pairAddress: string = MuteSwitchContractContext.pairAddress
  ) {}

  public async allPairs(parameter0: BigNumberish): Promise<string> {
    return await this._muteswitchPairFactory.allPairs(parameter0);
  }

  public async allPairsLength(): Promise<string> {
    return (await this._muteswitchPairFactory.allPairsLength()).toHexString();
  }

  public createPair(tokenA: string, tokenB: string): string {
    return this._muteswitchPairFactory.interface.encodeFunctionData('createPair', [
      tokenA,
      tokenB,
    ]);
  }

  public async feeTo(): Promise<string> {
    return await this._muteswitchPairFactory.feeTo();
  }

  public async feeToSetter(): Promise<string> {
    return await this._muteswitchPairFactory.feeToSetter();
  }

  public async getPair(
    parameter0: string,
    parameter1: string
  ): Promise<string> {
    return await this._muteswitchPairFactory.getPair(parameter0, parameter1);
  }

  public async setFeeTo(_feeTo: string): Promise<string> {
    return this._muteswitchPairFactory.interface.encodeFunctionData('setFeeTo', [
      _feeTo,
    ]);
  }

  public async setFeeToSetter(_feeToSetter: string): Promise<string> {
    return this._muteswitchPairFactory.interface.encodeFunctionData(
      'setFeeToSetter',
      [_feeToSetter]
    );
  }
}
