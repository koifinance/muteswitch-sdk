import { ContractInterface, providers } from 'ethers';
import { ChainId } from './enums/chain-id';
import { CustomNetwork } from './factories/pair/models/custom-network';
export interface ChainIdAndProvider {
    chainId: ChainId;
    providerUrl?: string | undefined;
    customNetwork?: CustomNetwork | undefined;
}
export interface EthereumProvider {
    ethereumProvider: any;
    customNetwork?: CustomNetwork | undefined;
}
export declare class EthersProvider {
    private _providerContext;
    private _ethersProvider;
    constructor(_providerContext: ChainIdAndProvider | EthereumProvider);
    /**
     * Get the chain name
     * @param chainId The chain id
     * @returns
     */
    private getChainName;
    /**
     * Creates a contract instance
     * @param abi The ABI
     * @param contractAddress The contract address
     */
    getContract<TGeneratedTypedContext>(abi: ContractInterface, contractAddress: string): TGeneratedTypedContext;
    /**
     * Get the network
     */
    network(): providers.Network;
    /**
     * Get the ethers provider
     */
    get provider(): providers.BaseProvider;
    /**
     * Get eth amount
     * @param ethereumAddress The ethereum address
     */
    balanceOf(ethereumAddress: string): Promise<string>;
    /**
     * Get provider url
     */
    getProviderUrl(): string | undefined;
    /**
     * Get the api key
     */
    private get _getApiKey();
}
