import { MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction } from 'mobx';
import { Address, getContract } from 'viem';
import { publicClient, anvil } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX32, fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import SCHEME from '../scheme.yaml';
import axios from 'axios';
import { encodeAbiParameters } from 'viem'
import { createWalletClient, custom } from 'viem'
import ERC20 from '@/abi/ERC20';

export interface MultipoolFees {
    deviationParam: BigNumber;
    deviationLimit: BigNumber;
    depegBaseFee: BigNumber;
    baseFee: BigNumber;
}

export interface fpSharePrice {
    thisAddress: Address;
    timestamp: bigint;
    value: bigint;
    signature: Address;
}

export interface assetArgs {
    addr: Address;
    amount: bigint;
}

export interface priceChange {
    multipool_id: string;
    change_24h: number;
    low_24h: number;
    high_24h: number;
    current_price: number;
}

export interface SwapArgs {
    fpSharePrice: fpSharePrice;
    selectedAssets: assetArgs[];
    isSleepageReverse: boolean;
    to: Address;
    refundTo: Address;
    ethValue: bigint;
}

class MultipoolStore {
    private publicClient = publicClient({ chainId: 31337 });
    private staticData;

    multipool;
    router;

    walletClient = createWalletClient({
        chain: anvil,
        transport: custom(window.ethereum),
    });

    fees: MultipoolFees = {
        deviationParam: BigNumber(0),
        deviationLimit: BigNumber(0),
        depegBaseFee: BigNumber(0),
        baseFee: BigNumber(0),
    };
    assets: (MultipoolAsset | SolidAsset)[] = [];
    assetsIsLoading: boolean = true;

    multipool_id: string;
    datafeedUrl = 'https://api.arcanum.to/api/tv';

    inputAsset: MultipoolAsset | SolidAsset | undefined;
    outputAsset: MultipoolAsset | SolidAsset | undefined;

    inputQuantity: BigNumber | undefined;
    outputQuantity: BigNumber | undefined;

    slippage: number = 0.5;

    selectedTab: "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" = "mint";
    selectedSCTab: "mint" | "burn" | "swap" = "mint";

    mainInput: "in" | "out" = "in";

    exchangeError: string | undefined;
    etherPrice: { [key: number]: number } = {};

    constructor(mp_id: string) {
        this.multipool_id = mp_id;

        this.staticData = SCHEME[this.multipool_id];

        this.multipool = getContract({
            address: this.staticData.address,
            abi: multipoolABI,
            publicClient: this.publicClient,
            walletClient: this.walletClient
        });

        this.router = getContract({
            address: this.staticData.router_address,
            abi: routerABI,
            publicClient: this.publicClient,
            walletClient: this.walletClient
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
            this.updateEtherPrice();

            runInAction(() => {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.assets[1];
                this.setSelectedTabWrapper("mint");

                this.assetsIsLoading = false;
            });
        });

        setInterval(() => {
            this.updatePrices();
            this.updateMultipoolPriceData();
            this.updateEtherPrice();
        }, 30000);


        makeAutoObservable(this, {}, { autoBind: true });
    }

    get getRouter(): Address {
        return this.staticData.router_address;
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
                address: token.address as Address,
                type: "multipool",
                multipoolAddress: this.staticData.address,
                idealShare: idealShare,
                quantity: quantity,
                chainPrice: new BigNumber(fromX96(chainPrice.toString())),
                coingeckoId: token.coingecko_id,
                collectedCashbacks: new BigNumber(asset.collectedCashbacks.toString())
            });

        }

        runInAction(() => {
            const mp = this.assets.find((asset) => asset.type === "solid") as SolidAsset;
            this.assets = [..._assets, mp]
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
            addressToPrice.set(address, new BigNumber(fromX96(price.toString())).toNumber());
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

    async checkSwap() {
        const isExactInput = this.mainInput === "out" ? false : true;

        if (this.inputQuantity === undefined && this.outputQuantity === undefined) return;

        let _fpSharePrice: any = (await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${this.multipool_id}`)).data;

        let fpSharePricePlaceholder: any;

        if (_fpSharePrice == null) {
            fpSharePricePlaceholder = {
                thisAddress: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(0),
                value: BigInt(0),
                signature: "0x0"
            };
        } else {
            fpSharePricePlaceholder = _fpSharePrice;
        }

        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();
        if (isExactInput) {
            selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed()));
            selectedAssets.set(this.outputAsset!.address!, BigInt("-1000000000000000000"));
        } else {
            selectedAssets.set(this.inputAsset!.address!, BigInt("1000000000000000000"));
            selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.multipliedBy(-1).toFixed()));
        }

        // sort by address, address is int
        const sortedAssets = new Map([...selectedAssets.entries()].sort((a, b) => {
            return BigInt(a[0]) > BigInt(b[0]) ? 1 : -1;
        }));

        const _selectedAssets: { addr: `0x${string}`; amount: bigint; }[] = [];

        for (const [address, amount] of sortedAssets) {
            _selectedAssets.push({
                addr: address,
                amount: amount
            });
        }

        try {
            const res = await this.multipool.read.checkSwap(
                [
                    fpSharePricePlaceholder,
                    _selectedAssets,
                    isExactInput
                ]);

            const estimates = res[1];
            const firstTokenQuantity = estimates[0];
            const secondTokenQuantity = estimates[1];

            const firstTokenAddress = sortedAssets.keys().next().value;

            runInAction(() => {

                if (this.mainInput === "in") {
                    if (firstTokenAddress === this.inputAsset?.address) {
                        this.outputQuantity = new BigNumber(secondTokenQuantity.toString());
                    } else {
                        this.outputQuantity = new BigNumber(firstTokenQuantity.toString());
                    }
                } else {
                    if (firstTokenAddress === this.outputAsset?.address) {
                        this.inputQuantity = new BigNumber(secondTokenQuantity.toString());
                    } else {
                        this.inputQuantity = new BigNumber(firstTokenQuantity.toString());
                    }
                }

                this.exchangeError = undefined;
            });

            return res;
        } catch (e) {
            runInAction(() => {
                // check if error contains 
                let errorString: string = (e as Error).toString();

                errorString = errorString.replace("ContractFunctionExecutionError: ", "");

                const startIndex = errorString.indexOf('Error: ');
                const endIndex = errorString.indexOf('\n', startIndex);


                const match = errorString.substring(startIndex + 7, endIndex);

                switch (match) {
                    case "InvalidForcePushAuthoritySignature()":
                        this.exchangeError = "Invalid Force Push Authority Signature";
                        break;

                    case "InvalidTargetShareSetterAuthority()":
                        this.exchangeError = "Invalid Target Share Setter Authority";
                        break;

                    case "ForcePushedPriceExpired(uint blockTimestamp, uint priceTimestestamp)":
                        this.exchangeError = "Force Pushed Price Expired";
                        break;

                    case "InsuficcientBalance()":
                        this.exchangeError = "Insuficcient Balance";
                        break;

                    case "SleepageExceeded()":
                        this.exchangeError = "Sleepage Exceeded";
                        break;

                    case "AssetsNotSortedOrNotUnique()":
                        this.exchangeError = "Assets Not Sorted Or Not Unique";
                        break;

                    case "IsPaused()":
                        this.exchangeError = "Is Paused";
                        break;

                    case "DeviationExceedsLimit()":
                        this.exchangeError = "Deviation Exceeds Limit";
                        break;

                    default:
                        this.exchangeError = undefined;
                        break;
                }
            });

            return;
        }
    }

    async swap(userAddress: Address) {
        const isExactInput = this.mainInput === "out" ? false : true;

        const assetsArg: assetArgs[] = [];
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        if (isExactInput) {
            selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed(0)));
            const outputWithSlippage = this.outputQuantity!.multipliedBy((100 - this.slippage) / 100);
            selectedAssets.set(this.outputAsset!.address!, BigInt(outputWithSlippage.toFixed(0)));
        } else {
            const inputWithSlippage = this.inputQuantity!.multipliedBy((100 - this.slippage) / 100);
            selectedAssets.set(this.inputAsset!.address!, BigInt(inputWithSlippage.toFixed(0)));
            selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.toFixed(0)));
        }

        // sort by address, address is int
        const sortedAssets = new Map([...selectedAssets.entries()].sort((a, b) => {
            return BigInt(a[0]) > BigInt(b[0]) ? 1 : -1;
        }));

        for (const [address, amount] of sortedAssets) {
            assetsArg.push({
                addr: address,
                amount: amount
            });
        }

        const _fpShare = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${this.multipool_id}`);
        let fpSharePricePlaceholder: any;

        if (_fpShare.data == null) {
            fpSharePricePlaceholder = {
                thisAddress: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(0),
                value: BigInt(0),
                signature: "0x0"
            };
        } else {
            fpSharePricePlaceholder = _fpShare.data;
        }

        const bytesData = encodeAbiParameters(
            [
                { name: "token", type: "address" },
                { name: "targetOrOrigin", type: "address" },
                { name: "amount", type: "uint256" }
            ],
            [this.inputAsset!.address!, this.multipool.address!, BigInt(this.inputQuantity!.toString())]
        );

        const feeData = await this.checkSwap();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const _ethFee = new BigNumber(feeData[0].toString()).isLessThan(0) ? new BigNumber(0) : new BigNumber(feeData[0].toString());
        const ethFee = BigInt(_ethFee.toFixed(0));

        try {
            const { request } = await this.router.simulate.swap([
                this.multipool.address,
                {
                    fpSharePrice: fpSharePricePlaceholder,
                    selectedAssets: assetsArg,
                    isExactInput: isExactInput,
                    to: userAddress,
                    refundTo: userAddress,
                    ethValue: ethFee
                },
                [
                    {
                        callType: 0,
                        data: bytesData
                    }
                ],
                []
            ],
                {
                    account: userAddress,
                    value: ethFee
                }
            );

            const hash = await this.walletClient.writeContract(request);

            this.getAssets();
            return hash;
        } catch (e) {
            runInAction(() => {
                // check if error contains 
                let errorString: string = (e as Error).toString();

                errorString = errorString.replace("ContractFunctionExecutionError: ", "");

                const startIndex = errorString.indexOf('Error: ');
                const endIndex = errorString.indexOf('\n', startIndex);


                const match = errorString.substring(startIndex + 7, endIndex);

                switch (match) {
                    case "InvalidForcePushAuthoritySignature()":
                        this.exchangeError = "Invalid Force Push Authority Signature";
                        break;

                    case "InvalidTargetShareSetterAuthority()":
                        this.exchangeError = "Invalid Target Share Setter Authority";
                        break;

                    case "ForcePushedPriceExpired(uint blockTimestamp, uint priceTimestestamp)":
                        this.exchangeError = "Force Pushed Price Expired";
                        break;

                    case "InsuficcientBalance()":
                        this.exchangeError = "Insuficcient Balance";
                        break;

                    case "SleepageExceeded()":
                        this.exchangeError = "Sleepage Exceeded";
                        break;

                    case "AssetsNotSortedOrNotUnique()":
                        this.exchangeError = "Assets Not Sorted Or Not Unique";
                        break;

                    case "IsPaused()":
                        this.exchangeError = "Is Paused";
                        break;

                    case "DeviationExceedsLimit()":
                        this.exchangeError = "Deviation Exceeds Limit";
                        break;

                    default:
                        this.exchangeError = undefined;
                        break;
                }
            });

            return undefined;
        }
    }

    isApproveRequired(userAddress: Address, tokenAddress: Address | undefined, destAddress: Address): boolean {
        if (tokenAddress === undefined) return false;

        this.publicClient.readContract({
            address: tokenAddress,
            abi: ERC20,
            functionName: "allowance",
            args: [userAddress, destAddress]
        }).then((allowance) => {

            const biInputQuantity = BigInt(this.inputQuantity!.toFixed());

            if (allowance < biInputQuantity) return false;
            return true;
        });

        return false;
    }

    async approve(userAddress: Address, tokenAddress: Address | undefined, destAddress: Address): Promise<void> {
        if (tokenAddress === undefined) return;

        const biInputQuantity = BigInt(this.inputQuantity!.toFixed());

        await this.walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20,
            functionName: "approve",
            args: [destAddress, biInputQuantity],
            account: userAddress
        });
    }

    setInputAsset(
        asset: MultipoolAsset | SolidAsset,
    ) {
        this.inputAsset = asset;
        this.outputQuantity = undefined;
        this.checkSwap();
    }

    setOutputAsset(
        asset: MultipoolAsset | SolidAsset,
    ) {
        this.outputAsset = asset;
        this.inputQuantity = undefined;
        this.checkSwap();
    }

    setSlippage(value: number) {
        this.slippage = value;
    }

    setInputQuantity(
        value: string | undefined
    ) {
        if (value === undefined) {
            this.inputQuantity = undefined;
            this.outputQuantity = undefined;
            return;
        }
        const decimals = this.inputAsset?.decimals ?? 18;
        const divider = new BigNumber(10).pow(decimals);
        const quantity = new BigNumber(value).times(divider);

        this.inputQuantity = quantity;
        this.outputQuantity = undefined;
    }

    setOutputQuantity(
        value: string | undefined
    ) {
        if (value === undefined) {
            this.inputQuantity = undefined;
            this.outputQuantity = undefined;
            return;
        }
        const decimals = this.outputAsset?.decimals ?? 18;
        const divider = new BigNumber(10).pow(decimals);
        const quantity = new BigNumber(value).times(divider);

        this.outputQuantity = quantity;
        this.inputQuantity = undefined;
    }

    setSelectedTabWrapper(value: "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" | "back" | string | undefined) {
        if (value == undefined) {
            return;
        }

        // check if string value can be converted mint | burn | swap | set-token-in | set-token-out
        const values = ["mint", "burn", "swap", "set-token-in", "set-token-out", "back"];
        if (!values.includes(value)) {
            return;
        }

        if (value == "back") {
            this.selectedTab = this.selectedSCTab;
            return;
        }

        if (value == "mint" || value == "burn" || value == "swap") {
            this.selectedSCTab = value;
            this.setAction(value);
        }

        runInAction(() => {
            this.selectedTab = (value as "mint" | "burn" | "swap" | "set-token-in" | "set-token-out");
        });
    }

    setAction(
        action: "mint" | "burn" | "swap",
    ) {
        const mpAsset = this.assets.find((asset) => asset.type === "solid") as SolidAsset;

        runInAction(() => {
            if (action === "mint") {
                this.inputAsset = this.assets[0];
                this.outputAsset = mpAsset;
            }

            if (action === "burn") {
                this.inputAsset = mpAsset;
                this.outputAsset = this.assets[0];
            }

            if (action === "swap") {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.assets[1];
            }
        });
    }

    setMainInput(
        value: "in" | "out",
    ) {
        this.mainInput = value;
    }

    get currentShares() {
        if (this.assets.length === 0) return new Map<string, BigNumber>();
        const multipoolAssets = this.assets.filter((asset) => asset.type === "multipool") as MultipoolAsset[];

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            const assetPrice = new BigNumber(asset.chainPrice?.toString() ?? 0);
            return acc.plus(assetPrice.times(asset.quantity) ?? new BigNumber(0));
        }, new BigNumber(0));

        const addressToShare = new Map<string, BigNumber>();

        for (const asset of multipoolAssets) {
            if (asset.chainPrice === undefined) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }
            if (asset.quantity.eq(0)) {
                addressToShare.set(asset.address!, new BigNumber(0));
                continue;
            }

            const assetPrice = new BigNumber(asset.chainPrice?.toString() ?? 0);

            addressToShare.set(asset.address!, assetPrice.times(asset.quantity).div(totalDollarValue).times(100) ?? new BigNumber(0));
        }

        return addressToShare;
    }

    async updateEtherPrice() {
        const _res = await axios.get("https://token-rates-aggregator.1inch.io/v1.0/native-token-rate?vs=USD");
        const etherPrices = _res.data;

        runInAction(() => {
            this.etherPrice[42161] = etherPrices["42161"].USD;
        });
    }

    get getInputPrice(): BigNumber {
        const address = this.inputAsset?.address;

        // check if address is multipool address
        if (address === this.multipool.address.toString()) {
            axios.get(`https://api.arcanum.to/api/stats?multipool_id=${this.staticData.name}`).then((res) => {
                const response = res.data;

                return new BigNumber(response.value).div(new BigNumber(10).pow(18));
            });
        }
        const asset = this.assets.find((asset) => asset.address === address) as MultipoolAsset;
        if (asset === undefined) return new BigNumber(0);

        if (asset.chainPrice === undefined) {
            if (asset.price === undefined) {
                return new BigNumber(0);
            }
            return new BigNumber(asset.price.toString());
        }

        return new BigNumber(asset.chainPrice.toString());
    }

    get getOutputPrice(): BigNumber {
        const address = this.outputAsset?.address;

        // check if address is multipool address
        if (address === this.multipool.address.toString()) {
            axios.get(`https://api.arcanum.to/api/stats?multipool_id=${this.staticData.name}`).then((res) => {
                const response = res.data;

                return new BigNumber(response.value).div(new BigNumber(10).pow(18));
            });
        }
        const asset = this.assets.find((asset) => asset.address === address) as MultipoolAsset;
        if (asset === undefined) return new BigNumber(0);

        if (asset.chainPrice === undefined) {
            if (asset.price === undefined) {
                return new BigNumber(0);
            }
            return new BigNumber(asset.price.toString());
        }

        return new BigNumber(asset.chainPrice.toString());
    }

    get hrInQuantity() {
        if (this.inputQuantity === undefined) return undefined;
        if (this.inputAsset === undefined) return undefined;

        const decimals = this.inputAsset.decimals;
        const divider = new BigNumber(10).pow(decimals);

        const _val = new BigNumber(this.inputQuantity.div(divider).toFixed(12));

        if (this.inputQuantity.isLessThan(1)) {
            return _val.absoluteValue();
        }

        return _val.toString();
    }

    get hrOutQuantity() {
        if (this.outputQuantity === undefined) return undefined;
        if (this.outputAsset === undefined) return undefined;

        const decimals = this.outputAsset.decimals;
        const divider = new BigNumber(10).pow(decimals);

        let _val = new BigNumber(this.outputQuantity.div(divider).toFixed(12));

        if (this.outputQuantity.isLessThan(1)) {
            _val = _val.absoluteValue();
        }

        return _val.toString();
    }
}

export const multipool = new MultipoolStore("arbi");
