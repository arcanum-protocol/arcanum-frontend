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

    // // SPDX-License-Identifier: GPL-3.0
// pragma solidity ^0.8.0;
// // Multipool can't be understood by your mind, only your heart

// import {ERC20, IERC20} from "openzeppelin/token/ERC20/ERC20.sol";
// import {SafeERC20} from "openzeppelin/token/ERC20/utils/SafeERC20.sol";
// import {MpAsset, MpContext} from "../lib/MpContext.sol";
// import {FeedInfo, FeedType} from "../lib/Price.sol";

// import {ERC20Upgradeable} from "oz-proxy/token/ERC20/ERC20Upgradeable.sol";
// import {ERC20PermitUpgradeable} from "oz-proxy/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
// import {OwnableUpgradeable} from "oz-proxy/access/OwnableUpgradeable.sol";
// import {Initializable} from "oz-proxy/proxy/utils/Initializable.sol";
// import {UUPSUpgradeable} from "oz-proxy/proxy/utils/UUPSUpgradeable.sol";
// import {ReentrancyGuardUpgradeable} from "oz-proxy/security/ReentrancyGuardUpgradeable.sol";
// import {FixedPoint96} from "../lib/FixedPoint96.sol";

// import {ECDSA} from "openzeppelin/utils/cryptography/ECDSA.sol";

// /// @custom:security-contact badconfig@arcanum.to
// contract Multipool is
//     Initializable,
//     ERC20Upgradeable,
//     ERC20PermitUpgradeable,
//     OwnableUpgradeable,
//     UUPSUpgradeable,
//     ReentrancyGuardUpgradeable
// {
//     using ECDSA for bytes32;
//     using SafeERC20 for IERC20;

//     function initialize(string memory mpName, string memory mpSymbol, uint sharePrice)
//         public
//         initializer
//     {
//         __ERC20_init(mpName, mpSymbol);
//         __ERC20Permit_init(mpName);
//         __ReentrancyGuard_init();
//         __Ownable_init();
//         initialSharePrice = sharePrice;
//     }

//     function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

//     //------------- Errors ------------

//     error InvalidForcePushAuthoritySignature();
//     error InvalidTargetShareSetterAuthority();
//     error ForcePushedPriceExpired(uint blockTimestamp, uint priceTimestestamp);
//     error ZeroAmountSupplied();
//     error InsuficcientBalance();
//     error SleepageExceeded();
//     error AssetsNotSortedOrNotUnique();
//     error IsPaused();

//     //------------- Events ------------

//     event AssetChange(address indexed token, uint quantity, uint128 collectedCashbacks);
//     event FeesChange(
//         uint64 deviationParam, uint64 deviationLimit, uint64 depegBaseFee, uint64 baseFee
//     );
//     event TargetShareChange(address indexed token, uint share, uint totalTargetShares);
//     event FeedChange(address indexed token, FeedInfo feed);
//     event SharePriceTTLChange(uint sharePriceTTL);
//     event PriceSetterToggled(address indexed account, bool isSetter);
//     event TargetShareSetterToggled(address indexed account, bool isSetter);
//     event PauseChange(bool isPaused);
//     event CollectedFeesChange(uint fees);

//     //------------- Variables ------------

//     mapping(address => MpAsset) internal assets;
//     mapping(address => FeedInfo) internal prices;

//     uint64 internal deviationParam;
//     uint64 internal deviationLimit;
//     uint64 internal depegBaseFee;
//     uint64 internal baseFee;

//     uint public totalTargetShares;
//     uint public totalCollectedCashbacks;
//     uint public collectedFees;

//     uint public initialSharePrice;
//     uint public sharePriceTTL;

//     mapping(address => bool) public isPriceSetter;
//     mapping(address => bool) public isTargetShareSetter;

//     bool public isPaused;

//     // ---------------- Methods ------------------

//     modifier notPaused() {
//         if (isPaused) revert IsPaused();
//         _;
//     }

//     function getPriceFeed(address asset) public view returns (FeedInfo memory f) {
//         f = prices[asset];
//     }

//     function getPrice(address asset) public view returns (uint price) {
//         price = prices[asset].getPrice();
//     }

//     function getFees()
//         public
//         view
//         returns (
//             uint64 _deviationParam,
//             uint64 _deviationLimit,
//             uint64 _depegBaseFee,
//             uint64 _baseFee
//         )
//     {
//         _deviationParam = deviationParam;
//         _deviationLimit = deviationLimit;
//         _depegBaseFee = depegBaseFee;
//         _baseFee = baseFee;
//     }

//     function getAsset(address assetAddress) public view returns (MpAsset memory asset) {
//         asset = assets[assetAddress];
//     }

//     function getContext(FPSharePriceArg calldata fpSharePrice)
//         internal
//         view
//         returns (MpContext memory ctx)
//     {
//         uint totSup = totalSupply();
//         uint price;
//         if (fpSharePrice.thisAddress == address(this)) {
//             bytes memory data = abi.encodePacked(
//                 address(fpSharePrice.thisAddress),
//                 uint(fpSharePrice.timestamp),
//                 uint(fpSharePrice.value)
//             );
//             if (
//                 !isPriceSetter[keccak256(data).toEthSignedMessageHash().recover(
//                     fpSharePrice.signature
//                 )]
//             ) {
//                 revert InvalidForcePushAuthoritySignature();
//             }
//             if (fpSharePrice.timestamp + sharePriceTTL < block.timestamp) {
//                 revert ForcePushedPriceExpired(block.timestamp, fpSharePrice.timestamp);
//             }
//             price = fpSharePrice.value;
//         } else {
//             price = totSup == 0 ? initialSharePrice : prices[address(this)].getPrice();
//         }
//         (uint64 _deviationParam, uint64 _deviationLimit, uint64 _depegBaseFee, uint64 _baseFee) =
//             getFees();
//         ctx.sharePrice = price;
//         ctx.oldTotalSupply = totSup;
//         ctx.totalTargetShares = totalTargetShares;
//         ctx.deviationParam = _deviationParam;
//         ctx.deviationLimit = _deviationLimit;
//         ctx.depegBaseFee = _depegBaseFee;
//         ctx.baseFee = _baseFee;
//         ctx.totalCollectedCashbacks = totalCollectedCashbacks;
//         ctx.collectedFees = collectedFees;
//         ctx.unusedEthBalance =
//             int(address(this).balance - ctx.totalCollectedCashbacks - ctx.collectedFees);
//     }

//     function getPricesAndSumQuotes(MpContext memory ctx, AssetArg[] memory selectedAssets)
//         internal
//         view
//         returns (uint[] memory pr)
//     {
//         uint arrayLen = selectedAssets.length;
//         address prevAddress = address(0);
//         pr = new uint[](arrayLen);
//         for (uint i; i < arrayLen; ++i) {
//             address currentAddress = selectedAssets[i].addr;
//             int amount = selectedAssets[i].amount;

//             if (prevAddress >= currentAddress) revert AssetsNotSortedOrNotUnique();
//             prevAddress = currentAddress;

//             uint price;
//             if (currentAddress == address(this)) {
//                 price = ctx.sharePrice;
//                 ctx.totalSupplyDelta = -amount;
//             } else {
//                 price = prices[currentAddress].getPrice();
//             }
//             pr[i] = price;
//             if (amount == 0) revert ZeroAmountSupplied();
//             if (amount > 0) {
//                 ctx.cummulativeInAmount += price * uint(amount) >> FixedPoint96.RESOLUTION;
//             } else {
//                 ctx.cummulativeOutAmount += price * uint(-amount) >> FixedPoint96.RESOLUTION;
//             }
//         }
//     }

//     function transferAsset(address asset, uint quantity, address to) internal {
//         if (asset != address(this)) {
//             IERC20(asset).safeTransfer(to, quantity);
//         } else {
//             _mint(to, quantity);
//         }
//     }

//     function receiveAsset(
//         MpAsset memory asset,
//         address assetAddress,
//         uint requiredAmount,
//         address refundAddress
//     ) internal {
//         uint unusedAmount;
//         if (assetAddress != address(this)) {
//             unusedAmount = IERC20(assetAddress).balanceOf(address(this)) - asset.quantity;
//             if (unusedAmount < requiredAmount) revert InsuficcientBalance();

//             uint left = unusedAmount - requiredAmount;
//             if (refundAddress != address(0) && left > 0) {
//                 IERC20(assetAddress).safeTransfer(refundAddress, left);
//             }
//         } else {
//             _burn(address(this), requiredAmount);

//             uint left = balanceOf(address(this));
//             if (refundAddress != address(0) && left > 0) {
//                 transfer(refundAddress, left);
//             }
//         }
//     }

//     struct AssetArg {
//         address addr;
//         int amount;
//     }

//     struct FPSharePriceArg {
//         address thisAddress;
//         uint128 timestamp;
//         uint128 value;
//         bytes signature;
//     }

//     function swap(
//         FPSharePriceArg calldata fpSharePrice,
//         AssetArg[] calldata selectedAssets,
//         bool isExactInput,
//         address to,
//         address refundTo
//     ) external payable notPaused nonReentrant {
//         MpContext memory ctx = getContext(fpSharePrice);
//         uint[] memory currentPrices = getPricesAndSumQuotes(ctx, selectedAssets);
//         ctx.calculateTotalSupplyDelta(isExactInput);

//         for (uint i; i < selectedAssets.length; ++i) {
//             address tokenAddress = selectedAssets[i].addr;
//             int suppliedAmount = selectedAssets[i].amount;
//             uint price = currentPrices[i];

//             MpAsset memory asset;
//             if (selectedAssets[i].addr != address(this)) {
//                 asset = assets[selectedAssets[i].addr];
//             }

//             if (isExactInput && suppliedAmount < 0) {
//                 int amount =
//                     int(ctx.cummulativeInAmount) * suppliedAmount / int(ctx.cummulativeOutAmount);
//                 if (amount > suppliedAmount) revert SleepageExceeded();
//                 suppliedAmount = amount;
//             } else if (!isExactInput && suppliedAmount > 0) {
//                 int amount =
//                     int(ctx.cummulativeOutAmount) * suppliedAmount / int(ctx.cummulativeInAmount);
//                 if (amount > suppliedAmount) revert SleepageExceeded();
//                 suppliedAmount = amount;
//             }

//             if (suppliedAmount > 0) {
//                 receiveAsset(asset, tokenAddress, uint(suppliedAmount), refundTo);
//             } else {
//                 transferAsset(tokenAddress, uint(-suppliedAmount), to);
//             }

//             if (tokenAddress != address(this)) {
//                 ctx.calculateDeviationFee(asset, suppliedAmount, price);
//                 emit AssetChange(tokenAddress, asset.quantity, asset.collectedCashbacks);
//                 assets[tokenAddress] = asset;
//             } else {
//                 emit AssetChange(address(this), totalSupply(), 0);
//             }
//         }
//         ctx.calculateBaseFee(isExactInput);
//         ctx.applyCollected(payable(refundTo));
//         totalCollectedCashbacks = ctx.totalCollectedCashbacks;
//         collectedFees = ctx.collectedFees;
//         emit CollectedFeesChange(ctx.collectedFees);
//     }

//     function checkSwap(
//         FPSharePriceArg calldata fpSharePrice,
//         AssetArg[] calldata selectedAssets,
//         bool isExactInput
//     ) external view returns (int fee, int[] memory amounts) {
//         MpContext memory ctx = getContext(fpSharePrice);
//         uint[] memory currentPrices = getPricesAndSumQuotes(ctx, selectedAssets);
//         amounts = new int[](selectedAssets.length);
//         ctx.calculateTotalSupplyDelta(isExactInput);

//         for (uint i; i < selectedAssets.length; ++i) {
//             address tokenAddress = selectedAssets[i].addr;
//             int suppliedAmount = selectedAssets[i].amount;
//             uint price = currentPrices[i];

//             MpAsset memory asset;
//             if (selectedAssets[i].addr != address(this)) {
//                 asset = assets[selectedAssets[i].addr];
//             }

//             if (isExactInput && suppliedAmount < 0) {
//                 int amount =
//                     int(ctx.cummulativeInAmount) * suppliedAmount / int(ctx.cummulativeOutAmount);
//                 suppliedAmount = amount;
//             } else if (!isExactInput && suppliedAmount > 0) {
//                 int amount =
//                     int(ctx.cummulativeOutAmount) * suppliedAmount / int(ctx.cummulativeInAmount);
//                 suppliedAmount = amount;
//             }

//             if (tokenAddress != address(this)) {
//                 ctx.calculateDeviationFee(asset, suppliedAmount, price);
//             }
//             amounts[i] = suppliedAmount;
//         }
//         ctx.calculateBaseFee(isExactInput);
//         fee = -ctx.unusedEthBalance;
//     }

//     function increaseCashback(address assetAddress)
//         external
//         payable
//         notPaused
//         nonReentrant
//         returns (uint128 amount)
//     {
//         uint totalCollectedCashbacksCached = totalCollectedCashbacks;
//         amount = uint128(address(this).balance - totalCollectedCashbacksCached - collectedFees);
//         MpAsset memory asset = assets[assetAddress];
//         asset.collectedCashbacks += uint128(amount);
//         emit AssetChange(assetAddress, asset.quantity, amount);
//         assets[assetAddress] = asset;
//         totalCollectedCashbacks = totalCollectedCashbacksCached + amount;
//     }

//     // ---------------- Owned ------------------

//     function updatePrice(address assetAddress, FeedType kind, bytes calldata feedData)
//         external
//         onlyOwner
//         notPaused
//     {
//         FeedInfo memory feed = FeedInfo({kind: kind, data: feedData});
//         prices[assetAddress] = feed;
//         emit FeedChange(assetAddress, feed);
//     }

//     function updateTargetShares(address[] calldata assetAddresses, uint[] calldata shares)
//         external
//         notPaused
//     {
//         if (!isTargetShareSetter[msg.sender]) revert InvalidTargetShareSetterAuthority();

//         uint len = assetAddresses.length;
//         uint totalTargetSharesCached = totalTargetShares;
//         for (uint a; a < len; ++a) {
//             address assetAddress = assetAddresses[a];
//             uint share = shares[a];
//             MpAsset memory asset = assets[assetAddress];
//             totalTargetSharesCached = totalTargetSharesCached - asset.share + share;
//             asset.share = uint128(share);
//             assets[assetAddress] = asset;
//             emit TargetShareChange(assetAddress, share, totalTargetSharesCached);
//         }
//         totalTargetShares = totalTargetSharesCached;
//     }

//     function withdrawFees(address to) external onlyOwner notPaused returns (uint fees) {
//         fees = collectedFees;
//         collectedFees = 0;
//         payable(to).transfer(fees);
//     }

//     function togglePause() external onlyOwner {
//         isPaused = !isPaused;
//         emit PauseChange(isPaused);
//     }

//     function setCurveParams(
//         uint64 newDeviationLimit,
//         uint64 newHalfDeviationFee,
//         uint64 newDepegBaseFee,
//         uint64 newBaseFee
//     ) external onlyOwner {
//         uint64 newDeviationParam = (newHalfDeviationFee << 32) / newDeviationLimit;
//         deviationLimit = newDeviationLimit;
//         deviationParam = newDeviationParam;
//         depegBaseFee = newDepegBaseFee;
//         baseFee = newBaseFee;
//         emit FeesChange(newDeviationParam, newDeviationLimit, newDepegBaseFee, newBaseFee);
//     }

//     function setSharePriceTTL(uint newSharePriceTTL) external onlyOwner {
//         sharePriceTTL = newSharePriceTTL;
//         emit SharePriceTTLChange(sharePriceTTL);
//     }

//     function toggleForcePushAuthority(address authority) external onlyOwner {
//         isPriceSetter[authority] = !isPriceSetter[authority];
//         emit PriceSetterToggled(authority, isPriceSetter[authority]);
//     }

//     function toggleTargetShareAuthority(address authority) external onlyOwner {
//         isTargetShareSetter[authority] = !isTargetShareSetter[authority];
//         emit TargetShareSetterToggled(authority, isTargetShareSetter[authority]);
//     }
// }

    async updatePrice(assetAddress: Address, feedType: FeedType, feedData: string) {
        const { request } = await this.multipool.simulate.updatePrice([
            assetAddress,
            feedType,
            feedData as Address
        ]);

        await this.walletClient.writeContract(request);
    }

    async withdrawFees(to: Address) {
        const { request } = await this.multipool.simulate.withdrawFees([to]);

        await this.walletClient.writeContract(request);
    }

    async togglePause() {
        const { request } = await this.multipool.simulate.togglePause([]);

        await this.walletClient.writeContract(request);
    }

    async setCurveParams(
        newDeviationLimit: number,
        newHalfDeviationFee: number,
        newDepegBaseFee: number,
        newBaseFee: number
    ) {
        const { request } = await this.multipool.simulate.setCurveParams([
            BigInt(newDeviationLimit),
            BigInt(newHalfDeviationFee),
            BigInt(newDepegBaseFee),
            BigInt(newBaseFee)
        ]);

        await this.walletClient.writeContract(request);
    }

    async setSharePriceTTL(newSharePriceTTL: number) {
        const { request } = await this.multipool.simulate.setSharePriceTTL([BigInt(newSharePriceTTL)]);

        await this.walletClient.writeContract(request);
    }

    async toggleForcePushAuthority(authority: Address) {
        const { request } = await this.multipool.simulate.toggleForcePushAuthority([authority]);

        await this.walletClient.writeContract(request);
    }

    async toggleTargetShareAuthority(authority: Address) {
        const { request } = await this.multipool.simulate.toggleTargetShareAuthority([authority]);

        await this.walletClient.writeContract(request);
    }
}

export const multipool = new MultipoolStore("arbi");
