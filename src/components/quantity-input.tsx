import { useState, useEffect } from "react";
import * as React from 'react';
import { parseUnits } from "ethers";
import { useDebounce } from "use-debounce";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

export function QuantityInput({
    disabled = false,
    decimals,
    quantitySetter,
    initialQuantity = undefined,
}) {
    const initial: { row: BigInt, formatted: string } | undefined = initialQuantity;
    const [quantity, setQuantity] = useState<string>("0");
    const [debouncedQuantity] = useDebounce(quantity, 1000);

    useEffect(() => {
        if (initial) {
            setQuantity(Number(initial.formatted).toFixed(4));
        }
    }, [initialQuantity]);

    useEffect(() => {
        if (!initial) {
            let num: bigint;
            if (debouncedQuantity == "") {
                quantitySetter(undefined);
            }
            try {
                num = FixedNumber
                    .fromString(debouncedQuantity)
                    .mulUnsafe(
                        FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString())))
                    ).toString().split(".")[0];
            } catch {
                quantitySetter(undefined);
                return;
            }
            quantitySetter(BigInt(num));
        }
    }, [debouncedQuantity, initial, decimals]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <input
                style={{
                    width: "100%",
                    boxSizing: "content-box",
                    overflow: "hidden",
                    fontFamily: "Neue Machina",
                    border: "none", outline: "none", fontSize: "24px", background: "none", color: "#fff"
                }}
                value={quantity}
                disabled={disabled}
                placeholder="0"
                onChange={e => {
                    let num: bigint;
                    if (e.target.value == "") {
                        setQuantity(e.target.value);
                    }
                    try {
                        num = parseUnits(e.target.value.toString(), 18);
                    } catch {
                        return;
                    }
                    setQuantity(e.target.value);
                }}
            />
        </div >
    );
}
