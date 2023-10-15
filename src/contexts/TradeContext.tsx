import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { EstimatedValues } from '../types/estimatedValues';
import { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import React, { useState, useContext, createContext } from 'react';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { Gas } from '@/types/gas';
import BigNumber from 'bignumber.js';

export interface TradeContextValue {
    routerAddress: Address;
    multipoolAddress: Address;

    userAddress: Address;
    setAdress: (value: Address) => void;

    inputHumanReadable: string | undefined;
    outputHumanReadable: string | undefined;

    inputDollarValue: string | undefined;
    outputDollarValue: string | undefined;

    inputQuantity: BigNumber | undefined;
    setInputQuantity: (quantity: BigNumber | undefined) => void;

    outputQuantity: BigNumber | undefined;
    setOutputQuantity: (quantity: BigNumber | undefined) => void;

    slippage: number;
    setSlippage: (value: number) => void;

    isLoading: boolean;
    setIsLoading: (value: boolean) => void;

    mainInput: "in" | "out";
    setMainInput: (value: "in" | "out") => void;

    setEstimatedValues: (value: EstimatedValues | undefined) => void;

    sendTransctionParams: SendTransactionParams | undefined;
    setSendTransctionParams: (value: SendTransactionParams | undefined) => void;

    estimationErrorMessage: string | undefined;
    setEstimationErrorMessage: (value: string | undefined) => void;

    tradeLogicAdapter: TradeLogicAdapter;

    transactionCost: {
        gas: number;
        gasPrice: number;
        cost: number;
    } | undefined;
    setTransactionCost: (value: {
        gas: number;
        gasPrice: number;
        cost: number;
    } | undefined) => void;
}

const TradeContext = createContext<TradeContextValue | null>(null);

export const TradeProvider: React.FunctionComponent<{ tradeLogicAdapter: TradeLogicAdapter, multipoolAddress: string | undefined, routerAddress: string | undefined, children: React.ReactNode }> = ({ tradeLogicAdapter, multipoolAddress, routerAddress, children }) => {
    const _multipoolAddress = multipoolAddress as Address;
    const _routerAddress = routerAddress as Address;

    const user = useAccount();
    const [userAddress, setAddress] = useState<Address>(user.address as Address);

    const [inputQuantity, setInputQuantity] = useState<BigNumber | undefined>(undefined);
    const [outputQuantity, setOutputQuantity] = useState<BigNumber | undefined>(undefined);

    const [inputHumanReadable, setInputHumanReadable] = useState<string | undefined>();
    const [outputHumanReadable, setOutputHumanReadable] = useState<string | undefined>();

    const [inputDollarValue, setInputDollarValue] = useState<string | undefined>();
    const [outputDollarValue, setOutputDollarValue] = useState<string | undefined>();

    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const [slippage, setSlippage] = useState<number>(0.1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function setEstimatedValues(value: EstimatedValues | undefined) {
        if (value == undefined) {
            setInputQuantity(undefined);
            setOutputQuantity(undefined);

            setInputHumanReadable('');
            setOutputHumanReadable('');
            return;
        }

        if (mainInput === "in") {
            if (outputQuantity != undefined) {
                return;
            }
            setOutputQuantity(new BigNumber(value.estimatedAmountOut?.row.toString() || "0"));
            setOutputHumanReadable(value.estimatedAmountOut?.formatted);
            setInputDollarValue(value.estimatedAmountIn?.usd);
            setOutputDollarValue(value.estimatedAmountOut?.usd);
        } else {
            if (value.estimatedAmountOut?.row.toString() == outputQuantity?.toString()) {
                return;
            }
            setInputQuantity(new BigNumber(value.estimatedAmountIn?.row.toString() || "0"));
            setInputHumanReadable(value.estimatedAmountOut?.formatted);
            setInputDollarValue(value.estimatedAmountOut?.usd);
            setOutputDollarValue(value.estimatedAmountIn?.usd);
        }
    }

    const [sendTransctionParams, setSendTransctionParams] = useState<SendTransactionParams | undefined>(undefined);

    const [estimationErrorMessage, setEstimationErrorMessage] = useState<string | undefined>(undefined);

    const [transactionCost, setTransactionCost] = useState<Gas | undefined>(undefined);

    function setMainInputHandler(value: "in" | "out") {
        setMainInput(value);
    };

    const value: TradeContextValue = {
        userAddress,
        setAdress: setAddress,

        routerAddress: _routerAddress,

        slippage,
        setSlippage,

        isLoading,
        setIsLoading,

        transactionCost,
        setTransactionCost,

        inputHumanReadable,
        outputHumanReadable,

        inputDollarValue,
        outputDollarValue,

        inputQuantity,
        setInputQuantity,

        outputQuantity,
        setOutputQuantity,

        setEstimatedValues,

        sendTransctionParams,
        setSendTransctionParams,

        estimationErrorMessage,
        setEstimationErrorMessage,

        mainInput,
        setMainInput: setMainInputHandler,

        tradeLogicAdapter,
        multipoolAddress: _multipoolAddress,
    };

    return (
        <TradeContext.Provider value={value}>
            {children}
        </TradeContext.Provider>
    );
};

export const useTradeContext = () => {
    const context = useContext(TradeContext);
    if (!context) {
        throw new Error('TradeContext must be used within a Provider');
    }
    return context;
};
