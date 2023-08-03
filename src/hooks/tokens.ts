import multipoolABI from '../abi/ETF';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useContractRead, useToken } from 'wagmi'
import { EstimatedValues, EstimationTransactionBody, SendTransactionParams, TradeLogicAdapter } from '../components/trade-pane';
import { useMedia } from 'react-use';

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

export function useMobileMedia(): boolean {
    return useMedia("(max-width: 550px)");
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
        enabled: tokenAddress != undefined,
    })

    const { data: tokenBalance, isError: isBalanceError, isLoading: isBalanceLoading } = useContractRead({
        address: tokenAddress,
        abi: multipoolABI,
        functionName: 'balanceOf',
        args: [userAddress],
        enabled: tokenAddress != undefined && userAddress != undefined,
        watch: true,
    });

    const { data: approvedTokenBalance, isError: isAllowanceError, isLoading: isAllowanceLoading } = useContractRead({
        address: tokenAddress,
        abi: multipoolABI,
        functionName: 'allowance',
        args: [userAddress, allowanceTo],
        enabled: tokenAddress != undefined && allowanceTo != undefined && userAddress != undefined,
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
                row: tokenBalance,
                formatted: tokenBalance && FixedNumber.from(tokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
            },
            approval: {
                row: approvedTokenBalance,
                formatted: tokenBalance && FixedNumber.from(approvedTokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
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
    error: string | undefined,
} {
    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);
    const { data: txnData, isError, error, isLoading } = useContractRead({
        address: txnBodyParts?.address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts != undefined && txnBodyParts.enabled,
        staleTime: 20_000,
        watch: true,
    });
    let errorMessage: undefined | string = undefined;
    if (error?.message.includes("deviation overflows limit")) {
        errorMessage = "Too big quantity";
    } else if (error?.message.includes("can't burn more assets than exist")) {
        errorMessage = "Insufficient balance";
    }


    let returnData: EstimatedValues | undefined = undefined;
    if (!isLoading && !isError) {
        returnData = adapter.parseEstimationResult(txnData, params);
    }
    return {
        data: returnData,
        isError: isError,
        isLoading: isLoading,
        error: errorMessage,
    };
}

