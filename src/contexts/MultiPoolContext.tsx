import { SolidAsset } from '@/types/solidAsset';
import { ExternalToken, useArbitrumTokens } from '@/hooks/externalTokens';
import { MultipoolAsset } from '@/types/multipoolAsset';
import React, { createContext, useState } from 'react';

export interface MultiPoolContextProps {
    externalAssets: ExternalToken[] | undefined;
    setExternalAssets: (externalAssets: ExternalToken[] | undefined) => void;

    assets: MultipoolAsset[] | undefined;
    setAssets: React.Dispatch<React.SetStateAction<any>>;

    multipool: SolidAsset | undefined;
    setMultipool: React.Dispatch<React.SetStateAction<any>>;

    tokenIn: ExternalToken | SolidAsset | MultipoolAsset | undefined;
    setTokenIn: React.Dispatch<React.SetStateAction<any>>;

    tokenOut: ExternalToken | SolidAsset | MultipoolAsset | undefined;
    setTokenOut: React.Dispatch<React.SetStateAction<any>>;

    selectToken: React.Dispatch<React.SetStateAction<any>>;
}

export const MultiPoolContext = createContext<MultiPoolContextProps>({
    externalAssets: [],
    setExternalAssets: () => { },

    assets: [],
    setAssets: () => { },

    multipool: undefined,
    setMultipool: () => { },

    tokenIn: undefined,
    setTokenIn: () => { },

    tokenOut: undefined,
    setTokenOut: () => { },

    selectToken: () => { },
});

const MultiPoolProvider: React.FunctionComponent<{ children: React.ReactNode, externalTokens: ExternalToken[] | undefined, multipoolAsset: MultipoolAsset[] | undefined, multiPool: SolidAsset | undefined, selectToken: React.Dispatch<React.SetStateAction<any>> }> = ({ children, externalTokens, multipoolAsset, multiPool, selectToken }) => {
    const [externalAssets, setExternalAssets] = useState<ExternalToken[] | undefined>(externalTokens);
    const [assets, setAssets] = useState<MultipoolAsset[] | undefined>(multipoolAsset);
    const [multipool, setMultipool] = useState<SolidAsset | undefined>(multiPool);
    const [tokenIn, setTokenIn] = useState<ExternalToken | SolidAsset | MultipoolAsset | undefined>(multipoolAsset?.[0]);
    const [tokenOut, setTokenOut] = useState<ExternalToken | SolidAsset | MultipoolAsset | undefined>();

    function TokenQuantityInput(text: "Send" | "Receive") {
        if (text === "Send") {
            selectToken("set-token-in");
        }
        if (text === "Receive") {
            selectToken("set-token-out");
        }
    }

    return (
        <MultiPoolContext.Provider value={{ assets, setAssets, multipool, setMultipool, externalAssets, setExternalAssets, tokenIn, setTokenIn, tokenOut, setTokenOut, selectToken: TokenQuantityInput }}>
            {children}
        </MultiPoolContext.Provider>
    );
};

function useMultiPoolContext() {
    const context = React.useContext(MultiPoolContext);
    if (context === undefined) {
        throw new Error('useMultiPoolContext must be used within a MultiPoolProvider');
    }
    return context;
}

export { MultiPoolProvider, useMultiPoolContext };
