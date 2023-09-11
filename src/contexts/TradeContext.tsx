import React, { useState, useContext, createContext } from 'react';
import type { SolidAsset } from '../types/solidAsset';
import { MultipoolAsset } from '../types/multipoolAsset';

type Asset = SolidAsset | MultipoolAsset;

interface TradeContextValue {
    assets: Asset[];
    setAssets: (assets: Asset[]) => void;

    inputAsset: Asset | undefined;
    setInputAsset: (index: Asset | undefined) => void;

    outputAsset: Asset | undefined;
    setOutputAsset: (index: Asset | undefined) => void;

    handleSelectAsset: (asset: Asset, isInput: 'in' | 'out') => void;

    mainInput: string;
    setMainInput: (value: "in" | "out") => void;
}

const TradeMintContext = createContext<TradeContextValue | null>(null);

export const TradeMintProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);

    const [inputAsset, setInputAsset] = useState<Asset | undefined>(undefined);
    const [outputAsset, setOutputAsset] = useState<Asset | undefined>(undefined);
    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const handleSelectAsset = (asset: Asset, isInput: 'in' | 'out') => {
        if (isInput === 'in' && asset === outputAsset) {
            setOutputAsset(undefined);
        }
        if (isInput === 'out' && asset === inputAsset) {
            setInputAsset(undefined);
        }
        if (isInput === 'in') {
            setInputAsset(asset);
        } else {
            setOutputAsset(asset);
        }
    };

    const value = {
        assets,
        setAssets,

        inputAsset,
        setInputAsset,

        outputAsset,
        setOutputAsset,

        handleSelectAsset,

        mainInput,
        setMainInput
    };

    return (
        <TradeMintContext.Provider value={value}>
            {children}
        </TradeMintContext.Provider>
    );
};

export const useMintTradeContext = () => {
    const context = useContext(TradeMintContext);
    if (!context) {
        throw new Error('TradeContext must be used within a Provider');
    }
    return context;
};

const TradeSwapContext = createContext<TradeContextValue | null>(null);

export const TradeSwapProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);

    const [inputAsset, setInputAsset] = useState<number>(0);
    const [outputAsset, setOutputAsset] = useState<number>(1);
    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const handleSelectAsset = (asset: number, isInput: 'in' | 'out') => {
        if (isInput === 'in' && asset === outputAsset) {
            setOutputAsset(0);
        }
        if (isInput === 'out' && asset === inputAsset) {
            setInputAsset(1);
        }
        if (isInput === 'in') {
            setInputAsset(asset);
        } else {
            setOutputAsset(asset);
        }
    };

    const value = {
        assets,
        setAssets,

        inputAsset,
        setInputAsset,

        outputAsset,
        setOutputAsset,

        handleSelectAsset,

        mainInput,
        setMainInput
    };

    return (
        <TradeSwapContext.Provider value={value}>
            {children}
        </TradeSwapContext.Provider>
    );
};

export const useSwapTradeContext = () => {
    const context = useContext(TradeSwapContext);
    if (!context) {
        throw new Error('TradeContext must be used within a Provider');
    }
    return context;
};

const TradeBurnContext = createContext<TradeContextValue | null>(null);

export const TradeBurnProvider: React.FunctionComponent<{children: React.ReactNode}> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);

    const [inputAsset, setInputAsset] = useState<number>(0);
    const [outputAsset, setOutputAsset] = useState<number>(1);
    const [mainInput, setMainInput] = useState<"in" | "out">("in");

    const handleSelectAsset = (asset: number, isInput: 'in' | 'out') => {
        if (isInput === 'in' && asset === outputAsset) {
            setOutputAsset(0);
        }
        if (isInput === 'out' && asset === inputAsset) {
            setInputAsset(1);
        }
        if (isInput === 'in') {
            setInputAsset(asset);
        } else {
            setOutputAsset(asset);
        }
    };

    const value = {
        assets,
        setAssets,

        inputAsset,
        setInputAsset,

        outputAsset,
        setOutputAsset,

        handleSelectAsset,

        mainInput,
        setMainInput
    };

    return (
        <TradeBurnContext.Provider value={value}>
            {children}
        </TradeBurnContext.Provider>
    );
};

export const useBurnTradeContext = () => {
    const context = useContext(TradeBurnContext);
    if (!context) {
        throw new Error('TradeContext must be used within a Provider');
    }
    return context;
};
