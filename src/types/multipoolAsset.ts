import { BigNumber } from "bignumber.js";

interface BaseAsset {
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    address: string | undefined;
    price?: BigNumber;
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
    idealShare: BigNumber;
    quantity: BigNumber;
    chainPrice: BigNumber;
    coingeckoId: string;
    collectedCashbacks: BigNumber;
    deviationPercent?: BigNumber;
    priceChange24h?: BigNumber;
    volume24h?: BigNumber;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type BaseAsset, type MultipoolAsset, type ExternalAsset, type SolidAsset };
