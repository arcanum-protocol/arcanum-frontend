import { useState } from "react";
import * as React from 'react';
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

export function QuantityInput({
    disabled = false,
    quantitySetter,
    maxAmount,
}) {
    const max: bigint = parseUnits(maxAmount.toString(), 18);
    const [quantity, setQuantity] = useState<string>("0");

    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            <input
                pattern="^-?[0-9]\d*\.?\d*$"
                value={quantity}
                disabled={disabled}
                placeholder="0"
                onChange={e => {
                    let num: bigint;
                    setQuantity(e.target.value);
                    try {
                        num = parseUnits(e.target.value.toString(), 18);
                    } catch {
                        setError("invalid number");
                        return;
                    }

                    if (max < num) {
                        setError("number too big");
                        return;
                    }
                    setError(null);
                    quantitySetter(BigNumber.from(num));
                }}
            />
            {error ? <p>{error}</p> : <div />}
        </div >
    );
}
