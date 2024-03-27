import { Address, decodeAbiParameters, getContract, encodeAbiParameters } from 'viem';
import { makeAutoObservable, runInAction, when } from 'mobx';
import { ExternalAsset, MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { arbitrumPublicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { getForcePushPrice, parseError } from '@/lib/multipoolUtils';
import { JAMQuote, PARAM_DOMAIN, PARAM_TYPES } from '@/api/bebop';
import { BebopQuoteResponce } from '@/types/bebop';
import { Calls, Create, CreateSwapFromMultipool, swapToCalldata } from '@/api/uniswap';
import { createApproveCall, createTransferCall, createWrapCall, fromBigIntBigNumber, fromBigNumberBigInt, isETH, sortAssets } from './StoresUtils';

export enum ActionType {
    BEBOP = "bebop",
    ARCANUM = "arcanum",
    UNISWAP = "uniswap",
    UNAVAILABLE = "unavailable",
}

class MultipoolStore {
    // multipool related data
    logo: string | undefined;
    chainId: number | undefined;
    totalSupply: BigNumber | undefined;
    price: BigNumber | undefined;
    name: string | undefined;

    multipool = getContract({
        address: undefined as any,
        abi: multipoolABI,
        client: arbitrumPublicClient,
    });
    router = getContract({
        address: undefined as any,
        abi: routerABI,
        client: arbitrumPublicClient,
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

    prices: Record<Address, BigNumber> = {};

    swapIsLoading: boolean = false;
    multipoolIsLoading: boolean = true;
    assetsIsLoading: boolean = true;
    pricesIsLoading: boolean = true;

    constructor(mp_id: string, multipool: {
        name: string;
        address: `0x${string}`;
        router: `0x${string}`;
        logo: string;
        assets: MultipoolAsset[];
    }) {
        this.multipoolId = mp_id;

        this.multipool = getContract({
            address: multipool.address as Address,
            abi: multipoolABI,
            client: arbitrumPublicClient,
        });

        this.router = getContract({
            address: multipool.router as Address,
            abi: routerABI,
            client: arbitrumPublicClient,
        });

        this.logo = multipool.logo;
        this.assets = multipool.assets;
        this.name = multipool.name;

        this.setSelectedTabWrapper("mint");

        this.multipoolIsLoading = false;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setSlippage(value: number) {
        if (value == 0) {
            this.slippage = 0.5;
            return;
        }

        this.slippage = value;
    }

    get isExactInput() {
        return this.mainInput === "in" ? true : false;
    }

    get multipoolAddress(): Address {
        return this.multipool.address;
    }

    get getSolidAsset(): SolidAsset | undefined {
        return {
            symbol: this.name,
            decimals: 18,
            logo: this.logo,
            address: this.multipool.address,
            type: "solid",
            routerAddress: this.router.address,
            chainId: this.chainId,
            price: this.price,
        } as SolidAsset;
    }

    async getPriceFeeds() {
        await when(() => this.assets.length > 0);

        const multipool = {
            address: this.multipool.address,
            abi: multipoolABI,
        } as const;

        const result = await arbitrumPublicClient?.multicall({
            contracts: this.assets.map((asset) => {
                return {
                    ...multipool,
                    functionName: "getPriceFeed",
                    args: [asset.address]
                }
            })
        });

        const feedInfos = result?.map((result) => {
            return {
                feedType: (result.result as any).kind as bigint,
                feedData: decodeAbiParameters([{ name: "oracle", type: "address" }, { name: "reversed", type: "bool" }, { name: "twapInterval", type: "uint256" }], (result.result as any).data as Address)
            }
        });

        const feedInfosMap = new Map<Address, { feedType: bigint, oracle: Address, reversed: boolean, twapInterval: bigint }>();
        for (const [index, feedInfo] of feedInfos!.entries()) {
            feedInfosMap.set(this.assets[index].address!, { feedType: feedInfo.feedType, oracle: feedInfo.feedData[0], reversed: feedInfo.feedData[1], twapInterval: feedInfo.feedData[2] });
        }

        return feedInfosMap;
    }

    setExternalAssets(externalAssets: ExternalAsset[]) {
        runInAction(() => {
            this.externalAssets = externalAssets;
        });
    }

    updateMPPrice(price: BigNumber) {
        this.price = price;
    }

    setEtherPrice(etherPrice: number | undefined) {
        if (etherPrice === undefined) return;

        runInAction(() => {
            this.etherPrice = etherPrice;
        });
    }

    setTokens(_assets: MultipoolAsset[]) {
        if (_assets.length === 0) return;

        runInAction(() => {
            this.assets = _assets;
            this.assetsIsLoading = false;
            this.setAction("mint");
        });

        return _assets;
    }

    setPrices(_prices: Record<Address, BigNumber> | undefined) {
        if (_prices === undefined) return;
        runInAction(() => {
            for (const [address, price] of Object.entries(_prices)) {
                this.prices[address as Address] = price;
            }
        });

        return this.prices;
    }

    private uniswapCreateSelectedAssets(calls: Calls[]) {
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        if (this.inputAsset === undefined || this.outputAsset === undefined) return undefined;
        if (this.outputQuantity === undefined || this.inputQuantity === undefined) return undefined;

        const inputAssetAddress = this.inputAsset.address;
        const outputAssetAddress = this.outputAsset.address;

        const inputQuantity = this.inputQuantity;
        const outputQuantity = this.outputQuantity;

        if (calls.length === 0) return undefined;

        const slippageMultiplier = (100 - 0.5) / 100;
        const outputWithSlippage = outputQuantity.multipliedBy(slippageMultiplier);

        for (const call of calls) {
            selectedAssets.set(call.asset, fromBigNumberBigInt(call.amountOut));
        }
        selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputWithSlippage));

        if (this.isExactInput) {
            const outputWithSlippage = outputQuantity.multipliedBy(slippageMultiplier);

            selectedAssets.set(inputAssetAddress, fromBigNumberBigInt(inputQuantity));
            selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputWithSlippage));
        } else {
            const inputWithSlippage = inputQuantity.multipliedBy(slippageMultiplier);

            selectedAssets.set(inputAssetAddress, fromBigNumberBigInt(inputWithSlippage));
            selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputQuantity));
        }

        return sortAssets(selectedAssets);
    }

    // yeah im sorry for this
    private createSelectedAssets(slippage?: number) {
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        if (this.inputAsset === undefined || this.outputAsset === undefined) throw new Error("Input or output asset is undefined");

        const inputAssetAddress = this.inputAsset.address;
        const outputAssetAddress = this.outputAsset.address;

        const inputQuantity = this.inputQuantity;
        const outputQuantity = this.outputQuantity;

        if (slippage) {
            if (outputQuantity === undefined || inputQuantity === undefined) throw new Error("Output or input quantity is undefined");

            const slippageMultiplier = this.isExactInput ? (100 - slippage) / 100 : (100 + slippage) / 100;

            if (this.isExactInput) {
                const outputWithSlippage = outputQuantity.multipliedBy(slippageMultiplier);

                selectedAssets.set(inputAssetAddress, fromBigNumberBigInt(inputQuantity));
                selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputWithSlippage));
            } else {
                const inputWithSlippage = inputQuantity.multipliedBy(slippageMultiplier);

                selectedAssets.set(inputAssetAddress, fromBigNumberBigInt(inputWithSlippage));
                selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputQuantity.multipliedBy(-1)));
            }

            return sortAssets(selectedAssets);
        }

        if (this.isExactInput) {
            if (inputQuantity === undefined) throw new Error("Input quantity is undefined");

            selectedAssets.set(inputAssetAddress, fromBigNumberBigInt(inputQuantity));
            selectedAssets.set(outputAssetAddress, BigInt("-1000000000000000000"));
        } else {
            if (outputQuantity === undefined) throw new Error("Output quantity is undefined");

            selectedAssets.set(inputAssetAddress, BigInt("1000000000000000000"));
            selectedAssets.set(outputAssetAddress, fromBigNumberBigInt(outputQuantity.multipliedBy(-1)));
        }

        return sortAssets(selectedAssets);
    }

    private clearSwapData() {
        runInAction(() => {
            this.inputQuantity = undefined;
            this.outputQuantity = undefined;
            this.maximumSend = undefined;
            this.minimalReceive = undefined;
            this.fee = undefined;
            this.transactionCost = undefined;
        });
    }

    updateErrorMessage(e: any | undefined, parse?: boolean) {
        runInAction(() => {
            if (e === undefined) {
                this.exchangeError = undefined;
                return;
            }
            this.exchangeError = parseError(e, parse);
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

    async checkSwap(userAddress?: Address) {
        if (this.multipool.address == undefined) this.clearSwapData();

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
        if (this.inputAsset === undefined) throw new Error("Input asset is undefined");
        if (this.inputQuantity === undefined) return;

        const targetShares: Map<Address, BigNumber> = new Map<Address, BigNumber>();

        for (const asset of this.assets) {
            if (asset.address === undefined) throw new Error("Asset address is undefined");
            if (asset.idealShare === undefined) throw new Error("Ideal share is undefined");
            targetShares.set(asset.address, asset.idealShare);
        }

        const calls = await Create(targetShares, this.currentShares.data, this.inputAsset.address, this.inputQuantity, this.multipool.address);
        if (calls === undefined) throw new Error("Calls is undefined");

        const selectedAssets = Array.from(calls.selectedAssets).map(([address, amount]) => {
            return {
                assetAddress: address,
                amount: fromBigNumberBigInt(amount)
            }
        });
        selectedAssets.push({
            assetAddress: this.multipool.address,
            amount: BigInt("-1000000000000000000")
        });

        const sortedAssets = selectedAssets.sort((a, b) => {
            return BigInt(a.assetAddress) > BigInt(b.assetAddress) ? 1 : -1;
        });

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolAddress);

        const responce = await this.multipool.read.checkSwap(
            [
                fpSharePricePlaceholder,
                sortedAssets,
                this.isExactInput
            ]);

        const estimates = responce[1];

        // get the one element that negative
        const ArcanumETF = estimates.find((estimate) => estimate < 0n);
        if (ArcanumETF === undefined) throw new Error("ArcanumETF is undefined");

        runInAction(() => {
            this.outputQuantity = fromBigIntBigNumber(ArcanumETF);

            this.selectedAssets = selectedAssets;
            this.fee = responce[0];
            this.minimalReceive = ArcanumETF;

            this.swapIsLoading = false;
        });

        return {
            fee: responce[0],
            calls: calls.calldata,
        };
    }

    async checkSwapBebop(userAddress?: Address) {
        try {
            const JAMRequest = await JAMQuote({
                sellTokens: this.inputAsset!.address!,
                buyTokens: this.outputAsset!.address!,
                sellAmounts: this.inputQuantity,
                takerAddress: userAddress === undefined ? "0x000000000000000000000000000000000000dEaD" : userAddress,
            });

            if (JAMRequest === undefined) return;

            const prices: Map<string, BigNumber> = new Map<string, BigNumber>();

            prices.set(this.inputAsset!.address!, JAMRequest.sellPrice);
            prices.set(this.outputAsset!.address!, JAMRequest.buyPrice);

            runInAction(() => {
                if (this.outputQuantity !== JAMRequest.buyAmounts) {
                    this.outputQuantity = JAMRequest.buyAmounts
                }
                this.transactionCost = BigInt(JAMRequest.gasFee.toFixed(0));
                this.toSign = JAMRequest.toSign;
                this.orderId = JAMRequest.orderId;
            });

            return {
                PARAM_DOMAIN: PARAM_DOMAIN,
                PARAM_TYPES: PARAM_TYPES,
                orderId: JAMRequest.orderId,
                toSign: JAMRequest.toSign,
            };
        } catch (e) {
            this.updateErrorMessage(e, true);
        }
    }

    get dataToSign() {
        return {
            PARAM_DOMAIN: PARAM_DOMAIN,
            PARAM_TYPES: PARAM_TYPES,
            toSign: this.toSign,
            orderId: this.orderId,
        }
    }

    private async checkUniswapFromMultipool() {
        if (this.inputAsset === undefined) throw new Error("Input asset is undefined");
        if (this.inputQuantity === undefined) return;

        const forsePushPrice = await getForcePushPrice(this.multipoolAddress);

        const targetShares: Record<Address, BigNumber> = {};
        const selectedAssets: { assetAddress: `0x${string}`; amount: bigint; }[] = [];
        selectedAssets.push({
            assetAddress: this.multipool.address,
            amount: BigInt("-1000000000000000000")
        });

        for (const asset of this.assets) {
            if (asset.address === undefined) throw new Error("Asset address is undefined");
            if (asset.idealShare === undefined) throw new Error("Ideal share is undefined");
            targetShares[asset.address] = asset.idealShare.multipliedBy(0.95);
        }

        // So-o-o, for example for $SPI we have BTC, USDT, wstETH, and we want to use Uniswap for mint swaps, BUT we want it from WBTC
        // and here is deal - we left target share % of those WBTC tokens, then swap unused WBTC to WETH, and then swap WETH to USDT, wstETH

        // amount that will be just simply transfered to Multipool
        const leftInputAssetPersent = targetShares[this.inputAsset.address];

        // remove input asset from target shares
        delete targetShares[this.inputAsset.address];

        const inputTokenToTransfer = this.inputQuantity.multipliedBy(leftInputAssetPersent).dividedBy(100); // amount of input token that will be transfered to Multipool
        const leftInputAsset = this.inputQuantity.minus(inputTokenToTransfer); // amount of input token that will be used for swaps

        selectedAssets.push({
            assetAddress: this.inputAsset.address,
            amount: fromBigNumberBigInt(inputTokenToTransfer)
        });

        // now we will take each other token that we need to mint, and we will calculate how much we need to swap to get it
        const swapTo: Record<Address, BigNumber> = {};
        for (const [address, share] of Object.entries(targetShares)) {
            const amount = share.multipliedBy(leftInputAsset).dividedBy(100);

            swapTo[address as Address] = amount;
        }

        // now we will create calls for each swap
        const calls: Record<Address, Calls> = {};

        for (const [address, amount] of Object.entries(swapTo)) {
            const responce = await swapToCalldata(this.inputAsset.address, address as Address, amount, this.multipool.address);
            calls[address as Address] = responce;

            selectedAssets.push({
                assetAddress: address as Address,
                amount: fromBigNumberBigInt(responce.amountOut)
            });
        }

        // now we will create calls for each swap, AND send the transfer call to Multipool with leftInputAsset
        const calldata: {
            callType: number;
            data: `0x${string}`;
        }[] = [];
        for (const [_, call] of Object.entries(calls)) {
            calldata.push({
                callType: 2,
                data: call.data as Address,
            });
        }

        const sortedAssets = selectedAssets.sort((a, b) => {
            return BigInt(a.assetAddress) > BigInt(b.assetAddress) ? 1 : -1;
        });

        const responce = await this.multipool.read.checkSwap(
            [
                forsePushPrice,
                sortedAssets,
                true
            ]);

        runInAction(() => {
            const outputQuantity = responce[1].filter((amount) => amount < 0n)[0];
            this.outputQuantity = fromBigIntBigNumber(outputQuantity);
            this.fee = responce[0];
        });

        return {
            fee: responce[0],
            calls: Object.values(calls),
            transferCalls: [
                createTransferCall(this.inputAsset.address, this.multipool.address, fromBigNumberBigInt(inputTokenToTransfer)),
                createTransferCall(this.inputAsset.address, this.router.address, fromBigNumberBigInt(leftInputAsset))
            ],
            selectedAssets: selectedAssets
        };
    }

    async uniswapFromMultipool(userAddress?: Address) {
        if (this.multipool.address === undefined) throw new Error("Multipool address is undefined");
        if (this.router === undefined) throw new Error("Router is undefined");
        if (userAddress === undefined) throw new Error("User address is undefined");
        if (!this.inputQuantity) throw new Error("Input quantity is undefined");
        if (this.inputAsset === undefined) throw new Error("Input asset is undefined");

        const forsePushPrice = await getForcePushPrice(this.multipoolAddress);

        const feeData = await this.checkUniswapFromMultipool();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const selectedAssets = feeData.selectedAssets;
        if (selectedAssets === undefined) throw new Error("selectedAssets is undefined");

        const ethFee = feeData.fee < 0n ? 0n : feeData.fee;

        if (userAddress === undefined) {
            return {
                request: undefined,
                value: 0n
            };
        }

        const callsBeforeUniswap = feeData.calls.map((call) => {
            const data = encodeAbiParameters([{ name: "target", type: "address" }, { name: "ethValue", type: "uint256" }, { name: "targetData", type: "bytes" }], [call.to as Address, 0n, call.data as Address]);

            return {
                callType: 2,
                data: data,
            }
        });

        const ethValue = ethFee + (isETH(this.inputAsset) ? BigInt(this.inputQuantity.multipliedBy(1.005).toFixed(0)!) : 0n);
        const uniswapRouter = feeData.calls[0].to;

        // add call to transfer tokens to router as first call
        // const callsTransfer = this.encodeForcePushArgs(ActionType.UNISWAP);
        callsBeforeUniswap.unshift(feeData.transferCalls[0]);
        callsBeforeUniswap.unshift(feeData.transferCalls[1]);
        
        const approveCall = createApproveCall(this.inputAsset.address, uniswapRouter as Address, this.inputQuantity);
        callsBeforeUniswap.unshift(approveCall);

        console.log("selectedAssets", selectedAssets);

        const request = [
            this.multipool.address,
            {
                forcePushArgs: forsePushPrice,
                assetsToSwap: selectedAssets,
                isExactInput: this.isExactInput,
                receiverAddress: userAddress,
                refundEthToReceiver: true,
                refundAddress: userAddress,
                ethValue: ethFee
            },
            callsBeforeUniswap,
            []
        ] as const;

        const value = {
            account: userAddress,
            value: ethValue
        } as const;

        const gas = await this.router.estimateGas.swap(request, value);
        const gasPrice = await arbitrumPublicClient.getGasPrice();

        this.updateGas(gas, gasPrice);

        await this.router.simulate.swap(request, value);

        return {
            request: request,
            value: ethFee
        };
    }

    private async checkSwapMultipool(userAddress?: Address) {
        const skipEstimateAndSimulate = userAddress == undefined;

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolAddress);
        const selectedAssets = this.createSelectedAssets();
        if (selectedAssets === undefined) throw new Error("selectedAssets is undefined");

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
                if (this.inputQuantity === undefined) throw new Error("inputQuantity is undefined");
                if (firstTokenAddress === this.inputAsset?.address) {
                    this.outputQuantity = new BigNumber(secondTokenQuantity.toString());
                    this.minimalReceive = secondTokenQuantity;
                } else {
                    this.outputQuantity = new BigNumber(firstTokenQuantity.toString());
                    this.minimalReceive = firstTokenQuantity;
                }
            } else {
                this.minimalReceive = undefined;
                if (this.outputQuantity === undefined) throw new Error("outputQuantity is undefined");
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
        if (newSelectedAssets === undefined) throw new Error("newSelectedAssets is undefined");

        const newArgs = this.encodeForcePushArgs(ActionType.ARCANUM);
        if (newArgs === undefined) throw new Error("newArgs is undefined");

        if (!skipEstimateAndSimulate) {
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
                [newArgs],
                []
            ],
                {
                    account: userAddress,
                    value: ethFee
                }
            );

            const gasPrice = await arbitrumPublicClient?.getGasPrice();

            runInAction(() => {
                this.transactionCost = gas * gasPrice;
            });
        }

        return {
            fee: res[0],
            calls: [newArgs],
        };
    }

    private encodeForcePushArgs(action: ActionType): {
        callType: number;
        data: `0x${string}`;
    } {
        if (this.inputAsset === undefined) throw new Error("Input asset is undefined");
        if (this.inputQuantity === undefined) throw new Error("inputQuantity is undefined");
        if (this.router.address === undefined) throw new Error("Router address is undefined");

        const inputQuantity = this.inputQuantity.abs();
        const inputAddress = this.inputAsset.address;
        const target = action === ActionType.UNISWAP ? this.router.address : this.multipool.address;

        const inputsWithSlippage = this.createSelectedAssets(this.slippage);

        if (inputsWithSlippage === undefined) {
            return createTransferCall(this.inputAsset.address, target, inputQuantity);
        }
        const _inputTokenQuantityWithSlippage = inputsWithSlippage.find((asset) => asset.assetAddress === inputAddress);
        if (_inputTokenQuantityWithSlippage === undefined) throw new Error("_inputTokenQuantityWithSlippage is undefined");
        const inputTokenQuantityWithSlippage = _inputTokenQuantityWithSlippage.amount;

        return createTransferCall(inputAddress, target, inputTokenQuantityWithSlippage);
    }

    async swapUniswap(userAddress?: Address) {
        if (this.multipool.address === undefined) throw new Error("Multipool address is undefined");
        if (this.router === undefined) throw new Error("Router is undefined");
        if (userAddress === undefined) throw new Error("User address is undefined");
        if (!this.inputQuantity) throw new Error("Input quantity is undefined");
        if (this.inputAsset === undefined) throw new Error("Input asset is undefined");
        if (this.inputAsset.address === undefined) throw new Error("Input asset address is undefined");

        const isExactInput = this.mainInput === "in" ? true : false;
        const forsePushPrice = await getForcePushPrice(this.multipoolAddress);

        const feeData = await this.checkSwapUniswap();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const selectedAssets = this.uniswapCreateSelectedAssets(feeData.calls);
        if (selectedAssets === undefined) throw new Error("selectedAssets is undefined");

        // remove input asset from selected assets
        const _selectedAssets = selectedAssets.filter((asset) => asset.assetAddress !== this.inputAsset?.address);

        const _ethFee = feeData.fee < 0n ? 0n : feeData.fee;

        if (userAddress === undefined) {
            return {
                request: undefined,
                value: 0n
            };
        }

        const ethFeeBG = new BigNumber(_ethFee.toString()).multipliedBy(1.01).toFixed(0);
        const ethFee = BigInt(ethFeeBG);

        const callsBeforeUniswap = feeData.calls.map((call) => {
            const data = encodeAbiParameters([{ name: "target", type: "address" }, { name: "ethValue", type: "uint256" }, { name: "targetData", type: "bytes" }],
                [call.to as Address, 0n, call.data as Address]);

            return {
                callType: 2,
                data: data,
            }
        });

        const ethValue = ethFee + (isETH(this.inputAsset) ? BigInt(this.inputQuantity.multipliedBy(1.005).toFixed(0)!) : 0n);
        const uniswapRouter = feeData.calls[0].to;

        if (!isETH(this.inputAsset)) {
            const approveCall = createApproveCall(this.inputAsset.address, uniswapRouter as Address, this.inputQuantity);
            callsBeforeUniswap.unshift(approveCall);

            // add call to transfer tokens to router as first call
            const callsTransfer = this.encodeForcePushArgs(ActionType.UNISWAP);
            callsBeforeUniswap.unshift(callsTransfer);
        } else {
            const wrapCall = createWrapCall(true, this.inputQuantity);
            callsBeforeUniswap.unshift(wrapCall);

            const approveCall = createApproveCall("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" as Address, uniswapRouter as Address, this.inputQuantity.multipliedBy(1.01));
            callsBeforeUniswap.unshift(approveCall);
        }

        const request = [
            this.multipool.address as Address,
            {
                forcePushArgs: forsePushPrice,
                assetsToSwap: _selectedAssets,
                isExactInput: isExactInput,
                receiverAddress: userAddress,
                refundEthToReceiver: true,
                refundAddress: userAddress,
                ethValue: ethFee
            },
            callsBeforeUniswap,
            []
        ] as const;

        const value = {
            account: userAddress,
            value: ethValue
        } as const;

        const gas = await this.router.estimateGas.swap(request, value);
        const gasPrice = await arbitrumPublicClient?.getGasPrice();
        await this.router.simulate.swap(request, value);

        this.updateGas(gas, gasPrice!);

        return {
            request: request,
            value: ethValue
        };
    }

    async swapMultipool(userAddress?: Address) {
        if (this.multipool.address === undefined) throw new Error("Multipool address is undefined");
        if (this.router === undefined) throw new Error("Router is undefined");

        const isExactInput = this.mainInput === "in" ? true : false;
        const forsePushPrice = await getForcePushPrice(this.multipoolAddress);

        const feeData = await this.checkSwapMultipool(userAddress);
        if (feeData === undefined) throw new Error("feeData is undefined");

        const selectedAssets = this.createSelectedAssets(this.slippage);
        if (selectedAssets === undefined) throw new Error("selectedAssets is undefined");

        const ethFee = feeData.fee < 0n ? 0n : feeData.fee;

        const callsTransfer = this.encodeForcePushArgs(ActionType.ARCANUM);
        if (callsTransfer === undefined) throw new Error("callsTransfer is undefined");

        if (!userAddress) {
            return {
                request: undefined,
                value: 0n
            };
        }

        const request = [
            this.multipool.address as Address,
            {
                forcePushArgs: forsePushPrice,
                assetsToSwap: selectedAssets,
                isExactInput: isExactInput,
                receiverAddress: userAddress,
                refundEthToReceiver: false,
                refundAddress: userAddress,
                ethValue: ethFee
            },
            [callsTransfer],
            []
        ] as const;

        const value = {
            account: userAddress,
            value: ethFee
        } as const;


        const gas = await this.router.estimateGas.swap(request, value);
        const gasPrice = await arbitrumPublicClient.getGasPrice();

        this.updateGas(gas, gasPrice);

        await this.router.simulate.swap(request, value);

        return {
            request: request,
            value: ethFee
        };
    }

    setInputAsset(
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
    ) {
        this.clearSwapData();
        this.exchangeError = undefined;
        this.inputAsset = asset;
        this.outputQuantity = undefined;
    }

    setOutputAsset(
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
    ) {
        this.clearSwapData();
        this.exchangeError = undefined;
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

        if (this.inputAsset === undefined || this.outputAsset === undefined) return;

        const quantityBG = new BigNumber(value);

        const decimals = direction == "Send" ? this.inputAsset.decimals : this.outputAsset.decimals;

        // so here we have idiot check, WBTC has 6 decimals, but user might input 0.0000001, so we need to prevent this
        const dp = quantityBG.decimalPlaces();
        if (dp != null) {
            if (dp > decimals) {
                this.exchangeError = `Too many decimal places ${direction}`;
                return;
            }
        }

        const divider = new BigNumber(10).pow(decimals);
        const quantity = quantityBG.times(divider);

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
            runInAction(() => {
                this.inputQuantity = undefined;
                this.outputQuantity = undefined;
            });
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
        if (this.assetsIsLoading) return; // #31
        this.clearSwapData();
        runInAction(() => {
            this.exchangeError = undefined;
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
        if (this.swapType === ActionType.UNISWAP) {
            this.mainInput = "in";
            return;
        }
        if (this.swapType === ActionType.BEBOP) {
            this.mainInput = "in";
            return;
        }
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
        if (this.assets.some((asset) => this.prices[asset.address] === undefined || asset.multipoolQuantity === undefined)) {
            return {
                data: new Map<Address, BigNumber>(),
                isLoading: true
            };
        }

        const totalDollarValue = this.assets.reduce((acc, asset) => {
            return acc.plus(this.prices[asset.address]!.multipliedBy(asset.multipoolQuantity.dividedBy(10 ** asset.decimals)));
        }, new BigNumber(0)).multipliedBy(this.etherPrice);

        const addressToShare = new Map<Address, BigNumber>();

        for (const asset of this.assets) {
            if (this.prices[asset.address]!.isEqualTo(0)) {
                addressToShare.set(asset.address!, BigNumber(0));
                continue;
            }
            if (asset.multipoolQuantity.isEqualTo(0)) {
                addressToShare.set(asset.address!, BigNumber(0));
                continue;
            }

            const assetValue = this.prices[asset.address]!.multipliedBy(asset.multipoolQuantity).dividedBy(10 ** asset.decimals).multipliedBy(this.etherPrice);

            const share = new BigNumber(assetValue).dividedBy(totalDollarValue).multipliedBy(100);

            addressToShare.set(asset.address!, share);
        }

        return {
            data: addressToShare,
            isLoading: false
        };
    }

    getItemPrice(direction: "Send" | "Receive"): BigNumber {
        if (this.multipool.address === undefined || this.assetsIsLoading) return BigNumber(0);

        const thisPrice = direction == "Send" ? this.inputAsset?.address : this.outputAsset?.address;

        if (thisPrice === undefined) return BigNumber(0);

        // check if address is multipool address
        if (thisPrice === this.multipool.address.toString()) {
            const bigintPrice = BigInt(this.price?.toFixed() ?? "0");
            return fromX96(bigintPrice, 18) ?? BigNumber(0);
        }

        if (this.prices[thisPrice] === undefined) return BigNumber(0);

        return this.prices[thisPrice];
    }

    hrQuantity(direction: "Send" | "Receive"): string {
        if (this.inputAsset === undefined || this.outputAsset === undefined) return "0";

        const decimals = direction == "Send" ? this.inputAsset.decimals : this.outputAsset.decimals;
        const divider = new BigNumber(10).pow(decimals);

        const quantity = direction == "Send" ? this.inputQuantity : this.outputQuantity;

        if (quantity === undefined) return "0";

        let _val = new BigNumber(quantity.div(divider).toFixed(12));

        return _val.absoluteValue().decimalPlaces(12).toFormat();
    }

    async getSharePriceParams(): Promise<number> {
        if (this.multipool.address === undefined) return 0;

        const sharePriceParams = await this.multipool.read.getSharePriceParams();

        return Number(sharePriceParams[0]);
    }

    updateGas(gas: bigint, gasPrice: bigint) {
        runInAction(() => {
            this.transactionCost = gas * gasPrice;
        });
    }
}

export { MultipoolStore };
