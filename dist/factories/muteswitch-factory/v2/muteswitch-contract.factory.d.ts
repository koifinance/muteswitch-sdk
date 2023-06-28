import { BigNumberish } from 'ethers';
import { EthersProvider } from '../../../ethers-provider';
export declare class MuteSwitchContractFactory {
    private _ethersProvider;
    private _factoryAddress;
    private _muteswitchFactoryContract;
    constructor(_ethersProvider: EthersProvider, _factoryAddress?: string);
    allPairs(parameter0: BigNumberish): Promise<string>;
    allPairsLength(): Promise<string>;
    createPair(tokenA: string, tokenB: string, feeType: string, stable: boolean): string;
    getPair(token0: string, token1: string, stable: boolean): Promise<string>;
    feeTo(): Promise<string>;
    feeToSetter(): Promise<string>;
    setFeeTo(_feeTo: string): Promise<string>;
    setFeeToSetter(_feeToSetter: string): Promise<string>;
}
