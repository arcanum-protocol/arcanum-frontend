import { ExternalAsset, MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import React, { createContext, useState } from 'react';

export interface MultiPoolContextProps {
    externalAssets: ExternalAsset[] | undefined;
    setExternalAssets: (externalAssets: ExternalAsset[] | undefined) => void;

    assets: MultipoolAsset[] | undefined;
    setAssets: React.Dispatch<React.SetStateAction<any>>;

    multipool: SolidAsset | undefined;
    setMultipool: React.Dispatch<React.SetStateAction<any>>;

    tokenIn: ExternalAsset | SolidAsset | MultipoolAsset | undefined;
    setTokenIn: React.Dispatch<React.SetStateAction<any>>;

    tokenOut: ExternalAsset | SolidAsset | MultipoolAsset | undefined;
    setTokenOut: React.Dispatch<React.SetStateAction<any>>;

    selectedSCTab: "mint" | "burn" | "swap";
    setSelectedSCTab: React.Dispatch<React.SetStateAction<"mint" | "burn" | "swap">>;

    selectedTab: "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" | undefined;
    setSelectedTab: React.Dispatch<React.SetStateAction<any>>;

    setTab: React.Dispatch<React.SetStateAction<any>>;
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

    selectedSCTab: "mint",
    setSelectedSCTab: () => { },

    selectedTab: "mint",
    setSelectedTab: () => { },

    setTab: () => { }
});

const MultiPoolProvider: React.FunctionComponent<{ children: React.ReactNode, ExternalAssets: ExternalAsset[] | undefined, multipoolAsset: MultipoolAsset[] | undefined, multiPool: SolidAsset | undefined }> = ({ children, ExternalAssets, multipoolAsset, multiPool }) => {
    const [externalAssets, setExternalAssets] = useState<ExternalAsset[] | undefined>(ExternalAssets);
    const [assets, setAssets] = useState<MultipoolAsset[] | undefined>(multipoolAsset);
    const [multipool, setMultipool] = useState<SolidAsset | undefined>(multiPool);
    const [tokenIn, setTokenIn] = useState<ExternalAsset | SolidAsset | MultipoolAsset | undefined>(multipoolAsset?.[0]);
    const [tokenOut, setTokenOut] = useState<ExternalAsset | SolidAsset | MultipoolAsset | undefined>();

    // for string selected tab, si we will know which tab to select wheb user clicks on "back" chevron inside token selector
    const [selectedSCTab, setSelectedSCTab] = useState<"mint" | "burn" | "swap">("mint");
    const [selectedTab, setSelectedTab] = useState<"mint" | "burn" | "swap" | "set-token-in" | "set-token-out" | undefined>("mint");

    function parseTabsChange(value: string | undefined): "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" | undefined {
        switch (value) {
            case "mint":
                return "mint";
            case "burn":
                return "burn";
            case "swap":
                return "swap";
            case "set-token-in":
                return "set-token-in";
            case "set-token-out":
                return "set-token-out";
            default:
                return "mint";
        }
    }

    function onValueChange(value: string | undefined) {
        console.log("value", value);
        
        const newValue = parseTabsChange(value);

        setSelectedTab(newValue);

        if (tokenIn?.address === tokenOut?.address) {
            setTokenOut(externalAssets?.filter((asset) => asset.address !== tokenIn?.address)?.[0]);
        }

        if (newValue === "mint" || newValue === "burn" || newValue === "swap") {
            setSelectedSCTab(newValue);

            if (newValue === "mint") {
                if (tokenIn === multipool) {
                    setTokenIn(externalAssets?.[0]);
                }
                setTokenOut(multipool);
            }
            if (newValue === "burn") {
                if (tokenOut === multipool) {
                    setTokenOut(externalAssets?.[0]);
                }
                setTokenIn(multipool);
            }
            if (newValue === "swap") {
                if (tokenIn === multipool) {
                    setTokenIn(externalAssets?.[0]);
                }
                if (tokenOut === multipool) {
                    setTokenOut(externalAssets?.[1]);
                }
            }
        }
    }

    return (
        <MultiPoolContext.Provider value={{
            assets,
            setAssets,
            multipool,
            setMultipool,
            externalAssets,
            setExternalAssets,
            tokenIn,
            setTokenIn,
            tokenOut,
            setTokenOut,
            selectedSCTab,
            setSelectedSCTab,
            selectedTab,
            setSelectedTab: onValueChange,
            setTab: onValueChange,
        }}>
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
