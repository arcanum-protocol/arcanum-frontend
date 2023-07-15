import { BigNumber, FixedNumber } from '@ethersproject/bignumber';

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
    price: FixedNumber,
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
    price: FixedNumber,
    logo: string | null,
}

export const routerAddress = '0x6c0528008A74AcCfF3A203670E94ddD822D8Cb44';
export const multipoolAddress = '0x33657896740F7BA132553EeE2efF38C8748F035C';

export const ArbiAsset: SolidAsset = {
    assetAddress: multipoolAddress,
    name: "Arbitrum altcoin index",
    symbol: "ARBI",
    price: FixedNumber.fromString("0"),
    logo: null,
};

export const etfAssetOrigin = 'https://arcanum.to/api/etf/info';

export async function fetchAssets(address: String = multipoolAddress, etfAssetUrl: String = 'https://arcanum.to/api/etf/info') {
    const response = await fetch(`${etfAssetUrl}?address=${address}`, {
        mode: 'cors'
    });
    if (response.status !== 200) {
        return;
    }
    let fetched_assets = (await response.json()).assets;

    let total_cap = FixedNumber.from(0);
    let total_ideal_share = FixedNumber.from(0);

    fetched_assets.forEach((a: any) => {
        total_cap = total_cap.addUnsafe(FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.chain_price)));
        total_ideal_share = total_ideal_share.addUnsafe(FixedNumber.from(a.ideal_share));
    });

    return fetched_assets.map((a: any): MultipoolAsset => {
        return {
            name: a.name,
            symbol: a.symbol,
            assetAddress: a.asset_address,
            currentShare: total_cap.isZero() ? FixedNumber.from(0) : FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.price)).divUnsafe(total_cap),
            idealShare: total_ideal_share.isZero() ? FixedNumber.from(0) : FixedNumber.from(a.ideal_share).divUnsafe(total_ideal_share),
            price: FixedNumber.from(a.price),
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
            deviationPercent: FixedNumber.from(a.quantity).mulUnsafe(FixedNumber.from(a.chain_price)).divUnsafe(total_cap).subUnsafe(FixedNumber.from(a.ideal_share).divUnsafe(total_ideal_share)),
            ticker: a.ticker
        };
    }).sort((a: MultipoolAsset, b: MultipoolAsset): number => Math.abs(b.idealShare.subUnsafe(b.currentShare).toUnsafeFloat()) - Math.abs(a.idealShare.subUnsafe(a.currentShare).toUnsafeFloat()));
}
