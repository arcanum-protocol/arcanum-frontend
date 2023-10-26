import { Address } from 'viem';
import { Gas } from '@/types/gas';
import { useAccount } from 'wagmi';
import BigNumber from 'bignumber.js';
import { EstimatedValues } from '../types/estimatedValues';
import { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import React, { useState, useContext, createContext } from 'react';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { useMultiPoolContext } from './MultiPoolContext';
import MassiveMintRouter from '@/abi/MassiveMintRouter';

export interface TradeContextValue {
    routerAddress: Address;
    multipoolAddress: Address;

    userAddress: Address;
    setAdress: (value: Address) => void;

    inputDollarValue: string | undefined;
    outputDollarValue: string | undefined;

    inputQuantity: BigNumber | undefined;
    setInputQuantity: (quantity: BigNumber | undefined) => void;

    outputQuantity: BigNumber | undefined;
    setOutputQuantity: (quantity: BigNumber | undefined) => void;

    slippage: number;
    setSlippage: (value: number) => void;

    mainInput: "in" | "out";
    setMainInput: (value: "in" | "out") => void;

    estimatedValues: EstimatedValues | undefined;
    setEstimatedValues: (value: EstimatedValues | undefined) => void;

    sendTransctionParams: SendTransactionParams | undefined;
    setSendTransctionParams: (value: SendTransactionParams | undefined) => void;

    estimationErrorMessage: string | undefined;
    setEstimationErrorMessage: (value: string | undefined) => void;

    getInputHumanized: () => string;
    getOutputHumanized: () => string;

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

    massiveMintRouter?: string;
}

const TradeContext = createContext<TradeContextValue | null>(null);

export const TradeProvider: React.FunctionComponent<{ tradeLogicAdapter: TradeLogicAdapter, multipoolAddress: string | undefined, routerAddress: string | undefined, MassiveMintRouter? : string, children: React.ReactNode }> = ({ MassiveMintRouter, tradeLogicAdapter, multipoolAddress, routerAddress, children }) => {
    const { tokenIn, tokenOut } = useMultiPoolContext();
    
    const _multipoolAddress = multipoolAddress as Address;
    const _routerAddress = routerAddress as Address;

    const user = useAccount();
    const [userAddress, setAddress] = useState<Address>(user.address as Address);

    const [inputQuantity, setInputQuantity] = useState<BigNumber | undefined>(undefined);
    const [outputQuantity, setOutputQuantity] = useState<BigNumber | undefined>(undefined);

    const [inputDollarValue, setInputDollarValue] = useState<string | undefined>();
    const [outputDollarValue, setOutputDollarValue] = useState<string | undefined>();

    const [mainInput, setMainInput] = useState<"in" | "out">("in");
    const [slippage, setSlippage] = useState<number>(0.1);

    const [estimatedValues, setEstimatedValuesPrivate] = useState<EstimatedValues | undefined>(undefined);

    function setEstimatedValues(value: EstimatedValues | undefined) {
        if (value == undefined) {
            if (mainInput === "in") {
                setInputDollarValue("0");
                setOutputDollarValue("0");
            }
            
            return;
        }

        if (mainInput === "in") {
            if (outputQuantity != undefined) {
                return;
            }
            setEstimatedValuesPrivate(value);
            
            setOutputQuantity(new BigNumber(value?.estimatedAmountOut?.row.toString() || "0"));
            setInputDollarValue(value?.estimatedAmountIn?.usd);
            setOutputDollarValue(value?.estimatedAmountOut?.usd);
        } else {
            if (inputQuantity != undefined) {
                return;
            }
            setEstimatedValuesPrivate(value);

            setInputQuantity(new BigNumber(value?.estimatedAmountIn?.row.toString() || "0"));
            setInputDollarValue(value?.estimatedAmountIn?.usd);
            setOutputDollarValue(value?.estimatedAmountOut?.usd);
        }
    }

    function getInputHumanized() {
        if (inputQuantity == undefined) {
            return "";
        }
        const decimals = new BigNumber(10).pow(new BigNumber(tokenIn?.decimals || 18)); 
        return inputQuantity.dividedBy(decimals).toFixed(12).toString();
    }

    function getOutputHumanized() {
        if (outputQuantity == undefined) {
            return "";
        }
        const decimals = new BigNumber(10).pow(new BigNumber(tokenOut?.decimals || 18)); 
        return outputQuantity.dividedBy(decimals).toFixed(12).toString();
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

        transactionCost,
        setTransactionCost,

        inputDollarValue,
        outputDollarValue,

        inputQuantity,
        setInputQuantity,

        outputQuantity,
        setOutputQuantity,

        estimatedValues,

        getInputHumanized,
        getOutputHumanized,

        setEstimatedValues,

        sendTransctionParams,
        setSendTransctionParams,

        estimationErrorMessage,
        setEstimationErrorMessage,

        mainInput,
        setMainInput: setMainInputHandler,

        tradeLogicAdapter,
        multipoolAddress: _multipoolAddress,

        massiveMintRouter: MassiveMintRouter,
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
