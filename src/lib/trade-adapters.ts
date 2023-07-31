import { routerAddress, multipoolAddress } from "../lib/multipool";
import routerABI from '../abi/ROUTER';
import { EstimatedValues, EstimationTransactionBody, SendTransactionParams, TradeLogicAdapter, TradePane } from '../components/trade-pane';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';

export const mintAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateMintSharesOut',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.in],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateMintAmountIn',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else {
            console.log("here");
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
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[2], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorIn, params.priceIn),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: withDenominator(v[1], BigInt(10) ** BigInt(16)),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'mintWithAmountIn',
                    args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to, BigInt("10000000000000000")],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[2], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorIn, params.priceIn),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, params.priceIn),
                fee: withDenominator(v[1], BigInt(10) ** BigInt(16)),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'mintWithSharesOut',
                    args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to, BigInt("10000000000000000")],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
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
            console.log([multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.in]);
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateSwapAmountOut',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.in],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined && params.tokenOut != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateSwapAmountIn',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.out],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined && params.tokenOut != undefined,
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
        console.log(v);
        if (params.quantities.in) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[1], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(v[4], denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(v[1], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: withDenominator(v[2], BigInt(10) ** BigInt(16)),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'swapWithAmountIn',
                    args: [multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to, BigInt("10000000000000000")],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[1], params.slippage, true), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[3], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(v[4], denominatorOut, params.priceOut),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[1], denominatorIn, params.priceIn),
                fee: withDenominator(v[2], BigInt(10) ** BigInt(16)),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'swapWithAmountOut',
                    args: [multipoolAddress, params.tokenIn?.tokenAddress, params.tokenOut?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to, BigInt("10000000000000000")],
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
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateBurnAmountOut',
                args: [multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.in],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateBurnSharesIn',
                args: [multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.out],
                enabled: multipoolAddress != undefined && params.tokenIn != undefined,
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
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const minimalAmountOut = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorOut, params.priceOut);
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: toAllFormats(v[2], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorIn, params.priceIn),
                estimatedAmountOut: toAllFormats(v[0], denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(params.quantities.in, denominatorIn, params.priceIn),
                fee: withDenominator(v[1], BigInt(10) ** BigInt(16)),
                maximumAmountIn: undefined,
                minimalAmountOut: minimalAmountOut,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'burnWithSharesIn',
                    args: [multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.in, minimalAmountOut.row, params.to, BigInt("10000000000000000")],
                    enabled: true,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals)).toString());
            const denominatorOut = BigInt(BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals)).toString());
            const maximumAmountIn = toAllFormats(applySlippage(v[0], params.slippage, true), denominatorIn, params.priceIn);
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: toAllFormats(v[2], denominatorIn, params.priceIn),
                estimatedCashbackOut: toAllFormats(BigInt(0), denominatorIn, params.priceIn),
                estimatedAmountOut: toAllFormats(params.quantities.out, denominatorOut, params.priceOut),
                estimatedAmountIn: toAllFormats(v[0], denominatorIn, params.priceIn),
                fee: withDenominator(v[1], BigInt(10) ** BigInt(16)),
                minimalAmountOut: undefined,
                maximumAmountIn: maximumAmountIn,
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: 'burnWithAmountOut',
                    args: [multipoolAddress, params.tokenOut?.tokenAddress, params.quantities.out, maximumAmountIn.row, params.to, BigInt("10000000000000000")],
                    enabled: true,
                }
            };
        } else {
            return undefined;
        }
    },
}
