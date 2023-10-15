import { Address } from "viem"

type EstimatedValues = {
    estimatedCashbackIn: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedCashbackOut: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedAmountOut: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedAmountIn: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    fee: {
        percent: string
        usd: string,
    } | undefined,
    minimalAmountOut: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    maximumAmountIn: {
        row: BigInt,
        formatted: string,
        usd: string,
    } | undefined,
    isIn: boolean,
    isOut: boolean,
    txn: {
        address: Address,
        abi: any,
        functionName: string,
        args: any[],
        enabled: boolean,
    }
}

export { type EstimatedValues }
