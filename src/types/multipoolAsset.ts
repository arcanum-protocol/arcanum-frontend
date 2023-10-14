import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

interface BaseAsset {
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    address: string;
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
    chainId: Number;
}

type SolidAsset = BaseAsset & SolidAssetSpecific;

interface MultipoolAssetSpecific {
    multipoolAddress: string;
    assetId: string;
    idealShare: FixedNumber;
    currentShare: FixedNumber;
    quantity: BigNumber;
    chainPrice: FixedNumber;
    id: string;
    ticker: string;
    coingeckoId: string;
    defilamaId: string | null;
    revenue: string | null;
    mcap: FixedNumber;
    volume24h: FixedNumber;
    priceChange24h: FixedNumber;
    deviationPercent: FixedNumber;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type MultipoolAsset, type ExternalAsset, type SolidAsset };
