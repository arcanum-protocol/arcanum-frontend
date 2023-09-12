import React, { ChangeEvent } from "react";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { useTradeContext } from "../contexts/TradeContext";

interface QuantityInputProps {
    disabled?: boolean;
    decimals: number;
    quantityInputName?: string;
}

export function QuantityInput({
    disabled = false,
    decimals,
    quantityInputName
}: QuantityInputProps) {
    const { inputHumanReadable, setInputHumanReadable, outputHumanReadable, setOutputHumanReadable, outputQuantity, setOutputQuantity, inputQuantity, setInputQuantity, mainInput, setMainInput } = useTradeContext();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (inputValue === "" || inputValue === "0") {
            setOutputHumanReadable(undefined);
            return;
        }

        try {
            const num = FixedNumber.fromString(inputValue)
                .mulUnsafe(FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString()))))
                .toString()
                .split(".")[0];
            if (quantityInputName === "Send") {
                setMainInput("in");
                setInputQuantity(BigInt(num));
                setInputHumanReadable(inputValue);
            } else {
                setMainInput("out");
                setOutputQuantity(BigInt(num));
                setOutputHumanReadable(inputValue);
            }
        } catch {
            setOutputHumanReadable(undefined);
        }
    };

    function getValue(): string {
        if (quantityInputName === "Send") {
            return inputHumanReadable || "";
        } else {
            return outputHumanReadable || "";
        }
    }

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
                value={getValue()}
                disabled={disabled}
                placeholder="0"
                onChange={handleInputChange}
            />
        </div>
    );
}
