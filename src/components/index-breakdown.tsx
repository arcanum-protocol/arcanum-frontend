import { toHumanReadable } from "../lib/format-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { Skeleton } from "./ui/skeleton";
import { MultipoolAsset } from "@/types/multipoolAsset";
import { useStore } from "@/contexts/StoreContext";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";


export const IndexAssetsBreakdown = observer(() => {
    const { assets, setTokens, setExternalAssets, currentShares, etherPrice, setEtherPrice } = useStore();

    const { isLoading } = useQuery(["assets"], async () => {
        await Promise.all([setTokens(), setExternalAssets()]);

        return 1;
    }, {
        retry: true,
    });

    useQuery(["etherPrice"], async () => {
        await setEtherPrice();

        return 1;
    }, {
        refetchInterval: 15000,
        retry: true,
    });

    if (isLoading) {
        return (
            <Skeleton className="relative w-[897px] overflow-auto rounded border h-[225.2px]">
            </Skeleton>
        );
    }

    const fetchedAssets = assets!.filter((asset) => asset != undefined).filter((asset) => asset.type === "multipool") as MultipoolAsset[];

    function tohumanReadableQuantity(number: BigNumber, decimals = 18) {
        const _decimals = new BigNumber(10).pow(decimals);

        if (number == undefined) {
            return "0";
        }
        const _number = new BigNumber(number.toString());

        const value = _number.dividedBy(_decimals);
        return toHumanReadable(value.toString(), 2);
    }

    function tohumanReadableCashback(number: BigNumber, decimals = 18) {
        const _decimals = new BigNumber(10).pow(decimals);

        if (number == undefined) {
            return "0";
        }
        const _number = new BigNumber(number.toString());

        const value = _number.dividedBy(_decimals).multipliedBy(etherPrice);
        return value.toFixed(2) + "$";
    }

    return (
        <Table className="hidden sm:table bg-[#0c0a09]">
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
                    fetchedAssets.map((fetchedAsset) => {
                        const { data: shares, isLoading } = currentShares;

                        if (fetchedAsset.price == undefined) {
                            return null;
                        }

                        const _etherPrice = new BigNumber(etherPrice.toString());
                        const price = fetchedAsset.price.multipliedBy(_etherPrice);

                        const idealShare = fetchedAsset.idealShare ?? new BigNumber(0);
                        const currentShare = shares.get(fetchedAsset.address!) ?? new BigNumber(0);

                        const Deviation = idealShare.minus(currentShare);
                        const color = Deviation.isLessThan(0) ? "text-red-400" : "text-green-400";

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
                                <TableCell>{price.toFixed(4)}$</TableCell>
                                <TableCell>{tohumanReadableQuantity(fetchedAsset.multipoolQuantity, fetchedAsset.decimals)}</TableCell>
                                <TableCell className={color}>{Deviation.toFixed(3)} %</TableCell>
                                <TableCell>{tohumanReadableCashback(fetchedAsset.collectedCashbacks, fetchedAsset.decimals)}</TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    );
});
