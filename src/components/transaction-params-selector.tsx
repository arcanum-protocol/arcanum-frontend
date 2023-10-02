import * as React from 'react';
import { FixedNumber } from "ethers";
import { useState, useEffect } from "react";
import { SendTransactionParams } from "./trade-pane";

import 'react-loading-skeleton/dist/skeleton.css'
import { useTradeContext } from '../contexts/TradeContext';
import { Tooltip } from './tooltip';
import { useMobileMedia } from '../hooks/tokens';

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

    const [priceToggled, togglePrice] = useState(true);

    const p: SendTransactionParams | undefined = txnParams;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column"
        }}>
            <SlippageSelector slippageSetter={slippageSetter} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                    transition: "max-height .5s",
                }}>
                {
                    estimatedValues?.minimalAmountOut != undefined ?
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Tooltip>
                                <p style={{ margin: "0", textDecoration: "underline" }}>
                                    Minimal receive
                                </p>
                                <p style={{ margin: "5px" }}>
                                    The minimum amount of tokens you'll receive in case of the maximal slippage.
                                </p>
                            </Tooltip>
                            <p style={{ margin: "0" }}>
                                {estimatedValues?.minimalAmountOut.formatted}({estimatedValues?.minimalAmountOut.usd}$)
                            </p>
                        </div>
                        : (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Tooltip>
                                    <p style={{ margin: "0", textDecoration: "underline" }}>
                                        Maximum send
                                    </p>
                                    <p style={{ margin: "5px" }}>
                                        The maximum amount of tokens you'll pay in the case of the maximal slippage.
                                    </p>
                                </Tooltip>
                                <p style={{ margin: "0" }}>
                                    {estimatedValues?.maximumAmountIn?.formatted || 0}({estimatedValues?.maximumAmountIn?.usd || 0}$)
                                </p>
                            </div>

                        )
                }
                <div
                    onClick={() => togglePrice(!priceToggled)}
                    style={{ display: "flex", justifyContent: "space-between" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Price
                        </p>
                        <p style={{ margin: "5px" }}>
                            Current price of the input token estimated in the output token.
                        </p>
                    </Tooltip>
                    <p
                        className={p ? "price-pane" : undefined}
                        style={{ margin: "0" }}
                    >
                        {
                            p ?
                                priceToggled
                                    ?
                                    <>
                                        1 {p?.tokenIn?.symbol
                                        }={(Number(estimatedValues?.estimatedAmountOut?.formatted || "0")
                                            / Number(estimatedValues?.estimatedAmountIn?.formatted || "1")).toFixed(4)}
                                        {" "}
                                        {p?.tokenOut?.symbol}
                                    </>
                                    :
                                    <>
                                        1 {p?.tokenOut?.symbol}={(Number(estimatedValues?.estimatedAmountIn?.formatted || "0")
                                            / Number(estimatedValues?.estimatedAmountOut?.formatted || "1")).toFixed(4)}
                                        {" "}
                                        {p?.tokenIn?.symbol}
                                    </>
                                :
                                <>{"-"}</>
                        }
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Cashback
                        </p>
                        <p style={{ margin: "5px" }}>
                            The amount of tokens in the corresponding asset you'll get for your pool balancing swaps (good actions). Cashback equal 0 means that your action was not directed towards balance.
                        </p>
                    </Tooltip>
                    {p ?
                        <Tooltip>
                            <p
                                style={{
                                    margin: "0",
                                    textDecoration: p ? "underline" : undefined,
                                }}>
                                {p ? <>
                                    {
                                        (
                                            Number(estimatedValues?.estimatedCashbackIn?.usd || "0") +
                                            Number(estimatedValues?.estimatedCashbackOut?.usd || "0")
                                        ).toString()}$
                                </> : <>{"-"} </>}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", margin: "5px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ margin: "0", marginRight: "10px" }}>
                                        {p?.tokenIn?.symbol}:
                                    </div>
                                    <div style={{ margin: "0" }}>
                                        {Number(estimatedValues?.estimatedCashbackIn?.formatted) || "0"}({Number(estimatedValues?.estimatedCashbackIn?.usd) || "0"})$
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ margin: "0", marginRight: "10px" }}>
                                        {p?.tokenOut?.symbol}:
                                    </div>
                                    <div style={{ margin: "0" }}>
                                        {Number(estimatedValues?.estimatedCashbackOut?.formatted) || "0"}({Number(estimatedValues?.estimatedCashbackOut?.usd) || "0"})$
                                    </div>
                                </div>
                            </div>
                        </Tooltip>
                        :
                        <>{"-"}</>
                    }
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Fee
                        </p>
                        <p style={{ margin: "5px" }}>
                            Platform fee is a summ of base fee and deviation fee.<br />
                            Base fee - the platform's commission, for swaps is equal 0.01%. It is zero for minting and burning. <br />
                            Deviation fee is added when you increase the current deviation of the token.
                        </p>
                    </Tooltip>
                    <p style={{ margin: "0" }}>{estimatedValues?.fee?.usd || 0}$ ({estimatedValues?.fee?.percent || 0}%)</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Tooltip>
                        <p style={{ margin: "0", textDecoration: "underline" }}>
                            Transaction cost
                        </p>
                        <p style={{ margin: "5px" }}>
                            Cost of the transaction on the blockchain.
                        </p>
                    </Tooltip>
                    <p style={{ margin: "0" }}>{txnCost?.cost.toFixed(4) || "0"}$</p>
                </div>
            </div >
        </div >
    );
}

export function SlippageSelector({ slippageSetter }) {
    const [slippage, setSlippage] = useState<number>(1);
    const isMobile = useMobileMedia();
    if (isMobile) {
        return;
    }

    useEffect(() => { slippage && slippageSetter(slippage) }, [slippage]);

    // 0,1,2,3 - presets, 4 - custom
    const [selectedSlippageType, setType] = useState<number>(2);
    const slippagePresets = [0.1, 0.5, 1, 3];
    return (
        <div style={{
            display: "flex", width: "100%",
            marginBottom: "0px"
        }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <div style={{
                    display: "flex",
                    border: "1px solid #363636",
                    padding: "5px",
                    margin: "auto",
                    borderRadius: "16px",
                }}>
                    <div style={{
                        display: "flex",
                    }}>
                        <div style={{
                            display: "flex",
                            borderRadius: "10px",
                            justifyContent: "center",
                        }}>
                            {slippagePresets.map((slippage: number, index: number) => {
                                return (
                                    <div
                                        key={index}
                                        onClick={e => { setType(index); setSlippage(slippage) }}
                                        style={{
                                            borderRadius: "12px",
                                            color: index != selectedSlippageType ? undefined : "var(--bl)",
                                            backgroundColor: index == selectedSlippageType ? "var(--wh)" : undefined,
                                            cursor: "pointer",
                                            justifySelf: "center",
                                            fontSize: "18px",
                                        }}>
                                        <p style={{ margin: "0 15px" }}>{slippage}%</p>
                                    </div>
                                );
                            })}
                            <input
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    overflow: "hidden",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "18px",
                                    boxSizing: "border-box",
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
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }}>
                        <Tooltip>
                            <p style={{ margin: "0", textDecoration: "underline" }}>
                                Slippage tolerance
                            </p>
                            <p style={{ margin: "5px" }}>
                                The parameter that shows how much funds is allowed to be spend according to fast price change.
                            </p>
                        </Tooltip>
                    </div>
                    <div style={{ display: "flex" }}>
                        <p style={{ margin: "0" }}>{slippage}%</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
