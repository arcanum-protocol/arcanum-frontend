import { BigNumber } from "bignumber.js";
import { toHumanReadable } from "../lib/format-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { multipool } from "@/store/MultipoolStore";
import { Skeleton } from "./ui/skeleton";
import { MultipoolAsset } from "@/types/multipoolAsset";


export const IndexAssetsBreakdown = observer(() => {
    const { assets, currentShares, assetsIsLoading } = multipool;

    const fetchedAssets = assets.filter((asset) => asset.type === "multipool") as MultipoolAsset[];

    function tohumanReadableQuantity(number: BigNumber) {
        const decimals = new BigNumber(10).pow(18);

        const value = number.div(decimals);
        return toHumanReadable(value, 2);
    }

    if (assetsIsLoading) {
        return (
            <Skeleton className="relative w-[897px] overflow-auto rounded-2xl border h-[225.2px]">
            </Skeleton>
        );
    }

    return (
        <Table className="hidden sm:table bg-[#161616]">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Asset</TableHead>
                    <TableHead className="text-center">Target</TableHead>
                    <TableHead className="text-center">Current</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    fetchedAssets.map((fetchedAsset) =>
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
                            <TableCell>{fetchedAsset.idealShare.toFixed(2)}%</TableCell>
                            <TableCell>{currentShares.get(fetchedAsset.address!)!.toFixed(2)}%</TableCell>
                            <TableCell>{fetchedAsset.chainPrice.toString()}$</TableCell>
                            <TableCell>{tohumanReadableQuantity(fetchedAsset.quantity)}</TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    );
});
