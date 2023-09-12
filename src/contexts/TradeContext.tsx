import React, { useState, useContext, createContext } from 'react';
import type { SolidAsset } from '../types/solidAsset';
import { MultipoolAsset } from '../types/multipoolAsset';

export interface TradeContextValue {
    assets: MultipoolAsset[];
    setAssets: (assets: MultipoolAsset[]) => void;

    inputHumanReadable: string | undefined;
    setInputHumanReadable: (value: string | undefined) => void;

    outputHumanReadable: string | undefined;
    setOutputHumanReadable: (value: string | undefined) => void;

    inputQuantity: BigInt | undefined;
    setInputQuantity: (quantity: BigInt | undefined) => void;

    outputQuantity: BigInt | undefined;
    setOutputQuantity: (quantity: BigInt | undefined) => void;

    inputAsset: MultipoolAsset | SolidAsset | undefined;
    setInputAsset: (asset: MultipoolAsset | SolidAsset) => void;

    outputAsset: MultipoolAsset | SolidAsset | undefined;
    setOutputAsset: (asset: MultipoolAsset | SolidAsset) => void;

    handleSelectAsset: (asset: MultipoolAsset, isInput: 'out') => void;

    mainInput: "in" | "out"; 
    setMainInput: (value: "in" | "out") => void;
}

const TradeContext = createContext<TradeContextValue | null>(null);

export const TradeProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
    const [assets, setAssets] = useState<MultipoolAsset[]>([]);
    
    const [inputAsset, setInputAsset] = useState<MultipoolAsset | SolidAsset | undefined>(undefined);
    const [inputQuantity, setInputQuantity] = useState<BigInt | undefined>(undefined);

    const [outputAsset, setOutputAsset] = useState<MultipoolAsset | SolidAsset | undefined>(undefined);
    const [outputQuantity, setOutputQuantity] = useState<BigInt | undefined>(undefined);

    const [mainInput, setMainInput] = useState<"in" | "out">("in");
    
    const [inputHumanReadable, setinputHumanReadable] = useState<string | undefined>(undefined);
    const [outputHumanReadable, setoutputHumanReadable] = useState<string | undefined>(undefined);

    function setMainInputHandler(value: "in" | "out") {
        setMainInput(value);
    }; 
    
    const handleSelectAsset = (asset: MultipoolAsset) => {
        setOutputAsset(asset);
    };

    const value: TradeContextValue = {
        assets,
        setAssets,

        inputAsset,
        setInputAsset,

        outputAsset,
        setOutputAsset,

        inputHumanReadable,
        setInputHumanReadable: setinputHumanReadable,

        outputHumanReadable,
        setOutputHumanReadable: setoutputHumanReadable,

        inputQuantity,
        setInputQuantity,

        outputQuantity,
        setOutputQuantity,

        handleSelectAsset,

        mainInput,
        setMainInput: setMainInputHandler
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