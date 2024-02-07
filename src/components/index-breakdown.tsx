import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { Skeleton } from "./ui/skeleton";
import { useStore } from "@/contexts/StoreContext";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { Address } from "viem";

export function tohumanReadableQuantity(number: BigNumber, decimals = 18) {
    const subsrint = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
    const _decimals = new BigNumber(10).pow(decimals);
    if (number.dividedBy(_decimals).isLessThan(0.001)) {
        const _number = number.dividedBy(_decimals).toFixed();
        const numberWithout_zerodotzero = _number.substring(3, _number.length);

        // regex to remove trailing zeros
        const numberWithoutTrailingZeros = numberWithout_zerodotzero.replace(/^0+(?=\d)/, '');
        const trailingZerosCount = numberWithout_zerodotzero.length - numberWithoutTrailingZeros.length;
        // replase the zeros with the subscript
        const numberWithSubscript = trailingZerosCount.toString().split("").map((char) => subsrint[parseInt(char)]).join("");

        return `0.0${numberWithSubscript}${numberWithoutTrailingZeros}`;
    } else {
        const _decimals = new BigNumber(10).pow(decimals);
        const _number = new BigNumber(number.toString());

        const value = _number.dividedBy(_decimals);
        return value.toFixed(3);
    }
}

export function tohumanReadableCashback(number: BigNumber, etherPrice: number, decimals = 18) {
    const _decimals = new BigNumber(10).pow(decimals);

    if (number == undefined) {
        return "0";
    }
    const _number = new BigNumber(number.toString());

    const value = _number.dividedBy(_decimals).multipliedBy(etherPrice);
    return value.toFixed(2) + "$";
}

function getNewColor(direction: "increase" | "decrease" | "none" | undefined) {
    if (direction === 'increase') {
        return 'text-green-400';
    } else if (direction === 'decrease') {
        return 'text-red-400';
    } else {
        return '';
    }
}

export const IndexAssetsBreakdown = observer(() => {
    const { assetsIsLoading, assets, setTokens, setExternalAssets, currentShares, etherPrice, setEtherPrice, getPrices, setPrices } = useStore();
    const [priceChangeColor, setPriceChangeColor] = useState<Map<Address, "increase" | "decrease" | "none"> | undefined>(undefined);

    const { isLoading } = useQuery(["assets"], async () => {
        await Promise.all([setTokens(), setExternalAssets()]);

        return 1;
    }, {
        retry: true,
        refetchOnWindowFocus: false,
        refetchInterval: 1000,
        enabled: assetsIsLoading,
    });

    useQuery(["etherPrice"], async () => {
        const previousPrices: Map<Address, BigNumber> = new Map();
        getPrices.forEach((value, key) => {
            previousPrices.set(key, value);
        });

        await setEtherPrice();
        await setPrices();

        const newPrices: Map<Address, BigNumber> = new Map();
        getPrices.forEach((value, key) => {
            newPrices.set(key, value);
        });

        const priceChangeColor: Map<Address, "increase" | "decrease" | "none"> = new Map();

        newPrices.forEach((value, key) => {
            const previousPrice = previousPrices.get(key);
            if (previousPrice != undefined) {
                if (value.isGreaterThan(previousPrice)) {
                    priceChangeColor.set(key, 'increase');
                } else if (value.isLessThan(previousPrice)) {
                    priceChangeColor.set(key, 'decrease');
                } else {
                    priceChangeColor.set(key, "none");
                }
            }
        });

        setPriceChangeColor(priceChangeColor);

        return 1;
    }, {
        refetchInterval: 1000,
        retry: true,
        refetchOnWindowFocus: false,
    });

    if (isLoading || assetsIsLoading) {
        return (
            <Skeleton className="hidden sm:table relative w-[897px] overflow-auto rounded border h-[225.2px]">
            </Skeleton>
        );
    }

    return (
        <div className="hidden sm:table w-full">
            <Table className="bg-[#0c0a09]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">Asset</TableHead>
                        <TableHead className="text-center">Target</TableHead>
                        <TableHead className="text-center">Current</TableHead>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-center">Deviation</TableHead>
                        <TableHead className="text-center">Cashbacks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        assets.map((fetchedAsset) => {
                            const { data: shares, isLoading } = currentShares;

                            if (fetchedAsset.address == undefined) {
                                return null;
                            }

                            if (getPrices.get(fetchedAsset.address) == undefined) {
                                return null;
                            }

                            const _etherPrice = new BigNumber(etherPrice.toString());
                            const price = getPrices.get(fetchedAsset.address)!.multipliedBy(_etherPrice);

                            const idealShare = fetchedAsset.idealShare ?? new BigNumber(0);
                            const currentShare = shares.get(fetchedAsset.address!) ?? new BigNumber(0);

                            const Deviation = idealShare.minus(currentShare);
                            const color = Deviation.isLessThan(0) ? "text-red-400" : "text-green-400";

                            const balance = fetchedAsset.multipoolQuantity;

                            const priceChangeColorClass = priceChangeColor?.get(fetchedAsset.address);
                            const colorPrice = getNewColor(priceChangeColorClass);

                            return (
                                <TableRow key={fetchedAsset.address}>
                                    <TableCell className="text-left">
                                        <div className="flex flex-row items-center gap-2">
                                            <Avatar className="w-5 h-5">
                                                <AvatarImage src={fetchedAsset.logo == null ? undefined : fetchedAsset.logo} />
                                                <AvatarFallback>{fetchedAsset.symbol}</AvatarFallback>
                                            </Avatar>
                                            {fetchedAsset.symbol}
                                        </div>
                                    </TableCell>
                                    <TableCell>{idealShare.toFixed(4)}%</TableCell>
                                    {
                                        isLoading ? <TableCell className="text-center"><Skeleton className="rounded w-16 h-4" /></TableCell> : <TableCell>{currentShare.toFixed(4)}%</TableCell>
                                    }
                                    <TableCell>
                                        <p className={`${colorPrice} transition-colors duration-1000`}>
                                            {price.toFixed(4)}$
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild className="items-center text-lg lg:text-sm">
                                                    <p>
                                                        {balance === undefined ? "0.000" : tohumanReadableQuantity(balance, fetchedAsset.decimals)}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                                    <p>
                                                        {balance === undefined ? "0" : balance.dividedBy(BigNumber(10).pow(fetchedAsset.decimals)).toFixed()} {fetchedAsset.symbol}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className={color}>{Deviation.toFixed(3)} %</TableCell>
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
