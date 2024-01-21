import { MultipoolAsset } from '@/types/multipoolAsset';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Address } from 'viem';
import yaml from 'yamljs';

// once-call
async function getMultipool(multipoolId: string) {
    const staticDataResponce = await axios.get(`https://app.arcanum.to/api/${multipoolId}.yaml`);
    const data = yaml.parse(staticDataResponce.data);

    const { name, address, router_address, logo, assets } = data;

    const assetsStaticData: MultipoolAsset[] = assets.map((asset: any) => {
        const { symbol, decimals, address, logo } = asset;
        return {
            symbol: symbol,
            decimals: decimals,
            address: address,
            logo: logo,
            type: "multipool",
        } as MultipoolAsset;
    });

    return {
        multipool: {
            name: name as string,
            address: address as Address,
            router: router_address as Address,
            logo: logo as string,
            assets: assetsStaticData,
        }
    }
}

// continiously-call
async function getMultipoolMarketData(multipoolId: string) {
    const responce = await axios.get(`https://api.arcanum.to/api/stats?multipool_id=${multipoolId}`);
    const data = await responce.data;

    return {
        change24h: Number(data.change_24h),
        low24h: Number(data.low_24h),
        high24h: Number(data.high_24h),
        price: Number(data.current_price),
    }
}

// continiously-call
async function getEtherPrice() {
    const responce = await axios.get(`https://token-rates-aggregator.1inch.io/v1.0/native-token-rate?vs=USD`);
    const data = await responce.data;

    return Number(data["42161"]["USD"]);
}

// continiously-call
async function getSignedPrice(multipoolId: string) {
    const responce = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${multipoolId}`);
    const data = await responce.data;

    return BigNumber(data.sharePrice);
}

async function fetchFarms() {
    const farms = await axios.get(`https://app.arcanum.to/api/farms.yaml`);
    // parse farms
    const data = yaml.parse(farms.data);
    return data;
}

export { getMultipool, getMultipoolMarketData, getEtherPrice, getSignedPrice, fetchFarms };

