import { BigNumber } from "bignumber.js";
import type { MultipoolAsset } from '../types/multipoolAsset';
import { toHumanReadable } from "../lib/format-number";
import { Tooltip } from './tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function IndexAssetsBreakdown({ fetchedAssets }: { fetchedAssets: MultipoolAsset[] }) {
    let randomindexes: number[] = [];

    for (let i = 0; i < fetchedAssets?.length * 6; i++) {
        randomindexes.push(Number((Math.random() * 10000).toFixed(0)));
    }

    console.log("fetchedAssets", fetchedAssets);

    function toHumanReadableMcap(number: BigNumber) {
        return toHumanReadable(number, 2);
    }

    function tohumanReadableQuantity(number: BigNumber) {
        const decimals = new BigNumber(10).pow(18);

        const value = number.div(decimals);
        return toHumanReadable(value, 2);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Asset</TableHead>
                    <TableHead className="text-center">Target</TableHead>
                    <TableHead className="text-center">Current</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Market Cap</TableHead>
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
                            <TableCell>{fetchedAsset.currentShare.toFixed(2)}%</TableCell>
                            <TableCell>{(fetchedAsset.price || 0).toFixed(2)}$</TableCell>
                            <TableCell>{tohumanReadableQuantity(fetchedAsset.quantity)}</TableCell>
                            <TableCell>{toHumanReadableMcap(fetchedAsset.mcap)}$</TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    );
}
