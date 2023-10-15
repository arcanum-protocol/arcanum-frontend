import _, { set, slice } from "lodash";
import { Button } from "./ui/button";
import { useEstimate, useTokenWithAddress } from '../hooks/tokens';
import { toHumanReadable } from '../lib/format-number';
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useTradeContext } from "../contexts/TradeContext";
import { InteractionWithApprovalButton } from './approval-button';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useMultiPoolContext } from "@/contexts/MultiPoolContext";
import type { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { TransactionParamsSelector } from './transaction-params-selector';
import type { SendTransactionParams } from '../types/sendTransactionParams';
import { ChangeEvent } from "react";
import { BigNumber } from "bignumber.js";
import { Quantities } from "@/types/quantities";
import { Address } from "viem";

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
        sendTransctionParams
    } = useTradeContext();

    const { data: inputToken } = useTokenWithAddress({ tokenAddress: tokenIn?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: multipool?.chainId });
    const { data: outputToken } = useTokenWithAddress({ tokenAddress: tokenOut?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: multipool?.chainId });

    const sendDisabled = action === "burn";
    const receiveDisabled = action === "mint";

    return (
        <div className="flex flex-col justify-center w-[400px] mt-[20px]">
            <TokenQuantityInput
                text={"Send"}
                decimals={inputToken?.decimals!}
                balance={inputToken?.balance.formatted || "0"}
                isDisabled={sendDisabled}
            />
            <TokenQuantityInput
                text={"Receive"}
                decimals={outputToken?.decimals!}
                balance={outputToken?.balance.formatted || "0"}
                isDisabled={receiveDisabled}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                <TransactionParamsSelector txnParams={sendTransctionParams} />
                <InteractionWithApprovalButton
                    approveMax={true}
                    token={inputToken}
                    networkId={multipool?.chainId}
                />
            </div>
        </div>
    );
}

interface TokenQuantityInputProps {
    text: "Send" | "Receive";
    decimals: number;
    balance: string;
    isDisabled?: boolean;
}

export function TokenQuantityInput({
    text,
    decimals,
    balance,
    isDisabled
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
        inputHumanReadable,
        outputHumanReadable,
        inputQuantity,
        outputQuantity,
        mainInput,
        setMainInput,
        setInputQuantity,
        setOutputQuantity,
        setEstimatedValues,
    } = useTradeContext();

    const tokenInData = useTokenWithAddress({
        tokenAddress: tokenIn?.address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: multipool?.chainId,
    });

    const tokenOutData = useTokenWithAddress({
        tokenAddress: tokenOut?.address as Address,
        userAddress: userAddress,
        allowanceTo: routerAddress,
        chainId: multipool?.chainId,
    });

    const adapter = tradeLogicAdapter;
    
    // check for NaN
    const inputQuantityNotNAN = inputQuantity?.isNaN() ? new BigNumber(0) : inputQuantity;
    const outputQuantityNotNAN = outputQuantity?.isNaN() ? new BigNumber(0) : outputQuantity;
    
    const inputQuantityBigInt = inputQuantityNotNAN != undefined ? BigInt(inputQuantityNotNAN.toString()) : BigInt(0);
    const outputQuantityBigInt = outputQuantityNotNAN != undefined ? BigInt(outputQuantityNotNAN.toString()) : BigInt(0);

    const transactionParams: SendTransactionParams = {
        to: userAddress,
        deadline: BigInt(0),
        slippage: slippage,
        quantities: {
            in: mainInput === "in" ? inputQuantityBigInt : undefined,
            out: mainInput === "in" ? undefined : outputQuantityBigInt,
        } as Quantities,
        tokenIn: tokenInData?.data!,
        tokenOut: tokenOutData?.data!,
        priceIn: tokenIn?.price || 0,
        priceOut: tokenOut?.price || 0,
        routerAddress: routerAddress,
        multipoolAddress: multipool?.address!,
    }

    const { data } = useEstimate(
        adapter,
        transactionParams,
        multipool?.chainId!,
    );

    console.log("data", inputQuantity?.toString(), outputQuantity?.toString());
    
    setEstimatedValues(data.estimationResult);

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
        const value = e.target.value || "";

        if (text === "Send") {
            setMainInput("in");

            const valueNumber = new BigNumber(value)
                .multipliedBy(new BigNumber("10").pow(new BigNumber(decimals)));

            setInputQuantity(valueNumber);
            setOutputQuantity(undefined);
        } else {
            setMainInput("out");

            const valueNumber = new BigNumber(value)
                .multipliedBy(new BigNumber("10").pow(new BigNumber(decimals)));

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
                        value={text === "Send" ? inputHumanReadable : outputHumanReadable}
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
                    {getEstimatedValuesText() + "$"}
                </p>
                <p className="m-0 text-gray-500 text-xs">
                    Balance: {toHumanReadable(balance)}
                </p>
            </div>
        </div>
    );
}

export { TradeLogicAdapter, SendTransactionParams };
