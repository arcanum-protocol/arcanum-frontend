import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { Skeleton } from "./ui/skeleton";
import { useMultipoolStore } from "@/contexts/StoreContext";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Address } from "viem";
import { tohumanReadableQuantity } from "@/lib/utils";
import { getExternalAssets } from "@/lib/multipoolUtils";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { getAssetInfo } from "@/api/arcanum";
import { toJS } from "mobx";

export function tohumanReadableCashback(number: BigNumber, etherPrice: number | undefined, decimals = 18) {
    if (etherPrice === undefined) {
        return "0";
    }

    const _decimals = new BigNumber(10).pow(decimals);

    if (number == undefined) {
        return "0";
    }
    const _number = new BigNumber(number.toString());

    const value = _number.dividedBy(_decimals).multipliedBy(etherPrice);
    return value.toFixed(2) + "$";
}

function PfP({ logo, symbol, idealShare }: { logo: string | undefined, symbol: string, idealShare: BigNumber | undefined }) {
    const { data: tokenInfo } = useQuery({
        queryKey: ["token-profile", symbol],
        queryFn: async () => {
            const tokenInfo = await getAssetInfo(symbol);
            return tokenInfo;
        },
        enabled: !!idealShare,
        initialData: {
            name: symbol,
            description: "",
            website: "",
            twitter: "",
            logo: logo,
        },
        staleTime: Infinity
    });

    if (!idealShare) {
        return (
            <TableCell>
                <Skeleton className="rounded w-16 h-4" />
            </TableCell>
        );
    }

    return (
        <TableCell>
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className="flex items-center space-x-2 hover:cursor-pointer hover:bg-[#1a1a1a] hover:shadow-lg rounded-lg p-2 w-16 h-4">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={logo} />
                            <AvatarFallback>{symbol}</AvatarFallback>
                        </Avatar>
                        <div className={`${idealShare.isEqualTo(0) ? "line-through" : ""}`}>{symbol}</div>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent>
                    <div className="flex flex-col items-center">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={logo} />
                            <AvatarFallback>{symbol}</AvatarFallback>
                        </Avatar>
                        <div className="text-lg font-bold">{tokenInfo.name}</div>
                        <div className="text-sm">{tokenInfo.description}</div>
                        <div className="flex items-center space-x-2">
                            <a href={tokenInfo.website} target="_blank" rel="noreferrer" className="text-blue-500">Website</a>
                            <a href={tokenInfo.twitter} target="_blank" rel="noreferrer" className="text-blue-500">Twitter</a>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </TableCell>
    );
}

function IdealShare({ idealShare }: { idealShare: BigNumber | undefined }) {
    if (!idealShare) {
        return (
            <TableCell>
                <Skeleton className="rounded w-16 h-4" />
            </TableCell>
        );
    }

    return (
        <TableCell>
            <p>{idealShare.toFixed(4)}%</p>
        </TableCell>
    );
}

const CurrentShare = observer(({ token }: { token: Address }) => {
    const { currentShares } = useMultipoolStore()
    const { data: shares, isLoading } = currentShares;

    if (isLoading) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    const share = shares.get(token);

    if (!share) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    if (share.isNaN()) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    return (
        <TableCell>
            <p>{share.toFixed(4)}%</p>
        </TableCell>
    );
});

function PriceCell({ price, etherPrice: _etherPrice }: { price: BigNumber | undefined, etherPrice: number | undefined }) {
    const [previousPrice, _setPreviousPrice] = useState<BigNumber>(BigNumber(0));

    function setPreviousPrice(price: BigNumber) {
        setTimeout(() => _setPreviousPrice(price), 1000);
    }

    if (!price) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    if (!_etherPrice) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    const etherPrice = new BigNumber(_etherPrice);

    const _price = price.multipliedBy(etherPrice).decimalPlaces(4).toFormat();

    if (price.isNaN() || price.isZero()) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    if (previousPrice.isEqualTo(0)) {
        _setPreviousPrice(price);
        return (
            <TableCell>
                <p className={`transition-colors duration-1000`}>{_price}$</p>
            </TableCell>
        );
    }

    if (price.isEqualTo(previousPrice)) {
        return (
            <TableCell>
                <p className={`transition-colors duration-1000`}>{_price}$</p>
            </TableCell>
        );
    }
    if (price.isGreaterThan(previousPrice)) {
        setPreviousPrice(price);

        return (
            <TableCell>
                <p className={`text-green-400 transition-colors duration-1000`}>{_price}$</p>
            </TableCell>
        );
    }
    if (price.isLessThan(previousPrice)) {
        setPreviousPrice(price);

        return (
            <TableCell>
                <p className={`text-red-400 transition-colors duration-1000`}>{_price}$</p>
            </TableCell>
        );
    }

    return (
        <TableCell>
            <p className={`transition-colors duration-1000`}>{_price}$</p>
        </TableCell>
    );
}

function Balance({ symbol, balance, decimals }: { symbol: string, balance: BigNumber | undefined, decimals: number }) {
    if (!balance) {
        return (
            <TableCell>
                <Skeleton className="rounded w-16 h-4" />
            </TableCell>
        );
    }

    return (
        <TableCell>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="items-center text-lg lg:text-sm">
                        <p>
                            {balance === undefined ? "0.000" : tohumanReadableQuantity(balance, decimals)}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                        <p>
                            {balance === undefined ? "0" : balance.dividedBy(BigNumber(10).pow(decimals)).toFixed()} {symbol}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </TableCell>
    );
}

const Deviation = observer(({ idealShare, token }: {
    idealShare: BigNumber | undefined, token: Address
}) => {
    const { currentShares } = useMultipoolStore();
    const { data: shares, isLoading } = currentShares;

    if (isLoading) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    const share = shares.get(token);

    if (!share || share.isNaN()) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    if (share.isZero()) {
        return (
            <TableCell>
                <p>0%</p>
            </TableCell>
        );
    }

    if (!idealShare || idealShare.isNaN() || idealShare.isZero()) {
        return (
            <TableCell>
                <Skeleton className="rounded w-full h-4" />
            </TableCell>
        );
    }

    const deviation = share.minus(idealShare);
    const color = deviation.isGreaterThan(0) ? "text-green-400" : "text-red-400";

    return (
        <TableCell className={color}>
            <p>{deviation.toFixed(4)}%</p>
        </TableCell>
    );
});

export const IndexAssetsBreakdown = observer(() => {
    const { assetsIsLoading, assets, setExternalAssets, setPrices, currentShares, prices, etherPrice } = useMultipoolStore();

    useQuery({
        queryKey: ["external-assets"],
        queryFn: async () => {
            const externalAssets = await getExternalAssets();

            const prices: Record<Address, BigNumber> = {};
            for (const asset of externalAssets) {
                prices[asset.address] = asset.price;
            }

            setExternalAssets(externalAssets);
            setPrices(prices);

            return externalAssets;
        },
        refetchInterval: 15000,
        initialData: []
    });

    if (assetsIsLoading) {
        return (
            <Skeleton className="hidden sm:table relative w-[897px] md:w-full overflow-auto rounded border h-[225.20px]">
            </Skeleton>
        );
    }

    const multipoolAssets = assets.slice()
        .sort((asset1, asset2) => {
            if (asset1.idealShare === undefined || asset2.idealShare === undefined) {
                return 0;
            }

            return asset2.idealShare.comparedTo(asset1.idealShare);
        });

    return (
        <div className="hidden sm:table w-full">
            <Table className="bg-[#0c0a09]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[20%] text-left">Asset</TableHead>
                        <TableHead className="w-[14%] text-center">Target</TableHead>
                        <TableHead className="w-[14%] text-center">Current</TableHead>
                        <TableHead className="w-[14%] text-center">Price</TableHead>
                        <TableHead className="w-[14%] text-center">Quantity</TableHead>
                        <TableHead className="w-[14%] text-center">Deviation</TableHead>
                        <TableHead className="w-[14%] text-center">Cashbacks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        multipoolAssets
                            .map((fetchedAsset) => {
                                const balance = fetchedAsset.multipoolQuantity;

                                return (
                                    <TableRow key={fetchedAsset.address}>
                                        <PfP logo={fetchedAsset.logo} symbol={fetchedAsset.symbol} idealShare={fetchedAsset.idealShare} />
                                        <IdealShare idealShare={fetchedAsset.idealShare} />
                                        <CurrentShare token={fetchedAsset.address} />
                                        <PriceCell price={prices[fetchedAsset.address]} etherPrice={etherPrice} />
                                        <Balance symbol={fetchedAsset.symbol} balance={balance} decimals={fetchedAsset.decimals} />
                                        <Deviation idealShare={fetchedAsset.idealShare} token={fetchedAsset.address} />
                                        <TableCell>{tohumanReadableCashback(fetchedAsset.collectedCashbacks, etherPrice)}</TableCell>
                                    </TableRow>
                                )
                            })
                    }
                </TableBody>
            </Table>
        </div>
    );
});
