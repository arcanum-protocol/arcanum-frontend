import { Address } from 'viem';


interface BaseAsset {
    symbol: string;
    decimals: number;
    logo: string | undefined;
    address: Address | undefined;
    balance?: bigint;
    userQuantity?: bigint;
    type: "solid" | "multipool" | "external";
}

interface ExternalAsset extends BaseAsset {}

interface SolidAssetSpecific {
    routerAddress: string;
    totalSupply: bigint;
    low24h: number;
    high24h: number;
    change24h: number;
    chainId: number;
}

type SolidAsset = BaseAsset & SolidAssetSpecific;

interface MultipoolAssetSpecific {
    multipoolAddress: string;
    multipoolQuantity: bigint;
    idealShare: bigint;
    chainPrice: bigint;
    collectedCashbacks: bigint;
    deviationPercent?: bigint;
    priceChange24h?: bigint;
    volume24h?: bigint;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type BaseAsset, type MultipoolAsset, type ExternalAsset, type SolidAsset };
