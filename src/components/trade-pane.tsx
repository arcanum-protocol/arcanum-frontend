import _ from "lodash";
import React, { useState } from 'react';
import { Address, useAccount } from 'wagmi'
import type { Quantities } from '../types/quantities';
import { QuantityInput } from './quantity-input';
import { TradePaneTexts } from '../types/tradePane';
import { toHumanReadable } from '../lib/format-number';
import type { MultipoolAsset } from "../types/multipoolAsset";
import type { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { InteractionWithApprovalButton } from './approval-button';
import { useTokenWithAddress, useEstimate } from '../hooks/tokens';
import { MultipoolAssetSelector } from "./multipool-assets-selector";
import { TransactionParamsSelector } from './transaction-params-selector';
import type { SendTransactionParams } from '../types/sendTransactionParams';
import { useTradeContext } from "../contexts/TradeContext";
import { SolidAsset } from "../types/solidAsset";


interface TradePaneProps {
    assetsIn: MultipoolAsset[];
    initialInIndex?: number;
    assetInDisableFilter?: (asset: MultipoolAsset) => boolean;
    assetOutDisableFilter?: (asset: MultipoolAsset) => boolean;
    assetsOut: MultipoolAsset[];
    initialOutIndex?: number;
    tradeLogicAdapter: TradeLogicAdapter;
    paneTexts: TradePaneTexts;
    selectTokenParent: React.RefObject<HTMLDivElement>;
    networkId: number;
    routerAddress: Address;
    multipoolAddress: Address;
}

export function TradePaneInner({
    assetsIn,
    assetsOut,
    initialOutIndex,
    tradeLogicAdapter,
    paneTexts,
    selectTokenParent,
    networkId,
    routerAddress,
    multipoolAddress,
}: TradePaneProps) {
    const texts: TradePaneTexts = paneTexts;

    const assetInDisableFilter = (asset: MultipoolAsset) => {
        return Number(asset.deviationPercent) > 10;
    };

    const assetOutDisableFilter = (asset: MultipoolAsset) => {
        return false;
    };

    const {
        inputAsset,
        setInputAsset,
        outputAsset,
        setOutputAsset,
        setInputHumanReadable,
        setOutputHumanReadable,
        mainInput,
        inputQuantity,
        setInputQuantity,
        outputQuantity,
        setOutputQuantity,
    } = useTradeContext();

    const adapter: TradeLogicAdapter = tradeLogicAdapter;
    const { address } = useAccount()

    const inTokenData = useTokenWithAddress({
        tokenAddress: inputAsset?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    });

    const outTokenData = useTokenWithAddress({
        tokenAddress: outputAsset?.assetAddress,
        userAddress: address,
        allowanceTo: routerAddress,
    });

    const [slippage, setSlippage] = useState<number>(0.5);

    let sendTransctionParams: SendTransactionParams = {
        to: address as Address,
        deadline: BigInt(0),
        slippage: slippage,
        quantities: {
            in: mainInput === "in" ? inputQuantity : undefined,
            out: mainInput === "in" ? undefined : outputQuantity,
        } as Quantities,
        tokenIn: inTokenData.data!,
        tokenOut: outTokenData.data!,
        priceIn: Number(inputAsset?.price?.toString() || 0),
        priceOut: Number(outputAsset?.price?.toString() || 0),
        routerAddress: routerAddress,
        multipoolAddress: multipoolAddress,
    };

    const {
        data: estimationResults,
        transactionCost: transactionCost,
        isLoading: estimationIsLoading,
        error: estimationErrorMessage,
    } = useEstimate(adapter, sendTransctionParams);

    if (estimationResults !== undefined) {
        if (mainInput === "in") {
            setOutputHumanReadable(estimationResults.estimatedAmountOut?.formatted);
            setOutputQuantity(estimationResults.estimatedAmountOut?.row);
        } else {
            setInputHumanReadable(estimationResults.estimatedAmountIn?.formatted);
            setInputQuantity(estimationResults.estimatedAmountIn?.row);
        }
    }

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
                assetSetter={setInputAsset}
                quantitySetter={setInputQuantity}
                tokenData={inTokenData}
                assets={assetsIn}
                name="in"
                initialAssetIndex={0}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountIn ? estimationResults?.estimatedAmountIn.usd + "$" : "0$"}
            />
            <TokenQuantityInput
                isDisabled={estimationIsLoading}
                assetDisableFilter={assetOutDisableFilter}
                text={texts.section2Name}
                assetSetter={setOutputAsset}
                quantitySetter={setOutputQuantity}
                tokenData={outTokenData}
                assets={assetsOut}
                name="out"
                initialAssetIndex={initialOutIndex!}
                selectTokenParent={selectTokenParent}
                usd={estimationResults?.estimatedAmountOut ? estimationResults?.estimatedAmountOut.usd + "$" : "0$"}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                {address ? <TransactionParamsSelector estimates={estimationResults} txnCost={transactionCost} txnParams={sendTransctionParams} slippageSetter={setSlippage} /> : undefined}
                <InteractionWithApprovalButton
                    interactionTxnBody={estimationResults?.txn}
                    interactionBalance={BigInt(String(estimationResults?.estimatedAmountIn?.row ? estimationResults?.estimatedAmountIn?.row : 0))}
                    externalErrorMessage={estimationErrorMessage}
                    approveMax={true}
                    tokenData={inTokenData}
                    networkId={networkId}
                    isLoading={estimationIsLoading}
                />
            </div >
        </div >
    );
}

interface TokenQuantityInputProps {
    initialAssetIndex: number;
    assetDisableFilter?: (asset: MultipoolAsset) => boolean;
    usd: string;
    isDisabled: boolean;
    text: string;
    assetSetter?: (asset: MultipoolAsset | SolidAsset) => void;
    quantitySetter: (quantity: BigInt | undefined) => void;
    tokenData: ReturnType<typeof useTokenWithAddress>;
    assets: MultipoolAsset[];
    quantity?: BigInt;
    selectTokenParent: React.RefObject<HTMLDivElement>;
    otherQuantity?: BigInt;
    name: string;
}

export function TokenQuantityInput({
    initialAssetIndex,
    assetDisableFilter,
    usd,
    isDisabled,
    text,
    assetSetter,
    tokenData,
    assets,
    selectTokenParent,
    name,
}: TokenQuantityInputProps) {
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
                    decimals={tokenData?.data?.decimals!}
                    quantityInputName={text}
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
export { TradeLogicAdapter };

