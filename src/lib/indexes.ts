import type { Index, IndexAsset } from "$types";
import { FixedNumber } from "@ethersproject/bignumber";

export interface IndexAsset {
    name: string;
    coingecko_id: string;
    defilama_id: string | null;
    share: number;
    market_cap: number;
    revenue: number | null;
    price: number;
    change_24h: number;
    vol_24h: number;
    logo: string;
}

export interface Index {
    name: string;
    symbol: string;
    description: string;
    price_change_24h: number;
    price_change_24h_rel: number;
    aggregation_type: string;
    assets: Array<IndexAsset>;
}


export const indexOrigin = "https://arcanum.to/api/index/info";

export async function fetchIndex(index_id: number, io = indexOrigin): Promise<Index> {
    const response = await fetch(io + "?" + new URLSearchParams({
        id: index_id.toString()
    }), {
        mode: "cors"
    });
    const fetched_index = await response.json();
    const index = fetched_index.index;
    let asset = fetched_index.assets;
    let total_val = FixedNumber.from(0);
    if (index.alg == "mcap") {
        asset.forEach((a) => total_val = total_val.addUnsafe(FixedNumber.from(a.mcap)));
    } else if (index.alg == "revenue") {
        asset.forEach((a) => total_val = total_val.addUnsafe(FixedNumber.from(a.revenue)));
    } else {
        throw "unknown index algorithm";
    }
    let assets: Array<IndexAsset> = asset.map((a: any): IndexAsset => {
        let v = FixedNumber.from(a.mcap);
        let share_val;
        if (index.alg == "mcap") {
            share_val = a.mcap;
        } else if (index.alg == "revenue") {
            share_val = a.revenue;
        } else {
            throw "unknown index algorithm";
        }
        return {
            name: a.name,
            share: FixedNumber.from(share_val).mulUnsafe(FixedNumber.from(100000000)).divUnsafe(total_val).toUnsafeFloat() / 1000000,
            price: parseFloat(a.price),
            market_cap: parseFloat(a.mcap),
            coingecko_id: a.coingecko_id,
            defilama_id: a.defilama_id,
            revenue: a.revenue,
            logo: a.logo,
            vol_24h: parseFloat(a.volume_24h),
            change_24h: parseFloat(a.price_change_24h)
        };
    }).sort((a: IndexAsset, b: IndexAsset): number => b.market_cap - a.market_cap);
    return {
        name: index.name,
        symbol: index.symbol,
        description: index.description,
        price_change_24h: index.price_change_24h || 0,
        price_change_24h_rel: index.price_change_24h_rel || 0,
        aggregation_type: index.alg,
        assets: assets
    };
}
