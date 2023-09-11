import React, { createContext, useContext, useState } from 'react';
import { MultipoolAsset } from '../types/multipoolAsset';
import { Quantities } from '../types/quantities';


interface TradeContextProps {
    assetIn: MultipoolAsset | null;
    setAssetIn: (value: MultipoolAsset | null) => void;
    assetOut: MultipoolAsset | null;
    setAssetOut: (value: MultipoolAsset | null) => void;
    slippage: number;
    setSlippage: (value: number) => void;
    quantity: Quantities;
    setQuantity: (value: Quantities) => void;
}

const TradeContext = createContext<TradeContextProps>({
    assetIn: null,
    setAssetIn: () => {},
    assetOut: null,
    setAssetOut: () => {},
    slippage: 0.5,
    setSlippage: () => {},
    quantity: { in: undefined, out: undefined },
    setQuantity: () => {},
});

function TradeProvider({ children }: { children: React.ReactNode }) {
    const [assetIn, setAssetIn] = useState<MultipoolAsset | null>(null);
    const [assetOut, setAssetOut] = useState<MultipoolAsset | null>(null);
    const [slippage, setSlippage] = useState<number>(0.5);
    const [quantity, setQuantity] = useState<Quantities>({ in: undefined, out: undefined });

    const contextValue: TradeContextProps = {
        assetIn,
        setAssetIn,
        assetOut,
        setAssetOut,
        slippage,
        setSlippage,
        quantity,
        setQuantity,
    };

    return (
        <TradeContext.Provider value={contextValue}>
            {children}
        </TradeContext.Provider>
  );
}

function useTrade(): TradeContextProps {
    const context = useContext(TradeContext);
    if (context === undefined) {
        throw new Error('useTrade must be used within a TradeProvider');
    }
    return context;
}

export { TradeProvider, useTrade, TradeContextProps };
