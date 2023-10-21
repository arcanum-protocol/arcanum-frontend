import { BigNumber } from "bignumber.js";

interface BaseAsset {
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    address: string | undefined;
    price?: number;
    balance?: number;
    type: "solid" | "multipool" | "external";
}

interface ExternalAsset extends BaseAsset {}

interface SolidAssetSpecific {
    routerAddress: string;
    totalSupply: BigNumber;
    low24h: Number;
    high24h: Number;
    change24h: Number;
    chainId: number;
}

type SolidAsset = BaseAsset & SolidAssetSpecific;

interface MultipoolAssetSpecific {
    multipoolAddress: string;
    assetId: string;
    idealShare: BigNumber;
    currentShare: BigNumber;
    quantity: BigNumber;
    chainPrice: BigNumber;
    id: string;
    ticker: string;
    coingeckoId: string;
    defilamaId: string | null;
    revenue: string | null;
    mcap: BigNumber;
    volume24h: BigNumber;
    priceChange24h: BigNumber;
    deviationPercent: BigNumber;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type BaseAsset, type MultipoolAsset, type ExternalAsset, type SolidAsset };
