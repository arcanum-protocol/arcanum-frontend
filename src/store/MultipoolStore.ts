import { MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction } from 'mobx';
import { Address, concat, getContract } from 'viem';
import { publicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX32, fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import SCHEME from '../scheme.yaml';
import axios from 'axios';
import { encodeAbiParameters } from 'viem'
import { createWalletClient, custom } from 'viem'
import ERC20 from '@/abi/ERC20';
import { WalletClient } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

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

    walletClient: WalletClient | undefined;

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

    userAddress: Address | undefined;

    minimalReceive: bigint | undefined;
    maximumSend: bigint | undefined;
    fee: bigint | undefined;
    transactionCost: bigint | undefined;

    constructor(mp_id: string) {
        this.multipool_id = mp_id;

        this.staticData = SCHEME[this.multipool_id];

        this.getAddresses();

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

        this.getAssets().then(async () => {
            await this.getFees();
            await this.updatePrices();
            await this.updateMultipoolPriceData();
            await this.updateEtherPrice();
            await this.updateTokenBalances();

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
            this.updateTokenBalances();
        }, 30000);


        makeAutoObservable(this, {}, { autoBind: true });
    }

    get getRouter(): Address {
        return this.staticData.router_address;
    }

    async getAddresses() {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        runInAction(() => {
            this.walletClient = createWalletClient({
                chain: arbitrumSepolia,
                account: account,
                transport: custom(window.ethereum),
            });
        });
    }

    async updateTokenBalances() {
        if (this.walletClient?.account?.address === undefined) return;
        if (this.assetsIsLoading) return;

        const assets = this.assets;

        for (const asset of assets) {
            if (asset.address === undefined) continue;

            const balance = await this.publicClient.readContract({
                address: asset.address,
                abi: ERC20,
                functionName: "balanceOf",
                args: [this.walletClient?.account!.address]
            });

            runInAction(() => {
                asset.balance = new BigNumber(balance.toString());
            });
        }

        runInAction(() => {
            this.assets = assets;
        });
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

            const idealShare = new BigNumber(asset.targetShare.toString()).div(totalTargetShares).times(100);
            const quantity = new BigNumber(asset.quantity.toString());

            const _chainPrice = new BigNumber(fromX96(chainPrice.toString(), token.decimals)!);

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
                chainPrice: _chainPrice,
                price: Number(_chainPrice.toString()),
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
        const addresses: {address: string, decimals: number}[] = this.assets.map((asset: any) => {
            return {
                address: asset.address,
                decimals: asset.decimals
            }
        });

        const addressToPrice = new Map<string, number>();

        for (const [_, {address, decimals}] of addresses.entries()) {
            if (address === this.multipool.address.toString()) continue;

            const price = await this.multipool.read.getPrice([address as Address]);
            addressToPrice.set(address, new BigNumber(fromX96(price.toString(), decimals)!).toNumber());
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

        let fpSharePricePlaceholder: any;

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

            this.estimateGas(this.walletClient?.account!.address!);
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

        const _ethFee = new BigNumber(feeData[0].toString()).isLessThan(0) ? new BigNumber(0) : new BigNumber(feeData[0].toString());
        const ethFee = BigInt(_ethFee.toFixed(0));


        try {
            const gas = await this.router.estimateGas.swap([
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

            const gasPrice = await this.publicClient?.getGasPrice();

            runInAction(() => {
                this.transactionCost = gas * gasPrice;
            });
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

        const _ethFee = new BigNumber(feeData[0].toString()).isLessThan(0) ? new BigNumber(0) : new BigNumber(feeData[0].toString());
        let ethFee = BigInt(_ethFee.toFixed(0));

        // apply slippage 

        const _slippage = this.slippage * 2 * 1000;

        if (isExactInput) {
            ethFee = ethFee * BigInt(_slippage) / BigInt(1000);
        } else {
            ethFee = ethFee * BigInt(_slippage) / BigInt(1000);
        }

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

            const hash = await this.walletClient?.writeContract(request);

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

    async approve(userAddress: Address, tokenAddress: Address | undefined, destAddress: Address): Promise<void> {
        if (tokenAddress === undefined) return;

        const biInputQuantity = BigInt(this.inputQuantity!.toFixed());

        const { request } = await this.publicClient.simulateContract({
            address: tokenAddress,
            abi: ERC20,
            functionName: "approve",
            args: [destAddress, biInputQuantity],
            account: userAddress
        })

        await this.walletClient?.writeContract(request);
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
        if (this.assets.length === 0) return new Map<string, BigNumber>();
        const multipoolAssets = this.assets.filter((asset) => asset.type === "multipool") as MultipoolAsset[];

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            const assetPrice = new BigNumber(asset.chainPrice?.toString() ?? 0);
            const assetDecimals = new BigNumber(10).pow(asset.decimals);
            return acc.plus(assetPrice.multipliedBy(asset.quantity.dividedBy(assetDecimals)) ?? new BigNumber(0));
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
            const assetDecimals = new BigNumber(10).pow(asset.decimals);

            addressToShare.set(asset.address!, assetPrice.times(asset.quantity.dividedBy(assetDecimals)).div(totalDollarValue).times(100) ?? new BigNumber(0));
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

    async updatePrice(assetAddress: Address, feedType: FeedType, feedData: string) {
        const { request } = await this.multipool.simulate.updatePrices([
            [assetAddress],
            [1],
            [feedData as Address]
        ], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async withdrawFees(to: Address) {
        const { request } = await this.multipool.simulate.withdrawFees([to], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async togglePause() {
        const { request } = await this.multipool.simulate.togglePause({ account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async setCurveParams(
        newDeviationLimit: number,
        newHalfDeviationFee: number,
        newDepegBaseFee: number,
        newBaseFee: number
    ) {
        const { request } = await this.multipool.simulate.setFeeParams([
            BigInt(newDeviationLimit),
            BigInt(newHalfDeviationFee),
            BigInt(newDepegBaseFee),
            BigInt(newBaseFee),
            BigInt(0),
            this.walletClient?.account!.address!,
        ], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async setSharePriceTTL(newSharePriceTTL: number) {
        const { request } = await this.multipool.simulate.setSharePriceValidityDuration([BigInt(newSharePriceTTL)], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async toggleForcePushAuthority(authority: Address) {
        const { request } = await this.multipool.simulate.setAuthorityRights([authority, true, true], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async increaseCashback(address: Address) {
        const { request } = await this.multipool.simulate.increaseCashback([address], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async updateTargetShares(
        assets: Address[],
        shares: number[]
    ) {
        const _shares = shares.map((share) => {
            return BigInt(share);
        });

        const { request } = await this.multipool.simulate.updateTargetShares([
            assets,
            _shares
        ], { account: this.walletClient?.account! });

        await this.walletClient?.writeContract(request);
    }

    async getSharePriceParams(): Promise<number> {
        const sharePriceParams = await this.multipool.read.getSharePriceParams();

        return Number(sharePriceParams[0]);
    }
}

export const multipool = new MultipoolStore("arbi");
