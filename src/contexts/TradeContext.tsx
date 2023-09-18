import React, { useState, useContext, createContext, useEffect } from 'react';
import type { SolidAsset } from '../types/solidAsset';
import { MultipoolAsset } from '../types/multipoolAsset';
import { Address } from 'viem';
import { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { useAccount } from 'wagmi';
import { SendTransactionParams } from '../types/sendTransactionParams';
import { EstimatedValues } from '../types/estimatedValues';

export interface TradeContextValue {
    routerAddress: Address;
    multipoolAddress: Address;

    userAddress: Address;
    setAdress: (value: Address) => void;

    assets: MultipoolAsset[];
    setAssets: (assets: MultipoolAsset[]) => void;

    inputHumanReadable: string | undefined;
    setInputHumanReadable: (value: string) => void;

    outputHumanReadable: string | undefined;
    setOutputHumanReadable: (value: string) => void;

    inputQuantity: string | undefined;
    setInputQuantity: (quantity: string | undefined) => void;

    outputQuantity: string | undefined;
    setOutputQuantity: (quantity: string | undefined) => void;

    inputAsset: MultipoolAsset | SolidAsset | undefined;
    setInputAsset: (asset: MultipoolAsset | SolidAsset) => void;

    outputAsset: MultipoolAsset | SolidAsset | undefined;
    setOutputAsset: (asset: MultipoolAsset | SolidAsset) => void;

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

export const TradeProvider: React.FunctionComponent<{ contextInputAsset?: MultipoolAsset | SolidAsset, contextOutputAddress?: MultipoolAsset | SolidAsset, tradeLogicAdapter: TradeLogicAdapter, multipoolAddress: Address, routerAddress: Address, fetchedAssets: MultipoolAsset[], children: React.ReactNode }> = ({ contextInputAsset, contextOutputAddress, tradeLogicAdapter, multipoolAddress, routerAddress, fetchedAssets, children }) => {
    const user = useAccount();
    const [userAddress, setAddress] = useState<Address>(user.address as Address);
    const [assets, setAssets] = useState<MultipoolAsset[]>([]);

    const [inputAsset, setInputAsset] = useState<MultipoolAsset | SolidAsset | undefined>(contextInputAsset || fetchedAssets[0]);
    const [outputAsset, setOutputAsset] = useState<MultipoolAsset | SolidAsset | undefined>(contextOutputAddress || fetchedAssets[1]);
    
    const [inputQuantity, setInputQuantity] = useState<string | undefined>(undefined);
    const [outputQuantity, setOutputQuantity] = useState<string | undefined>(undefined);

    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const [inputHumanReadable, setInputHumanReadable] = useState<string | undefined>();
    const [outputHumanReadable, setOutputHumanReadable] = useState<string | undefined>();

    const [slippage, setSlippage] = useState<number>(0.5);

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

        routerAddress,

        assets,
        setAssets,

        inputAsset,
        setInputAsset,

        outputAsset,
        setOutputAsset,

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
        multipoolAddress
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
