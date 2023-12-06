import { BigNumber } from "bignumber.js";
import { Address } from 'viem';


interface BaseAsset {
    name: string;
    symbol: string;
    decimals: number;
    logo: string | undefined;
    address: Address | undefined;
    price?: number;
    balance?: BigNumber;
    quantity: BigNumber;
    type: "solid" | "multipool" | "external";
}

interface ExternalAsset extends BaseAsset {}

interface SolidAssetSpecific {
    routerAddress: string;
    totalSupply: number;
    low24h: number;
    high24h: number;
    change24h: number;
    chainId: number;
}

type SolidAsset = BaseAsset & SolidAssetSpecific;

interface MultipoolAssetSpecific {
    multipoolAddress: string;
    idealShare: BigNumber;
    chainPrice: BigNumber;
    coingeckoId: string;
    collectedCashbacks: BigNumber;
    deviationPercent?: BigNumber;
    priceChange24h?: BigNumber;
    volume24h?: BigNumber;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type BaseAsset, type MultipoolAsset, type ExternalAsset, type SolidAsset };
