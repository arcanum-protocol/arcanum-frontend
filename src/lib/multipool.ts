import axios from 'axios';
import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { useQuery } from '@tanstack/react-query';
import type { MultipoolAsset } from '../types/multipoolAsset';
import { SolidAsset } from '../types/solidAsset';
import SCHEME from '../scheme.yaml';
import multipoolABI from '../abi/ETF';
import { useContractReads } from 'wagmi';
import { useContractRead } from 'wagmi';
import { parseEther } from 'viem';

export function useMultipoolData(
    multipool_id: String,
): {
    data: {
        assets: MultipoolAsset[],
        multipool: SolidAsset,
    } | undefined,
    isLoading: boolean,
    error: any,
} {

    const mp = SCHEME[multipool_id];

    const { data: context, isError: ctxIsError, isLoading: ctxIsLoading } = useContractRead({
        address: mp.address,
        abi: multipoolABI,
        functionName: 'getContext',
        args: [0],
        enabled: true,
        chainId: mp.chain_id,
        watch: true,
    });

    const { data: totalSupply, isError: tsIsError, isLoading: tsIsLoading } = useContractRead({
        address: mp.address,
        abi: multipoolABI,
        functionName: 'totalSupply',
        args: [],
        enabled: true,
        chainId: mp.chain_id,
        watch: true,
    });

    let assets: any = [];

    const { data: onchainData, isError: assetsIsError, isLoading: assetsIsLoading } = useContractReads({
        contracts: mp.assets.map(asset => {
            console.log(asset.address);
            return {
                address: mp.address,
                abi: multipoolABI,
                functionName: 'getAsset',
                args: [asset.address],
                chainId: mp.chain_id,
                enabled: true,
            }
        }),
        watch: true,
    });
    console.log(onchainData);
    if (onchainData)
        for (let i = 0; i < mp.assets.length; i++) {
            let asset = mp.assets[i];
            asset.onchain = onchainData[i].result;
            assets.push(asset);
        }

    const { data: geckoData, isLoading: geckoIsLoading } = useQuery(['assets'], async () => {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${assets.map(a => a.coingecko_id).join(",")
            }&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
        );
        return response.data;
    }, {
        refetchInterval: 10000,
        staleTime: 100000,
        cacheTime: 100000,
    });

    const { data: mpPriceData, isLoading: mpPriceIsLoading } = useQuery(['priceInfo'], async () => {
        const response = await axios.get(
            `https://api.arcanum.to/api/stats?multipool_id=${multipool_id}`,
        );
        console.log("DATA", response);
        return response.data;
    }, {
        refetchInterval: 10000,
        staleTime: 100000,
        cacheTime: 100000,
    });

    if (ctxIsLoading || assetsIsLoading || tsIsLoading || geckoIsLoading)
        return {
            data: undefined,
            isLoading: ctxIsLoading || assetsIsLoading || tsIsLoading || geckoIsLoading,
            error: undefined,
        };

    const multipool = {
        assetAddress: mp.address,
        routerAddress: mp.router_address,
        name: mp.name,
        chainId: Number(mp.chain_id),
        symbol: mp.name,
        totalSupply: BigNumber.from(totalSupply || '0'),
        low24h: Number(mpPriceData?.low_24h || '0'),
        high24h: Number(mpPriceData?.high_24h || '0'),
        change24h: Number(mpPriceData?.change_24h || '0'),
        price: Number(mpPriceData?.current_price || '0'),
        logo: '/logo.svg',
    };

    console.log(geckoData);
    if (geckoData)
        for (let i = 0; i < assets.length; i++) {
            console.log(assets[i].coingecko_id, geckoData[assets[i].coingecko_id]);
            assets[i].gecko = geckoData[assets[i].coingecko_id];
        }

    const processedAssets = assets.map(asset => {
        const currentShare = asset.onchain == undefined ? 0 : Number(asset.onchain.price * asset.onchain.quantity / context.usdCap) * 100 / Number(parseEther('1'));
        console.log(context);
        const idealShare = asset.onchain == undefined ? 0 : Number(asset.onchain.share * parseEther('1') / context.totalTargetShares) * 100 / Number(parseEther('1'));
        console.log(idealShare);
        return {
            name: asset.symbol,
            symbol: asset.symbol,
            assetAddress: asset.address,
            currentShare: FixedNumber.from(currentShare.toString()),
            idealShare: FixedNumber.from(idealShare.toString()),
            price: FixedNumber.from(asset?.gecko?.usd.toString() || 0),
            quantity: BigNumber.from(asset?.onchain?.quantity || 0),
            logo: asset.logo,
            multipoolAddress: mp.address,
            assetId: asset.symbol,
            decimals: asset?.onchain?.decimals || 18,
            chainPrice: asset?.onchain?.price || 0,
            id: asset.symbol,
            coingeckoId: asset.coingecko_id,
            defilamaId: asset.defilama_id,
            revenue: null,
            mcap: FixedNumber.from(asset?.gecko?.usd_market_cap.toString() || 0),
            volume24h: FixedNumber.from(asset?.gecko?.usd_24h_vol.toString() || 0),
            priceChange24h: FixedNumber.from(asset?.gecko?.usd_24h_change.toString() || 0),
            deviationPercent: FixedNumber.from(currentShare.toString()).subUnsafe(FixedNumber.from(idealShare.toString())),
            ticker: asset.symbol,
        };
    });



    return {
        data: {
            assets: processedAssets,
            multipool: multipool,
        },
        isLoading: ctxIsLoading || assetsIsLoading,
        error: undefined,
    }
}
