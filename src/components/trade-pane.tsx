import _ from "lodash";
import React, { useState } from 'react';
import { Address, useAccount } from 'wagmi'
import { Quantities } from '../types/quantities';
import { QuantityInput } from './quantity-input';
import { MultipoolAsset } from "../lib/multipool";
import { TradePaneTexts } from '../types/tradePane';
import { toHumanReadable } from '../lib/format-number';
import { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { InteractionWithApprovalButton } from './approval-button';
import { MultipoolAssetSelector } from "./multipool-assets-selector";
import { TransactionParamsSelector } from './transaction-params-selector';
import { useTokenWithAddress, useEstimate } from '../hooks/tokens';
import { SendTransactionParams } from '../types/sendTransactionParams';

export function TradePaneInner({
    assetsIn,
    initialInIndex = 0,
    assetInDisableFilter,
    assetOutDisableFilter,
    assetsOut,
    initialOutIndex = 0,
    tradeLogicAdapter,
    paneTexts,
    selectTokenParent,
    networkId,
    routerAddress,
    multipoolAddress,
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
    });

    const [assetOut, setAssetOut] = useState<MultipoolAsset>(assetsOut[initialOutIndex] || assetsOut);
    const bindAssetOut = (value: MultipoolAsset) => setAssetOut(value);

    const outTokenData = useTokenWithAddress({
        tokenAddress: assetOut?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    });

    const [slippage, setSlippage] = useState<number>(0.5);
    const [quantity, setQuantity] = useState<Quantities>({
        in: undefined,
        out: undefined,
    });
    const bindQuantityIn = (value: bigint) => setQuantity({ in: value, out: undefined });
    const bindQuantityOut = (value: bigint) => setQuantity({ in: undefined, out: value });

    let sendTransctionParams: SendTransactionParams = {
        to: address as Address,
        deadline: BigInt(0),
        slippage: slippage,
        quantities: quantity,
        tokenIn: inTokenData.data!,
        tokenOut: outTokenData.data!,
        priceIn: Number(assetIn?.price?.toString() || 0),
        priceOut: Number(assetOut?.price?.toString() || 0),
        routerAddress: routerAddress,
        multipoolAddress: multipoolAddress,
    };

    const {
        data: estimationResults,
        transactionCost: transactionCost,
        isLoading: estimationIsLoading,
        isError: estimationIsError,
        error: estimationErrorMessage,
    } = useEstimate(adapter, sendTransctionParams);

    return (
        <div style={
            {
                display: "flex",
                overflow: "auto",
                flexDirection: "column",
                justifyContent: "center",
                maxWidth: "400px",
                width: "100%",
                marginTop: "20px",
            }
        }>
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                assetDisableFilter={assetInDisableFilter}
                text={texts.section1Name}
                assetSetter={bindAssetIn}
                quantitySetter={bindQuantityIn}
                initialQuantity={!estimationResults?.isIn ? estimationResults?.estimatedAmountIn : undefined}
                otherQuantity={quantity.out}
                tokenData={inTokenData}
                assets={assetsIn}
                initialAssetIndex={initialInIndex}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountIn ? estimationResults?.estimatedAmountIn.usd + "$" : "0$"}
            />
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                assetDisableFilter={assetOutDisableFilter}
                text={texts.section2Name}
                assetSetter={bindAssetOut}
                initialQuantity={!estimationResults?.isOut ? estimationResults?.estimatedAmountOut : undefined}
                otherQuantity={quantity.in}
                quantitySetter={bindQuantityOut}
                tokenData={outTokenData}
                assets={assetsOut}
                initialAssetIndex={initialOutIndex}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountOut ? estimationResults?.estimatedAmountOut.usd + "$" : "0$"}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                {address ? <TransactionParamsSelector estimates={estimationResults} txnCost={transactionCost} txnParams={sendTransctionParams} slippageSetter={setSlippage} /> : undefined}
                <InteractionWithApprovalButton
                    interactionTxnBody={estimationResults?.txn}
                    interactionBalance={estimationResults?.estimatedAmountIn?.row}
                    externalErrorMessage={estimationErrorMessage}
                    approveMax={true}
                    actionName={texts.buttonAction}
                    tokenData={inTokenData}
                    networkId={networkId}
                    updatePaneCb={undefined}
                />
            </div >
        </div >
    );
}

export function TokenQuantityInput({
    initialAssetIndex,
    assetDisableFilter,
    usd,
    isDisabled,
    text,
    assetSetter,
    quantitySetter,
    tokenData,
    assets,
    initialQuantity,
    selectTokenParent,
    otherQuantity,
}) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            margin: "1px 20px",
            borderRadius: "16px",
            background: "var(--bl)",
            height: "100%",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start", justifyContent: "space-between",
                marginLeft: "10px", marginTop: "10px", marginBottom: "10px",
            }}>
                <div style={{ display: "flex", }}>
                    <p style={{
                        fontSize: "18px",
                        margin: "0"
                    }}> {text} </p>
                </div>
                <QuantityInput
                    disabled={isDisabled}
                    decimals={tokenData?.data?.decimals}
                    quantitySetter={quantitySetter}
                    initialQuantity={initialQuantity}
                    otherQuantity={otherQuantity}
                />
                <p style={{
                    margin: "0", marginTop: "1px", fontSize: "13px",
                    opacity: "0.3"
                }}>{usd}</p>
            </div>
            <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "flex-end", justifyContent: "space-between",
                marginRight: "10px", marginTop: "10px", marginBottom: "10px",
                width: "100%",
                height: "80%",
            }}>
                <MultipoolAssetSelector
                    disableFilter={assetDisableFilter}
                    modalParent={selectTokenParent} assetList={assets}
                    setter={assetSetter} initialIndex={initialAssetIndex} />
                <p style={{
                    margin: "0", fontSize: "13px",
                    opacity: "0.3"
                }}> Balance: {toHumanReadable(tokenData.data?.balance.formatted || "0")}</p>
            </div>
        </div>);
}

export const TradePane = React.memo(
    TradePaneInner,
    (o, n) => {
        let val = _.isEqual(o, n);
        return val;
    }
);
