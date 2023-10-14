import { ChangeEvent, useEffect } from "react";
import { useTradeContext } from "../contexts/TradeContext";
import { SendTransactionParams } from "./trade-pane";
import { Address } from "wagmi";
import { useEstimate, useTokenWithAddress } from "../hooks/tokens";
import { Quantities } from "../types/quantities";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

interface QuantityInputProps {
    className?: string;
    decimals: number;
    quantityInputName: string;
    chainId: number;
}

export function QuantityInput({
    className,
    decimals,
    quantityInputName,
    chainId,
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
        tokenAddress: inputAsset?.address as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: chainId,
    });

    const outTokenData = useTokenWithAddress({
        tokenAddress: outputAsset?.address as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: chainId,
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
        isError: estimationIsError,
        error: estimationErrorMessageScope,
    } = useEstimate(tradeLogicAdapter, sendTransactionParams, chainId);

    if (estimationIsError) {
        setEstimationErrorMessage(estimationErrorMessageScope);
    } else {
        setEstimationErrorMessage(undefined);
    }

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

    useEffect(() => {
        if (estimationResults) {
            setEstimatedValues(estimationResults);
            console.log("transactionCostScope", transactionCostScope);
            setTransactionCost(transactionCostScope);
            setSendTransctionParams(sendTransactionParams);
            setUsdValues({
                in: estimationResults.estimatedAmountIn?.usd.toString() || "",
                out: estimationResults.estimatedAmountOut?.usd.toString() || "",
            });
        }
    }, [estimationResults]);

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

        const value = e.target.value;

        if (quantityInputName === "Send") {
            setMainInput("in");
            try {
                const valueNumber = FixedNumber.fromString(value)
                    .mulUnsafe(FixedNumber.fromValue(BigNumber.from("10").pow(BigNumber.from(decimals.toString()))))
                    .toString()
                    .split(".")[0];

                setInputQuantity(valueNumber);
                setInputHumanReadable(value);
            } catch {
                setInputHumanReadable("");
            }
        } else {
            setMainInput("out");
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
    };

    return (
        <div className={className} 
        style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <input className="w-full text-3xl h-10 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                value={inputQuantityScope}
                placeholder="0"
                onChange={handleInputChange}
            />
        </div>
    );
}
