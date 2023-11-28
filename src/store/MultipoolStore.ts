import { makeAutoObservable, runInAction } from 'mobx';
import { publicClient } from '@/config';
import { Address, getContract } from 'viem';
import SCHEME from '../scheme.yaml';
import multipoolABI from '../abi/ETF';
import { fromX32 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { MultipoolAsset } from '@/types/multipoolAsset';
import axios from 'axios';

export interface MultipoolFees {
    deviationParam: BigNumber;
    deviationLimit: BigNumber;
    depegBaseFee: BigNumber;
    baseFee: BigNumber;
}

export interface fpSharePrice {
    thisAddress: Address;
    timestamp: BigNumber;
    value: BigNumber;
    signature: Address;
}

export interface assetArgs {
    addr: Address;
    amount: BigNumber;
}

export interface priceChange {
    multipool_id: string;
    change_24h: number;
    low_24h: number;
    high_24h: number;
    current_price: number;
}

class MultipoolStore {
    private publicClient = publicClient({ chainId: 31337 });
    private staticData;

    multipool;
    fees: MultipoolFees = {
        deviationParam: BigNumber(0),
        deviationLimit: BigNumber(0),
        depegBaseFee: BigNumber(0),
        baseFee: BigNumber(0),
    };
    priceChange: priceChange = {
        multipool_id: "",
        change_24h: 0,
        low_24h: 0,
        high_24h: 0,
        current_price: 0
    };
    assets: MultipoolAsset[] = [];

    multipool_id: string;
    datafeedUrl = 'https://api.arcanum.to/api/tv';

    constructor(mp_id: string) {
        this.multipool_id = mp_id;

        this.staticData = SCHEME[this.multipool_id];
        this.multipool = getContract({
            address: this.staticData.address,
            abi: multipoolABI,
            publicClient: this.publicClient
        });

        this.getFees();
        this.getAssets().then(() => {
            this.updatePrices();
            this.updateMultipoolPriceData();
        });

        setInterval(() => {
            this.updatePrices();
            this.updateMultipoolPriceData();
        }, 30000);

        makeAutoObservable(this, {}, { autoBind: true });
    }

    async getFees() {
        const rawFees: [bigint, bigint, bigint, bigint] = await this.multipool.read.getFees() as [bigint, bigint, bigint, bigint];
        const fees = rawFees.map((fee) => {
            return fromX32(fee.toString());
        });

        runInAction(() => {
            this.fees = {
                deviationParam: new BigNumber((fees[0]).toString()),
                deviationLimit: new BigNumber((fees[1]).toString()),
                depegBaseFee: new BigNumber((fees[2]).toString()),
                baseFee: new BigNumber((fees[3]).toString()),
            };
        });
    }

    async getAssets() {
        const tokens: Array<{
            symbol: string;
            decimals: number;
            logo: string | null;
            address: string | undefined;
            coingecko_id: string;
        }> = this.staticData.assets.map((asset: any) => {
            return {
                symbol: asset.symbol,
                decimals: asset.decimals,
                logo: asset.logo,
                address: asset.address,
                coingecko_id: asset.coingecko_id
            };
        });

        const _assets: MultipoolAsset[] = [];
        const _totalTargetShares = await this.multipool.read.totalTargetShares();

        const totalTargetShares = new BigNumber(_totalTargetShares.toString());

        for (const token of tokens) {
            const asset = await this.multipool.read.getAsset([token.address as Address]);
            const chainPrice = await this.multipool.read.getPrice([token.address as Address]);

            const idealShare = new BigNumber(asset.share.toString()).div(totalTargetShares).times(100);
            const quantity = new BigNumber(asset.quantity.toString());


            _assets.push({
                name: token.symbol,
                symbol: token.symbol,
                decimals: token.decimals,
                logo: token.logo,
                address: token.address,
                type: "multipool",
                multipoolAddress: this.staticData.address,
                idealShare: idealShare,
                quantity: quantity,
                chainPrice: new BigNumber(chainPrice.toString()),
                coingeckoId: token.coingecko_id,
                collectedCashbacks: new BigNumber(asset.collectedCashbacks.toString())
            });
        }

        runInAction(() => {
            this.assets = _assets;
        });
    }

    async updatePrices() {
        const addresses: Array<string> = this.assets.map((asset: any) => {
            return asset.address as string;
        });

        const addressToPrice = new Map<string, BigNumber>();

        for (const address of addresses) {
            const price = await this.multipool.read.getPrice([address as Address]);
            addressToPrice.set(address, new BigNumber(price.toString()));
        }

        runInAction(() => {
            this.assets = this.assets.map((asset) => {
                return {
                    ...asset,
                    price: addressToPrice.get(asset.address!)!
                };
            });
        });
    }

    async updateMultipoolPriceData() {
        const _response = await axios.get(`https://api.arcanum.to/api/stats?multipool_id=${this.staticData.name}`);

        const response = _response.data;

        runInAction(() => {
            this.priceChange = {
                multipool_id: response.multipool_id,
                change_24h: Number(response.change_24h),
                low_24h: Number(response.low_24h),
                high_24h: Number(response.high_24h),
                current_price: Number(response.current_price)
            };
        });
    }

    checkSwap(
        selectedAssets: assetArgs[],
        isSlippageReversed: boolean,
    ) {
        const fpSharePricePlaceholder = {
            thisAddress: "0x0000000000000000000000000000000000000000" as Address,
            timestamp: BigInt("0") as bigint,
            value: BigInt("0") as bigint,
            signature: "0x0000000000000000000000000000000000000000" as Address
        };
        
        const _selectedAssets = selectedAssets.map((asset) => {
            return {
                addr: asset.addr,
                amount: BigInt(asset.amount.toString())
            };
        }) as readonly { addr: Address; amount: bigint }[];

        this.multipool.read.checkSwap(
            [
                fpSharePricePlaceholder,
                _selectedAssets,
                isSlippageReversed
            ]
        ).then((res) => {
            console.log("res", res);
        });
    }

    get currentShares() {
        if (this.assets.length === 0) return new Map<string, BigNumber>();

        const totalDollarValue = this.assets.reduce((acc, asset) => {
            return acc.plus(asset.price?.times(asset.quantity) ?? new BigNumber(0));
        }, new BigNumber(0));

        const addressToShare = new Map<string, BigNumber>();

        for (const asset of this.assets) {
            if (asset.price === undefined) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }
            if (asset.quantity.eq(0)) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }

            addressToShare.set(asset.address!, asset.price?.times(asset.quantity).div(totalDollarValue).times(100) ?? new BigNumber(0));
        }

        return addressToShare;
    }
}

export const multipool = new MultipoolStore("arbi");
