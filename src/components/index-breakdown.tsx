import { toHumanReadable } from "../lib/format-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { observer } from "mobx-react-lite";
import { Skeleton } from "./ui/skeleton";
import { MultipoolAsset } from "@/types/multipoolAsset";
import { useStore } from "@/contexts/StoreContext";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";
import { getMultipool } from "@/api/arcanum";


export const IndexAssetsBreakdown = observer(() => {
    const { getAssets: assets, setTokens, currentShares, etherPrice, multipoolId } = useStore();

    const { data: staticAssets, isLoading } = useQuery(["assets"], async () => {
        const { assets } = await getMultipool(multipoolId);

        return assets;
    }, {
        enabled: assets === undefined,
    });

    console.log("assets", staticAssets);

    if (isLoading) {
        return (
            <Skeleton className="relative w-[897px] overflow-auto rounded-2xl border h-[225.2px]">
            </Skeleton>
        );
    }

    if (assets == undefined) {
        setTokens(staticAssets!);
    }
    const fetchedAssets = assets!.filter((asset) => asset != undefined).filter((asset) => asset.type === "multipool") as MultipoolAsset[];

    function tohumanReadableQuantity(number: bigint, decimals = 18) {
        const _decimals = 10n ** BigInt(decimals);
        const decimalsBN = new BigNumber(_decimals.toString());

        const _number = new BigNumber(number.toString());

        const value = _number.dividedBy(decimalsBN);
        return toHumanReadable(value.toString(), 2);
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
                    fetchedAssets.map((fetchedAsset) => {
                        const price = Number(fetchedAsset.chainPrice) * etherPrice;
                        const idealShare = new BigNumber(fetchedAsset.idealShare.toString()).dividedBy(new BigNumber(10).pow(18));
                        const currentShare = new BigNumber(currentShares.get(fetchedAsset.address!)!.toString());

                        return (<TableRow key={fetchedAsset.address}>
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
                            <TableCell>{currentShare.toFixed(4)}%</TableCell>
                            <TableCell>{price.toFixed(4)}$</TableCell>
                            <TableCell>{tohumanReadableQuantity(fetchedAsset.multipoolQuantity, fetchedAsset.decimals)}</TableCell>
                        </TableRow>)
                    }
                    )
                }
            </TableBody>
        </Table>
    );
});
