import { BigNumber } from "@ethersproject/bignumber";

interface SolidAsset {
    assetAddress: string,
    routerAddress: string,
    name: string,
    symbol: string,
    price: Number,
    logo: string | null,
    totalSupply: BigNumber,
    low24h: Number,
    high24h: Number,
    change24h: Number,
    chainId: Number,
}

export { SolidAsset };
