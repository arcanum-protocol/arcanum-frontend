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
                enabled: true,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateMintAmountIn',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out],
                enabled: true,
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
            const denominatorIn = BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals));
            const denominatorOut = BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals));
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: {
                    row: BigInt(0),
                    formatted: FixedNumber.from(BigInt(0)).divUnsafe(FixedNumber.from(denominatorIn)).toString()
                },
                estimatedCashbackOut: {
                    row: BigInt(0),
                    formatted: FixedNumber.from(BigInt(0)).divUnsafe(FixedNumber.from(denominatorOut)).toString()
                },
                estimatedAmountOut: {
                    row: v,
                    formatted: FixedNumber.from(v).divUnsafe(FixedNumber.from(denominatorOut)).toString()
                },
                estimatedAmountIn: {
                    row: params.quantities.in,
                    formatted: FixedNumber.from(params.quantities.in).divUnsafe(FixedNumber.from(denominatorIn)).toString()
                },
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: '',
                    args: [],
                    enabled: false,
                }
            };
        }
    },
}

export const emptyAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: '',
                args: [],
                enabled: false,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: '',
                args: [],
                enabled: false,
            };
        } else {
            return undefined;
        }
    },
    parseEstimationResult: (
        v: any,
        params: SendTransactionParams,
    ): EstimatedValues | undefined => {
        // if (!v) {
        //     return undefined;
        // }
        if (params.quantities.in) {
            const denominatorIn = BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals));
            const denominatorOut = BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals));
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: {
                    row: BigInt(10e18),
                    formatted: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorIn)).toString(),
                    usd: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorIn)).mulUnsafe(FixedNumber.fromString(params.priceIn.toString())).toString(),
                },
                estimatedCashbackOut: {
                    row: BigInt(10e18),
                    formatted: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorOut)).toString(),
                    usd: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorOut)).mulUnsafe(FixedNumber.fromString(params.priceOut.toString())).toString(),
                },
                estimatedAmountOut: {
                    row: BigInt(params.quantities.in.toString()) * BigInt(101) / BigInt(100),
                    formatted: FixedNumber.from(BigInt(params.quantities.in.toString()) * BigInt(101) / BigInt(100)).divUnsafe(FixedNumber.from(denominatorOut)).toString(),
                    usd: FixedNumber.from(BigInt(params.quantities.in.toString()) * BigInt(101) / BigInt(100)).divUnsafe(FixedNumber.from(denominatorOut)).mulUnsafe(FixedNumber.fromString(params.priceIn.toString())).toString(),
                },
                estimatedAmountIn: {
                    row: params.quantities.in,
                    formatted: FixedNumber.from(params.quantities.in).divUnsafe(FixedNumber.from(denominatorIn)).toString(),
                    usd: FixedNumber.from(params.quantities.in).divUnsafe(FixedNumber.from(denominatorIn)).mulUnsafe(FixedNumber.fromString(params.priceOut.toString())).toString(),
                },
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: '',
                    args: [],
                    enabled: false,
                }
            };
        } else if (params.quantities.out) {
            const denominatorIn = BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals));
            const denominatorOut = BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals));
            return {
                isIn: false,
                isOut: true,
                estimatedCashbackIn: {
                    row: BigInt(10e18),
                    formatted: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorIn)).toString(),
                    usd: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorIn)).mulUnsafe(FixedNumber.fromString(params.priceIn.toString())).toString(),
                },
                estimatedCashbackOut: {
                    row: BigInt(10e18),
                    formatted: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorOut)).toString(),
                    usd: FixedNumber.from(BigInt(10e18)).divUnsafe(FixedNumber.from(denominatorOut)).mulUnsafe(FixedNumber.fromString(params.priceOut.toString())).toString(),
                },
                estimatedAmountIn: {
                    row: BigInt(params.quantities.out.toString()) * BigInt(101) / BigInt(100),
                    formatted: FixedNumber.from(BigInt(params.quantities.out.toString()) * BigInt(101) / BigInt(100)).divUnsafe(FixedNumber.from(denominatorOut)).toString(),
                    usd: FixedNumber.from(BigInt(params.quantities.out.toString()) * BigInt(101) / BigInt(100)).divUnsafe(FixedNumber.from(denominatorOut)).mulUnsafe(FixedNumber.fromString(params.priceIn.toString())).toString(),
                },
                estimatedAmountOut: {
                    row: params.quantities.out,
                    formatted: FixedNumber.from(params.quantities.out).divUnsafe(FixedNumber.from(denominatorIn)).toString(),
                    usd: FixedNumber.from(params.quantities.out).divUnsafe(FixedNumber.from(denominatorIn)).mulUnsafe(FixedNumber.fromString(params.priceOut.toString())).toString(),
                },
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: '',
                    args: [],
                    enabled: false,
                }
            };
        }
    },
}



