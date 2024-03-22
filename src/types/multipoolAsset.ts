import BigNumber from 'bignumber.js';
import { Address } from 'viem';


interface BaseAsset {
    symbol: string;
    decimals: number;
    logo: string | undefined;
    address: Address;
    type: "solid" | "multipool" | "external";
}

interface ExternalAsset extends BaseAsset {
    price: BigNumber;
}

interface SolidAssetSpecific {
    routerAddress: string;
    chainId: number;
}

type SolidAsset = BaseAsset & SolidAssetSpecific;

interface MultipoolAssetSpecific {
    multipoolAddress: string;
    multipoolQuantity: BigNumber;
    idealShare?: BigNumber;
    currentShare?: BigNumber;
    collectedCashbacks: BigNumber;
}

type MultipoolAsset = BaseAsset & MultipoolAssetSpecific;

export { type BaseAsset, type MultipoolAsset, type ExternalAsset, type SolidAsset };
