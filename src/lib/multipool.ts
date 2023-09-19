import axios from 'axios';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useQuery } from '@tanstack/react-query';
import type { MultipoolAsset } from '../types/multipoolAsset';
import { SolidAsset } from '../types/solidAsset';


export const routerAddress = '0xBd16d2Bf77b7Ae6c2d186E9AD3A599Abdedbb8da';
export const multipoolAddress = '0x3a57210dc2cb93eb8e18055308f51ee2a20a3c38';
export const etfAssetOrigin = 'https://api.arcanum.to/api/multipool/info';

export function useFetchAssets(
    address: string = multipoolAddress,
    etfAssetUrl: string = etfAssetOrigin,
): {
    data: {
        assets: MultipoolAsset[],
        multipool: SolidAsset,
    } | undefined,
    isLoading: boolean,
    error: any,
} {
    if (address === "") {
        address = multipoolAddress;
    }
    return useQuery(['assets'], async () => {
        console.log('fetching assets', address, etfAssetUrl);
        const response = await axios.get(`${etfAssetUrl}?address=${address}`);
        const { assets: fetched_assets, multipool: fetched_multipool } = response.data;

        let total_cap = FixedNumber.fromString("0");
        let total_ideal_share = FixedNumber.fromString("0");

        fetched_assets.forEach((a: any) => {
            total_cap = total_cap.addUnsafe(FixedNumber.from(BigNumber.from(a.quantity).mul(BigNumber.from(10).pow(BigNumber.from(18)))).mulUnsafe(FixedNumber.from(a.chain_price)));
            total_ideal_share = total_ideal_share.addUnsafe(FixedNumber.from(a.ideal_share));
        });

        const assets = fetched_assets.map((a: any): MultipoolAsset => {
            const currentShare = total_cap.isZero() ? FixedNumber.from(0) : FixedNumber.from(BigNumber.from(a.quantity).mul(BigNumber.from(10).pow(BigNumber.from(18)))).mulUnsafe(FixedNumber.fromString("100")).mulUnsafe(FixedNumber.from(a.chain_price)).divUnsafe(total_cap);
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
        });

        const multipool = {
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
        }

        return {
            assets: assets,
            multipool: multipool
        };
    }, {
        refetchInterval: 10000,
        staleTime: 100000,
        cacheTime: 100000,
    });
}
