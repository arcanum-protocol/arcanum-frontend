import multipoolABI from '../abi/ETF';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useContractRead, useToken, useNetwork, useFeeData, useAccount, Address } from 'wagmi'
import { EstimatedValues, EstimationTransactionBody, SendTransactionParams, TradeLogicAdapter } from '../components/trade-pane';
import { useMedia } from 'react-use';
import { useDebounce } from 'use-debounce';
import * as React from 'react';
import { chains, publicClient } from '../config';

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
                row: tokenBalance as bigint,
                formatted: tokenBalance as string && FixedNumber.from(tokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
            },
            approval: {
                row: approvedTokenBalance as bigint,
                formatted: tokenBalance as string && FixedNumber.from(approvedTokenBalance).divUnsafe(FixedNumber.from(denominator)).toString(),
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
    transactionCost: {
        gas: number,
        gasPrice: number,
        cost: number,
    } | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);
    const { data: txnData, isError, error, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts != undefined && txnBodyParts.enabled,
        watch: true,
    });
    let errorMessage: undefined | string = undefined;
    if (error?.message.includes("MULTIPOOL: DO")) {
        errorMessage = "Too big quantity";
    } else if (error?.message.includes("MULTIPOOL: QE")) {
        errorMessage = "Insufficient liquidity";
    } else if (isError) {
        //errorMessage = error?.message;
    }

    const [cost, setCost] = React.useState<
        {
            gas: number,
            gasPrice: number,
            cost: number,
        } | undefined
    >();

    const [returnData, setReturnData] = React.useState<EstimatedValues | undefined>();
    const [debouncedReturnData] = useDebounce(returnData, 1000);

    React.useEffect(() => {
        async function inner() {
            if (!isLoading && !isError) {
                setReturnData(adapter.parseEstimationResult(txnData, params));
            }
        }

        inner();

    }, [txnData]);


    const { address } = useAccount();
    const { chain, chains } = useNetwork();

    React.useEffect(() => {
        async function inner() {
            if (debouncedReturnData != undefined && address != undefined) {
                let gasPrice: any = await publicClient({ chainId: chain?.id }).getGasPrice();
                gasPrice = Number(gasPrice) / Math.pow(10, 15);
                const gas = await publicClient({ chainId: chain?.id }).estimateContractGas({
                    account: address,
                    abi: debouncedReturnData.txn.abi,
                    address: debouncedReturnData.txn.address as Address,
                    args: debouncedReturnData.txn.args,
                    functionName: debouncedReturnData.txn.functionName,
                });
                setCost({
                    gas: Number(gas),
                    gasPrice: Number(gasPrice),
                    cost: Number(gas) * Number(gasPrice),
                });
            }
        }

        inner();

    }, [debouncedReturnData]);

    return {
        data: returnData,
        transactionCost: cost,
        isError: isError,
        isLoading: isLoading,
        error: errorMessage,
    };
}
