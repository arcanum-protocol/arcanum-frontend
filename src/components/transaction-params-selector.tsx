import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import { EstimatedValues, SendTransactionParams } from "./trade-pane";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useMobileMedia } from "../hooks/tokens";

export function TransactionParamsSelector({ txnParams, estimates, slippageSetter }) {
    const p: SendTransactionParams = txnParams;
    const e: EstimatedValues = estimates;
    const isMobile = useMobileMedia();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {isMobile ? undefined : <SlippageSelector slippageSetter={slippageSetter} />}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {p.tokenIn?.symbol ? <p style={{ margin: "0" }}>{p.tokenIn?.symbol} price</p> : <Skeleton />}
                <p style={{ margin: "0" }}>
                    {"0"}
                </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {p.tokenOut?.symbol ? <p style={{ margin: "0" }}>{p.tokenOut?.symbol} price</p> : <Skeleton />}
                <p style={{ margin: "0" }}>
                    {"0"}
                </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {p.tokenIn?.symbol ? <p style={{ margin: "0" }}>Cashback {p.tokenIn?.symbol}</p> : <Skeleton />}
                <p style={{ margin: "0" }}>
                    {e?.estimatedCashbackIn?.formatted || "0"}
                    ({e?.estimatedCashbackIn?.usd || "0"}$)
                </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {p.tokenOut?.symbol ? <p style={{ margin: "0" }}>Cashback {p.tokenOut?.symbol}</p> : <Skeleton />}
                <p style={{ margin: "0" }}>
                    {e?.estimatedCashbackOut?.formatted || "0"}
                    ({e?.estimatedCashbackOut?.usd || "0"}$)
                </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: "0" }}>Fee</p>
                <p style={{ margin: "0" }}>{"0"}%</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: "0" }}>Transaction cost</p>
                <p style={{ margin: "0" }}>{"0"}</p>
            </div>
        </div>
    );
}

export function SlippageSelector({ slippageSetter }) {
    const [slippage, setSlippage] = useState<number>();

    // 0,1,2,3 - presets, 4 - custom
    const [selectedSlippageType, setType] = useState<number>(2);

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", }}>
                <div style={{ display: "flex", justifySelf: "flex-start" }}>
                    <p style={{ margin: "0" }}>Slippage tolerance</p>
                </div>
                <div style={{
                    display: "flex",
                    backgroundColor: "var(--bl)",
                    padding: "5px",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    margin: "auto",
                    borderRadius: "10px",
                }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {[0.1, 0.5, 1, 3].map((slippage: number, index: number) => {
                            return (
                                <div
                                    onClick={e => { setType(index); setSlippage(slippage) }}
                                    style={{
                                        borderRadius: "10px",
                                        color: index != selectedSlippageType ? "var(--wh)" : "var(--bl)",
                                        backgroundColor: index == selectedSlippageType ? "var(--wh)" : "var(--bl)",
                                    }}>
                                    <button style={{
                                        margin: "0",
                                        padding: "0",
                                        width: "60px",
                                        fontSize: "18px",
                                        background: "none",
                                        color: index != selectedSlippageType ? "var(--wh)" : "var(--bl)",
                                    }}>
                                        {slippage}%
                                    </button>
                                </div>
                            );
                        })}
                        <input
                            type="tel"
                            size={3}
                            style={{
                                marginLeft: "20px",
                                border: "none",
                                outline: "none",
                                fontSize: "18px",
                                background: "none",
                                color: "#fff",
                            }}
                            value={0}
                            placeholder="Custom"
                            onChange={e => {
                            }}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
