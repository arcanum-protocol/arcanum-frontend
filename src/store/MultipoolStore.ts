import { BaseAsset, MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction } from 'mobx';
import { Address, getContract } from 'viem';
import { publicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import SCHEME from '../scheme.yaml';
import axios from 'axios';
import { encodeAbiParameters } from 'viem'
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

export enum FeedType {
    Undefined,
    FixedValue,
    UniV3
}

class MultipoolStore {
    private publicClient = publicClient({ chainId: 31337 });
    private staticData;

    multipool;
    router;

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

    balances: { [key: string]: bigint } = {};

    inputAsset: MultipoolAsset | SolidAsset | undefined;
    outputAsset: MultipoolAsset | SolidAsset | undefined;

    inputQuantity: BigNumber | undefined;
    outputQuantity: BigNumber | undefined;

    slippage: number = 0.5;

    selectedTab: "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" = "mint";
    selectedSCTab: "mint" | "burn" | "swap" = "mint";

    mainInput: "in" | "out" = "in";

    exchangeError: string | undefined;
    etherPrice: number = 0;

    userAddress: Address | undefined;

    minimalReceive: bigint | undefined;
    maximumSend: bigint | undefined;
    fee: bigint | undefined;
    transactionCost: bigint | undefined;

    constructor(mp_id: string) {
        this.multipool_id = mp_id;

        this.staticData = SCHEME[this.multipool_id];

        this.multipool = getContract({
            address: this.staticData.address,
            abi: multipoolABI,
            publicClient: this.publicClient,
        });

        this.router = getContract({
            address: this.staticData.router_address,
            abi: routerABI,
            publicClient: this.publicClient,
        });

        (async () => {
            await this.getFees();
            await this.updatePrices();

            runInAction(() => {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.assets[1];
                this.setSelectedTabWrapper("mint");

                this.assetsIsLoading = false;
            });
        });

        setInterval(() => {
            this.updatePrices();
        }, 30000);


        makeAutoObservable(this, {}, { autoBind: true });
    }

    get getRouter(): Address {
        return this.staticData.router_address;
    }

    updateTokenBalances(balances: { [key: string]: bigint }) {
        this.balances = balances;
    }

    async getFees() {
        const rawFees: [bigint, bigint, bigint, bigint, bigint, Address] = await this.multipool.read.getFeeParams() as [bigint, bigint, bigint, bigint, bigint, Address];

        runInAction(() => {
            const deviationParam = new BigNumber((rawFees[0]).toString());
            const deviationLimit = new BigNumber((rawFees[1]).toString());
            const depegBaseFee = new BigNumber((rawFees[2]).toString());
            const baseFee = new BigNumber((rawFees[3]).toString());

            this.fees = {
                deviationParam: deviationParam,
                deviationLimit: deviationLimit,
                depegBaseFee: depegBaseFee,
                baseFee: baseFee,
            };
        });
    }

    async setTokens(tokens: BaseAsset[]) {
        const _assets: MultipoolAsset[] = [];
        const totalTargetShares = await this.multipool.read.totalTargetShares();

        for (const token of tokens) {
            const asset = await this.multipool.read.getAsset([token.address as Address]);

            if (token.address?.toString() === this.multipool.address.toString()) continue;

            const chainPrice = await this.multipool.read.getPrice([token.address as Address]);

            const idealShare = asset.targetShare / totalTargetShares * 100n;
            const quantity = asset.quantity;

            const _chainPrice = fromX96(chainPrice, token.decimals);

            _assets.push({
                symbol: token.symbol,
                decimals: token.decimals,
                logo: token.logo,
                address: token.address as Address,
                type: "multipool",
                multipoolAddress: this.staticData.address,
                idealShare: idealShare,
                chainPrice: _chainPrice,
                collectedCashbacks: asset.collectedCashbacks,
                multipoolQuantity: quantity,
            });
        }

        runInAction(() => {
            const mp = this.assets.find((asset) => asset.type === "solid") as SolidAsset;
            this.assets = [..._assets, mp]
        });
    }

    async updatePrices() {
        const addresses: { address: string, decimals: number }[] = this.assets.map((asset: any) => {
            return {
                address: asset.address,
                decimals: asset.decimals
            }
        });

        const addressToPrice = new Map<string, bigint>();

        for (const [_, { address, decimals }] of addresses.entries()) {
            if (address === this.multipool.address.toString()) continue;

            const price = await this.multipool.read.getPrice([address as Address]);
            addressToPrice.set(address, fromX96(price, decimals)!);
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

    updateMultipoolPriceData(multipool: { low_24h: number, high_24h: number, change_24h: number, total_supply: string }) {
        const multipoolID = this.assets.findIndex((asset) => asset.type === "solid");

        this.assets[multipoolID] = {
            ...this.assets[multipoolID],
            low24h: Number(multipool.low_24h),
            high24h: Number(multipool.high_24h),
            change24h: Number(multipool.change_24h),
            totalSupply: BigInt(multipool.total_supply)
        };
    }

    async checkSwap() {
        const isExactInput = this.mainInput === "out" ? false : true;

        runInAction(() => {
            this.maximumSend = undefined;
            this.minimalReceive = undefined;
            this.fee = undefined;
            this.transactionCost = undefined;

            if (isExactInput) {
                this.outputQuantity = undefined;
            } else {
                this.inputQuantity = undefined;
            }
        });

        // if (this.inputQuantity === undefined || this.outputQuantity === undefined) return;

        let _fpSharePrice: any = (await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${this.multipool_id}`)).data;

        let fpSharePricePlaceholder: {
            contractAddress: `0x${string}`;
            timestamp: bigint;
            sharePrice: bigint;
            signature: `0x${string}`;
        }

        if (_fpSharePrice == null) {
            fpSharePricePlaceholder = {
                contractAddress: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(0),
                sharePrice: BigInt(0),
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

        const _selectedAssets: { assetAddress: `0x${string}`; amount: bigint; }[] = [];

        for (const [address, amount] of sortedAssets) {
            _selectedAssets.push({
                assetAddress: address,
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
                if (isExactInput) {
                    this.maximumSend = undefined;
                    if (firstTokenAddress === this.inputAsset?.address) {
                        this.outputQuantity = new BigNumber(secondTokenQuantity.toString());
                        this.minimalReceive = secondTokenQuantity;
                    } else {
                        this.outputQuantity = new BigNumber(firstTokenQuantity.toString());
                        this.minimalReceive = firstTokenQuantity;
                    }
                } else {
                    this.minimalReceive = undefined;
                    if (firstTokenAddress === this.outputAsset?.address) {
                        this.inputQuantity = new BigNumber(secondTokenQuantity.toString());
                        this.maximumSend = secondTokenQuantity;
                    } else {
                        this.inputQuantity = new BigNumber(firstTokenQuantity.toString());
                        this.maximumSend = firstTokenQuantity;
                    }
                }
                this.fee = res[0];
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
        }
    }

    async estimateGas(userAddress: Address) {
        if (this.transactionCost !== undefined) return;
        if (this.inputQuantity === undefined || this.outputQuantity === undefined) return;
        const isExactInput = this.mainInput === "in" ? true : false;

        const assetsArg: { assetAddress: `0x${string}`; amount: bigint; }[] = [];
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        const slippage = (100 - this.slippage) / 100;
        const reversedSlippage = (100 + this.slippage) / 100;

        if (isExactInput) {
            selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed(0)));
            const outputWithSlippage = this.outputQuantity!.multipliedBy(slippage);
            selectedAssets.set(this.outputAsset!.address!, BigInt(outputWithSlippage.toFixed(0)));
        } else {
            const inputWithSlippage = this.inputQuantity!.multipliedBy(reversedSlippage);
            selectedAssets.set(this.inputAsset!.address!, BigInt(inputWithSlippage.toFixed(0)));
            selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.multipliedBy(-1).toFixed(0)));
        }

        // sort by address, address is int
        const sortedAssets = new Map([...selectedAssets.entries()].sort((a, b) => {
            return BigInt(a[0]) > BigInt(b[0]) ? 1 : -1;
        }));

        for (const [address, amount] of sortedAssets) {
            assetsArg.push({
                assetAddress: address,
                amount: amount
            });
        }

        const _fpShare = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${this.multipool_id}`);
        let fpSharePricePlaceholder: any;

        if (_fpShare.data == null) {
            fpSharePricePlaceholder = {
                contractAddress: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(0),
                sharePrice: BigInt(0),
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
            [this.inputAsset!.address!, this.multipool.address!, BigInt(this.inputQuantity!.toFixed())]
        );


        const feeData = await this.checkSwap();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const _ethFee: bigint = feeData[0] < 0 ? 0n : feeData[0];
        const ethFee = _ethFee;


        try {
            const gas = await this.router.estimateGas.swap([
                this.multipool.address,
                {
                    forcePushArgs: fpSharePricePlaceholder,
                    assetsToSwap: assetsArg,
                    isExactInput: isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
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

            const gasPrice = await this.publicClient?.getGasPrice();

            runInAction(() => {
                this.transactionCost = gas * gasPrice;
            });
        } catch (e: any) {
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
            return e.toString();
        }
    }

    async swap(userAddress: Address) {
        const isExactInput = this.mainInput === "in" ? true : false;

        const assetsArg: { assetAddress: `0x${string}`; amount: bigint; }[] = [];
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        const slippage = (100 - this.slippage) / 100;
        const reversedSlippage = (100 + this.slippage) / 100;

        if (isExactInput) {
            selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed(0)));
            const outputWithSlippage = this.outputQuantity!.multipliedBy(slippage);
            selectedAssets.set(this.outputAsset!.address!, BigInt(outputWithSlippage.toFixed(0)));
        } else {
            const inputWithSlippage = this.inputQuantity!.multipliedBy(reversedSlippage);
            selectedAssets.set(this.inputAsset!.address!, BigInt(inputWithSlippage.toFixed(0)));
            selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.multipliedBy(-1).toFixed(0)));
        }

        // sort by address, address is int
        const sortedAssets = new Map([...selectedAssets.entries()].sort((a, b) => {
            return BigInt(a[0]) > BigInt(b[0]) ? 1 : -1;
        }));

        for (const [address, amount] of sortedAssets) {
            assetsArg.push({
                assetAddress: address,
                amount: amount
            });
        }

        const _fpShare = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${this.multipool_id}`);
        let fpSharePricePlaceholder: any;

        if (_fpShare.data == null) {
            fpSharePricePlaceholder = {
                contractAddress: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(0),
                sharePrice: BigInt(0),
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
            [this.inputAsset!.address!, this.multipool.address!, BigInt(this.inputQuantity!.toFixed())]
        );

        const feeData = await this.checkSwap();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const _ethFee = feeData[0] < 0n ? 0n : feeData[0];
        let ethFee = _ethFee;

        try {
            const { request } = await this.router.simulate.swap([
                this.multipool.address,
                {
                    forcePushArgs: fpSharePricePlaceholder,
                    assetsToSwap: assetsArg,
                    isExactInput: isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
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

            return request;
        } catch (e: any) {
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
            return e.toString();
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

    async approve(userAddress: Address, tokenAddress: Address | undefined, destAddress: Address): Promise<any> {
        if (tokenAddress === undefined) return;

        const biInputQuantity = BigInt(this.inputQuantity!.toFixed());

        const { request } = await this.publicClient.simulateContract({
            address: tokenAddress,
            abi: ERC20,
            functionName: "approve",
            args: [destAddress, biInputQuantity],
            account: userAddress
        })

        return request;
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

    swapAssets() {
        if (this.inputAsset === undefined || this.outputAsset === undefined) return;
        if (this.selectedSCTab !== "swap") return;

        const _inputAsset = this.inputAsset;
        const _outputAsset = this.outputAsset;

        runInAction(() => {
            this.inputAsset = _outputAsset;
            this.outputAsset = _inputAsset;
        });
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
        if (this.assets.length === 0) return new Map<string, bigint>();
        const multipoolAssets = this.assets.filter((asset) => asset.type === "multipool") as MultipoolAsset[];

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            const assetPrice = asset.chainPrice ?? 0n;
            const assetDecimals = 10n ** BigInt(asset.decimals);

            return acc + assetPrice * asset.multipoolQuantity / assetDecimals;
        }, 0n);

        const addressToShare = new Map<string, bigint>();

        for (const asset of multipoolAssets) {
            if (asset.chainPrice === undefined) {
                addressToShare.set(asset.address!, 0n);
                continue;
            }
            if (asset.multipoolQuantity == 0n) {
                addressToShare.set(asset.address!, 0n);
                continue;
            }

            const assetPrice = asset.chainPrice ?? 0n;
            const assetDecimals = 10n ** BigInt(asset.decimals);

            addressToShare.set(asset.address!, assetPrice ** asset.multipoolQuantity / assetDecimals / totalDollarValue ** 100n ?? 0n);
        }

        return addressToShare;
    }

    setEtherPrice(etherPrice: number) {
        this.etherPrice = etherPrice;
    }

    get getInputPrice(): bigint {
        const address = this.inputAsset?.address;

        // check if address is multipool address
        if (address === this.multipool.address.toString()) {
            axios.get(`https://api.arcanum.to/api/stats?multipool_id=${this.staticData.name}`).then((res) => {
                const response = res.data;

                return new BigNumber(response.value).div(new BigNumber(10).pow(18));
            });
        }
        const asset = this.assets.find((asset) => asset.address === address) as MultipoolAsset;
        if (asset === undefined) return 0n;

        if (asset.chainPrice === undefined) {
            return 0n;
        }

        return asset.chainPrice;
    }

    get getOutputPrice(): bigint {
        const address = this.outputAsset?.address;

        // check if address is multipool address
        if (address === this.multipool.address.toString()) {
            axios.get(`https://api.arcanum.to/api/stats?multipool_id=${this.staticData.name}`).then((res) => {
                const response = res.data;

                return new BigNumber(response.value).div(new BigNumber(10).pow(18));
            });
        }
        const asset = this.assets.find((asset) => asset.address === address) as MultipoolAsset;
        if (asset === undefined) 0n;

        if (asset.chainPrice === undefined) {
            return 0n;
        }

        return asset.chainPrice;
    }

    get hrInQuantity() {
        if (this.inputQuantity === undefined) return undefined;
        if (this.inputAsset === undefined) return undefined;

        const decimals = this.inputAsset.decimals;
        const divider = new BigNumber(10).pow(decimals);

        let _val = new BigNumber(this.inputQuantity.div(divider).toFixed(12));

        if (this.inputQuantity.isLessThan(1)) {
            _val = _val.absoluteValue();
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

    // async updatePrice(assetAddress: Address, feedType: FeedType, feedData: string) {
    //     const { request } = await this.multipool.simulate.updatePrices([
    //         [assetAddress],
    //         [1],
    //         [feedData as Address]
    //     ], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async withdrawFees(to: Address) {
    //     const { request } = await this.multipool.simulate.withdrawFees([to], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async togglePause() {
    //     const { request } = await this.multipool.simulate.togglePause({ account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async setCurveParams(
    //     newDeviationLimit: number,
    //     newHalfDeviationFee: number,
    //     newDepegBaseFee: number,
    //     newBaseFee: number
    // ) {
    //     const { request } = await this.multipool.simulate.setFeeParams([
    //         BigInt(newDeviationLimit),
    //         BigInt(newHalfDeviationFee),
    //         BigInt(newDepegBaseFee),
    //         BigInt(newBaseFee),
    //         BigInt(0),
    //         this.walletClient?.account!.address!,
    //     ], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async setSharePriceTTL(newSharePriceTTL: number) {
    //     const { request } = await this.multipool.simulate.setSharePriceValidityDuration([BigInt(newSharePriceTTL)], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async toggleForcePushAuthority(authority: Address) {
    //     const { request } = await this.multipool.simulate.setAuthorityRights([authority, true, true], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async increaseCashback(address: Address) {
    //     const { request } = await this.multipool.simulate.increaseCashback([address], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    // async updateTargetShares(
    //     assets: Address[],
    //     shares: number[]
    // ) {
    //     const _shares = shares.map((share) => {
    //         return BigInt(share);
    //     });

    //     const { request } = await this.multipool.simulate.updateTargetShares([
    //         assets,
    //         _shares
    //     ], { account: this.walletClient?.account! });

    //     await this.walletClient?.writeContract(request);
    // }

    async getSharePriceParams(): Promise<number> {
        const sharePriceParams = await this.multipool.read.getSharePriceParams();

        return Number(sharePriceParams[0]);
    }
}

export const multipool = new MultipoolStore("arbi");
