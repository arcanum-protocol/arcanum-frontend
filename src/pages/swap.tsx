import * as React from 'react';
import { fetchAssets, routerAddress, multipoolAddress, type MultipoolAsset, ArbiAsset } from "../lib/multipool";
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { useState, useEffect } from 'react';
import { type TokenWithAddress } from '../hooks/tokens';
import { EstimatedValues, EstimationTransactionBody, SendTransactionParams, TradeLogicAdapter, TradePane } from '../components/trade-pane';
import { Quantities } from '../components/trade-pane';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { Faucet } from '../components/faucet-modal';

const mintAdapter: TradeLogicAdapter = {
    genEstimationTxnBody: (
        params: SendTransactionParams,
    ): EstimationTransactionBody | undefined => {
        if (params.quantities.in) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateMintSharesOut',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.in],
                enabled: true,
            };
        } else if (params.quantities.out) {
            return {
                address: routerAddress,
                abi: routerABI,
                functionName: 'estimateMintAmountIn',
                args: [multipoolAddress, params.tokenIn?.tokenAddress, params.quantities.out],
                enabled: true,
            };
        } else {
            return undefined;
        }
    },
    parseEstimationResult: (
        v: any,
        params: SendTransactionParams,
    ): EstimatedValues | undefined => {
        if (!v) {
            return undefined;
        }
        if (params.quantities.in) {
            const denominatorIn = BigNumber.from(10).pow(BigNumber.from(params.tokenIn.decimals));
            const denominatorOut = BigNumber.from(10).pow(BigNumber.from(params.tokenOut.decimals));
            return {
                isIn: true,
                isOut: false,
                estimatedCashbackIn: {
                    row: BigInt(0),
                    formatted: FixedNumber.from(BigInt(0)).divUnsafe(FixedNumber.from(denominatorIn)).toString()
                },
                estimatedCashbackOut: {
                    row: BigInt(0),
                    formatted: FixedNumber.from(BigInt(0)).divUnsafe(FixedNumber.from(denominatorOut)).toString()
                },
                estimatedAmountOut: {
                    row: v,
                    formatted: FixedNumber.from(v).divUnsafe(FixedNumber.from(denominatorOut)).toString()
                },
                estimatedAmountIn: {
                    row: params.quantities.in,
                    formatted: FixedNumber.from(params.quantities.in).divUnsafe(FixedNumber.from(denominatorIn)).toString()
                },
                txn: {
                    address: routerAddress,
                    abi: routerABI,
                    functionName: '',
                    args: [],
                    enabled: false,
                }
            };
        }
    },
}


export function Swap() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result);
        }
        inner();
    }, []);

    return (
        <div style={{ display: "flex", height: "calc(100vh - 150px)", alignItems: "center", justifyContent: "center", flexDirection: "column", rowGap: "10px" }}>
            <Faucet assets={fetchedAssets} />
            <div style={{ display: "flex", justifyContent: "center" }}>
                <TradePane
                    assetsIn={fetchedAssets}
                    assetsOut={fetchedAssets}
                    tradeLogicAdapter={mintAdapter}
                    paneTexts={{
                        buttonAction: "Mint",
                        section1Name: "Send",
                        section2Name: "Receive",
                    }} />

            </div >
        </div >
    );
}

