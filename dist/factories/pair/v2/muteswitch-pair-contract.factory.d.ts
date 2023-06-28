import { BigNumberish } from 'ethers';
import { EthersProvider } from '../../../ethers-provider';
export declare class MuteSwitchPairContractFactory {
    private _ethersProvider;
    private _pairAddress;
    private _muteswitchPairFactory;
    constructor(_ethersProvider: EthersProvider, _pairAddress?: string);
    allPairs(parameter0: BigNumberish): Promise<string>;
    allPairsLength(): Promise<string>;
    createPair(tokenA: string, tokenB: string): string;
    feeTo(): Promise<string>;
    feeToSetter(): Promise<string>;
    getPair(parameter0: string, parameter1: string): Promise<string>;
    setFeeTo(_feeTo: string): Promise<string>;
    setFeeToSetter(_feeToSetter: string): Promise<string>;
}
