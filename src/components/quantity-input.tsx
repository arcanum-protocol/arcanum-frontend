import { useState, useEffect } from "react";
import * as React from 'react';
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

export function QuantityInput({
    disabled = false,
    quantitySetter,
    maxAmount = undefined,
    initialQuantity = undefined,
}) {
    const initial: { row: BigInt, formatted: string } | undefined = initialQuantity;
    console.log("trigger reload with ", initialQuantity);
    const max: bigint = maxAmount && BigInt(maxAmount);
    const [quantity, setQuantity] = useState<string>("0");

    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        try {
            let oldVal = parseUnits(quantity, 18);
            if (oldVal == initial.row) {
                return;
            }
        } catch { }
        try {
            if (initial) {
                if (maxAmount != undefined && max < initial.row) {
                    setError("number too big");
                } else {
                    setQuantity(Number(initial.formatted).toFixed(4));
                }
            }
        } catch (e) {
            setError("invalid number");
        }
    }, [maxAmount, initialQuantity]);

    console.log("q: ", quantity);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <input
                size={20}
                style={{ border: "none", outline: "none", fontSize: "24px" }}
                pattern="^-?[0-9]\d*\.?\d*$"
                value={quantity}
                disabled={disabled}
                placeholder="0"
                onChange={e => {
                    let num: bigint;
                    console.log("set value in event", e.target.value);
                    setQuantity(e.target.value);
                    try {
                        num = parseUnits(e.target.value.toString(), 18);
                    } catch {
                        setError("invalid number");
                        return;
                    }

                    if (maxAmount && max < num) {
                        setError("number too big");
                        return;
                    }
                    setError(null);
                    quantitySetter(num);
                }}
            />
            {<p style={{ margin: "0px", fontSize: "13px", height: "20px", color: "red" }}>{error || ""}</p>}
        </div >
    );
}
