"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchRouterContractFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const muteswitch_contract_context_1 = require("../../../muteswitch-contract-context/muteswitch-contract-context");
class MuteSwitchRouterContractFactory {
    constructor(_ethersProvider, _routerAddress = muteswitch_contract_context_1.MuteSwitchContractContext.routerAddress) {
        this._ethersProvider = _ethersProvider;
        this._routerAddress = _routerAddress;
        this._muteswitchRouterContract = this._ethersProvider.getContract(JSON.stringify(muteswitch_contract_context_1.MuteSwitchContractContext.routerAbi), this._routerAddress);
    }
    addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('addLiquidity', [
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline,
            stable
        ]);
    }
    addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('addLiquidityETH', [token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline, stable]);
    }
    factory() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._muteswitchRouterContract.factory();
        });
    }
    getAmountsOut(amountIn, path) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = yield this._muteswitchRouterContract.getAmountsOutExpanded(amountIn, path);
            return {
                amounts: data.amounts.map((c) => c.toHexString()),
                stable: data.stable,
                fee: data.amounts.map((c) => c.toHexString())
            };
        });
    }
    getPairInfoFee(path, stable) {
        return __awaiter(this, void 0, void 0, function* () {
            const pairInfo = yield this._muteswitchRouterContract.getPairInfo(path, stable);
            return new bignumber_js_1.default(pairInfo[5]['_hex']);
        });
    }
    quote(amountA, reserveA, reserveB) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._muteswitchRouterContract.quote(amountA, reserveA, reserveB)).toHexString();
        });
    }
    removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidity', [tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, stable]);
    }
    removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidity', [token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable]);
    }
    removeLiquidityETHSupportingFeeOnTransferTokens(token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidityETHSupportingFeeOnTransferTokens', [token, liquidity, amountTokenMin, amountETHMin, to, deadline, stable]);
    }
    removeLiquidityETHWithPermit(token, liquidity, amountTokenMin, amountETHMin, to, deadline, approveMax, v, r, s) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidityETHWithPermit', [
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
        ]);
    }
    removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(token, liquidity, amountTokenMin, amountETHMin, to, deadline, approveMax, v, r, s) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidityETHWithPermitSupportingFeeOnTransferTokens', [
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
        ]);
    }
    removeLiquidityWithPermit(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, approveMax, v, r, s) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('removeLiquidityWithPermit', [
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
        ]);
    }
    swapExactETHForTokens(amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactETHForTokens', [amountOutMin, path, to, deadline, stable]);
    }
    swapETHForExactTokens(amountOut, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapETHForExactTokens', [amountOut, path, to, deadline, stable]);
    }
    swapExactETHForTokensSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactETHForTokensSupportingFeeOnTransferTokens', [amountIn, amountOutMin, path, to, deadline, stable]);
    }
    swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactTokensForETH', [amountIn, amountOutMin, path, to, deadline, stable]);
    }
    swapTokensForExactETH(amountOut, amountInMax, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapTokensForExactETH', [amountOut, amountInMax, path, to, deadline, stable]);
    }
    swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactTokensForETHSupportingFeeOnTransferTokens', [amountIn, amountOutMin, path, to, deadline, stable]);
    }
    swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactTokensForTokens', [amountIn, amountOutMin, path, to, deadline, stable]);
    }
    swapTokensForExactTokens(amountOut, amountInMax, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapTokensForExactTokens', [amountOut, amountInMax, path, to, deadline, stable]);
    }
    swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, to, deadline, stable) {
        return this._muteswitchRouterContract.interface.encodeFunctionData('swapExactTokensForTokensSupportingFeeOnTransferTokens', [amountIn, amountOutMin, path, to, deadline, stable]);
    }
}
exports.MuteSwitchRouterContractFactory = MuteSwitchRouterContractFactory;
