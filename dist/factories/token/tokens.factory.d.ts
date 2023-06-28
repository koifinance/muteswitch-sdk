import { EthersProvider } from '../../ethers-provider';
import { CloneMuteSwitchContractDetails } from '../pair/models/clone-muteswitch-contract-details';
import { CustomNetwork } from '../pair/models/custom-network';
import { Token } from './models/token';
import { TokenWithAllowanceInfo } from './models/token-with-allowance-info';
export declare class TokensFactory {
    private _ethersProvider;
    private _customNetwork?;
    private _cloneMuteSwitchContractDetails?;
    private _multicall;
    constructor(_ethersProvider: EthersProvider, _customNetwork?: CustomNetwork | undefined, _cloneMuteSwitchContractDetails?: CloneMuteSwitchContractDetails | undefined);
    /**
     * Get the tokens details
     */
    getTokens(tokenContractAddresses: string[]): Promise<Token[]>;
    /**
     * Get allowance and balance for many contracts
     * @param ethereumAddress The ethereum address
     * @param tokenContractAddresses The token contract addresses
     * @param format If you want it to format it for you to the correct decimal place
     */
    getAllowanceAndBalanceOfForContracts(ethereumAddress: string, tokenContractAddresses: string[], format?: boolean): Promise<TokenWithAllowanceInfo[]>;
    private buildAllowanceAndBalanceContractCallContext;
}
