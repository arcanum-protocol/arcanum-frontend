import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

interface MultipoolAsset {
    address: string,
    multipoolAddress: string,
    assetId: string,
    idealShare: FixedNumber,
    currentShare: FixedNumber,
    quantity: BigNumber,
    chainPrice: FixedNumber,
    id: string,
    name: string,
    symbol: string,
    decimals: number,
    ticker: string,
    coingeckoId: string,
    defilamaId: string | null,
    price: Number,
    revenue: string | null,
    mcap: FixedNumber,
    volume24h: FixedNumber,
    logo: string | null,
    priceChange24h: FixedNumber,
    deviationPercent: FixedNumber,
}

export { type MultipoolAsset };
