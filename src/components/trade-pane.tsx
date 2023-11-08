import { Button } from "./ui/button";
import { useEstimate, useTokenWithAddress } from '../hooks/tokens';
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useTradeContext } from "../contexts/TradeContext";
import { InteractionWithApprovalButton } from './approval-button';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useMultiPoolContext } from "@/contexts/MultiPoolContext";
import type { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { TransactionParamsSelector } from './transaction-params-selector';
import type { SendTransactionParams } from '../types/sendTransactionParams';
import { ChangeEvent, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import { Quantities } from "@/types/quantities";
import { Address } from "viem";
import { useMultipoolPrice } from "@/lib/multipool";

interface TradePaneProps {
    action: "mint" | "burn" | "swap";
}

export function TradePaneInner({
    action
}: TradePaneProps) {
    const {
        tokenIn,
        tokenOut,
        multipool
    } = useMultiPoolContext();

    const {
        userAddress,
        routerAddress,
        sendTransctionParams,
        clearValues,
    } = useTradeContext();

    useEffect(() => {
        clearValues();
    }, [tokenIn, tokenOut]);

    const { data: inputToken } = useTokenWithAddress({ address: tokenIn?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: multipool?.chainId });
    const { data: outputToken } = useTokenWithAddress({ address: tokenOut?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: multipool?.chainId });

    const sendDisabled = action === "burn";
    const receiveDisabled = action === "mint";

    return (
        <div className="flex flex-col justify-center w-[400px] mt-[20px]">
            <TokenQuantityInput
                text={"Send"}
                balance={inputToken?.balance?.toString() || "0"}
                isDisabled={sendDisabled}
                action={action}
            />
            <TokenQuantityInput
                text={"Receive"}
                balance={outputToken?.balance?.toString() || "0"}
                isDisabled={receiveDisabled}
                action={action}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                <TransactionParamsSelector txnParams={sendTransctionParams} />
                <InteractionWithApprovalButton
                    approveMax={true}
                    token={inputToken}
                    networkId={multipool?.chainId!}
                />
            </div>
        </div>
    );
}

function toHumanReadable(number: number | undefined, decimals: number | undefined) {
    if (!number) {
        return "0";
    }

    const root = new BigNumber(number);
    const divisor = new BigNumber(10).pow(decimals || 18);

    return root.div(divisor).toFixed(4).toString();
}

interface TokenQuantityInputProps {
    text: "Send" | "Receive";
    balance: string;
    isDisabled?: boolean;
    action: "mint" | "burn" | "swap";
}

export function TokenQuantityInput({
    text,
    balance,
    isDisabled,
    action
}: TokenQuantityInputProps) {
    const {
        multipool,
        tokenIn,
        tokenOut,
        setSelectedTab,
    } = useMultiPoolContext();

    const {
        routerAddress,
        slippage,
        userAddress,
        tradeLogicAdapter,
        inputQuantity,
        outputQuantity,
        mainInput,
        inputDollarValue,
        outputDollarValue,
        setMainInput,
        setInputQuantity,
        setOutputQuantity,
        setEstimatedValues,
        getInputHumanized,
        getOutputHumanized,
        setTransactionCost,
        setEstimationErrorMessage
    } = useTradeContext();

    const { data: tokenInData } = useTokenWithAddress({
        address: tokenIn?.address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: multipool?.chainId,
    });

    const { data: tokenOutData } = useTokenWithAddress({
        address: tokenOut?.address as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: multipool?.chainId,
    });

    const { data: arbiData } = useMultipoolPrice("arbi");

    // inkect price into the token if it's solidAsset
    if (tokenIn?.type === "solid") {
        tokenIn.price = arbiData?.price.toNumber();
    }

    if (tokenOut?.type === "solid") {
        tokenOut.price = arbiData?.price.toNumber();
    }

    const adapter = tradeLogicAdapter;

    const transactionParams: SendTransactionParams = {
        to: userAddress,
        deadline: new BigNumber(0),
        slippage: slippage,
        quantities: {
            in: mainInput === "in" ? inputQuantity : undefined,
            out: mainInput === "in" ? undefined : outputQuantity,
        } as Quantities,
        tokenIn: tokenInData,
        tokenOut: tokenOutData,
        priceIn: tokenIn?.price || 0,
        priceOut: tokenOut?.price || 0,
        routerAddress: routerAddress,
        multipoolAddress: multipool?.address!,
    }

    const thisInput = text === "Send" ? 'in' : 'out';
    const shouldCallMassiveMint = action === "mint";
    const anythingToCalculateInCase = transactionParams.quantities.in !== undefined && transactionParams.quantities.in.isGreaterThan(0);
    const anythingToCalculateOutCase = transactionParams.quantities.out !== undefined && transactionParams.quantities.out.isGreaterThan(0);
    const anythingToCalculate = anythingToCalculateInCase || anythingToCalculateOutCase;

    // console.log("useEstimate", thisInput === mainInput && anythingToCalculate && shouldCallMassiveMint);

    const { data, error } = useEstimate(
        adapter,
        transactionParams,
        multipool?.chainId!,
        thisInput === mainInput && anythingToCalculate && shouldCallMassiveMint,
    );
    
    if (data.estimationResult !== undefined && data.transactionCost !== undefined) {
        console.log("useEstimate called", data);
        setEstimatedValues(data.estimationResult);
        setTransactionCost(data.transactionCost);
        setEstimationErrorMessage(error);
    }

    function getEstimatedValuesText() {
        if (text === "Send") {
            return {
                tokenSymbol: tokenIn?.symbol || undefined,
                logoImage: tokenIn?.logo || undefined,
            }
        } else {
            return {
                tokenSymbol: tokenOut?.symbol || undefined,
                logoImage: tokenOut?.logo || undefined,
            }
        }
    }

    function onClick() {
        if (isDisabled) {
            return;
        } else {
            setSelectedTab(text === "Send" ? "set-token-in" : "set-token-out");
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        // prevent Receive input from being changed IF token in is type external

        if (text === "Receive" && tokenIn?.type === "external") {
            return;
        }

        const regex = new RegExp("^[0-9]*[.,]?[0-9]*$");
        if (!regex.test(e.target.value)) {
            // prevent non-numeric input
            e.target.value = e.target.value.slice(0, -1);
            return;
        }

        const value = e.target.value.replace(",", ".");
        const decimals = new BigNumber((text === "Send" ? tokenIn?.decimals : tokenOut?.decimals) || 18);

        if (text === "Send") {
            setMainInput("in");

            const valueNumber = new BigNumber(value)
                .multipliedBy(new BigNumber("10").pow(decimals));

            setInputQuantity(valueNumber);
            setOutputQuantity(undefined);
        } else {
            setMainInput("out");

            const valueNumber = new BigNumber(value)
                .multipliedBy(new BigNumber("10").pow(decimals));

            setOutputQuantity(valueNumber);
            setInputQuantity(undefined);
        }
    };

    return (
        <div className="flex flex-col justify-between items-start rounded-2xl border h-full mx-[20px] my-[1px] p-3">
            <p className="text-base m-0">{text} </p>
            <div className="flex flex-row flex-start items-start justify-between w-full">
                <div className={''}
                    style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    <input className="w-full text-3xl h-10 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                        value={
                            text === "Send" ? (
                                mainInput === "in" ? undefined : getInputHumanized()
                            ) : (
                                mainInput === "out" ? undefined : getOutputHumanized()
                            )
                        }
                        placeholder="0"
                        onChange={handleInputChange}
                    />
                </div>
                <Button className="grow max-w-min rounded-2xl pl-0.5 pr-0.5 justify-between" variant="secondary" onClick={() => onClick()}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getEstimatedValuesText().logoImage} alt="Logo" />
                        <AvatarFallback>{getEstimatedValuesText().tokenSymbol}</AvatarFallback>
                    </Avatar>
                    <p className="px-0.5 text-white opacity-100">{getEstimatedValuesText().tokenSymbol}</p>
                    {
                        !isDisabled ?
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                            <div className="w-2"></div>
                    }
                </Button>
            </div>
            <div className="flex flex-row justify-between w-full mt-[4px]">
                <p className="m-0 text-xs text-gray-500">
                    {(text === "Send" ? inputDollarValue : outputDollarValue) + "$"}
                </p>
                <p className="m-0 text-gray-500 text-xs">
                    Balance: {
                        toHumanReadable(
                            parseFloat(balance),
                            text === "Send" ? tokenIn?.decimals : tokenOut?.decimals
                        )
                    }
                </p>
            </div>
        </div>
    );
}

export { TradeLogicAdapter, SendTransactionParams };
