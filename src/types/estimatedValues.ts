import BigNumber from "bignumber.js"
import { Address } from "viem"

type EstimatedValues = {
    estimatedCashbackIn: {
        row: BigNumber,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedCashbackOut: {
        row: BigNumber,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedAmountOut: {
        row: BigNumber,
        formatted: string,
        usd: string,
    } | undefined,
    estimatedAmountIn: {
        row: BigNumber,
        formatted: string,
        usd: string,
    } | undefined,
    fee: {
        percent: string
        usd: string,
    } | undefined,
    minimalAmountOut: {
        row: BigNumber,
        formatted: string,
        usd: string,
    } | undefined,
    maximumAmountIn: {
        row: BigNumber,
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
