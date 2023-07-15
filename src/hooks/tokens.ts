import multipoolABI from '../abi/ETF';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useContractRead, useToken } from 'wagmi'
import { EstimatedValues, EstimationTransactionBody, Quantities, SendTransactionParams, TradeLogicAdapter } from '../components/trade-pane';

export type TokenWithAddress = {
    tokenAddress: string,
    interactionAddress: string | undefined,
    userAddress: string,
    decimals: number
    name: string
    symbol: string
    totalSupply: {
        row: bigint,
        formatted: string,
    },
    balance: {
        row: bigint,
        formatted: string,
    },
    approval: {
        row: bigint,
        formatted: string,
    } | undefined,
}

export function useTokenWithAddress({
    tokenAddress,
    userAddress,
    allowanceTo,
}): {
    data: TokenWithAddress | undefined,
    isLoading: boolean,
    isError: boolean,
    isUnset: boolean,
} {
    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading } = useToken({
        address: tokenAddress,
        enabled: tokenAddress,
    })

    const { data: mintTokenBalance, isError: isBalanceError, isLoading: isBalanceLoading } = useContractRead({
        address: tokenAddress,
        abi: multipoolABI,
        functionName: 'balanceOf',
        args: [userAddress],
        enabled: tokenAddress,
        watch: true,
    });

    const { data: approvedTokenBalance, isError: isAllowanceError, isLoading: isAllowanceLoading } = useContractRead({
        address: tokenAddress,
        abi: multipoolABI,
        functionName: 'allowance',
        args: [userAddress, allowanceTo],
        enabled: tokenAddress && allowanceTo,
        watch: true,
    });
    const isLoading = isTokenLoading || isAllowanceLoading || isBalanceLoading;
    const isError = isTokenError || isBalanceError || isAllowanceError;
    const isUnset = isLoading || isError || tokenAddress == undefined;
    let data: TokenWithAddress | undefined;
    if (!isUnset) {
        const denominator = BigNumber.from(10).pow(BigNumber.from(tokenData?.decimals));
        data = {
            tokenAddress: tokenAddress,
            interactionAddress: allowanceTo,
            userAddress: userAddress,
            decimals: tokenData!.decimals,
            name: tokenData!.name,
            symbol: tokenData!.symbol,
            totalSupply: {
                row: tokenData!.totalSupply.value,
                formatted: tokenData!.totalSupply.formatted,
            },
            balance: {
                row: mintTokenBalance,
                formatted: FixedNumber.from(mintTokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
            },
            approval: {
                row: approvedTokenBalance,
                formatted: FixedNumber.from(approvedTokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
            },
        };
    }
    return {
        isLoading: isLoading,
        isError: isError,
        data: data,
        isUnset: isUnset,
    }
}

export function useEstimate(
    adapter: TradeLogicAdapter,
    params: SendTransactionParams,
): {
    data: EstimatedValues | undefined,
    isLoading: boolean,
    isError: boolean,
} {
    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);
    const { data: txnData, isError, isLoading } = useContractRead({
        address: txnBodyParts?.address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts && txnBodyParts.enabled,
        //watch: true,
    });
    let returnData: EstimatedValues | undefined = undefined;
    if (!isLoading && !isError) {
        returnData = adapter.parseEstimationResult(txnData, params);
    }
    return {
        data: returnData,
        isError: isError,
        isLoading: isLoading,
    };
}

