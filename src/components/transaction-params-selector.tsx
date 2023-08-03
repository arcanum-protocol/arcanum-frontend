import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import { EstimatedValues, SendTransactionParams } from "./trade-pane";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useMobileMedia } from "../hooks/tokens";
import chevron from '/chevron-down.svg';
import { FixedNumber } from "ethers";

export function TransactionParamsSelector({ txnParams, estimates, slippageSetter }) {
    const p: SendTransactionParams = txnParams;
    const e: EstimatedValues = estimates;

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                    transition: "max-height .5s",
                    overflow: "hidden",
                }}>
                <SlippageSelector slippageSetter={slippageSetter} />
                {
                    e?.minimalAmountOut != undefined ?
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <p style={{ margin: "0" }}>Minimal receive</p>
                            <p style={{ margin: "0" }}>
                                {e.minimalAmountOut.formatted}({e.minimalAmountOut.usd}$)
                            </p>
                        </div>
                        : (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ margin: "0" }}>Maximum send</p>
                                <p style={{ margin: "0" }}>
                                    {e?.maximumAmountIn?.formatted || 0}({e?.maximumAmountIn?.usd || 0}$)
                                </p>
                            </div>

                        )
                }
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>{p.tokenIn?.symbol} price</p>
                    <p style={{ margin: "0" }}>
                        {(Number(e?.estimatedAmountOut?.formatted || "0")
                            / Number(e?.estimatedAmountIn?.formatted || "1")).toFixed(4)}
                        {" "}
                        {p.tokenOut?.symbol}
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>{p.tokenOut?.symbol} price</p>
                    <p style={{ margin: "0" }}>
                        {(Number(e?.estimatedAmountIn?.formatted || "0")
                            / Number(e?.estimatedAmountOut?.formatted || "1")).toFixed(4)}
                        {" "}
                        {p.tokenIn?.symbol}
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Cashback {p.tokenIn?.symbol}</p>
                    <p style={{ margin: "0" }}>
                        {e?.estimatedCashbackIn?.formatted || "0"}
                        ({e?.estimatedCashbackIn?.usd || "0"}$)
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Cashback {p.tokenOut?.symbol}</p>
                    <p style={{ margin: "0" }}>
                        {e?.estimatedCashbackOut?.formatted || "0"}
                        ({e?.estimatedCashbackOut?.usd || "0"}$)
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Fee</p>
                    <p style={{ margin: "0" }}>{e?.fee || 0}%</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Transaction cost</p>
                    <p style={{ margin: "0" }}>{"0"}</p>
                </div>
            </div>
        </div >
    );
}

export function SlippageSelector({ slippageSetter }) {
    const [slippage, setSlippage] = useState<number>();

    useEffect(() => { slippage && slippageSetter(slippage) }, [slippage]);

    // 0,1,2,3 - presets, 4 - custom
    const [selectedSlippageType, setType] = useState<number>(2);
    const slippagePresets = [0.1, 0.5, 1, 3];
    return (
        <div style={{ display: "flex", width: "100%", marginBottom: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }}>
                        <p style={{ margin: "0" }}>Slippage tolerance</p>
                    </div>
                    <div style={{ display: "flex" }}>
                        <p style={{ margin: "0" }}>{slippage}%</p>
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    backgroundColor: "var(--bl)",
                    padding: "5px",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    margin: "auto",
                    borderRadius: "10px",
                    maxWidth: "90%",
                }}>
                    <div style={{
                        display: "flex",
                        overflow: "auto",
                    }}>
                        <div style={{
                            display: "flex",
                            borderRadius: "10px",
                            justifyContent: "flex-start"
                        }}>
                            {slippagePresets.map((slippage: number, index: number) => {
                                return (
                                    <div
                                        key={index}
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
                                style={{
                                    display: "flex",
                                    width: "80px",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "18px",
                                    background: "none",
                                    color: "var(--wh)",
                                }}
                                value={selectedSlippageType == 4 ? slippage : undefined}
                                placeholder="Custom"
                                onChange={e => {
                                    setType(4);
                                    try {
                                        if (e.target.value == "") {
                                            setSlippage(slippagePresets[2]);
                                            setType(2);
                                        }
                                        let val = FixedNumber.fromString(e.target.value);
                                        let num = Number(val.toString());
                                        if (num < 100) {
                                            setSlippage(num);
                                        }
                                    } catch { }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
