import { BigNumberish, BytesLike } from 'ethers';
import BigNumber from 'bignumber.js';
import { EthersProvider } from '../../../ethers-provider';
export declare class MuteSwitchRouterContractFactory {
    private _ethersProvider;
    private _routerAddress;
    private _muteswitchRouterContract;
    constructor(_ethersProvider: EthersProvider, _routerAddress?: string);
    addLiquidity(tokenA: string, tokenB: string, amountADesired: BigNumberish, amountBDesired: BigNumberish, amountAMin: BigNumberish, amountBMin: BigNumberish, to: string, deadline: BigNumberish, stable: boolean): string;
    addLiquidityETH(token: string, amountTokenDesired: BigNumberish, amountTokenMin: BigNumberish, amountETHMin: BigNumberish, to: string, deadline: BigNumberish, stable: boolean): string;
    factory(): Promise<string>;
    getAmountsOut(amountIn: BigNumberish, path: string[]): Promise<{
        amounts: string[];
        stable: boolean[];
        fee: string[];
    }>;
    getPairInfoFee(path: string[], stable: boolean): Promise<BigNumber>;
    quote(amountA: BigNumberish, reserveA: BigNumberish, reserveB: BigNumberish): Promise<string>;
    removeLiquidity(tokenA: string, tokenB: string, liquidity: BigNumberish, amountAMin: BigNumberish, amountBMin: BigNumberish, to: string, deadline: BigNumberish, stable: boolean): string;
    removeLiquidityETH(token: string, liquidity: BigNumberish, amountTokenMin: BigNumberish, amountETHMin: BigNumberish, to: string, deadline: BigNumberish, stable: boolean): string;
    removeLiquidityETHSupportingFeeOnTransferTokens(token: string, liquidity: BigNumberish, amountTokenMin: BigNumberish, amountETHMin: BigNumberish, to: string, deadline: BigNumberish, stable: boolean): string;
    removeLiquidityETHWithPermit(token: string, liquidity: BigNumberish, amountTokenMin: BigNumberish, amountETHMin: BigNumberish, to: string, deadline: BigNumberish, approveMax: boolean, v: BigNumberish, r: BytesLike, s: BytesLike): string;
    removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(token: string, liquidity: BigNumberish, amountTokenMin: BigNumberish, amountETHMin: BigNumberish, to: string, deadline: BigNumberish, approveMax: boolean, v: BigNumberish, r: BytesLike, s: BytesLike): string;
    removeLiquidityWithPermit(tokenA: string, tokenB: string, liquidity: BigNumberish, amountAMin: BigNumberish, amountBMin: BigNumberish, to: string, deadline: BigNumberish, approveMax: boolean, v: BigNumberish, r: BytesLike, s: BytesLike): string;
    swapExactETHForTokens(amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapETHForExactTokens(amountOut: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapExactETHForTokensSupportingFeeOnTransferTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapExactTokensForETH(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapTokensForExactETH(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapExactTokensForTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapTokensForExactTokens(amountOut: BigNumberish, amountInMax: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
    swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn: BigNumberish, amountOutMin: BigNumberish, path: string[], to: string, deadline: BigNumberish, stable: boolean[]): string;
}
