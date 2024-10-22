import { TokenProfile } from '@/types/arcanum';
import { MultipoolAsset } from '@/types/multipoolAsset';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Address } from 'viem';
import yaml from 'yamljs';

// once-call
async function getMultipool(multipoolId: string) {
    const staticDataResponce = await fetch(`/api/${multipoolId}.yaml`);
    const data = await staticDataResponce.text();
    const yamlParsed = yaml.parse(data);
    
    const { name, address, router_address, logo, assets } = yamlParsed;
    
    const newBackend = await fetch(`https://api.arcanum.to/oracle/v1/asset_list?multipool_address=${address}`);
    const jsonData = await newBackend.json();
    
    const actualAddress = jsonData as Address[];

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

    // filter out assets that are not in the actual address list
    const filteredAssets = assetsStaticData.filter((asset) => actualAddress.includes(asset.address.toLowerCase() as Address));

    return {
        name: name as string,
        address: address as Address,
        router: router_address as Address,
        logo: logo as string,
        assets: filteredAssets
    }
}

async function getAssetInfo(assetName: string): Promise<TokenProfile> {
    const name = assetName.toLowerCase();
    const responce = await fetch(`/api/profiles/${name}.yaml`);

    const data = await responce.text();
    const parsedData = yaml.parse(data);

    return parsedData;
}

// continiously-call
async function getMultipoolMarketData(multipoolAddress: Address) {
    const responce = await axios.get(`https://api.arcanum.to/api/tv/stats?multipool_id=${multipoolAddress}`);
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
    const responce = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`);
    const data = await responce.data;

    return Number(data["USD"]);
}

// continiously-call
async function getSignedPrice(multipoolAddress: Address) {
    const responce = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_address=${multipoolAddress}`);
    const data = await responce.data;

    return BigNumber(data.sharePrice);
}

export interface RootFarm {
    farms: { [key: string]: Farm };
}

export interface Farm {
    address: string;
}

async function fetchFarms() {
    const farms = await fetch(`/api/farms.yaml`);
    const blob = await farms.blob();
    const text = await blob.text();
    
    // parse farms
    const data = yaml.parse(text);

    return data as RootFarm;
}

// array of mp ids
async function getETFsPrice(mps: string[]) {
    const addressToPrice: Map<Address, number> = new Map();

    for (const mp of mps) {
        const multipool = await getMultipool(mp);
        const price = await getMultipoolMarketData(multipool.address);

        addressToPrice.set(multipool.address.toLowerCase() as Address, price.price);
        if (multipool.address.toLowerCase() == "0x4810e5a7741ea5fdbb658eda632ddfac3b19e3c6") { // delete this, just a ploaceholder for farming test
            addressToPrice.set("0x961fad7932e95018bac25ee3c7459c7002480671" as Address, price.price);
        }
        if (multipool.address.toLowerCase() == "0xbb5b3d9f6b57077b4545ea9879ee7fd0bdb08db0") {
            addressToPrice.set("0xa67554edfa8be9bf28d2086bdc1eaf5ac27bd008" as Address, price.price);
        }
    }


    return addressToPrice;
}

export { getMultipool, getMultipoolMarketData, getEtherPrice, getSignedPrice, fetchFarms, getETFsPrice, getAssetInfo };
