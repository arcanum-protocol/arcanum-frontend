import { Address } from 'viem';
import routerABI from '../abi/ROUTER';
import { TradeLogicAdapter } from '../components/trade-pane';
import { EstimatedValues } from '../types/estimatedValues';
import { EstimationTransactionBody } from '../types/estimationTransactionBody';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { BigNumber } from 'bignumber.js';

export const mintAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateMintSharesOut',
                args: [params.multipoolAddress, params.tokenIn?.address, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateMintAmountIn',
                args: [params.multipoolAddress, params.tokenIn?.address, params.quantities.out],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else {
            return undefined;
        }
    },
    parseEstimationResult: (
        v: any,
        params: SendTransactionParams,
    ): EstimatedValues | undefined => {
        if (!v) {
            return undefined;
        }
        if (params.quantities.in) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const denominatorIn = new BigNumber(10).pow(decimalsIn);
            const denominatorOut = new BigNumber(10).pow(decimalsOut);

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, priceOut);
            
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(0, denominatorOut, priceOut),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, priceIn),
                fee: makeFee(params.quantities.in, v[1], v[2], v[0], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'mintWithAmountIn',
                    args: [params.multipoolAddress, params.tokenIn?.address, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const denominatorIn = new BigNumber(10).pow(decimalsIn);
            const denominatorOut = new BigNumber(10).pow(decimalsOut);

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, false), denominatorIn, priceIn);

            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(0, denominatorOut, priceOut),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, priceIn),
                fee: makeFee(params.quantities.out, v[2], v[1], v[0], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'mintWithSharesOut',
                    args: [params.multipoolAddress, params.tokenIn?.address, params.quantities.out, maximumAmountIn.row, params.to],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}

function makeFee(inp: BigNumber, priceIn: BigNumber, priceOut: BigNumber, op: BigNumber, denominatorIn: BigNumber, denominatorOut: BigNumber): { percent: string, usd: string } {
    const inVal = Number(inp.toString()) / Number(denominatorIn.toString());
    const outVal = Number(op.toString()) / Number(denominatorOut.toString());
    const percent =
        (inVal * Number(priceIn.toString())) /
        (Number(priceOut.toString()) * outVal) - 1;
    const usdVal = percent * inVal;
    return {
        percent: Math.abs(percent * 100).toFixed(4),
        usd: Math.abs(usdVal).toFixed(4),
    }
}

function applySlippage(value: any, slippage: number, recv: boolean): BigNumber {
    const _value = new BigNumber(value.toString());
    const result = _value.multipliedBy(1 + (recv ? - slippage / 100 : slippage / 100));
    return result.integerValue(BigNumber.ROUND_DOWN);
}

function withDenominator(value: BigNumber, denominator: BigNumber): string {
    return value.div(denominator).toFixed(4);
}

function withDenominatorToUsd(value: BigNumber, denominator: BigNumber, price: BigNumber): string {
    return value.div(denominator).multipliedBy(price).toFixed(4);
}

function toAllFormats(value: any, denominator: BigNumber, price: BigNumber): { row: BigNumber, formatted: string, usd: string } {
    const _value = new BigNumber(value.toString());
    return {
        row: _value,
        formatted: withDenominator(_value, denominator),
        usd: withDenominatorToUsd(_value, denominator, price),
    };
}

export const swapAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateSwapAmountOut',
                args: [params.multipoolAddress, params.tokenIn?.address, params.tokenOut?.address, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined && params.tokenOut != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateSwapAmountIn',
                args: [params.multipoolAddress, params.tokenIn?.address, params.tokenOut?.address, params.quantities.out],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined && params.tokenOut != undefined,
            };
        } else {
            return undefined;
        }
    },
    parseEstimationResult: (
        v: any,
        params: SendTransactionParams,
    ): EstimatedValues | undefined => {
        if (!v) {
            return undefined;
        }
        if (params.quantities.in) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const denominatorIn = new BigNumber(10).pow(decimalsIn);
            const denominatorOut = new BigNumber(10).pow(decimalsOut)

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const minimalAmountOut = toAllFormats(applySlippage(v[1], params.slippage, true), denominatorOut, priceOut);
            
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[4], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(v[5], denominatorOut, priceOut),
                estimatedAmountOut: toAllFormats(v[1], denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, priceIn),
                fee: makeFee(params.quantities.in, v[2], v[3], v[1], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'swapWithAmountIn',
                    args: [params.multipoolAddress, params.tokenIn?.address, params.tokenOut?.address, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const denominatorIn = new BigNumber(10).pow(decimalsIn);
            const denominatorOut = new BigNumber(10).pow(decimalsOut)

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const maximumAmountIn = toAllFormats(applySlippage(v[1], params.slippage, false), denominatorIn, priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[4], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(v[5], denominatorOut, priceOut),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(v[1], denominatorIn, priceIn),
                fee: makeFee(params.quantities.out, v[3], v[2], v[1], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'swapWithAmountOut',
                    args: [params.multipoolAddress, params.tokenIn?.address, params.tokenOut?.address, params.quantities.out, maximumAmountIn.row, params.to],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}


export const burnAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateBurnAmountOut',
                args: [params.multipoolAddress, params.tokenOut?.address, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateBurnSharesIn',
                args: [params.multipoolAddress, params.tokenOut?.address, params.quantities.out],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else {
            return undefined;
        }
    },
    parseEstimationResult: (
        v: any,
        params: SendTransactionParams,
    ): EstimatedValues | undefined => {
        if (!v) {
            return undefined;
        }
        if (params.quantities.in) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const start = new BigNumber(10);

            const denominatorIn = start.pow(decimalsIn);
            const denominatorOut = start.pow(decimalsOut);

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(0, denominatorOut, priceOut),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, priceIn),
                fee: makeFee(params.quantities.in, v[2], v[1], v[0], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'burnWithSharesIn',
                    args: [params.multipoolAddress, params.tokenOut?.address, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const decimalsIn = new BigNumber(params?.tokenIn?.decimals || 0);
            const decimalsOut = new BigNumber(params?.tokenOut?.decimals || 0);

            const start = new BigNumber(10);

            const denominatorIn = start.pow(decimalsIn);
            const denominatorOut = start.pow(decimalsOut);

            const priceIn = new BigNumber(params.priceIn);
            const priceOut = new BigNumber(params.priceOut);

            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, false), denominatorIn, priceIn);

            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, priceIn),
                estimatedCashbackOut: toAllFormats(0, denominatorIn, priceIn),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, priceIn),
                fee: makeFee(params.quantities.out, v[1], v[2], v[0], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress as Address,
                    abi: routerABI,
                    functionName: 'burnWithAmountOut',
                    args: [params.multipoolAddress, params.tokenOut?.address, params.quantities.out, maximumAmountIn.row, params.to],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}
