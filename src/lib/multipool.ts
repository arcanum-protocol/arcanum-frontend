import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { fetchEnsAddress } from '@wagmi/core';

export interface MultipoolAsset {
    assetAddress: string,
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

export interface SolidAsset {
    assetAddress: string,
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

export const routerAddress = '0xBd16d2Bf77b7Ae6c2d186E9AD3A599Abdedbb8da';
export const multipoolAddress = '0x3a57210dc2cb93eb8e18055308f51ee2a20a3c38';

export const etfAssetOrigin = 'https://api.arcanum.to/api/multipool/info';

export async function fetchAssets(
    address: String = multipoolAddress,
    etfAssetUrl: String = etfAssetOrigin,
): Promise<{ assets: MultipoolAsset[], multipool: SolidAsset }> {
    const response = await fetch(`${etfAssetUrl}?address=${address}`, {
        mode: 'cors'
    });
    if (response.status !== 200 && response.status !== 304) {
        throw 'unable to fetch api';
    }
    let { assets: fetched_assets, multipool: fetched_multipool } = (await response.json());

    let total_cap = FixedNumber.fromString("0");
    let total_ideal_share = FixedNumber.fromString("0");

    fetched_assets.forEach((a: any) => {
        total_cap = total_cap.addUnsafe(FixedNumber.from(BigNumber.from(a.quantity).mul(BigNumber.from(10).pow(BigNumber.from(18 - a.decimals)))).mulUnsafe(FixedNumber.from(a.chain_price)));
        total_ideal_share = total_ideal_share.addUnsafe(FixedNumber.from(a.ideal_share));
    });

    return {
        assets: fetched_assets.map((a: any): MultipoolAsset => {
            const currentShare = total_cap.isZero() ? FixedNumber.from(0) : FixedNumber.from(BigNumber.from(a.quantity).mul(BigNumber.from(10).pow(BigNumber.from(18 - a.decimals)))).mulUnsafe(FixedNumber.fromString("100")).mulUnsafe(FixedNumber.from(a.chain_price)).divUnsafe(total_cap);
            const idealShare = total_ideal_share.isZero() ? FixedNumber.from(0) : FixedNumber.from(a.ideal_share).mulUnsafe(FixedNumber.fromString("100")).divUnsafe(total_ideal_share);
            return {
                name: a.name,
                symbol: a.symbol,
                assetAddress: a.asset_address,
                currentShare: currentShare,
                idealShare: idealShare,
                price: a.price,
                quantity: BigNumber.from(a.quantity),
                logo: a.logo,
                multipoolAddress: a.multipool_address,
                assetId: a.asset_id,
                decimals: a.decimals,
                chainPrice: a.chain_price,
                id: a.id,
                coingeckoId: a.coingecko_id,
                defilamaId: a.defilama_id,
                revenue: null,
                mcap: FixedNumber.from(a.mcap),
                volume24h: FixedNumber.from(a.volume_24h),
                priceChange24h: a.price_change_24h,
                deviationPercent: currentShare.subUnsafe(idealShare),
                ticker: a.ticker
            };
        }),
        multipool: {
            assetAddress: fetched_multipool.address,
            name: fetched_multipool.name,
            chainId: Number(fetched_multipool.chain),
            symbol: fetched_multipool.symbol,
            totalSupply: fetched_multipool.total_supply,
            low24h: Number(fetched_multipool.low_24h),
            high24h: Number(fetched_multipool.high_24h),
            change24h: Number(fetched_multipool.change_24h),
            price: Number(fetched_multipool.current_price),
            logo: null,
        },
    };
}
