import * as React from 'react';
import { FixedNumber } from "ethers";
import { useState, useEffect } from "react";
import { SendTransactionParams } from "./trade-pane";

import 'react-loading-skeleton/dist/skeleton.css'
import { useTradeContext } from '../contexts/TradeContext';

interface TransactionParamsSelectorProps {
    txnParams: SendTransactionParams | undefined;
    txnCost: {
        gas: number;
        gasPrice: number;
        cost: number;
    } | undefined;
    slippageSetter: (slippage: number) => void;
}

export function TransactionParamsSelector({ txnParams, txnCost, slippageSetter }: TransactionParamsSelectorProps) {
    const { estimatedValues } = useTradeContext();

    const p: SendTransactionParams | undefined = txnParams;
    
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
                    estimatedValues?.minimalAmountOut != undefined ?
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <p style={{ margin: "0" }}>Minimal receive</p>
                            <p style={{ margin: "0" }}>
                                {estimatedValues?.minimalAmountOut.formatted}({estimatedValues?.minimalAmountOut.usd}$)
                            </p>
                        </div>
                        : (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ margin: "0" }}>Maximum send</p>
                                <p style={{ margin: "0" }}>
                                    {estimatedValues?.maximumAmountIn?.formatted || 0}({estimatedValues?.maximumAmountIn?.usd || 0}$)
                                </p>
                            </div>

                        )
                }
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>{p?.tokenIn?.symbol} price</p>
                    <p style={{ margin: "0" }}>
                        {(Number(estimatedValues?.estimatedAmountOut?.formatted || "0")
                            / Number(estimatedValues?.estimatedAmountIn?.formatted || "1")).toFixed(4)}
                        {" "}
                        {p?.tokenOut?.symbol}
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>{p?.tokenOut?.symbol} price</p>
                    <p style={{ margin: "0" }}>
                        {(Number(estimatedValues?.estimatedAmountIn?.formatted || "0")
                            / Number(estimatedValues?.estimatedAmountOut?.formatted || "1")).toFixed(4)}
                        {" "}
                        {p?.tokenIn?.symbol}
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Cashback {p?.tokenIn?.symbol}</p>
                    <p style={{ margin: "0" }}>
                        {Number(estimatedValues?.estimatedCashbackIn?.usd).toString() || "0"}$
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Cashback {p?.tokenOut?.symbol}</p>
                    <p style={{ margin: "0" }}>
                        {Number(estimatedValues?.estimatedCashbackOut?.usd).toString() || "0"}$
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Fee</p>
                    <p style={{ margin: "0" }}>{estimatedValues?.fee?.usd || 0}$ ({estimatedValues?.fee?.percent || 0}%)</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: "0" }}>Transaction cost</p>
                    <p style={{ margin: "0" }}>{txnCost?.cost.toFixed(4) || "0"}$</p>
                </div>
            </div>
        </div >
    );
}

export function SlippageSelector({ slippageSetter }) {
    const [slippage, setSlippage] = useState<number>(1);

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
