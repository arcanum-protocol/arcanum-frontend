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
<<<<<<< HEAD
<<<<<<< HEAD
import { BaseAsset } from '@/types/multipoolAsset';
import MassiveMintRouter from '@/abi/MassiveMintRouter';
import { useTradeContext } from '@/contexts/TradeContext';
import { useMultiPoolContext } from '@/contexts/MultiPoolContext';
import { useEffect, useState } from 'react';
import ERC20 from '@/abi/ERC20';
=======
import { BaseAsset, ExternalAsset } from '@/types/multipoolAsset';
import sheme from '@/scheme.yaml';
import MassiveMintRouter from '@/abi/MassiveMintRouter';
import { error } from 'console';
>>>>>>> 4c40c2d (sync)
=======
import { BaseAsset } from '@/types/multipoolAsset';
import MassiveMintRouter from '@/abi/MassiveMintRouter';
>>>>>>> 098ebb9 (sync)

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
<<<<<<< HEAD
    const {
        assets,
        multipool
    } = useMultiPoolContext();

    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading, error: tokenError } = useToken({
        address: address as Address,
        chainId: chainId,
        enabled: address != undefined,
    });

=======
    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading, error: tokenError } = useToken({
        address: address as Address,
        chainId: chainId,
        enabled: address != undefined,
    });

>>>>>>> 098ebb9 (sync)
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

    let tokenType: "solid" | "multipool" | "external" = "external";

    if (multipool?.address == address) {
        tokenType = "solid";
    }
    if (assets?.findIndex(asset => asset.address == address) != -1) {
        tokenType = "multipool";
    }

    data = {
        address: address,
        interactionAddress: allowanceTo,
        userAddress: userAddress,
<<<<<<< HEAD
<<<<<<< HEAD
        decimals: decimals.toNumber(),
        name: tokenData?.name || "ARCANUM ETF",
        symbol: tokenData?.symbol || "AETF",
=======
        decimals: tokenData?.decimals,
        name: tokenData?.name,
        symbol: tokenData?.symbol,
>>>>>>> 4c40c2d (sync)
=======
        decimals: decimals.toNumber(),
        name: tokenData?.name || "ARCANUM ETF",
        symbol: tokenData?.symbol || "AETF",
>>>>>>> 098ebb9 (sync)
        balance: userBalance.toNumber(),
        balanceFormated: userBalance.dividedBy(denominator).toString(),
        approval: {
            row: approvedBalance,
            formatted: approvedBalance.dividedBy(denominator).toString(),
        },
        type: tokenType,
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
<<<<<<< HEAD
    _enabled?: boolean,
=======
    params?: {
        enabled?: boolean,
    }
>>>>>>> 098ebb9 (sync)
): {
    data: Gas | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
<<<<<<< HEAD
    const enabled = _enabled != undefined ? _enabled : true;

=======
    const enabled = params?.enabled || true;
>>>>>>> 098ebb9 (sync)
    const { address } = useAccount();

    const { data: result, isError, isLoading, error, refetch } = useQuery(['gasPrice'], async () => {
        const gasPriceRaw = await publicClient({ chainId: chainId }).getGasPrice();
<<<<<<< HEAD
        const gasPrice = new BigNumber(gasPriceRaw.toString()).dividedBy(new BigNumber(10).pow(15));

        const gasBigInt = await publicClient({ chainId: chainId }).estimateContractGas({
=======
        const gasPrice = Number(gasPriceRaw) / Math.pow(10, 15);

        const gas = await publicClient({ chainId: chainId }).estimateContractGas({
>>>>>>> 098ebb9 (sync)
            account: address!,
            abi: sendTransactionParams?.abi,
            address: sendTransactionParams?.address as Address,
            args: sendTransactionParams?.args,
            functionName: sendTransactionParams?.functionName,
        });

        const gas = new BigNumber(gasBigInt.toString());

        const cost = gasPrice.multipliedBy(gas);
        return {
            gas: gas.toString(),
            gasPrice: gasPrice.toString(),
            cost: cost.toString(),
        } as Gas;
    }, {
<<<<<<< HEAD
<<<<<<< HEAD
        enabled: !address && enabled,
=======
        enabled: !address,
>>>>>>> 4c40c2d (sync)
=======
        enabled: !address && enabled,
>>>>>>> 098ebb9 (sync)
    });

    useEffect(() => {
        if (sendTransactionParams?.args == undefined) return;
        if (!enabled) return;
        refetch();
    }, [sendTransactionParams]);

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
<<<<<<< HEAD
    chainId: number,
=======
    router: Address,
>>>>>>> 098ebb9 (sync)
    params?: {
        enabled?: boolean,
    }
): {
    data: {
        buildedTransactions: BuildedTransaction[] | undefined
        swapRoutes: KyberswapResponse[] | undefined
<<<<<<< HEAD
        assetInUsd: BigNumber | undefined
        estimatedNetworkFee: Gas | undefined
=======
>>>>>>> 098ebb9 (sync)
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
<<<<<<< HEAD
<<<<<<< HEAD
    const enabled = params?.enabled == undefined ? true : params?.enabled;

    const { data: arbi } = useMultipoolData("arbi", { enabled: enabled });
    const { assets } = arbi!;
    const { massiveMintRouter, multipoolAddress } = useTradeContext();

    const filteredAssets = assets.filter(asset => asset.currentShare.isGreaterThan(0));
    const isMultipoolToken = assets.findIndex(asset => asset.address == token) != -1;

    // Считаем сумму выхода для каждого токена
    const { data: kyberswapResponse, isError: kyberswapResponseIsError, isLoading: kyberswapResponseIsLoading, error: kyberswapResponseError, refetch } = useQuery(['kyberswap'], async () => {
        // Соотношение между токенами в пуле

        if (!amount?.isGreaterThan(new BigNumber(0))) {
            return {
                buildedTransactions: undefined,
                swapRoutes: undefined,
                assetInUsd: undefined,
            };
        }

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
            const amountInInteger = amountInDivided[i].amount.integerValue().toFixed(0);

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
                "recipient": multipoolAddress,
            });

            return transaction.data as BuildedTransaction;
        }));

        return {
            buildedTransactions: trxs,
            swapRoutes: routes,
            assetInUsd: routes?.map(route => {
                return new BigNumber(route.data.routeSummary.amountInUsd);
            }).reduce((a, b) => {
                return a.plus(b);
            }, new BigNumber(0)),
        };
    }, {
        enabled: false
    });

    useEffect(() => {
        if (!amount?.isGreaterThan(new BigNumber(0))) {
            return;
        }
        if (isMultipoolToken) {
            return;
        }

        refetch();
    }, [token, amount, sender]);

    const { data: gas, error } = useQuery(['gasPrice'], async () => {
        const tokens = kyberswapResponse?.swapRoutes?.map(route => route.data.routeSummary.tokenOut);

        const gasPriceRaw = await publicClient({ chainId: chainId }).getGasPrice();
        const gasPrice = new BigNumber(gasPriceRaw.toString()).dividedBy(new BigNumber(10).pow(15));

        const gas = await publicClient({ chainId: chainId }).estimateContractGas({
            address: massiveMintRouter as Address,
            abi: MassiveMintRouter,
            functionName: 'massiveMint',
            args: [
                multipoolAddress,
                token,
                amount?.integerValue().toString(),
                new BigNumber(0).integerValue().toString(),
                kyberswapResponse?.buildedTransactions?.map(trx => {
                    return ({
                        "targetData": trx.data.data,
                        "target": trx.data.routerAddress,
                        "ethValue": 0
                    });
                }),
                tokens,
                sender
            ],
            account: sender as Address,
        });

        const cost = gasPrice.multipliedBy(new BigNumber(gas.toString()));

        return {
            gas: gas.toString(),
            gasPrice: gasPrice.toString(),
            cost: cost.toString(),
        } as Gas;
    }, {
        enabled: !!amount && amount?.isGreaterThan(0) && enabled && !!token
    });

    const { data: approvalGas } = useQuery(['approvalGasPrice'], async () => {
        const gasPriceRaw = await publicClient({ chainId: chainId }).getGasPrice();
        const gasPrice = new BigNumber(gasPriceRaw.toString()).dividedBy(new BigNumber(10).pow(15));

        const gas = await publicClient({ chainId: chainId }).estimateContractGas({
            address: token as Address,
            abi: ERC20,
            functionName: 'approve',
            args: [massiveMintRouter, amount?.integerValue().toString()],
            account: sender as Address,
        });

        const cost = gasPrice.multipliedBy(new BigNumber(gas.toString()));

        return {
            gas: gas.toString(),
            gasPrice: gasPrice.toString(),
            cost: cost.toString(),
        } as Gas;
    });

    useEffect(() => {
        if (amount === undefined) {
            return;
        }
        refetch();
    }, [amount, token, sender]);

    return {
        data: {
            buildedTransactions: kyberswapResponse?.buildedTransactions,
            swapRoutes: kyberswapResponse?.swapRoutes,
            assetInUsd: kyberswapResponse?.assetInUsd,
            estimatedNetworkFee: error ? approvalGas : gas,
        },
=======
    const { data: arbi } = useMultipoolData("arbi");
    const { assets } = arbi!;
=======
    const enabled = params?.enabled == undefined ? true : params?.enabled;
>>>>>>> 098ebb9 (sync)

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
<<<<<<< HEAD
        data: kyberswapResponse,
>>>>>>> 4c40c2d (sync)
=======
        data: {
            buildedTransactions: kyberswapResponse?.buildedTransactions,
            swapRoutes: kyberswapResponse?.swapRoutes,
        },
>>>>>>> 098ebb9 (sync)
        isError: kyberswapResponseIsError,
        isLoading: kyberswapResponseIsLoading,
        error: kyberswapResponseError as string,
    };
}

export function useEstimateMassiveMint(
    token: Address | undefined,
    amount: BigNumber | undefined,
    sender: Address | undefined,
<<<<<<< HEAD
    chainId: number,
=======
    router: Address,
>>>>>>> 098ebb9 (sync)
    params?: {
        enabled?: boolean,
    }
): {
    data: {
<<<<<<< HEAD
        estimatedAmountIn: {
            row: BigNumber
            formatted: string
            usd: string
        },
        estimatedOutShares: {
            row: BigNumber
            formatted: string
            usd: string
        },
        estimatedTransactionCost: Gas,
        massiveMintTransaction: EstimatedValues
=======
        estimatedOutShares: BigNumber,
        estimatedTransactionCost: Gas,
        massiveMintTransaction: any
>>>>>>> 4c40c2d (sync)
    } | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
<<<<<<< HEAD
    const { massiveMintRouter, multipoolAddress } = useTradeContext();
    const { address } = useAccount();
    const enabled = params?.enabled == undefined ? true : params?.enabled;

    const { data: kyberswapResponse, isLoading: MassiveMintIsLoading, isError: MassiveMintIsError, error: MassiveMintError } = useEstimateMassiveMintTransactions(
        token,
        amount,
        sender,
        chainId,
        { enabled: enabled });
=======
    const enabled = params?.enabled == undefined ? true : params?.enabled;
>>>>>>> 098ebb9 (sync)

    const { data: kyberswapResponse, isLoading: MassiveMintIsLoading, isError: MassiveMintIsError, error: MassiveMintError } = useEstimateMassiveMintTransactions(token, amount, sender, router, { enabled: enabled });

    let response: BigNumber = new BigNumber(0);

<<<<<<< HEAD
<<<<<<< HEAD
    kyberswapResponse?.buildedTransactions?.map((item) => {
        response = response.plus(new BigNumber(item.data.amountOutUsd));
    });

    // get multipool price 
    const { data: arbi } = useMultipoolPrice("arbi");

    const divisor = new BigNumber(10).pow(18);

    const multipollSharesAmount = response.dividedBy(arbi?.price || 0).multipliedBy(divisor).integerValue();
    const formatted = multipollSharesAmount.dividedBy(divisor);
    const usd = multipollSharesAmount.multipliedBy(arbi?.price || 0).dividedBy(divisor);

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
            estimatedAmountIn: {
                row: amount || BigNumber(0),
                formatted: (amount || BigNumber(0)).toString(),
                usd: kyberswapResponse.assetInUsd?.toString() || "0",
            },
            estimatedOutShares: {
                row: multipollSharesAmount,
                formatted: formatted.toString(),
                usd: usd.toString(),
            },
            massiveMintTransaction: {
                maximumAmountIn: {
                    row: amount || BigNumber(0),
                    formatted: (amount || BigNumber(0)).toString(),
                    usd: kyberswapResponse.assetInUsd?.toString() || "0",
                },
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
            estimatedTransactionCost: kyberswapResponse.estimatedNetworkFee!,
=======
    for (let i = 0; i < kyberswapResponse.length; i++) {
        if (kyberswapResponse[i].data.amountOutUsd == undefined) continue;
        response = response.plus(new BigNumber(kyberswapResponse[i].data.amountOutUsd));
    }
=======
    kyberswapResponse?.buildedTransactions?.map((item) => {
        response = response.plus(new BigNumber(item.data.amountOutUsd));
    });
>>>>>>> 098ebb9 (sync)

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
                address: getMassiveMintRouter(),
                abi: MassiveMintRouter,
                functionName: 'massiveMint',
                args: [
                    getMultipoolAddress("arbi"),
                    token,
                    amount?.integerValue(),
                    new BigNumber(0).integerValue(),
                    swaps,
                    tokens,
                    "0xd0fFEB96E4e9D1A4de008A2FD5A9C416d7cE048F"
                ],
                // chainId: 421611,
                enabled: enabled,
            },
            estimatedTransactionCost: {
                gas: "0",
                gasPrice: "0",
                cost: "0",
            } as unknown as Gas,
<<<<<<< HEAD
            massiveMintTransaction: undefined,
>>>>>>> 4c40c2d (sync)
=======
>>>>>>> 13c17a2 (sync)
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
<<<<<<< HEAD
    _enabled?: boolean,
=======
    _params: {
        enabled: boolean,
    }
>>>>>>> 098ebb9 (sync)
): {
    data: {
        estimationResult: EstimatedValues | undefined,
        masiveMintResult: any | undefined,
        transactionCost: Gas | undefined
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
<<<<<<< HEAD
    const enabled = _enabled === undefined ? true : _enabled;
    const isNotMultipoolToken = params.tokenIn?.type !== "multipool";

    const { address } = useAccount();

<<<<<<< HEAD
    const { data, isLoading: massiveMintIsLoading } = useEstimateMassiveMint(
        params.tokenIn?.address as Address,
        params.quantities.in,
        address,
        chainId, {
        enabled: enabled && isNotMultipoolToken,
    });
=======
    console.log("params.quantities.in", params.quantities.in?.toString());
    const { data } = useEstimateMassiveMint(params.tokenIn.address as Address, params.quantities.in, address, params.routerAddress as Address);
    console.log("outShares", data?.estimatedOutShares.toString());
>>>>>>> 4c40c2d (sync)
=======
    const enabled = _params?.enabled || true;

    const { address } = useAccount();

    const { data } = useEstimateMassiveMint(params.tokenIn?.address as Address, params.quantities.in, address, params.routerAddress as Address, {
        enabled: enabled && params.tokenIn?.type === "external" && params.quantities.in != undefined && params.quantities.in.isGreaterThan(0),
    });
>>>>>>> 098ebb9 (sync)

    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);

    const { data: classicMint, error, isError, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        chainId: chainId,
<<<<<<< HEAD
        enabled: enabled && !isNotMultipoolToken
=======
        enabled: enabled,
>>>>>>> 098ebb9 (sync)
    });

    const { data: classicTransactionCost } = useEstimateTransactionCost(
        txnBodyParts as EstimationTransactionBody,
        chainId,
        enabled && !isNotMultipoolToken
    );

    const transactionCost = data?.estimatedTransactionCost || classicTransactionCost;

    const classicMintOut = adapter.parseEstimationResult(classicMint, params)?.estimatedAmountOut?.row || BigNumber(0);
    const massiveMintOut = data?.estimatedOutShares || { row: BigNumber(0), formatted: "0", usd: "0" };

    const maximumAmountIn = {
        row: params.quantities.in || BigNumber(0),
        formatted: (params?.quantities.in?.dividedBy(new BigNumber(10).pow(new BigNumber(params.tokenIn?.decimals || BigNumber(0)))) || new BigNumber(0)).toString(),
        usd: Number(data?.estimatedAmountIn.usd).toFixed(4) || "0",
    }

<<<<<<< HEAD
    if (!enabled) {
        return {
            data: {
                estimationResult: undefined,
                transactionCost: undefined
            },
            isError: isError,
            isLoading: isLoading,
            error: error?.message,
        }
    }
=======
    const { data: transactionCost } = useEstimateTransactionCost(txnBodyParts as EstimationTransactionBody, chainId, { enabled: enabled });

<<<<<<< HEAD
    // console.log("transactionCost", txnData);
>>>>>>> 098ebb9 (sync)

    if (massiveMintOut.row.isLessThan(classicMintOut) || !isNotMultipoolToken) {
        return {
            data: {
                estimationResult: adapter.parseEstimationResult(classicMint, params),
                transactionCost: transactionCost
            },
            isError: isError,
            isLoading: isLoading,
            error: error?.message,
        }
    } else {
        return {
            data: {
                estimationResult: {
                    estimatedAmountIn: {
                        row: params.quantities.in || BigNumber(0),
                        formatted: (params?.quantities.in || BigNumber(0)).toString(),
                        usd: data?.estimatedAmountIn.usd || "0",
                    },
                    txn: data?.massiveMintTransaction.txn!,
                    estimatedAmountOut: massiveMintOut,
                    maximumAmountIn: maximumAmountIn,
                },
                transactionCost: transactionCost
            },
            isError: isError,
            isLoading: isLoading || massiveMintIsLoading,
            error: error?.message,
        }
    }
=======
    return {
        data: {
            estimationResult: adapter.parseEstimationResult(txnData, params),
            masiveMintResult: data?.massiveMintTransaction,
            transactionCost: transactionCost
        },
        isError: isError,
        isLoading: isLoading,
        error: errorText,
    };
>>>>>>> 13c17a2 (sync)
}
