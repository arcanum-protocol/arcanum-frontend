import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { useQuery } from '@tanstack/react-query';
import type { MultipoolAsset } from '../types/multipoolAsset';
import { SolidAsset } from '../types/multipoolAsset';
import SCHEME from '../scheme.yaml';
import multipoolABI from '../abi/ETF';
import { useContractReads } from 'wagmi';
import { useContractRead } from 'wagmi';
import { Address, parseEther } from 'viem';

export function useMultipoolData(
    multipool_id: string,
    params: {
        enabled: boolean,
    } = {
        enabled: true,
    }
): {
    data: {
        assets: MultipoolAsset[],
        multipool: SolidAsset,
    } | undefined,
    isLoading: boolean,
    error: any,
} {
    const mp = SCHEME[multipool_id];

    const { data: _context, isLoading: ctxIsLoading, error: contextError } = useContractRead({
        address: mp.address,
        abi: multipoolABI,
        functionName: 'getContext',
        args: [0],
        enabled: params.enabled,
        chainId: mp.chain_id,
        watch: params.enabled,
    });
    const context = _context as any;

    const { data: totalSupply, isLoading: tsIsLoading, error: supplyError } = useContractRead({
        address: mp.address,
        abi: multipoolABI,
        functionName: 'totalSupply',
        args: [],
        enabled: params.enabled,
        chainId: mp.chain_id,
        watch: true,
    });

    let assets: any = [];

    const { data: onchainData, isLoading: assetsIsLoading, error: assetError } = useContractReads({
        contracts: mp.assets.map((asset: any) => {
            return {
                address: mp.address,
                abi: multipoolABI,
                functionName: 'getAsset',
                args: [asset.address],
                chainId: mp.chain_id,
                enabled: params.enabled,
            }
        }),
        watch: params.enabled,
    });

    if (onchainData)
        for (let i = 0; i < mp.assets.length; i++) {
            let asset = mp.assets[i];
            asset.onchain = onchainData[i].result;
            assets.push(asset);
        }

    const { data: geckoData, isLoading: geckoIsLoading } = useQuery(['assets'], async () => {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${assets.map((a: any) => a.coingecko_id).join(",")
            }&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
        );
        return response.data;
    }, {
        refetchInterval: 20000,
        enabled: params.enabled,
    });

    const { data: mpPriceData } = useQuery(['priceInfo'], async () => {
        const response = await axios.get(
            `https://api.arcanum.to/api/stats?multipool_id=${multipool_id}`,
        );
        return response.data;
    }, {
        refetchInterval: 20000,
        enabled: params.enabled,
    });

    const multipool = {
        address: mp.address,
        routerAddress: mp.router_address,
        name: mp.name,
        chainId: Number(mp.chain_id),
        symbol: mp.name,
        totalSupply: new BigNumber(totalSupply as any || '0'),
        low24h: Number(mpPriceData?.low_24h || '0'),
        high24h: Number(mpPriceData?.high_24h || '0'),
        change24h: Number(mpPriceData?.change_24h || '0'),
        price: Number(mpPriceData?.current_price || '0'),
        logo: '/logo.svg',
    };

    if (geckoData)
        for (let i = 0; i < assets.length; i++) {
            assets[i].gecko = geckoData[assets[i].coingecko_id];
        }

    const processedAssets = assets.map((asset: any) => {
        const currentShare = asset.onchain == undefined ? 0 : Number(asset.onchain.price * asset.onchain.quantity / context.usdCap) * 100 / Number(parseEther('1'));
        const idealShare = asset.onchain == undefined ? 0 : Number(asset.onchain.share * parseEther('1') / context.totalTargetShares) * 100 / Number(parseEther('1'));
        return {
            name: asset.symbol,
            symbol: asset.symbol,
            address: asset.address,
            currentShare: new BigNumber(currentShare.toString()),
            idealShare: new BigNumber(idealShare.toString()),
            price: new BigNumber(asset?.gecko?.usd.toString() || 0),
            quantity: new BigNumber(asset?.onchain?.quantity || 0),
            logo: asset.logo,
            multipoolAddress: mp.address,
            assetId: asset.symbol,
            decimals: asset?.onchain?.decimals || 18,
            chainPrice: asset?.onchain?.price || 0,
            id: asset.symbol,
            coingeckoId: asset.coingecko_id,
            defilamaId: asset.defilama_id,
            revenue: null,
            mcap: new BigNumber(asset?.gecko?.usd_market_cap.toString() || 0),
            volume24h: new BigNumber(asset?.gecko?.usd_24h_vol.toString() || 0),
            priceChange24h: new BigNumber(asset?.gecko?.usd_24h_change.toString() || 0),
            deviationPercent: new BigNumber(currentShare.toString()).minus(new BigNumber(idealShare.toString())),
            ticker: asset.symbol,
        };
    });

    return {
        data: {
            assets: processedAssets,
            multipool: multipool as unknown as SolidAsset,
        },
        isLoading: ctxIsLoading || assetsIsLoading || tsIsLoading || geckoIsLoading,
        error: contextError || supplyError || assetError,
    }
}

export function useMultipoolPrice(multipoolId: string,
    params: {
        enabled: boolean,
    } = {
        enabled: true,
    }): {
    data: {
        address: Address,
        price: BigNumber,
        tokens: {
            address: Address,
            multipoolBalance: BigNumber,
            price: BigNumber
        }[],
        totalSupply: BigNumber
    } | undefined
} {
    const multipoolScheme = SCHEME[multipoolId];

    const assets = multipoolScheme.assets;
    const tokens = [];

    for (const asset of assets) {
        const { data } = useContractRead({
            address: multipoolScheme.address,
            abi: multipoolABI,
            functionName: 'assets',
            args: [asset.address],
            chainId: multipoolScheme.chain_id,
            enabled: params.enabled,
        });

        if (!data) continue;

        const tokenBalance = new BigNumber((data as unknown as any)[0]);
        const tokenPrice = new BigNumber((data as unknown as any)[1]);

        if (tokenBalance.isZero()) continue;

        tokens.push({
            address: asset.address,
            multipoolBalance: tokenBalance,
            price: tokenPrice,
        });
    }

    const { data: totalSupplyRaw } = useContractRead({
        address: multipoolScheme.address,
        abi: multipoolABI,
        functionName: 'totalSupply',
        chainId: multipoolScheme.chain_id,
        enabled: params.enabled,
    });

    const { data: usdCapRaw } = useContractRead({
        address: multipoolScheme.address,
        abi: multipoolABI,
        functionName: 'usdCap',
        chainId: multipoolScheme.chain_id,
        enabled: params.enabled,
    });

    const totalSupply = new BigNumber(totalSupplyRaw as any);
    const usdCap = new BigNumber(usdCapRaw as any);

    return {
        data: {
            address: multipoolScheme.address,
            price: usdCap.div(totalSupply),
            tokens: tokens as any,
            totalSupply,
        },
    };
}

export function getMassiveMintRouter() {
    return SCHEME['arbi'].massive_mint_address;
}

export function getMultipoolAddress(multipoolId: string) {
    return SCHEME[multipoolId].address;
}
