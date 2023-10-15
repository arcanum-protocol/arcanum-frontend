import multipoolABI from '../abi/ETF';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useContractRead, useToken, useAccount, Address, useQuery } from 'wagmi'
import { EstimatedValues } from '../types/estimatedValues';
import { EstimationTransactionBody } from '../types/estimationTransactionBody';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { TradeLogicAdapter } from '../components/trade-pane';
import { publicClient } from '../config';
import { Gas } from '@/types/gas';

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
    chainId?: number
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

export function useEstimateTransactionCost(
    sendTransactionParams: EstimationTransactionBody,
    chainId: number,
): {
    data: Gas | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const { address } = useAccount();
    const { data: result, isError, isLoading, error } = useQuery(['gasPrice'], async () => {
        const gasPriceRaw = await publicClient({ chainId: chainId }).getGasPrice();
        const gasPrice = Number(gasPriceRaw) / Math.pow(10, 15);
        const gas = await publicClient({ chainId: chainId }).estimateContractGas({
            account: address,
            abi: sendTransactionParams?.abi,
            address: sendTransactionParams?.address as Address,
            args: sendTransactionParams?.args,
            functionName: sendTransactionParams?.functionName,
        });

        const cost = gasPrice * Number(gas);
        return {
            gas: Number(gas),
            gasPrice: gasPrice,
            cost: cost,
        } as Gas;
    }, {
        enabled: sendTransactionParams != undefined && sendTransactionParams.enabled,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: 0,
    });

    return {
        data: result,
        isError: isError,
        isLoading: isLoading,
        error: error,
    };
}

export function useEstimate(
    adapter: TradeLogicAdapter,
    params: SendTransactionParams,
    chainId: number,
): {
    data: {
        estimationResult: EstimatedValues | undefined,
        transactionCost: Gas | undefined
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);

    let errorText: string | undefined = "";

    const { data: txnData, isError, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts != undefined && txnBodyParts.enabled,
        chainId: chainId,
        onError: (e) => {
            if (e.message?.includes("MULTIPOOL: DO")) {
                errorText = "Deviation overflow";
            } else if (e.message?.includes("MULTIPOOL: QE")) {
                errorText = "Insufficient liquidity";
            } else if (e.message?.includes("MULTIPOOL: IQ")) {
                errorText = "Insufficient quantity";
            } else if (e.message?.includes("MULTIPOOL: ZS")) {
                errorText = "Zero share";
            } else if (e.message == undefined) {
                errorText = undefined;
            }
        },
    });

    const { data: transactionCost } = useEstimateTransactionCost(txnBodyParts as EstimationTransactionBody, chainId);

    return {
        data: {
            estimationResult: adapter.parseEstimationResult(txnData, params),
            transactionCost: transactionCost
        },
        isError: isError,
        isLoading: isLoading,
        error: errorText,
    };
}
