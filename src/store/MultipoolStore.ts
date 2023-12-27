import { ExternalAsset, MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { Address, getContract } from 'viem';
import { publicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { encodeAbiParameters } from 'viem';
import { getMultipool } from '@/api/arcanum';
import { getForcePushPrice, parseError } from '@/lib/multipoolUtils';
import { JAMQuote, PARAM_DOMAIN, PARAM_TYPES } from '@/api/bebop';
import { BebopQuoteResponce } from '@/types/bebop';
import { Create } from '@/api/uniswap';


export enum ActionType {
    BEBOP = "bebop",
    ARCANUM = "arcanum",
    UNISWAP = "uniswap",
    UNAVAILABLE = "unavailable",
}

class MultipoolStore {
    private publicClient = publicClient({ chainId: 42161 });

    // multipool related data
    logo: string | undefined;
    chainId: number | undefined;
    totalSupply: BigNumber | undefined;
    price: BigNumber | undefined;

    multipool = getContract({
        address: undefined as any,
        abi: multipoolABI,
        publicClient: this.publicClient,
    });
    router = getContract({
        address: undefined as any,
        abi: routerABI,
        publicClient: this.publicClient,
    });

    fees: {
        deviationParam: BigNumber,
        deviationLimit: BigNumber,
        depegBaseFee: BigNumber,
        baseFee: BigNumber,
    } | undefined;

    assets: MultipoolAsset[] = [];
    externalAssets: ExternalAsset[] = [];

    multipoolId: string;
    datafeedUrl = 'https://api.arcanum.to/api/tv';

    inputAsset: MultipoolAsset | SolidAsset | ExternalAsset | undefined;
    outputAsset: MultipoolAsset | SolidAsset | ExternalAsset | undefined;

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

    toSign: BebopQuoteResponce["toSign"] | undefined;
    orderId: string | undefined;

    selectedAssets: { assetAddress: `0x${string}`; amount: bigint; }[] = [];
    calls: {
        data: string;
        to: string;
        value: string;
        asset: Address;
        amountOut: BigNumber;
    }[] = [];

    constructor(mp_id: string) {
        this.multipoolId = mp_id;

        (async () => {
            const multipoolData = await getMultipool(mp_id);

            runInAction(() => {
                this.multipool = getContract({
                    address: multipoolData.address as Address,
                    abi: multipoolABI,
                    publicClient: this.publicClient,
                });

                this.router = getContract({
                    address: multipoolData.router as Address,
                    abi: routerABI,
                    publicClient: this.publicClient,
                });

                this.logo = multipoolData.logo;
                this.assets = multipoolData.assets;
            });

            await this.getFees();
        })();

        setInterval(async () => {
            this.updateMPTotalSupply();
            await this.updatePricesUniswap();
        }, 30000);

        this.setSelectedTabWrapper("mint");

        makeAutoObservable(this, {}, { autoBind: true });
    }

    setSlippage(value: number) {
        this.slippage = value;
    }

    get getSolidAsset(): SolidAsset | undefined {
        return {
            symbol: "ARBI",
            decimals: 18,
            logo: this.logo,
            address: this.multipool.address,
            type: "solid",
            routerAddress: this.router.address,
            totalSupply: this.totalSupply,
            chainId: this.chainId,
            price: this.price,
        } as SolidAsset;
    }

    setExternalAssets(assets: ExternalAsset[]) {
        this.externalAssets = assets;
    }

    updateMPPrice(price: BigNumber) {
        this.price = price;
    }

    setEtherPrice(price: number) {
        this.etherPrice = price;
    }

    updateMPTotalSupply() {
        if (this.multipool.address === undefined) return;

        this.multipool.read.totalSupply().then((totalSupply) => {
            runInAction(() => {
                this.totalSupply = new BigNumber(totalSupply.toString());
            });
        });
    }

    async getFees() {
        if (this.multipool.address === undefined) return;
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

    async setTokens(tokens: MultipoolAsset[]) {
        if (this.multipool.address === undefined) return;

        const _assets: MultipoolAsset[] = [];
        const _totalTargetShares = await this.multipool.read.totalTargetShares();
        const totalTargetShares = new BigNumber(_totalTargetShares.toString());

        for (const token of tokens) {
            const _asset = await this.multipool.read.getAsset([token.address as Address]);
            const asset = {
                quantity: new BigNumber(_asset.quantity.toString()),
                targetShare: new BigNumber(_asset.targetShare.toString()),
                collectedCashbacks: new BigNumber(_asset.collectedCashbacks.toString()),
            };

            if (token.address?.toString() === this.multipool.address.toString()) continue;

            const chainPrice = await this.multipool.read.getPrice([token.address as Address]);

            const idealShare = asset.targetShare.dividedBy(totalTargetShares).multipliedBy(100);
            const quantity = asset.quantity;

            const price = fromX96(chainPrice, token.decimals);

            _assets.push({
                symbol: token.symbol,
                decimals: token.decimals,
                logo: token.logo,
                address: token.address as Address,
                type: "multipool",
                multipoolAddress: this.multipool.address,
                idealShare: idealShare,
                price: price,
                collectedCashbacks: asset.collectedCashbacks,
                multipoolQuantity: quantity,
            });
        }

        runInAction(() => {
            this.assets = _assets;

            this.setAction("mint")
        });
    }

    async updatePricesUniswap() {
        const addresses: { address: string, decimals: number }[] = this.assets.filter(asset => asset.type == "multipool").map((asset: any) => {
            return {
                address: asset.address,
                decimals: asset.decimals
            }
        });

        const addressToPrice = new Map<string, BigNumber>();

        const getPriceCall = {
            address: this.multipool.address,
            abi: multipoolABI,
            functionName: "getPrice",
        } as const;

        const prices = await this.publicClient.multicall({
            contracts: addresses.map(({ address }) => {
                return {
                    ...getPriceCall,
                    args: [address]
                }
            })
        });

        for (const [index, result] of prices.entries()) {
            const price = result.result as bigint;
            const { address, decimals } = addresses[index];

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

    updatePrice(tokens: Map<string, BigNumber>) {
        runInAction(() => {
            this.externalAssets = this.externalAssets.map((asset) => {
                // if this asset in not in the map, return it
                if (!tokens.has(asset.address!)) return asset;
                return {
                    ...asset,
                    price: tokens.get(asset.address!)!
                };
            });
        });
    }

    // yeah im sorry for this
    private createSelectedAssets(slippage?: number): { assetAddress: `0x${string}`; amount: bigint; }[] | undefined {
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        if (this.inputAsset === undefined || this.outputAsset === undefined) return undefined;

        const inputAssetAddress = this.inputAsset.address!;
        const outputAssetAddress = this.outputAsset.address!;

        const inputQuantity = this.inputQuantity;
        const outputQuantity = this.outputQuantity;

        if (slippage === undefined) {
            if (this.isExactInput) {
                if (inputQuantity === undefined) return undefined;

                selectedAssets.set(inputAssetAddress, BigInt(inputQuantity.toFixed()));
                selectedAssets.set(outputAssetAddress, BigInt("-1000000000000000000"));
            } else {
                if (outputQuantity === undefined) return undefined;

                selectedAssets.set(inputAssetAddress, BigInt("1000000000000000000"));
                selectedAssets.set(outputAssetAddress, BigInt(outputQuantity.multipliedBy(-1).toFixed()));
            }
        } else {
            if (this.inputAsset === undefined || this.outputAsset === undefined) return undefined
            if (inputAssetAddress === undefined || outputAssetAddress === undefined) return undefined;

            if (this.swapType === ActionType.UNISWAP) {
                if (this.calls.length === 0) return undefined;
                if (inputQuantity === undefined) return undefined;
                if (outputQuantity === undefined) return undefined;

                const slippageMultiplier = (100 - slippage) / 100;
                const outputWithSlippage = outputQuantity.multipliedBy(slippageMultiplier);

                for (const call of this.calls) {
                    selectedAssets.set(call.asset, BigInt(call.amountOut.toFixed(0)));
                }
                selectedAssets.set(outputAssetAddress, BigInt(outputWithSlippage.toFixed(0)));
            }

            if (this.isExactInput) {
                if (inputQuantity === undefined) return undefined;
                if (outputQuantity === undefined) return undefined;

                const slippageMultiplier = (100 - slippage) / 100;
                const outputWithSlippage = outputQuantity.multipliedBy(slippageMultiplier);

                selectedAssets.set(inputAssetAddress, BigInt(inputQuantity.toFixed(0)));
                selectedAssets.set(outputAssetAddress, BigInt(outputWithSlippage.toFixed(0)));
            } else {
                if (inputQuantity === undefined) return undefined;
                if (outputQuantity === undefined) return undefined;

                const slippageMultiplier = (100 + slippage) / 100;
                const inputWithSlippage = inputQuantity.multipliedBy(slippageMultiplier);

                selectedAssets.set(inputAssetAddress, BigInt(inputWithSlippage.toFixed(0)));
                selectedAssets.set(outputAssetAddress, BigInt(outputQuantity.multipliedBy(-1).toFixed(0)));
            }
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

        return _selectedAssets;
    }

    private get isExactInput(): boolean {
        return this.mainInput === "in" ? true : false;
    }

    private clearSwapData() {
        runInAction(() => {
            this.maximumSend = undefined;
            this.minimalReceive = undefined;
            this.fee = undefined;
            this.transactionCost = undefined;
        });
    }

    private updateErrorMessage(e: any) {
        runInAction(() => {
            this.exchangeError = parseError(e);
        });
    }

    get swapType(): ActionType {
        const { inputAsset, outputAsset } = this;

        if (!inputAsset || !outputAsset) return ActionType.UNAVAILABLE;

        const isExternal = inputAsset.type === "external";
        const isMultipool = inputAsset.type === "multipool";
        const isSolid = inputAsset.type === "solid";

        if (isExternal && (outputAsset.type === "external" || outputAsset.type === "multipool")) return ActionType.BEBOP;
        if (isExternal && outputAsset.type === "solid") return ActionType.UNISWAP;
        if (isMultipool && (outputAsset.type === "multipool" || outputAsset.type === "solid")) return ActionType.ARCANUM;
        if (isSolid && outputAsset.type === "multipool") return ActionType.ARCANUM;

        return ActionType.UNAVAILABLE;
    }

    async checkSwap(userAddress: Address) {
        if (this.multipool.address === undefined) return;
        if (userAddress === undefined) return;

        console.log("checkSwap", this.swapType);

        if (this.swapType === ActionType.ARCANUM) {
            return await this.checkSwapMultipool(userAddress);
        }
        if (this.swapType === ActionType.UNISWAP) {
            return await this.checkSwapUniswap();
        }
        if (this.swapType === ActionType.BEBOP) {
            return await this.checkSwapBebop(userAddress);
        }
    }

    private async checkSwapUniswap() {
        if (this.inputQuantity === undefined) return;
        const calls = await Create(this.currentShares.data, this.inputAsset!.address!, this.inputQuantity, this.multipool.address);
        if (calls === undefined) return;

        const selectedAssets = Array.from(calls.selectedAssets).map((asset) => {
            return {
                assetAddress: asset[0],
                amount: BigInt(asset[1].toFixed(0))
            }
        });
        selectedAssets.push({
            assetAddress: this.multipool.address,
            amount: BigInt("-1000000000000000000")
        });

        const sortedAssets = selectedAssets.sort((a, b) => {
            return BigInt(a.assetAddress) > BigInt(b.assetAddress) ? 1 : -1;
        });

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolId);

        try {
            const responce = await this.multipool.read.checkSwap(
                [
                    fpSharePricePlaceholder,
                    sortedAssets,
                    this.isExactInput
                ]);

            const estimates = responce[1];

            // get the one element that negative
            const ArcanumETF = estimates.find((estimate) => estimate < 0n);

            runInAction(() => {
                this.outputQuantity = new BigNumber(ArcanumETF?.toString()!);

                this.calls = calls.calldata;
                this.selectedAssets = selectedAssets;
                this.fee = responce[0];
                this.exchangeError = undefined;
            });

            return responce;
        } catch (e) {
            console.log("e", e);
            this.updateErrorMessage(e);
        }
    }

    private async checkSwapBebop(userAddress: Address) {
        const test = await JAMQuote({
            sellTokens: this.inputAsset!.address!,
            buyTokens: this.outputAsset!.address!,
            sellAmounts: this.inputQuantity,
            takerAddress: userAddress,
        });

        if (test === undefined) return;

        const prices: Map<string, BigNumber> = new Map<string, BigNumber>();

        prices.set(this.inputAsset!.address!, test.sellPrice);
        prices.set(this.outputAsset!.address!, test.buyPrice);
        this.updatePrice(prices);

        runInAction(() => {
            if (this.outputQuantity !== test.buyAmounts) {
                this.outputQuantity = test.buyAmounts
            }
            this.transactionCost = BigInt(test.gasFee.toFixed(0));
            this.toSign = test.toSign;
            this.orderId = test.orderId;
        });
    }

    get dataToSign() {
        return {
            PARAM_DOMAIN: PARAM_DOMAIN,
            PARAM_TYPES: PARAM_TYPES,
            toSign: this.toSign,
            orderId: this.orderId,
        }
    }

    private async checkSwapMultipool(userAddress: Address) {
        if (this.multipool.address === undefined) return;

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolId);
        const selectedAssets = this.createSelectedAssets();
        if (selectedAssets === undefined) return;

        try {
            const res = await this.multipool.read.checkSwap(
                [
                    fpSharePricePlaceholder,
                    selectedAssets,
                    this.isExactInput
                ]);

            const estimates = res[1];
            const firstTokenQuantity = estimates[0];
            const secondTokenQuantity = estimates[1];

            const firstTokenAddress = selectedAssets[0].assetAddress;

            runInAction(() => {
                if (this.isExactInput) {
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

            const ethFee: bigint = res[0] < 0 ? 0n : res[0];

            const newSelectedAssets = this.createSelectedAssets(this.slippage);
            if (newSelectedAssets === undefined) return;

            const newArgs = this.encodeForcePushArgs;
            if (newArgs === undefined) return;

            const newCalls = [{ callType: 0, data: newArgs }];

            const gas = await this.router.estimateGas.swap([
                this.multipool.address,
                {
                    forcePushArgs: fpSharePricePlaceholder,
                    assetsToSwap: newSelectedAssets,
                    isExactInput: this.isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
                    ethValue: ethFee
                },
                newCalls,
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

            return res;
        } catch (e) {
            console.log("e", e);
            this.updateErrorMessage(e);
        }
    }

    private get encodeForcePushArgs(): Address | undefined {
        if (this.swapType === ActionType.UNISWAP) {
            return encodeAbiParameters(
                [
                    { name: "token", type: "address" },
                    { name: "targetOrOrigin", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                [this.inputAsset!.address!, this.router!.address!, BigInt(this.inputQuantity!.abs().toFixed(0))]
            )
        }
        const inputsWithSlippage = this.createSelectedAssets(this.slippage);

        if (inputsWithSlippage === undefined) {
            return encodeAbiParameters(
                [
                    { name: "token", type: "address" },
                    { name: "targetOrOrigin", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                [this.inputAsset!.address!, this.multipool.address!, BigInt(this.inputQuantity!.abs().toFixed(0))]
            )
        }
        const inputTokenQuantityWithSlippage = inputsWithSlippage.find((asset) => asset.assetAddress === this.inputAsset?.address)?.amount;

        return encodeAbiParameters(
            [
                { name: "token", type: "address" },
                { name: "targetOrOrigin", type: "address" },
                { name: "amount", type: "uint256" }
            ],
            [this.inputAsset!.address!, this.multipool.address!, inputTokenQuantityWithSlippage!]
        )
    }

    async swap(userAddress: Address) {
        if (this.inputQuantity === undefined || this.outputQuantity === undefined) this.clearSwapData();
        if (this.swapType === ActionType.ARCANUM) {
            return await this.swapMultipool(userAddress);
        }
        if (this.swapType === ActionType.UNISWAP) {
            return await this.swapUniswap(userAddress);
        }
    }

    async swapUniswap(userAddress: Address) {
        runInAction(() => this.calls = [])
        if (this.multipool.address === undefined) return;
        if (this.router === undefined) return;

        const isExactInput = this.mainInput === "in" ? true : false;
        const forsePushPrice = await getForcePushPrice(this.multipoolId);

        const feeData = await this.checkSwap(userAddress);
        if (feeData === undefined) throw new Error("feeData is undefined");

        const selectedAssets = this.createSelectedAssets(this.slippage);
        if (selectedAssets === undefined) return;

        // remove input asset from selected assets
        const _selectedAssets = selectedAssets.filter((asset) => asset.assetAddress !== this.inputAsset?.address);

        const _ethFee = feeData[0] < 0n ? 0n : feeData[0];
        const ethFeeBG = new BigNumber(_ethFee.toString()).multipliedBy(1.005).toFixed(0);
        const ethFee = BigInt(ethFeeBG);

        const callsTransfer = this.encodeForcePushArgs;
        if (callsTransfer === undefined) return;

        const callsBeforeUniswap = this.calls.map((call) => {
            const data = encodeAbiParameters([{ name: "target", type: "address" }, { name: "ethValue", type: "uint256" }, { name: "targetData", type: "bytes" }], [call.to as Address, BigInt(call.value), call.data as Address]);

            return {
                callType: 2,
                data: data
            }
        });

        const uniswapRouter = this.calls[0].to;

        // add call to approve tokens from arcanum router to uniswap router as first call
        const approveData = encodeAbiParameters([{ name: "token", type: "address" }, { name: "target", type: "address" }, { name: "amount", type: "uint256" }], [this.inputAsset!.address!, uniswapRouter as Address, BigInt(this.inputQuantity!.abs().toFixed(0))]);
        const approveCall = {
            callType: 1,
            data: approveData
        };
        callsBeforeUniswap.unshift(approveCall);
        // add call to transfer tokens to router as first call
        callsBeforeUniswap.unshift({ callType: 0, data: callsTransfer });

        try {
            const gas = await this.router.estimateGas.swap([
                this.multipool.address,
                {
                    forcePushArgs: forsePushPrice,
                    assetsToSwap: _selectedAssets,
                    isExactInput: isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
                    ethValue: ethFee
                },
                callsBeforeUniswap,
                []
            ],
                {
                    account: userAddress,
                    value: ethFee
                }
            );

            const gasPrice = await this.publicClient?.getGasPrice();

            const { request } = await this.router.simulate.swap([
                this.multipool.address,
                {
                    forcePushArgs: forsePushPrice,
                    assetsToSwap: _selectedAssets,
                    isExactInput: isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
                    ethValue: ethFee
                },
                callsBeforeUniswap,
                []
            ],
                {
                    account: userAddress,
                    value: ethFee
                }
            );

            runInAction(() => {
                this.transactionCost = gas * gasPrice;
            });

            return request;
        } catch (e: any) {
            console.log("e", e);
            this.updateErrorMessage(e);
            return undefined;
        }
    }

    async swapMultipool(userAddress: Address) {
        if (this.multipool.address === undefined) return;
        if (this.router === undefined) return;

        const isExactInput = this.mainInput === "in" ? true : false;
        const forsePushPrice = await getForcePushPrice(this.multipoolId);

        const feeData = await this.checkSwap(userAddress);
        if (feeData === undefined) throw new Error("feeData is undefined");

        const selectedAssets = this.createSelectedAssets(this.slippage);
        if (selectedAssets === undefined) return;

        const ethFee = feeData[0] < 0n ? 0n : feeData[0];

        const callsTransfer = this.encodeForcePushArgs;
        if (callsTransfer === undefined) return;

        const callsBeforeArcanum = [{ callType: 0, data: callsTransfer }];

        try {

            const { request } = await this.router.simulate.swap([
                this.multipool.address,
                {
                    forcePushArgs: forsePushPrice,
                    assetsToSwap: selectedAssets,
                    isExactInput: isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
                    ethValue: ethFee
                },
                callsBeforeArcanum,
                []
            ],
                {
                    account: userAddress,
                    value: ethFee
                }
            );

            return request;
        } catch (e: any) {
            console.log("e", e);
            this.updateErrorMessage(e);
            return undefined;
        }
    }

    setInputAsset(
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
    ) {
        this.inputAsset = asset;
        this.outputQuantity = undefined;
    }

    setOutputAsset(
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
    ) {
        this.outputAsset = asset;
        this.inputQuantity = undefined;
    }

    swapAssets() {
        if (this.inputAsset === undefined || this.outputAsset === undefined) return;
        if (this.selectedSCTab !== "swap") return;

        const _inputAsset = this.inputAsset;
        const _outputAsset = this.outputAsset;

        runInAction(() => {
            this.setInputAsset(_outputAsset);
            this.setOutputAsset(_inputAsset);
        });
    }

    setQuantity(
        direction: "Send" | "Receive",
        value: string | undefined
    ) {
        if (value === undefined) {
            this.inputQuantity = undefined;
            this.outputQuantity = undefined;
            return;
        }

        const decimals = direction == "Send" ? this.inputAsset?.decimals : this.outputAsset?.decimals;
        const divider = new BigNumber(10).pow(decimals!);
        const quantity = new BigNumber(value).times(divider);

        if (direction == "Send") {
            this.inputQuantity = quantity;
            this.outputQuantity = undefined;
        } else {
            this.outputQuantity = quantity;
            this.inputQuantity = undefined;
        }
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
        runInAction(() => {
            this.clearSwapData();
            if (action === "mint") {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.getSolidAsset;
            }

            if (action === "burn") {
                this.inputAsset = this.getSolidAsset;
                this.outputAsset = this.assets[0];
            }

            if (action === "swap") {
                this.inputAsset = this.assets[0];
                this.outputAsset = this.assets[1];
            }
        });
    }

    setMainInput(
        value: "in" | "out" | "Send" | "Receive",
    ) {
        if (value === "Send") {
            this.mainInput = "in";
            return;
        } else if (value === "Receive") {
            this.mainInput = "out";
            return;
        }
        this.mainInput = value;
    }

    get currentShares(): {
        data: Map<Address, BigNumber>,
        isLoading: boolean
    } {
        if (this.assets.length === 0) {
            return {
                data: new Map<Address, BigNumber>(),
                isLoading: true
            };
        }
        const multipoolAssets = this.assets.filter((asset) => asset != undefined).filter((asset) => asset.type === "multipool") as MultipoolAsset[];
        if (multipoolAssets.some((asset) => asset.price === undefined || asset.multipoolQuantity === undefined)) {
            return {
                data: new Map<Address, BigNumber>(),
                isLoading: true
            };
        }

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            return acc.plus(asset.price.multipliedBy(asset.multipoolQuantity));
        }, new BigNumber(0));

        const addressToShare = new Map<Address, BigNumber>();

        for (const asset of multipoolAssets) {
            if (asset.price.isEqualTo(0)) {
                addressToShare.set(asset.address!, BigNumber(0));
                continue;
            }
            if (asset.multipoolQuantity.isEqualTo(0)) {
                addressToShare.set(asset.address!, BigNumber(0));
                continue;
            }

            const assetValue = asset.price.multipliedBy(asset.multipoolQuantity);

            const share = new BigNumber(assetValue).dividedBy(totalDollarValue).multipliedBy(100);

            addressToShare.set(asset.address!, share);
        }

        return {
            data: addressToShare,
            isLoading: false
        };
    }

    getItemPrice(direction: "Send" | "Receive"): BigNumber {
        if (this.multipool.address === undefined) return BigNumber(0);

        const thisPrice = direction == "Send" ? this.inputAsset?.address : this.outputAsset?.address;

        // check if address is multipool address
        if (thisPrice === this.multipool.address.toString()) {
            const bigintPrice = BigInt(this.price?.toFixed() ?? "0");
            return fromX96(bigintPrice, 18) ?? BigNumber(0);
        }
        const asset = [...this.assets, ...this.externalAssets].find((asset) => asset.address === thisPrice) as MultipoolAsset | ExternalAsset;

        if (asset === undefined) return BigNumber(0);
        if (asset.price === undefined) return BigNumber(0);

        return asset.price;
    }

    hrQuantity(direction: "Send" | "Receive"): string {
        if (this.inputQuantity === undefined || this.outputQuantity === undefined) return "0";
        if (this.inputAsset === undefined || this.outputAsset === undefined) return "0";

        const decimals = direction == "Send" ? this.inputAsset.decimals : this.outputAsset?.decimals;
        const divider = new BigNumber(10).pow(decimals!);

        const quantity = direction == "Send" ? this.inputQuantity : this.outputQuantity;
        let _val = new BigNumber(quantity!.div(divider).toFixed(12));

        return _val.absoluteValue().toFixed(12);
    }

    async getSharePriceParams(): Promise<number> {
        if (this.multipool.address === undefined) return 0;

        const sharePriceParams = await this.multipool.read.getSharePriceParams();

        return Number(sharePriceParams[0]);
    }
}

export { MultipoolStore };
