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
    } | undefined,
    estimatedCashbackOut: {
        row: BigInt,
        formatted: string,
    } | undefined,
    estimatedAmountOut: {
        row: BigInt,
        formatted: string,
    } | undefined,

    estimatedAmountIn: {
        row: BigInt,
        formatted: string,
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
    tokenOut: TokenWithAddress
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
    assetsOut,
    tradeLogicAdapter,
    paneTexts,
}) {
    const texts: TradePaneTexts = paneTexts;
    const adapter: TradeLogicAdapter = tradeLogicAdapter;
    const { address } = useAccount()

    const [assetIn, setAssetIn] = useState<MultipoolAsset | undefined>();
    const bindAssetIn = (value: MultipoolAsset) => setAssetIn(value);

    const inTokenData = useTokenWithAddress({
        tokenAddress: assetIn?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    })

    const [assetOut, setAssetOut] = useState<MultipoolAsset | undefined>();
    const bindAssetOut = (value: MultipoolAsset) => setAssetOut(value);

    const outTokenData = useTokenWithAddress({
        tokenAddress: assetOut?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    })

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
        slippage: 0,
        quantities: debouncedQuantity,
        tokenIn: inTokenData.data,
        tokenOut: outTokenData.data,
    };

    const {
        data: estimationResults,
        isLoading: estimationIsLoading,
        isError: estimationIsError
    } = useEstimate(adapter, sendTransctionParams);

    return (
        //<div style={{ display: "flex", justifySelf: "center", margin: "0px auto", width: "550px" }}>
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "0px auto",
            width: "500px"
        }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flex: "1", justifySelf: "flex-start" }}>
                    <p style={{ fontSize: "30px", margin: "0" }}> {texts.section1Name} </p>
                </div>
                <div style={{ display: "flex", width: "30px", height: "30px", justifySelf: "flex-end" }}>
                    <TransactionParamsSelector setter={undefined} />
                </div>
            </div>
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                assetSetter={bindAssetIn}
                quantitySetter={bindQuantityIn}
                initialQuantity={!estimationResults?.isIn && estimationResults?.estimatedAmountIn}
                tokenData={inTokenData}
                assets={assetsIn}
            />
            <div style={{ display: "flex", justifySelf: "flex-start" }}>
                <p style={{ fontSize: "30px", margin: "0" }}> {texts.section2Name} </p>
            </div>
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                assetSetter={bindAssetOut}
                initialQuantity={!estimationResults?.isOut && estimationResults?.estimatedAmountOut}
                quantitySetter={bindQuantityOut}
                tokenData={outTokenData}
                assets={assetsOut}
            />
            <InteractionWithApprovalButton
                interactionTxnBody={estimationResults?.txn}
                interactionBalance={quantity.in}
                approveMax={true}
                actionName={texts.buttonAction}
                tokenData={inTokenData}
            />
        </div >
    );
}

export function TokenQuantityInput({ isDisabled, assetSetter, quantitySetter, tokenData, assets, initialQuantity }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <QuantityInput
                disabled={isDisabled}
                quantitySetter={quantitySetter}
                initialQuantity={initialQuantity}
                maxAmount={tokenData && tokenData.data?.balance.row}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <MultipoolAssetSelector assetList={assets} setter={assetSetter} />
                <p style={{ paddingBottom: "1px", fontSize: "13px" }}> balance: {tokenData.data?.balance.formatted || "0"}</p>
            </div>
        </div>);
}
