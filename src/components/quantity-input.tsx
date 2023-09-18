import React, { ChangeEvent } from "react";
import { useTradeContext } from "../contexts/TradeContext";
import { SendTransactionParams } from "./trade-pane";
import { Address } from "wagmi";
import { useEstimate, useTokenWithAddress } from "../hooks/tokens";
import { Quantities } from "../types/quantities";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

interface QuantityInputProps {
    decimals: number;
    quantityInputName: string;
}

export function QuantityInput({
    decimals,
    quantityInputName
}: QuantityInputProps) {
    const { tradeLogicAdapter,
        inputAsset,
        outputAsset,
        userAddress,
        routerAddress,
        slippage,
        mainInput,
        inputHumanReadable,
        outputHumanReadable,
        inputQuantity,
        outputQuantity,
        multipoolAddress,
        setUsdValues,
        setInputHumanReadable,
        setOutputHumanReadable,
        setOutputQuantity,
        setInputQuantity,
        setMainInput,
        setEstimationErrorMessage,
        setEstimatedValues,
        setTransactionCost,
        setSendTransctionParams } = useTradeContext();

    const inTokenData = useTokenWithAddress({
        tokenAddress: inputAsset?.assetAddress as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
    });

    const outTokenData = useTokenWithAddress({
        tokenAddress: outputAsset?.assetAddress as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
    });

    const sendTransactionParams: SendTransactionParams = {
        to: userAddress,
        deadline: BigInt(0),
        slippage: slippage,
        quantities: {
            in: mainInput === "in" ? inputQuantity : undefined,
            out: mainInput === "in" ? undefined : outputQuantity,
        } as Quantities,
        tokenIn: inTokenData.data!,
        tokenOut: outTokenData.data!,
        priceIn: Number(inputAsset?.price?.toString() || 0),
        priceOut: Number(outputAsset?.price?.toString() || 0),
        routerAddress: routerAddress,
        multipoolAddress: multipoolAddress,
    };

    const {
        data: estimationResults,
        transactionCost: transactionCostScope,
        isLoading: estimationIsLoading,
        error: estimationErrorMessageScope,
    } = useEstimate(tradeLogicAdapter, sendTransactionParams);

    let inputQuantityScope: string = "";
    // const esimates: EstimatedValues | undefined = estimationResults;

    if (mainInput === "in" && quantityInputName === "Receive" && inputHumanReadable != "") {
        inputQuantityScope = estimationResults?.estimatedAmountOut?.formatted.toString() || "";
    } else if (mainInput === "out" && quantityInputName === "Send" && outputHumanReadable != "") {
        inputQuantityScope = estimationResults?.estimatedAmountIn?.formatted.toString() || "";
    } else if (mainInput === "in" && quantityInputName === "Send") {
        inputQuantityScope = inputHumanReadable || "";
    } else if (mainInput === "out" && quantityInputName === "Receive") {
        inputQuantityScope = outputHumanReadable || "";
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value == undefined || e.target.value === "") {
            setInputHumanReadable("");
            setOutputHumanReadable("");
            setUsdValues({ in: undefined, out: undefined });
            setEstimatedValues(undefined);
            setTransactionCost({ gas: 0, gasPrice: 0, cost: 0 });
            setSendTransctionParams(undefined);
            setEstimationErrorMessage(undefined);

            return;
        }

        if (quantityInputName === "Send") {
            setMainInput("in");
            try {
                const valueNumber = FixedNumber.fromString(e.target.value)
                    .mulUnsafe(FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString()))))
                    .toString()
                    .split(".")[0];

                setInputQuantity(valueNumber);
                setInputHumanReadable(e.target.value);
            } catch {
                setInputHumanReadable("");
            }
        } else {
            setMainInput("out");
            const value = e.target.value;
            try {
                const valueNumber = FixedNumber.fromString(value)
                    .mulUnsafe(FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString()))))
                    .toString()
                    .split(".")[0];

                setOutputQuantity(valueNumber);
                setOutputHumanReadable(value);
            } catch {
                setOutputHumanReadable("");
            }
        }

        setEstimationErrorMessage(estimationErrorMessageScope);
        setEstimatedValues(estimationResults);
        setTransactionCost(transactionCostScope);
        setSendTransctionParams(sendTransactionParams);
        setUsdValues({
            in: estimationResults?.estimatedAmountIn?.usd,
            out: estimationResults?.estimatedAmountOut?.usd,
        });
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
                value={inputQuantityScope}
                placeholder="0"
                onChange={handleInputChange}
            />
        </div>
    );
}
