import { BigNumber } from "bignumber.js";
import { toHumanReadable } from "../lib/format-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { multipool } from "@/store/MultipoolStore";
import { Skeleton } from "./ui/skeleton";

export const IndexAssetsBreakdown = observer(() => {
    const { assets, currentShares } = multipool;

    function toHumanReadablePrice(number: BigNumber | undefined) {
        if (number == null) {
            return "0";
        }

        const decimals = new BigNumber(10).pow(18);
        return number.dividedBy(decimals).toFixed(2);
    }

    function tohumanReadableQuantity(number: BigNumber) {
        const decimals = new BigNumber(10).pow(18);

        const value = number.div(decimals);
        return toHumanReadable(value, 2);
    }

    if (assets.length === 0) {
        return (
            <Skeleton className="relative w-full overflow-auto rounded-2xl border h-96">
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
                    assets.map((fetchedAsset) =>
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
                            <TableCell>{toHumanReadablePrice(fetchedAsset.price)}$</TableCell>
                            <TableCell>{tohumanReadableQuantity(fetchedAsset.quantity)}</TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    );
});
