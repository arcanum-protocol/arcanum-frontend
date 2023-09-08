import React, { useState, ChangeEvent } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

interface QuantityInputProps {
    disabled?: boolean;
    decimals: number;
    quantitySetter: (quantity: BigInt | undefined) => void;
    initialQuantity?: { row: BigInt; formatted: string } | undefined;
    otherQuantity?: any;
}

export function QuantityInput({
    disabled = false,
    decimals,
    quantitySetter
}: QuantityInputProps) {
    const [quantity, setQuantity] = useState<string | undefined>("");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setQuantity(inputValue);

        if (inputValue === "" || inputValue === "0") {
            quantitySetter(undefined);
            return;
        }

        try {
            const num = FixedNumber.fromString(inputValue)
                .mulUnsafe(FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString()))))
                .toString()
                .split(".")[0];
            quantitySetter(BigInt(num));
        } catch {
            quantitySetter(undefined);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <input
                style={{
                    width: "100%",
                    boxSizing: "content-box",
                    overflow: "hidden",
                    fontFamily: "Neue Machina",
                    border: "none",
                    outline: "none",
                    fontSize: "24px",
                    background: "none",
                    color: "#fff",
                }}
                value={quantity}
                disabled={disabled}
                placeholder="0"
                onChange={handleInputChange}
            />
        </div>
    );
}
