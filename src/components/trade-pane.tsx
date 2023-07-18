import * as React from 'react';
import { MultipoolAssetSelector } from "./multipool-assets-selector";
import { fetchAssets, routerAddress, multipoolAddress, type MultipoolAsset, ArbiAsset } from "../lib/multipool";
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { useState, useEffect } from 'react';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useDebounce } from 'use-debounce';
import { QuantityInput } from './quantity-input';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction, useToken } from 'wagmi'
import { formatEther, MaxUint256 } from "ethers";
import { type TokenWithAddress, useTokenWithAddress, useEstimate } from '../hooks/tokens';
import { InteractionWithApprovalButton } from './approval-button';
import { TransactionParamsSelector } from './transaction-params-selector';

export type TradePaneTexts = {
    buttonAction: string,
    section1Name: string,
    section2Name: string,
}

export type EstimatedValues = {
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
    isIn: boolean,
    isOut: boolean,
    txn: {
        address: string,
        abi: any,
        functionName: string,
        args: any[],
        enabled: boolean,
    }
}

export type EstimationTransactionBody = {
    address: string,
    abi: any,
    functionName: string,
    args: any[],
    enabled: boolean,
};

export type SendTransactionParams = {
    to: string,
    deadline: bigint,
    slippage: number,
    quantities: Quantities,
    tokenIn: TokenWithAddress,
    tokenOut: TokenWithAddress,
    priceIn: number,
    priceOut: number,
};

export type TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ) => EstimationTransactionBody | undefined,
    parseEstimationResult: (v: any, params: SendTransactionParams) => EstimatedValues | undefined,
}

export type Quantities = { in: BigInt | undefined, out: BigInt | undefined };


export function TradePane({
    assetsIn,
    initialInIndex = 0,
    assetsOut,
    initialOutIndex = 0,
    tradeLogicAdapter,
    paneTexts,
    selectTokenParent,
}) {
    const texts: TradePaneTexts = paneTexts;
    const adapter: TradeLogicAdapter = tradeLogicAdapter;
    const { address } = useAccount()

    const [assetIn, setAssetIn] = useState<MultipoolAsset>(assetsIn[initialInIndex] || assetsIn);
    const bindAssetIn = (value: MultipoolAsset) => setAssetIn(value);

    const inTokenData = useTokenWithAddress({
        tokenAddress: assetIn?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    })

    const [assetOut, setAssetOut] = useState<MultipoolAsset>(assetsOut[initialOutIndex] || assetsOut);
    const bindAssetOut = (value: MultipoolAsset) => setAssetOut(value);

    const outTokenData = useTokenWithAddress({
        tokenAddress: assetOut?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    })

    const [slippage, setSlippage] = useState<number>(0.5);
    const [quantity, setQuantity] = useState<Quantities>({
        in: BigInt("0"),
        out: BigInt("0"),
    });
    const [debouncedQuantity] = useDebounce(quantity, 500);
    const bindQuantityIn = (value: bigint) => setQuantity({ in: value, out: undefined });
    const bindQuantityOut = (value: bigint) => setQuantity({ in: undefined, out: value });

    let sendTransctionParams: SendTransactionParams = {
        to: address,
        deadline: BigInt(0),
        slippage: slippage,
        quantities: debouncedQuantity,
        tokenIn: inTokenData.data,
        tokenOut: outTokenData.data,
        priceIn: 10.1,
        priceOut: 1.1,
    };

    const {
        data: estimationResults,
        isLoading: estimationIsLoading,
        isError: estimationIsError
    } = useEstimate(adapter, sendTransctionParams);

    console.log(estimationResults?.estimatedAmountIn);
    return (
        <div style={{
            display: "flex",
            rowGap: "30px",
            flexDirection: "column",
            justifyContent: "center",
            margin: "0px auto",
            width: "400px"
        }}>

            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                text={texts.section1Name}
                assetSetter={bindAssetIn}
                quantitySetter={bindQuantityIn}
                initialQuantity={!estimationResults?.isIn && estimationResults?.estimatedAmountIn}
                tokenData={inTokenData}
                assets={assetsIn}
                initialAssetIndex={initialInIndex}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountIn ? estimationResults?.estimatedAmountIn.usd + "$" : "0$"}
            />
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                text={texts.section2Name}
                assetSetter={bindAssetOut}
                initialQuantity={!estimationResults?.isOut && estimationResults?.estimatedAmountOut}
                quantitySetter={bindQuantityOut}
                tokenData={outTokenData}
                assets={assetsOut}
                initialAssetIndex={initialOutIndex}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountOut ? estimationResults?.estimatedAmountOut.usd + "$" : "0$"}
            />
            <TransactionParamsSelector estimates={estimationResults} txnParams={sendTransctionParams} slippageSetter={setSlippage} />
            <InteractionWithApprovalButton
                interactionTxnBody={estimationResults?.txn}
                interactionBalance={estimationResults?.estimatedAmountIn?.row}
                approveMax={true}
                actionName={texts.buttonAction}
                tokenData={inTokenData}
            />
        </div >
    );
}

export function TokenQuantityInput({
    initialAssetIndex,
    usd,
    isDisabled,
    text,
    assetSetter,
    quantitySetter,
    tokenData,
    assets,
    initialQuantity,
    selectTokenParent,
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0" }}>
                <div style={{ display: "flex", }}>
                    <p style={{ fontSize: "20px", margin: "0" }}> {text} </p>
                </div>
                <QuantityInput
                    disabled={isDisabled}
                    quantitySetter={quantitySetter}
                    initialQuantity={initialQuantity}
                />
                <p style={{ marginTop: "1px", fontSize: "13px" }}>{usd}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <MultipoolAssetSelector modalParent={selectTokenParent} assetList={assets} setter={assetSetter} initialIndex={initialAssetIndex} />
                <p style={{ marginTop: "1px", fontSize: "13px" }}> Balance: {tokenData.data?.balance.formatted || "0"}</p>
            </div>
        </div>);
}
