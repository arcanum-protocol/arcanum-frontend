import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { EstimatedValues } from '../types/estimatedValues';
import { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import React, { useState, useContext, createContext} from 'react';
import { SendTransactionParams } from '../types/sendTransactionParams';

export interface TradeContextValue {
    routerAddress: Address;
    multipoolAddress: Address;

    userAddress: Address;
    setAdress: (value: Address) => void;

    inputHumanReadable: string | undefined;
    setInputHumanReadable: (value: string) => void;

    outputHumanReadable: string | undefined;
    setOutputHumanReadable: (value: string) => void;

    inputQuantity: string | undefined;
    setInputQuantity: (quantity: string | undefined) => void;

    outputQuantity: string | undefined;
    setOutputQuantity: (quantity: string | undefined) => void;

    slippage: number;
    setSlippage: (value: number) => void;

    isLoading: boolean;
    setIsLoading: (value: boolean) => void;

    mainInput: "in" | "out";
    setMainInput: (value: "in" | "out") => void;

    estimatedValues: EstimatedValues | undefined;
    setEstimatedValues: (value: EstimatedValues | undefined) => void;

    sendTransctionParams: SendTransactionParams | undefined;
    setSendTransctionParams: (value: SendTransactionParams | undefined) => void;

    estimationErrorMessage: string | undefined;
    setEstimationErrorMessage: (value: string | undefined) => void;

    usdValues: {
        in: string | undefined;
        out: string | undefined;
    };
    setUsdValues: (value: {
        in: string | undefined;
        out: string | undefined;
    }) => void;

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
    
    const [inputQuantity, setInputQuantity] = useState<string | undefined>(undefined);
    const [outputQuantity, setOutputQuantity] = useState<string | undefined>(undefined);

    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const [inputHumanReadable, setInputHumanReadable] = useState<string | undefined>();
    const [outputHumanReadable, setOutputHumanReadable] = useState<string | undefined>();

    const [slippage, setSlippage] = useState<number>(0.1);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [estimatedValues, setEstimatedValues] = useState<EstimatedValues | undefined>(undefined);
    const [sendTransctionParams, setSendTransctionParams] = useState<SendTransactionParams | undefined>(undefined);

    const [usdValues, setUsdValues] = useState<{
        in: string | undefined;
        out: string | undefined;
    }>({
        in: undefined,
        out: undefined,
    });

    const [estimationErrorMessage, setEstimationErrorMessage] = useState<string | undefined>(undefined);

    const [transactionCost, setTransactionCost] = useState<{
        gas: number;
        gasPrice: number;
        cost: number;
    } | undefined>(undefined);

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
        setInputHumanReadable,

        outputHumanReadable,
        setOutputHumanReadable,

        inputQuantity,
        setInputQuantity,

        outputQuantity,
        setOutputQuantity,

        estimatedValues,
        setEstimatedValues,

        sendTransctionParams,
        setSendTransctionParams,

        estimationErrorMessage,
        setEstimationErrorMessage,

        usdValues,
        setUsdValues,

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
