import routerABI from '../abi/ROUTER';
import { EstimatedValues, EstimationTransactionBody, SendTransactionParams, TradeLogicAdapter, TradePane } from '../components/trade-pane';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';

export const mintAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateMintSharesOut',
                args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateMintAmountIn',
                args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out],
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
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.in, v[1], v[2], v[0], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'mintWithAmountIn',
                    args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, false), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.out, v[2], v[1], v[0], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'mintWithSharesOut',
                    args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}

function makeFee(inp: BigInt, priceIn: BigInt, priceOut: BigInt, op: BigInt, denominatorIn: BigInt, denominatorOut: BigInt): { percent: string, usd: string } {
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

function makeFeeSwap(inp: BigInt, priceIn: BigInt, priceOut: BigInt, op: BigInt, denominatorIn: BigInt, denominatorOut: BigInt): { percent: string, usd: string } {
    const inVal = Number(inp.toString()) / Number(denominatorIn.toString());
    const outVal = Number(op.toString()) / Number(denominatorOut.toString());
    console.log(inVal, priceIn, priceOut, outVal);
    const percent =
        (inVal * Number(priceIn.toString())) /
        (Number(priceOut.toString()) * outVal) - 1;
    const usdVal = percent * inVal;
    return {
        percent: Math.abs(percent * 100).toFixed(4),
        usd: Math.abs(usdVal).toFixed(4),
    }
}

function applySlippage(value: BigInt, slippage: number, recv: boolean): BigInt {
    return BigInt(FixedNumber
        .fromString(value.toString())
        .mulUnsafe(FixedNumber.fromString(
            (1 + (recv ? - slippage / 100 : slippage / 100)).toString()))
        .toString().split(".")[0]);
}

function withDenominator(value: BigInt, denominator: BigInt): string {
    return Number(FixedNumber
        .from(value)
        .divUnsafe(FixedNumber.from(denominator))
        .toString()).toFixed(4);
}

function withDenominatorToUsd(value: BigInt, denominator: BigInt, price: Number): string {
    return Number(FixedNumber.from(value)
        .divUnsafe(FixedNumber.from(denominator))
        .mulUnsafe(FixedNumber.fromString(price.toString()))
        .toString()).toFixed(4);
}

function toAllFormats(value: BigInt, denominator: BigInt, price: Number): { row: BigInt, formatted: string, usd: string } {
    return {
        row: value,
        formatted: withDenominator(value, denominator),
        usd: withDenominatorToUsd(value, denominator, price),
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
                args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined && params.tokenOut != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateSwapAmountIn',
                args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.out],
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
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[1], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[4], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(v[5], denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(v[1], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.in, v[2], v[3], v[1], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'swapWithAmountIn',
                    args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[1], params.slippage, false), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[4], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(v[5], denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[1], denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.out, v[3], v[2], v[1], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'swapWithAmountOut',
                    args: [params.multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to],
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
                args: [params.multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.in],
                enabled: params.multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: params.routerAddress,
                abi: routerABI,
                functionName: 'estimateBurnSharesIn',
                args: [params.multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.out],
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
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.in, v[2], v[1], v[0], denominatorIn, denominatorOut),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'burnWithSharesIn',
                    args: [params.multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenIn?.decimals || 0)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params?.tokenOut?.decimals || 0)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, false), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorIn, params.priceIn),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, params.priceIn),
                fee: makeFee(params.quantities.out, v[1], v[2], v[0], denominatorOut, denominatorIn),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: params.routerAddress,
                    abi: routerABI,
                    functionName: 'burnWithAmountOut',
                    args: [params.multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}
