import { getMultipoolMarketData } from "@/api/arcanum";
import { tohumanReadableCashback, tohumanReadableQuantity } from "@/components/index-breakdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { StoreProvider, useMultipoolStore } from "@/contexts/StoreContext";
import { MultipoolStore } from "@/store/MultipoolStore";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { toJS } from "mobx";

export const Head = observer(() => {
    const { multipoolId, multipoolAddress, assets, setTokens, setEtherPrice, assetsIsLoading, etherPrice, getPrices, setPrices } = useMultipoolStore();
    const { toast } = useToast();

    const { data: multipool, isLoading: multipoolIsLoading } = useQuery({
        queryKey: ["multipool"],
        queryFn: async () => {
            await setEtherPrice();
            await setTokens();
            await setPrices();
            const mp = await getMultipoolMarketData(multipoolAddress);

            return mp;
        },
        retry: true,
        refetchInterval: 1000,
        enabled: assetsIsLoading
    });

    console.log("multipoolIsLoading, assetsIsLoading", multipoolIsLoading, assetsIsLoading, toJS(assets));

    if (multipoolIsLoading || assetsIsLoading) {
        // skeleton
        return (
            <div className='flex w-full rounded p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
                <div className="flex flex-row items-center justify-between gap-2 pl-4 pr-8 py-2 xl:py-0 w-full">
                    <div className="flex flex-row items-center text-left gap-2">
                        <img src={`/multipools/${multipoolId}_eclipse.svg`} alt="Logo" className='w-14 h-14' />
                        <Skeleton className="rounded w-16 h-10" />
                    </div>
                    <Skeleton className="rounded w-16 h-10" />
                </div>
                <div className="hidden gap-1 flex-row xl:flex">
                    <div className="rounded bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>TVL</p>
                        <Skeleton className="rounded w-16 h-6" />
                    </div>
                </div>
            </div>
        );
    }

    const TVLraw = assets.reduce((acc, asset) => acc.plus(asset.multipoolQuantity.multipliedBy(getPrices.get(asset.address) ?? 0)), BigNumber(0));
    const TVL = TVLraw.multipliedBy(etherPrice).dividedBy(10 ** 18);
    const price = multipool?.price?.toFixed(4);

    function copyToClipboard() {
        navigator.clipboard.writeText(multipoolAddress || "");
        toast({
            title: "Copied to clipboard!",
            description: "The multipool address has been copied to your clipboard",
            duration: 1000
        });
    }

    return (
        <div className='flex w-full rounded p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
            <div className="flex flex-row items-center justify-between gap-2 pl-4 pr-8 py-2 xl:py-0 w-full">
                <div className="flex flex-row text-left gap-2 items-center">
                    <img src={`/multipools/${multipoolId}_eclipse.svg`} alt="Logo" className='w-1 h-1' />
                    <div>
                        <p className='text-[#fff] p-0 text-2xl'>{multipoolId.toLocaleUpperCase() || ""}</p>
                        <div className='flex flex-row gap-2 items-center text-white opacity-70 cursor-pointer' onClick={copyToClipboard}>
                            {multipoolAddress && <p className='text-white opacity-70 p-0 text-sm'>{multipoolAddress.slice(0, 6) + "..." + multipoolAddress.slice(-4)}</p>}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                        </div>
                    </div>
                </div>
                <p className='text-xl'>${price}</p>
            </div>
            <div className="hidden gap-1 flex-row xl:flex">
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>TVL</p>
                    <p className={'text-base'}>{TVL.toFixed(4)}$</p>
                </div>
            </div>
        </div>
    );
});

const AssetsTable = observer(() => {
    const { assets, assetsIsLoading, currentShares, etherPrice, getPriceFeeds, getPrices } = useMultipoolStore();

    const { data: priceFeeds, isLoading: priceFeedsIsLoading } = useQuery({
        queryKey: ["assets"],
        queryFn: async () => {
            return await getPriceFeeds();
        }
    });

    if (assetsIsLoading) {
        return <Skeleton className="relative w-full overflow-auto rounded border h-[225.2px]" />;
    }

    return (
        <Table className="hidden sm:table bg-[#0c0a09]">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left">Asset</TableHead>
                    <TableHead className="text-left">Address</TableHead>
                    <TableHead className="text-left">Price Feed</TableHead>
                    <TableHead className="text-left">Price Feed Address</TableHead>
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

                        if (getPrices.get(fetchedAsset.address) == undefined) {
                            return null;
                        }

                        const _etherPrice = new BigNumber(etherPrice.toString());
                        const price = getPrices.get(fetchedAsset.address)!.multipliedBy(_etherPrice);

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
                                <TableCell className="text-left">
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="cursor-pointer" onClick={() => {
                                            navigator.clipboard.writeText(fetchedAsset.address!);
                                            toast({
                                                title: "Copied to clipboard!",
                                                description: "The asset address has been copied to your clipboard",
                                                duration: 1000
                                            });
                                        }}>
                                            {fetchedAsset.address!.slice(0, 6) + "..." + fetchedAsset.address!.slice(-4)}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                            </svg>
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right items-center">
                                    <div className="flex items-center">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage src='/brands/uniswap.svg' />
                                            <AvatarFallback>{fetchedAsset.symbol}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left cursor-pointer" onClick={() => {
                                    navigator.clipboard.writeText(priceFeeds?.get(fetchedAsset.address!)?.oracle ?? "");
                                    toast({
                                        title: "Copied to clipboard!",
                                        description: "The price feed address has been copied to your clipboard",
                                        duration: 1000
                                    });
                                }}>
                                    {priceFeedsIsLoading ? <Skeleton className="rounded w-16 h-4" /> : priceFeeds?.get(fetchedAsset.address!)?.oracle.slice(0, 6) + "..." + priceFeeds?.get(fetchedAsset.address!)?.oracle.slice(-4) ?? fetchedAsset}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                    </svg>
                                </TableCell>
                                <TableCell>{idealShare.toFixed(4)}%</TableCell>
                                {
                                    isLoading ? <TableCell className="text-center"><Skeleton className="rounded w-16 h-4" /></TableCell> : <TableCell>{currentShare.toFixed(4)}%</TableCell>
                                }
                                <TableCell>{price.toFixed(4)}$</TableCell>
                                <TableCell>{tohumanReadableQuantity(fetchedAsset.multipoolQuantity, fetchedAsset.decimals)}</TableCell>
                                <TableCell className={color}>{Deviation.toFixed(3)} %</TableCell>
                                <TableCell>{tohumanReadableCashback(fetchedAsset.collectedCashbacks, etherPrice, fetchedAsset.decimals)}</TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    );
});

function Analytics() {
    const { id } = useParams();
    if (!id) {
        return <div>Invalid multipool id</div>;
    }
    const multipool = new MultipoolStore(id);

    return (
        <StoreProvider store={multipool}>
            <div className="flex flex-col gap-1">
                <Head />
                <AssetsTable />
            </div>
        </StoreProvider>
    );
}

export { Analytics };
