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
}

export const routerAddress = '0xBd16d2Bf77b7Ae6c2d186E9AD3A599Abdedbb8da';
export const multipoolAddress = '0x3a57210dc2cb93eb8e18055308f51ee2a20a3c38';

export const etfAssetOrigin = 'https://arcanum.to/api/multipool/info';

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
        total_cap = total_cap.addUnsafe(FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.chain_price)));
        total_ideal_share = total_ideal_share.addUnsafe(FixedNumber.from(a.ideal_share));
    });

    console.log(fetched_assets);
    return {
        assets: fetched_assets.map((a: any): MultipoolAsset => {
            return {
                name: a.name,
                symbol: a.symbol,
                assetAddress: a.asset_address,
                currentShare: total_cap.isZero() ? FixedNumber.from(0) : FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.price)).divUnsafe(total_cap),
                idealShare: total_ideal_share.isZero() ? FixedNumber.from(0) : FixedNumber.from(a.ideal_share).divUnsafe(total_ideal_share),
                price: a.price,
                quantity: BigNumber.from(a.quantity),
                logo: a.logo,
                multipoolAddress: a.multipool_address,
                assetId: a.asset_id,
                chainPrice: a.chain_price,
                id: a.id,
                coingeckoId: a.coingecko_id,
                defilamaId: a.defilama_id,
                revenue: null,
                mcap: FixedNumber.from(a.mcap),
                volume24h: FixedNumber.from(a.volume_24h),
                priceChange24h: a.price_change_24h,
                deviationPercent: !total_cap.isZero() && !total_ideal_share.isZero() ?
                    FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.chain_price))
                        .divUnsafe(total_cap).subUnsafe(FixedNumber.from(a.ideal_share).divUnsafe(total_ideal_share)) :
                    FixedNumber.from("0"),
                ticker: a.ticker
            };
        }).sort((a: MultipoolAsset, b: MultipoolAsset): number => Math.abs(b.idealShare.subUnsafe(b.currentShare).toUnsafeFloat()) - Math.abs(a.idealShare.subUnsafe(a.currentShare).toUnsafeFloat())),
        multipool: {
            assetAddress: fetched_multipool.address,
            name: fetched_multipool.name,
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
