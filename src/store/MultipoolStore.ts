import { MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { Address, getContract } from 'viem';
import { publicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import { fromX32 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import SCHEME from '../scheme.yaml';
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
    assets: (MultipoolAsset | SolidAsset)[] = [];

    multipool_id: string;
    datafeedUrl = 'https://api.arcanum.to/api/tv';

    inputAsset: MultipoolAsset | SolidAsset | undefined;
    outputAsset: MultipoolAsset | SolidAsset | undefined;

    inputQuantity: BigNumber | undefined;
    outputQuantity: BigNumber | undefined;

    constructor(mp_id: string) {
        this.multipool_id = mp_id;

        this.staticData = SCHEME[this.multipool_id];
        this.multipool = getContract({
            address: this.staticData.address,
            abi: multipoolABI,
            publicClient: this.publicClient
        });

        this.assets = [...this.assets, {
            name: this.staticData.name,
            symbol: this.staticData.name,
            decimals: 18,
            logo: this.staticData.logo,
            address: this.staticData.address,
            type: "solid",
        } as SolidAsset];

        this.getFees();
        this.getAssets().then(() => {
            this.updatePrices();
            this.updateMultipoolPriceData();

            runInAction(() => {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.assets[1];
            });
        });

        setInterval(() => {
            this.updatePrices();
            this.updateMultipoolPriceData();
        }, 30000);


        makeAutoObservable(this, {}, { autoBind: true });
    }

    get getRouter(): Address {
        return this.staticData.router;
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
            logo: string | undefined;
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

            if (token.address?.toString() === this.multipool.address.toString()) continue;

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
            this.assets = [..._assets, ...this.assets]
        });
    }

    async updatePrices() {
        const addresses: Array<string> = this.assets.map((asset: any) => {
            return asset.address as string;
        });

        const addressToPrice = new Map<string, number>();

        for (const address of addresses) {
            if (address === this.multipool.address.toString()) continue;

            const price = await this.multipool.read.getPrice([address as Address]);
            addressToPrice.set(address, Number(price.toString()));
        }

        runInAction(() => {
            this.assets = this.assets.map((asset) => {
                if (asset.address === this.multipool.address.toString()) return asset;
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
            const multipoolID = this.assets.findIndex((asset) => asset.type === "solid");
            
            this.assets[multipoolID] = {
                ...this.assets[multipoolID],
                low24h: Number(response.low_24h),
                high24h: Number(response.high_24h),
                change24h: Number(response.change_24h),
                totalSupply: Number(response.total_supply),
                price: Number(response.current_price),
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
            // console.log("res", res);
        });
    }

    // setInputAssetQuantity(
    //     quantity: string,
    // ) {
    //     const decimals 
    // }

    setInputAsset(
        asset: MultipoolAsset | SolidAsset,
    ) {
        this.inputAsset = asset;
    }

    setOutputAsset(
        asset: MultipoolAsset | SolidAsset,
    ) {
        this.outputAsset = asset;
    }

    setAction(
        action: "mint" | "burn" | "swap",
    ) {
        if (action === "mint") {
            this.inputAsset = this.assets[0];
            this.outputAsset = this.assets[1];
        }

        if (action === "burn") {
            this.inputAsset = this.assets[1];
            this.outputAsset = this.assets[0];
        }

        if (action === "swap") {
            this.inputAsset = this.assets[0];
            this.outputAsset = this.assets[1];
        }
    }

    get currentShares() {
        if (this.assets.length === 0) return new Map<string, BigNumber>();
        const multipoolAssets = this.assets.filter((asset) => asset.type === "multipool") as MultipoolAsset[];

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            const assetPrice = new BigNumber(asset.price?.toString() ?? 0);
            return acc.plus(assetPrice.times(asset.quantity) ?? new BigNumber(0));
        }, new BigNumber(0));

        const addressToShare = new Map<string, BigNumber>();

        for (const asset of multipoolAssets) {
            if (asset.price === undefined) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }
            if (asset.quantity.eq(0)) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }

            const assetPrice = new BigNumber(asset.price?.toString() ?? 0);

            addressToShare.set(asset.address!, assetPrice.times(asset.quantity).div(totalDollarValue).times(100) ?? new BigNumber(0));
        }

        return addressToShare;
    }
}

export const multipool = new MultipoolStore("arbi");
