import { MultipoolAsset } from '@/types/multipoolAsset';
import axios from 'axios';
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
        name: name,
        address: address,
        router: router_address,
        logo: logo,
        assets: assetsStaticData,
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

export { getMultipool, getMultipoolMarketData };
