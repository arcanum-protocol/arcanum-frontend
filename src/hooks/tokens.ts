import multipoolABI from '../abi/ETF';
import { BigNumber } from 'bignumber.js';
import { useContractRead, useToken, useAccount, Address, useQuery, usePrepareContractWrite, useContractWrite } from 'wagmi'
import { EstimatedValues } from '../types/estimatedValues';
import { EstimationTransactionBody } from '../types/estimationTransactionBody';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { TradeLogicAdapter } from '../components/trade-pane';
import { publicClient } from '../config';
import { Gas } from '@/types/gas';
import { getMassiveMintRouter, getMultipoolAddress, useMultipoolData, useMultipoolPrice } from '@/lib/multipool';
import axios from 'axios';
import { BuildedTransaction, KyberswapResponse } from '@/types/kyberswap';
import { BaseAsset } from '@/types/multipoolAsset';
import MassiveMintRouter from '@/abi/MassiveMintRouter';
import { useTradeContext } from '@/contexts/TradeContext';

type TokenWithAddressSpecific = {
    interactionAddress: string | undefined,
    userAddress: string,
    balanceFormated?: string,
    approval: {
        row: BigNumber,
        formatted: string,
    } | undefined,
}

export interface TokenWithAddress extends BaseAsset, TokenWithAddressSpecific { }

interface TokenWithAddressParams {
    address: string | undefined,
    userAddress: Address,
    allowanceTo: Address,
    chainId?: number
}

export function useTokenWithAddress({
    address,
    userAddress,
    allowanceTo,
    chainId
}: TokenWithAddressParams): {
    data: TokenWithAddress | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading, error: tokenError } = useToken({
        address: address as Address,
        chainId: chainId,
        enabled: address != undefined,
    });

    const { data: tokenBalance, isError: isBalanceError, isLoading: isBalanceLoading, error: balanceError } = useContractRead({
        address: address as Address,
        abi: multipoolABI,
        functionName: 'balanceOf',
        args: [userAddress],
        enabled: address != undefined && userAddress != undefined,
        watch: true,
        chainId: chainId,
    });

    const { data: approvedTokenBalance, isError: isAllowanceError, isLoading: isAllowanceLoading, error: approveError } = useContractRead({
        address: address as Address,
        abi: multipoolABI,
        functionName: 'allowance',
        args: [userAddress, allowanceTo],
        enabled: address != undefined && allowanceTo != undefined && userAddress != undefined,
        watch: true,
        chainId: chainId,
    });

    let data: TokenWithAddress;

    const decimals = new BigNumber(tokenData?.decimals || "0");
    const denominator = new BigNumber(10).pow(decimals || "0");

    const userBalance = new BigNumber(tokenBalance as string);
    const approvedBalance = new BigNumber(approvedTokenBalance as string);

    data = {
        address: address,
        interactionAddress: allowanceTo,
        userAddress: userAddress,
        decimals: decimals.toNumber(),
        name: tokenData?.name || "ARCANUM ETF",
        symbol: tokenData?.symbol || "AETF",
        balance: userBalance.toNumber(),
        balanceFormated: userBalance.dividedBy(denominator).toString(),
        approval: {
            row: approvedBalance,
            formatted: approvedBalance.dividedBy(denominator).toString(),
        },
        type: "external",
        logo: null,
    };

    return {
        data: address ? data : undefined,
        isLoading: isTokenLoading || isAllowanceLoading || isBalanceLoading,
        isError: isTokenError || isBalanceError || isAllowanceError,
        error: tokenError?.message || balanceError?.message || approveError?.message,
    }
}

export function useEstimateTransactionCost(
    sendTransactionParams: EstimationTransactionBody,
    chainId: number,
    params?: {
        enabled?: boolean,
    }
): {
    data: Gas | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const enabled = params?.enabled || true;
    const { address } = useAccount();

    const { data: result, isError, isLoading, error } = useQuery(['gasPrice'], async () => {
        const gasPriceRaw = await publicClient({ chainId: chainId }).getGasPrice();
        const gasPrice = Number(gasPriceRaw) / Math.pow(10, 15);

        const gas = await publicClient({ chainId: chainId }).estimateContractGas({
            account: address!,
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
        enabled: !address && enabled,
    });

    return {
        data: result,
        isError: isError,
        isLoading: isLoading,
        error: error as string,
    };
}

export function useEstimateMassiveMintTransactions(
    token: Address | undefined,
    amount: BigNumber | undefined,
    sender: Address | undefined,
    router: Address,
    params?: {
        enabled?: boolean,
    }
): {
    data: {
        buildedTransactions: BuildedTransaction[] | undefined
        swapRoutes: KyberswapResponse[] | undefined
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const enabled = params?.enabled == undefined ? true : params?.enabled;

    const { data: arbi } = useMultipoolData("arbi", { enabled: enabled });
    const { assets } = arbi!;

    const filteredAssets = assets.filter(asset => asset.currentShare.isGreaterThan(0));

    // Считаем сумму выхода для каждого токена
    const { data: kyberswapResponse, isError: kyberswapResponseIsError, isLoading: kyberswapResponseIsLoading, error: kyberswapResponseError } = useQuery(['kyberswap'], async () => {
        // Соотношение между токенами в пуле

        const tokenRatio = filteredAssets.map(asset => {
            const ratio = new BigNumber(asset.currentShare.toString()).dividedBy(new BigNumber(100));
            return {
                address: asset.address,
                ratio: ratio,
            }
        });

        const amountInDivided = tokenRatio.map(token => {
            return {
                address: token.address,
                amount: amount?.multipliedBy(token.ratio) || new BigNumber(0),
            }
        });

        const routes = await Promise.all(amountInDivided.map(async (_, i) => {
            const amountInInteger = amountInDivided[i].amount.integerValue();

            const tokenOut = amountInDivided[i].address;

            const response = await axios.get(
                `https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=${token}&tokenOut=${tokenOut}&amountIn=${amountInInteger}&saveGas=true&gasInclude=true`,
            );

            return response.data as KyberswapResponse;
        }));

        const trxs = await Promise.all(routes.map(async (routePromise) => {
            const route = routePromise;
            const transaction = await axios.post(`https://aggregator-api.kyberswap.com/arbitrum/api/v1/route/build`, {
                "routeSummary": route.data.routeSummary,
                "sender": sender,
                "recipient": arbi?.multipool.address,
            });

            return transaction.data as BuildedTransaction;
        }));

        return {
            buildedTransactions: trxs,
            swapRoutes: routes,
        };
    }, {
        enabled: !!amount && amount?.isGreaterThan(0) && enabled && !!token,
        refetchInterval: 30000,
    });

    return {
        data: {
            buildedTransactions: kyberswapResponse?.buildedTransactions,
            swapRoutes: kyberswapResponse?.swapRoutes,
        },
        isError: kyberswapResponseIsError,
        isLoading: kyberswapResponseIsLoading,
        error: kyberswapResponseError as string,
    };
}

export function useEstimateMassiveMint(
    token: Address | undefined,
    amount: BigNumber | undefined,
    sender: Address | undefined,
    router: Address,
    params?: {
        enabled?: boolean,
    }
): {
    data: {
        estimatedOutShares: BigNumber,
        estimatedTransactionCost: Gas,
        massiveMintTransaction: EstimatedValues
    } | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const { massiveMintRouter, multipoolAddress } = useTradeContext();
    const { address } = useAccount();
    const enabled = params?.enabled == undefined ? true : params?.enabled;

    const { data: kyberswapResponse, isLoading: MassiveMintIsLoading, isError: MassiveMintIsError, error: MassiveMintError } = useEstimateMassiveMintTransactions(token, amount, sender, router, { enabled: enabled });

    let response: BigNumber = new BigNumber(0);

    kyberswapResponse?.buildedTransactions?.map((item) => {
        response = response.plus(new BigNumber(item.data.amountOutUsd));
    });

    // get multipool price 
    const { data: arbi } = useMultipoolPrice("arbi");
    const multipollSharesAmount = response.dividedBy(arbi?.price || 0);

    const swaps = kyberswapResponse?.buildedTransactions?.map((item) => {
        return ({
            "targetData": item.data.data,
            "target": item.data.routerAddress,
            "ethValue": 0
        });
    });

    const tokens = kyberswapResponse?.swapRoutes?.map((item) => {
        return item.data.routeSummary.tokenOut;
    });

    return {
        data: {
            estimatedOutShares: multipollSharesAmount,
            massiveMintTransaction: {
                txn: {
                    address: massiveMintRouter as Address,
                    abi: MassiveMintRouter,
                    functionName: 'massiveMint',
                    args: [
                        multipoolAddress,
                        token,
                        amount?.integerValue(),
                        new BigNumber(0).integerValue(),
                        swaps,
                        tokens,
                        address
                    ],
                    enabled: enabled,
                }
            },
            estimatedTransactionCost: {
                gas: "0",
                gasPrice: "0",
                cost: "0",
            } as unknown as Gas,
        },
        isError: MassiveMintIsError,
        isLoading: MassiveMintIsLoading,
        error: MassiveMintError as string,
    };
}

export function useEstimate(
    adapter: TradeLogicAdapter,
    params: SendTransactionParams,
    chainId: number,
    _params: {
        enabled: boolean,
    }
): {
    data: {
        estimationResult: EstimatedValues | undefined,
        transactionCost: Gas | undefined
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const enabled = _params?.enabled || true;

    const { address } = useAccount();

    const { data } = useEstimateMassiveMint(params.tokenIn?.address as Address, params.quantities.in, address, params.routerAddress as Address, {
        enabled: enabled && params.tokenIn?.type === "external" && params.quantities.in != undefined && params.quantities.in.isGreaterThan(0),
    });

    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);

    let errorText: string | undefined = "";

    const { data: txnData, isError, error, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        chainId: chainId,
        enabled: enabled,
    });

    if (error?.message?.includes("MULTIPOOL: DO")) {
        errorText = "Deviation overflow";
    } else if (error?.message?.includes("MULTIPOOL: QE")) {
        errorText = "Insufficient liquidity";
    } else if (error?.message?.includes("MULTIPOOL: IQ")) {
        errorText = "Insufficient quantity";
    } else if (error?.message?.includes("MULTIPOOL: ZS")) {
        errorText = "Zero share";
    } else if (error?.message == undefined) {
        errorText = undefined;
    }

    const { data: transactionCost } = useEstimateTransactionCost(
        txnBodyParts as EstimationTransactionBody, 
        chainId, 
        { enabled: enabled 
    });


    if (data?.estimatedOutShares !== undefined && txnData !== undefined) {
        const classicMintOut = adapter.parseEstimationResult(txnData, params)?.estimatedAmountOut?.row || BigNumber(0);
        const massiveMintOut = data?.estimatedOutShares || BigNumber(0);
        if (massiveMintOut < classicMintOut) {
            return {
                data: {
                    estimationResult: adapter.parseEstimationResult(txnData, params),
                    transactionCost: transactionCost
                },
                isError: isError,
                isLoading: isLoading,
                error: errorText,
            }
        } else {
            return {
                data: {
                    estimationResult: data.massiveMintTransaction,
                    transactionCost: data.estimatedTransactionCost
                },
                isError: isError,
                isLoading: isLoading,
                error: errorText,
            }
        }
    }

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
