import { useState, useEffect } from "react";
import * as React from 'react';
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";
import { useMobileMedia } from "../hooks/tokens";

export function QuantityInput({
    disabled = false,
    quantitySetter,
    initialQuantity = undefined,
}) {
    const initial: { row: BigInt, formatted: string } | undefined = initialQuantity;
    const [quantity, setQuantity] = useState<string>("0");
    const isMobile = useMobileMedia();

    useEffect(() => {
        if (initial) {
            setQuantity(Number(initial.formatted).toFixed(4));
        }
    }, [initialQuantity]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <input
                //size={isMobile ? 8 : 15}
                style={{
                    width: "100%",
                    boxSizing: "content-box",
                    overflow: "hidden",
                    border: "none", outline: "none", fontSize: "24px", background: "none", color: "#fff"
                }}
                value={quantity}
                disabled={disabled}
                placeholder="0"
                onChange={e => {
                    let num: bigint;
                    if (e.target.value == "") {
                        setQuantity(e.target.value);
                        quantitySetter(undefined);
                    }
                    try {
                        num = parseUnits(e.target.value.toString(), 18);
                    } catch {
                        quantitySetter(undefined);
                        return;
                    }
                    setQuantity(e.target.value);
                    quantitySetter(num);
                }}
            />
        </div >
    );
}
