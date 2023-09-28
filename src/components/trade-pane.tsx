import _ from "lodash";
import React from 'react';
import { Address, useAccount } from 'wagmi'
import { QuantityInput } from './quantity-input';
import { TradePaneTexts } from '../types/tradePane';
import { toHumanReadable } from '../lib/format-number';
import { InteractionWithApprovalButton } from './approval-button';
import { useTokenWithAddress } from '../hooks/tokens';
import { MultipoolAssetSelector } from "./multipool-assets-selector";
import { TransactionParamsSelector } from './transaction-params-selector';
import { useTradeContext } from "../contexts/TradeContext";
import { SolidAsset } from "../types/solidAsset";
import type { MultipoolAsset } from "../types/multipoolAsset";
import type { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import type { SendTransactionParams } from '../types/sendTransactionParams';


interface TradePaneProps {
    assetsIn: MultipoolAsset[] | SolidAsset;
    assetsOut: MultipoolAsset[] | SolidAsset;
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
    paneTexts,
    selectTokenParent,
    networkId
}: TradePaneProps) {
    const texts: TradePaneTexts = paneTexts;

    const {
        userAddress,
        setSlippage,
        inputAsset,
        outputAsset,
        routerAddress,
        transactionCost,
        sendTransctionParams
    } = useTradeContext();

    const tokenIn = useTokenWithAddress({ tokenAddress: inputAsset?.assetAddress as Address, userAddress: userAddress, allowanceTo: routerAddress, chainId: networkId });
    const tokenOut = useTokenWithAddress({ tokenAddress: outputAsset?.assetAddress as Address, userAddress: userAddress, allowanceTo: routerAddress, chainId: networkId });

    return (
        <div style={
            {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxWidth: "400px",
                width: "100%",
                marginTop: "20px",
            }
        }>
            <TokenQuantityInput
                assetDisableFilter={(asset: MultipoolAsset) => Number(asset.deviationPercent) > 10}
                text={texts.section1Name}
                decimals={tokenIn.data?.decimals!}
                assets={assetsIn}
                initialAssetIndex={0}
                selectTokenParent={selectTokenParent}
                balance={tokenIn.data?.balance.formatted || "0"}
                chainId={networkId}
            />
            <TokenQuantityInput
                assetDisableFilter={(asset: MultipoolAsset) => Number(asset.deviationPercent) < -10}
                text={texts.section2Name}
                decimals={tokenOut.data?.decimals!}
                assets={assetsOut}
                initialAssetIndex={1}
                selectTokenParent={selectTokenParent}
                balance={tokenOut.data?.balance.formatted || "0"}
                chainId={networkId}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                {userAddress ? <TransactionParamsSelector txnCost={transactionCost} txnParams={sendTransctionParams} slippageSetter={() => setSlippage} /> : undefined}
                <InteractionWithApprovalButton
                    approveMax={true}
                    tokenData={tokenIn}
                    networkId={networkId}
                />
            </div >
        </div >
    );
}

interface TokenQuantityInputProps {
    initialAssetIndex: number;
    assetDisableFilter: (asset: MultipoolAsset) => boolean;
    text: "Send" | "Receive";
    decimals: number;
    assets: MultipoolAsset[] | SolidAsset;
    selectTokenParent: React.RefObject<HTMLDivElement>;
    balance: string;
    chainId: number;
}

export function TokenQuantityInput({
    initialAssetIndex,
    assetDisableFilter,
    text,
    decimals,
    assets,
    selectTokenParent,
    balance,
    chainId
}: TokenQuantityInputProps) {
    const { estimatedValues } = useTradeContext();
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
                    decimals={decimals}
                    quantityInputName={text}
                    chainId={chainId}
                />
                <p style={{
                    margin: "0", marginTop: "1px", fontSize: "13px",
                    opacity: "0.3"
                }}>{(text === "Send" ? estimatedValues?.estimatedAmountIn?.usd || "0" : estimatedValues?.estimatedAmountOut?.usd || "0") + "$"}</p>
            </div>
            <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "flex-end", justifyContent: "space-between",
                marginRight: "10px", marginTop: "10px", marginBottom: "10px",
                width: "100%",
                height: "80%",
            }}>
                <MultipoolAssetSelector
                    name={text}
                    disableFilter={assetDisableFilter}
                    modalParent={selectTokenParent}
                    assetList={assets}
                    initialIndex={initialAssetIndex} />
                <p style={{
                    margin: "0", fontSize: "13px",
                    opacity: "0.3"
                }}> Balance: {toHumanReadable(balance)}</p>
            </div>
        </div>);
}
export { TradeLogicAdapter, SendTransactionParams };

