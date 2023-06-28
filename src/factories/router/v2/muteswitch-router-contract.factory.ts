import { BigNumberish, BytesLike } from 'ethers';
import BigNumber from 'bignumber.js';
import { ContractContext as RouterContractContext } from '../../../ABI/types/muteswitch-router';
import { EthersProvider } from '../../../ethers-provider';
import { MuteSwitchContractContext } from '../../../muteswitch-contract-context/muteswitch-contract-context';

export class MuteSwitchRouterContractFactory {
  private _muteswitchRouterContract =
    this._ethersProvider.getContract<RouterContractContext>(
      JSON.stringify(MuteSwitchContractContext.routerAbi),
      this._routerAddress
    );

  constructor(
    private _ethersProvider: EthersProvider,
    private _routerAddress: string = MuteSwitchContractContext.routerAddress
  ) {}

  public addLiquidity(
    tokenA: string,
    tokenB: string,
    amountADesired: BigNumberish,
    amountBDesired: BigNumberish,
    amountAMin: BigNumberish,
    amountBMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    stable: boolean
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'addLiquidity',
      [
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline,
        stable
      ]
    );
  }

  public addLiquidityETH(
    token: string,
    amountTokenDesired: BigNumberish,
    amountTokenMin: BigNumberish,
    amountETHMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    stable: boolean
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'addLiquidityETH',
      [token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline, stable]
    );
  }

  public async factory(): Promise<string> {
    return await this._muteswitchRouterContract.factory();
  }

  public async getAmountsOut(
    amountIn: BigNumberish,
    path: string[]
  ): Promise<{amounts: string[], stable: boolean[], fee: string[]}> {
    var data = await this._muteswitchRouterContract.getAmountsOutExpanded(
      amountIn,
      path,
    );
    return {
      amounts: data.amounts.map((c) => c.toHexString()),
      stable: data.stable,
      fee: data.amounts.map((c) => c.toHexString())
    }
  }

  public async getPairInfoFee(
    path: string[],
    stable: boolean
  ): Promise<BigNumber> {
    const pairInfo = await this._muteswitchRouterContract.getPairInfo(path, stable);
    return new BigNumber(pairInfo[5]['_hex']);
  }

  public async quote(
    amountA: BigNumberish,
    reserveA: BigNumberish,
    reserveB: BigNumberish
  ): Promise<string> {
    return (
      await this._muteswitchRouterContract.quote(amountA, reserveA, reserveB)
    ).toHexString();
  }

  public removeLiquidity(
    tokenA: string,
    tokenB: string,
    liquidity: BigNumberish,
    amountAMin: BigNumberish,
    amountBMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    stable: boolean
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidity',
      [tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, stable]
    );
  }

  public removeLiquidityETH(
    token: string,
    liquidity: BigNumberish,
    amountTokenMin: BigNumberish,
    amountETHMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    stable: boolean
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidity',
      [token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable]
    );
  }

  public removeLiquidityETHSupportingFeeOnTransferTokens(
    token: string,
    liquidity: BigNumberish,
    amountTokenMin: BigNumberish,
    amountETHMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    stable: boolean
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidityETHSupportingFeeOnTransferTokens',
      [token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable]
    );
  }

  public removeLiquidityETHWithPermit(
    token: string,
    liquidity: BigNumberish,
    amountTokenMin: BigNumberish,
    amountETHMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    approveMax: boolean,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidityETHWithPermit',
      [
        token,
        liquidity,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        approveMax,
        v,
        r,
        s,
      ]
    );
  }

  public removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
    token: string,
    liquidity: BigNumberish,
    amountTokenMin: BigNumberish,
    amountETHMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    approveMax: boolean,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
      [
        token,
        liquidity,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        approveMax,
        v,
        r,
        s,
      ]
    );
  }

  public removeLiquidityWithPermit(
    tokenA: string,
    tokenB: string,
    liquidity: BigNumberish,
    amountAMin: BigNumberish,
    amountBMin: BigNumberish,
    to: string,
    deadline: BigNumberish,
    approveMax: boolean,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'removeLiquidityWithPermit',
      [
        tokenA,
        tokenB,
        liquidity,
        amountAMin,
        amountBMin,
        to,
        deadline,
        approveMax,
        v,
        r,
        s,
      ]
    );
  }

  public swapExactETHForTokens(
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactETHForTokens',
      [amountOutMin, path, to, deadline, stable]
    );
  }

  public swapETHForExactTokens(
    amountOut: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapETHForExactTokens',
      [amountOut, path, to, deadline, stable]
    );
  }

  public swapExactETHForTokensSupportingFeeOnTransferTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactETHForTokensSupportingFeeOnTransferTokens',
      [amountIn, amountOutMin, path, to, deadline, stable]
    );
  }

  public swapExactTokensForETH(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactTokensForETH',
      [amountIn, amountOutMin, path, to, deadline, stable]
    );
  }

  public swapTokensForExactETH(
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapTokensForExactETH',
      [amountOut, amountInMax, path, to, deadline, stable]
    );
  }

  public swapExactTokensForETHSupportingFeeOnTransferTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactTokensForETHSupportingFeeOnTransferTokens',
      [amountIn, amountOutMin, path, to, deadline, stable]
    );
  }

  public swapExactTokensForTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactTokensForTokens',
      [amountIn, amountOutMin, path, to, deadline, stable]
    );
  }

  public swapTokensForExactTokens(
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapTokensForExactTokens',
      [amountOut, amountInMax, path, to, deadline, stable]
    );
  }

  public swapExactTokensForTokensSupportingFeeOnTransferTokens(
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    path: string[],
    to: string,
    deadline: BigNumberish,
    stable: boolean[]
  ): string {
    return this._muteswitchRouterContract.interface.encodeFunctionData(
      'swapExactTokensForTokensSupportingFeeOnTransferTokens',
      [amountIn, amountOutMin, path, to, deadline, stable]
    );
  }
}
