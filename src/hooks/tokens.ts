import multipoolABI from '../abi/ETF';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useContractRead, useToken, useNetwork, useAccount, Address } from 'wagmi'
import { EstimatedValues } from '../types/estimatedValues';
import { EstimationTransactionBody } from '../types/estimationTransactionBody';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { TradeLogicAdapter } from '../components/trade-pane';
import { useMedia } from 'react-use';
import { useDebounce } from 'use-debounce';
import * as React from 'react';
import { publicClient } from '../config';
import { useState } from 'react';

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

interface TokenWithAddressParams {
    tokenAddress: string | undefined,
    userAddress: Address,
    allowanceTo: Address,
    chainId: number
}

export function useTokenWithAddress({
    tokenAddress,
    userAddress,
    allowanceTo,
    chainId
}: TokenWithAddressParams): {
    data: TokenWithAddress | undefined,
    isLoading: boolean,
    isError: boolean,
    isUnset: boolean,
} {
    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading } = useToken({
        address: tokenAddress as Address,
        enabled: tokenAddress != undefined,
        chainId: chainId,
    })

    const { data: tokenBalance, isError: isBalanceError, isLoading: isBalanceLoading } = useContractRead({
        address: tokenAddress as Address,
        abi: multipoolABI,
        functionName: 'balanceOf',
        args: [userAddress],
        enabled: tokenAddress != undefined && userAddress != undefined,
        watch: true,
        chainId: chainId,
    });

    const { data: approvedTokenBalance, isError: isAllowanceError, isLoading: isAllowanceLoading } = useContractRead({
        address: tokenAddress as Address,
        abi: multipoolABI,
        functionName: 'allowance',
        args: [userAddress, allowanceTo],
        enabled: tokenAddress != undefined && allowanceTo != undefined && userAddress != undefined,
        watch: true,
        chainId: chainId,
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
    chainId: number,
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
    const { address } = useAccount();

    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);

    let [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const { data: txnData, isError, error, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts != undefined && txnBodyParts.enabled,
        watch: true,
        chainId: chainId,
        onError: (e) => {
            setErrorMessage(e.message);
        },
    });

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
        function inner() {
            if (!isLoading && !isError) {
                setReturnData(adapter.parseEstimationResult(txnData, params));
            }
        }

        inner();
    }, [txnData]);

    React.useEffect(() => {
        async function inner() {
            let gasPrice: any = await publicClient({ chainId: chainId }).getGasPrice();
            gasPrice = Number(gasPrice) / Math.pow(10, 15);
            try {
                const gas = await publicClient({ chainId: chainId }).estimateContractGas({
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
            } catch (e) {
                setCost(undefined);
            }
        }

        inner();
    }, [debouncedReturnData]);

    let errorText: string | undefined = undefined;

    if (errorMessage?.includes("MULTIPOOL: DO")) {
        errorText = "Deviation overflow";
    } else if (errorMessage?.includes("MULTIPOOL: QE")) {
        errorText = "Insufficient liquidity";
    } else if (errorMessage?.includes("MULTIPOOL: IQ")) {
        errorText = "Insufficient quantity";
    } else if (errorMessage?.includes("MULTIPOOL: ZS")) {
        errorText = "Zero share";
    } else if (errorMessage == undefined) {
        errorText = undefined;
    }

    return {
        data: returnData,
        transactionCost: cost,
        isError: isError,
        isLoading: isLoading,
        error: errorText,
    };
}
