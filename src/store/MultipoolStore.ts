import { ExternalAsset, MultipoolAsset, SolidAsset } from '@/types/multipoolAsset';
import { makeAutoObservable, runInAction } from 'mobx';
import { Address, getContract } from 'viem';
import { publicClient } from '@/config';
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { fromX96 } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { encodeAbiParameters } from 'viem'
import ERC20 from '@/abi/ERC20';
import { getMultipool } from '@/api/arcanum';
import { getForcePushPrice, parseError } from '@/lib/multipoolUtils';


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
            await this.updatePrices();
        }, 30000);

        this.setSelectedTabWrapper("mint");

        makeAutoObservable(this, {}, { autoBind: true });
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

    async updatePrices() {
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

        const prices = await this.publicClient?.multicall({
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

    private createSelectedAssets(slippage?: number): { assetAddress: `0x${string}`; amount: bigint; }[] {
        const selectedAssets: Map<Address, bigint> = new Map<Address, bigint>();

        if (this.inputAsset === undefined || this.outputAsset === undefined) return [];

        if (slippage === undefined) {
            if (this.isExactInput) {
                selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed()));
                selectedAssets.set(this.outputAsset!.address!, BigInt("-1000000000000000000"));
            } else {
                selectedAssets.set(this.inputAsset!.address!, BigInt("1000000000000000000"));
                selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.multipliedBy(-1).toFixed()));
            }
        } else {
            if (this.isExactInput) {
                const slippageMultiplier = (100 - slippage) / 100;
                const outputWithSlippage = this.outputQuantity!.multipliedBy(slippageMultiplier);

                selectedAssets.set(this.inputAsset!.address!, BigInt(this.inputQuantity!.toFixed()));
                selectedAssets.set(this.outputAsset!.address!, BigInt(outputWithSlippage.toFixed()));
            } else {
                const slippageMultiplier = (100 + slippage) / 100;
                const inputWithSlippage = this.inputQuantity!.multipliedBy(slippageMultiplier);

                selectedAssets.set(this.inputAsset!.address!, BigInt(inputWithSlippage.toFixed()));
                selectedAssets.set(this.outputAsset!.address!, BigInt(this.outputQuantity!.multipliedBy(-1).toFixed()));
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

            if (this.isExactInput) {
                this.outputQuantity = undefined;
            } else {
                this.inputQuantity = undefined;
            }
        });
    }

    private updateErrorMessage(e: any) {
        runInAction(() => {
            this.exchangeError = parseError(e);
        });
    }

    async checkSwap() {
        if (this.multipool.address === undefined) return;
        this.clearSwapData();

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolId);

        try {
            const res = await this.multipool.read.checkSwap(
                [
                    fpSharePricePlaceholder,
                    this.createSelectedAssets(),
                    this.isExactInput
                ]);

            const estimates = res[1];
            const firstTokenQuantity = estimates[0];
            const secondTokenQuantity = estimates[1];

            const firstTokenAddress = this.createSelectedAssets().keys().next().value;

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

            return res;
        } catch (e) {
            this.updateErrorMessage(e);
        }
    }

    private get encodeForcePushArgs(): Address {
        return encodeAbiParameters(
            [
                { name: "token", type: "address" },
                { name: "targetOrOrigin", type: "address" },
                { name: "amount", type: "uint256" }
            ],
            [this.inputAsset!.address!, this.multipool.address!, BigInt(this.inputQuantity!.toFixed())]
        )
    }

    async estimateGas(userAddress: Address) {
        if (this.multipool.address === undefined) return;
        if (this.router === undefined) return;

        if (this.transactionCost !== undefined) return;
        if (this.inputQuantity === undefined || this.outputQuantity === undefined) return;

        const fpSharePricePlaceholder = await getForcePushPrice(this.multipoolId);

        const feeData = await this.checkSwap();
        if (feeData === undefined) return;

        const ethFee: bigint = feeData[0] < 0 ? 0n : feeData[0];

        try {
            const gas = await this.router.estimateGas.swap([
                this.multipool.address,
                {
                    forcePushArgs: fpSharePricePlaceholder,
                    assetsToSwap: this.createSelectedAssets(this.slippage),
                    isExactInput: this.isExactInput,
                    receiverAddress: userAddress,
                    refundEthToReceiver: false,
                    refundAddress: userAddress,
                    ethValue: ethFee
                },
                [
                    {
                        callType: 0,
                        data: this.encodeForcePushArgs
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
            this.updateErrorMessage(e);
        }
    }

    async swap(userAddress: Address) {
        if (this.multipool.address === undefined) return;
        if (this.router === undefined) return;

        const isExactInput = this.mainInput === "in" ? true : false;

        const assetsArg = this.createSelectedAssets(this.slippage);
        const forsePushPrice = await getForcePushPrice(this.multipoolId);

        const feeData = await this.checkSwap();
        if (feeData === undefined) throw new Error("feeData is undefined");

        const ethFee = feeData[0] < 0n ? 0n : feeData[0];

        try {
            const { request } = await this.router.simulate.swap([
                this.multipool.address,
                {
                    forcePushArgs: forsePushPrice,
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
                        data: this.encodeForcePushArgs
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
            this.updateErrorMessage(e);
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
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
    ) {
        this.inputAsset = asset;
        this.outputQuantity = undefined;
        this.checkSwap();
    }

    setOutputAsset(
        asset: MultipoolAsset | SolidAsset | ExternalAsset,
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
        data: Map<string, BigNumber>,
        isLoading: boolean
    } {
        if (this.assets.length === 0) {
            return {
                data: new Map<string, BigNumber>(),
                isLoading: true
            };
        }
        const multipoolAssets = this.assets.filter((asset) => asset != undefined).filter((asset) => asset.type === "multipool") as MultipoolAsset[];
        if (multipoolAssets.some((asset) => asset.price === undefined || asset.multipoolQuantity === undefined)) {
            return {
                data: new Map<string, BigNumber>(),
                isLoading: true
            };
        }

        const totalDollarValue = multipoolAssets.reduce((acc, asset) => {
            return acc.plus(asset.price.multipliedBy(asset.multipoolQuantity));
        }, new BigNumber(0));

        const addressToShare = new Map<string, BigNumber>();

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
        const asset = this.assets.find((asset) => asset.address === thisPrice) as MultipoolAsset;
        if (asset === undefined) return BigNumber(0);

        if (asset.price === undefined) {
            return BigNumber(0);
        }

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
