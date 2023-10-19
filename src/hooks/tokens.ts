import multipoolABI from '../abi/ETF';
import { BigNumber } from 'bignumber.js';
import { useContractRead, useToken, useAccount, Address, useQuery, usePrepareContractWrite } from 'wagmi'
import { EstimatedValues } from '../types/estimatedValues';
import { EstimationTransactionBody } from '../types/estimationTransactionBody';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { TradeLogicAdapter } from '../components/trade-pane';
import { publicClient } from '../config';
import { Gas } from '@/types/gas';
import { useMultipoolData, useMultipoolPrice } from '@/lib/multipool';
import axios from 'axios';
import { BuildedTransaction, KyberswapResponse } from '@/types/kyberswap';
import { BaseAsset, ExternalAsset } from '@/types/multipoolAsset';
import sheme from '@/scheme.yaml';
import MassiveMintRouter from '@/abi/MassiveMintRouter';
import { error } from 'console';

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
    tokenAddress: string,
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
    isError: boolean
} {
    const { data: tokenData, isError: isTokenError, isLoading: isTokenLoading } = useToken({
        address: tokenAddress as Address,
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

    let data: TokenWithAddress | undefined;

    const decimals = new BigNumber(tokenData?.decimals || "0");
    const denominator = new BigNumber(10).pow(decimals || "0");

    const userBalance = new BigNumber(tokenBalance as string);
    const approvedBalance = new BigNumber(approvedTokenBalance as string);

    data = {
        address: tokenAddress,
        interactionAddress: allowanceTo,
        userAddress: userAddress,
        decimals: tokenData?.decimals,
        name: tokenData?.name,
        symbol: tokenData?.symbol,
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
        data: data,
        isLoading: isTokenLoading || isAllowanceLoading || isBalanceLoading,
        isError: isTokenError || isBalanceError || isAllowanceError,
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
        enabled: !address,
    });

    return {
        data: result,
        isError: isError,
        isLoading: isLoading,
        error: error as string,
    };
}

export function useEstimateMassiveMintTransactions(
    token: Address,
    amount: BigNumber | undefined,
    sender: Address | undefined,
    router: Address,
): {
    data: BuildedTransaction[] | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const { data: arbi } = useMultipoolData("arbi");
    const { assets } = arbi!;

    console.log("assets", assets);
    console.log("amountInDivided", amount?.toString());

    // Считаем сумму выхода для каждого токена
    const { data: kyberswapResponse, isError: kyberswapResponseIsError, isLoading: kyberswapResponseIsLoading, error: kyberswapResponseError } = useQuery(['kyberswap'], async () => {
        // Соотношение между токенами в пуле
        const tokenRatio = assets.map(asset => {
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

        // if (amountInDivided.some(token => token.amount.isEqualTo(0))) return [];

        const routes = amountInDivided.map(async (_, i) => {
            const amountInInteger = amountInDivided[i].amount.integerValue();

            const tokenOut = amountInDivided[i].address;

            const response = await axios.get(
                `https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=${token}&tokenOut=${tokenOut}&amountIn=${amountInInteger}&saveGas=true&gasInclude=true`,
            );

            return response.data as KyberswapResponse;
        });

        const trxs = routes.map(async (routePromise) => {
            const route = await routePromise;
            const transaction = await axios.post(`https://aggregator-api.kyberswap.com/arbitrum/api/v1/route/build`, {
                "routeSummary": route.data.routeSummary,
                "sender": sender,
                "recipient": router,
            });

            return transaction.data as BuildedTransaction;
        });

        return await Promise.all(trxs);
    }, {
        enabled: token != undefined && amount != undefined && sender != undefined && router != undefined && amount?.isGreaterThan(0),
        refetchInterval: 1000,
    });

    console.log("kyberswapResponse", kyberswapResponse, kyberswapResponseIsLoading, kyberswapResponseError);

    return {
        data: kyberswapResponse,
        isError: kyberswapResponseIsError,
        isLoading: kyberswapResponseIsLoading,
        error: kyberswapResponseError as string,
    };
}

// export function useMassiveMint(): {
//     data: BuildedTransaction[] | undefined,
//     isLoading: boolean,
//     isError: boolean,
//     error: string | undefined,
// } {}

export function useEstimateMassiveMint(
    token: Address,
    amount: BigNumber | undefined,
    sender: Address | undefined,
    router: Address,
): {
    data: {
        estimatedOutShares: BigNumber,
        estimatedTransactionCost: Gas,
        massiveMintTransaction: any
    } | undefined,
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const { data: kyberswapResponse, isLoading: MassiveMintIsLoading, isError: MassiveMintIsError, error: MassiveMintError } = useEstimateMassiveMintTransactions(token, amount, sender, router);
    if (kyberswapResponse == undefined) return { data: undefined, isError: MassiveMintIsError, isLoading: MassiveMintIsLoading, error: MassiveMintError };

    let response: BigNumber = new BigNumber(0);

    for (let i = 0; i < kyberswapResponse.length; i++) {
        if (kyberswapResponse[i].data.amountOutUsd == undefined) continue;
        response = response.plus(new BigNumber(kyberswapResponse[i].data.amountOutUsd));
    }

    // get multipool price 
    const { data: arbi } = useMultipoolPrice("arbi");
    const multipollSharesAmount = response.dividedBy(arbi?.price || 0);

    // const { data } = usePrepareContractWrite({
    //     address: sheme["arbi"].massive_mint_address,
    //     abi: MassiveMintRouter,
    //     functionName: 'massiveMint',
    //     args: [token, amount, sender],
    //     chainId: 421611,
    // });

    return {
        data: {
            estimatedOutShares: multipollSharesAmount,
            estimatedTransactionCost: {
                gas: "0",
                gasPrice: "0",
                cost: "0",
            } as unknown as Gas,
            massiveMintTransaction: undefined,
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
): {
    data: {
        estimationResult: EstimatedValues | undefined,
        transactionCost: Gas | undefined
    },
    isLoading: boolean,
    isError: boolean,
    error: string | undefined,
} {
    const token: ExternalAsset = {
        address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" as Address,
        decimals: 6,
        name: "Ethereum",
        symbol: "ETH",
        type: "external",
        logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
    };
    const { address } = useAccount();

    console.log("params.quantities.in", params.quantities.in?.toString());
    const { data } = useEstimateMassiveMint(params.tokenIn.address as Address, params.quantities.in, address, params.routerAddress as Address);
    console.log("outShares", data?.estimatedOutShares.toString());

    const txnBodyParts: EstimationTransactionBody | undefined = adapter.genEstimationTxnBody(params);

    let errorText: string | undefined = "";

    const { data: txnData, isError, error, isLoading } = useContractRead({
        address: txnBodyParts?.address as Address,
        abi: txnBodyParts?.abi,
        functionName: txnBodyParts?.functionName,
        args: txnBodyParts?.args,
        enabled: txnBodyParts != undefined && txnBodyParts.enabled,
        chainId: chainId,
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


