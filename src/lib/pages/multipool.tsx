import { IndexAssetsBreakdown } from '../../components/index-breakdown';
import { TradePaneInner } from '../../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { observer } from "mobx-react-lite";
import { MultipoolStore } from "@/store/MultipoolStore";
import TVChartContainer from "@/components/tv-chart";
import { TokenSelector } from "@/components/token-selector";
import { AdminPannel } from './admin';
import { useQuery } from '@tanstack/react-query';
import { StoreProvider, useMultipoolStore } from '@/contexts/StoreContext';
import { getEtherPrice, getMultipool, getMultipoolMarketData } from '@/api/arcanum';
import { toast, useToast } from '@/components/ui/use-toast';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fromBigNumber, fromX96 } from '../utils';
import BigNumber from 'bignumber.js';
import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import ETF from '@/abi/ETF';
import { MultipoolAsset } from '@/types/multipoolAsset';
import { Address } from 'viem';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VAULT from '@/abi/VAULT';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export const Admin = observer(() => {
    return (
        <>
            <AdminPannel />
        </>
    )
});

const addressToId: Record<string, string> = {
    "0x71b9d28384aEb0949Fe9Ee3a1d52F27034E1F976": "yield"
};

export const Multipool = ({ isAddress }: { isAddress: boolean }) => {
    const { id } = useParams();

    if (isAddress) {
        const _id = addressToId[id!];

        return (
            <NestedMultipoolComponent id={_id} rndid={Math.floor(Math.random() * 1000).toString()} />
        );
    }

    return (
        <NestedMultipoolComponent id={id ?? "arbi"} rndid={Math.floor(Math.random() * 1000).toString()} />
    );
};

function NestedMultipoolComponent({ id, rndid }: { id: string, rndid: string }) {
    const { data: multipoolStore } = useQuery({
        queryKey: ["base_multipool", rndid],
        queryFn: async () => {
            const multipool = await getMultipool(id);

            const mp = new MultipoolStore(id, multipool);
            return mp;
        },
        refetchOnWindowFocus: false,
    });

    if (!multipoolStore) {
        return <></>;
    }

    return (
        <StoreProvider store={multipoolStore}>
            <MainInner />
        </StoreProvider>
    )
}

export const MainInner = observer(() => {
    const { assetsIsLoading, multipoolId, multipool, assets, setPrices, setEtherPrice, setTokens } = useMultipoolStore();
    const publicClient = usePublicClient();

    const { refetch } = useQuery({
        queryKey: ["multipool-assets"],
        queryFn: async () => {
            if (!publicClient) throw new Error("Public client not initialized");

            const _assets: MultipoolAsset[] = [];
            const _totalTargetShares = await multipool.read.totalTargetShares();
            const totalTargetShares = new BigNumber(_totalTargetShares.toString());

            const multipoolContract = {
                address: multipool.address as Address,
                abi: ETF,
                functionName: "getAsset",
            } as const;

            const result = await publicClient.multicall({
                contracts: assets.map(({ address }) => {
                    return {
                        ...multipoolContract,
                        args: [address]
                    }
                })
            });

            for (let i = 0; i < assets.length; i++) {
                const token = assets[i];
                const tokenAddress = token.address as Address;

                if (result[i].status == "failure") {
                    continue;
                }
                const _asset = result[i].result!;

                const asset = {
                    quantity: new BigNumber(_asset.quantity.toString()),
                    targetShare: new BigNumber(_asset.targetShare.toString()),
                    collectedCashbacks: new BigNumber(_asset.collectedCashbacks.toString()),
                };

                const idealShare = asset.targetShare.dividedBy(totalTargetShares).multipliedBy(100);
                const quantity = asset.quantity;

                _assets.push({
                    symbol: token.symbol,
                    decimals: token.decimals,
                    logo: token.logo,
                    address: tokenAddress,
                    type: "multipool",
                    multipoolAddress: multipool.address,
                    idealShare: idealShare,
                    collectedCashbacks: asset.collectedCashbacks,
                    multipoolQuantity: quantity,
                });
            }

            setTokens(_assets);
            return _assets;
        },
        refetchOnWindowFocus: false,
        initialData: []
    });

    const { refetch: updatePrice } = useQuery({
        queryKey: ["price-updater"],
        queryFn: async () => {
            const prices: Record<string, BigNumber> = {};

            if (!publicClient) {
                throw new Error("Public client not initialized");
            }

            const result = await publicClient.multicall({
                contracts: assets.map(({ address }) => {
                    return {
                        address: multipool.address,
                        abi: ETF,
                        functionName: "getPrice",
                        args: [address]
                    };
                })
            });

            for (const [index, asset] of assets.entries()) {
                const rawPrice = result[index];
                if (rawPrice.status == "failure") {
                    continue;
                }
                const price = fromX96(rawPrice.result as bigint, asset.decimals);

                prices[asset.address] = price;
            }

            setPrices(prices);
            return prices;
        },
        refetchInterval: 2000,
        enabled: assetsIsLoading
    });

    const { refetch: updateEtherPrice } = useQuery({
        queryKey: ["ether-price"],
        queryFn: async () => {
            const etherPrice = await getEtherPrice();

            setEtherPrice(etherPrice);
            return etherPrice;
        },
        refetchInterval: 15000,
    });

    useEffect(() => {
        refetch();
        updatePrice();
        updateEtherPrice();
    }, [multipoolId]);

    return (
        <>
            <div className='flex flex-col min-w-full mt-0.5 gap-2 items-center xl:flex-row xl:items-stretch'>
                <div className='flex flex-col items-center w-full gap-2'>
                    <Head />
                    <TVChartContainer />
                    <IndexAssetsBreakdown />
                </div >
                <div className='flex flex-col items-center gap-2'>
                    <ActionForm />
                    <AdminToggle />
                </div>
            </div >
        </>
    );
});

const AdminToggle = observer(() => {
    const { multipool, isAdminView, setAdminView } = useMultipoolStore();

    const { address } = useAccount();
    const { data: admin, isLoading, isError } = useReadContract({
        address: multipool.address as Address,
        abi: ETF,
        functionName: "owner",
    });

    if (isLoading) {
        return <></>;
    }

    if (isError) {
        return <></>;
    }

    if (address == admin) {
        return (
            <div className="bg-[#0c0a09] rounded border border-[#292524] p-4 w-full flex items-center justify-between">
                Toggle Admin View
                <Switch checked={isAdminView} onCheckedChange={setAdminView} />
            </div>
        )
    }

    return <></>;
});

function AddBalance({ multipoolAddress }: { multipoolAddress: Address }) {
    const { writeContract } = useWriteContract();
    const [ethValue, setEthValue] = useState<bigint>(0n);

    return (
        <div className="flex flex-col items-center justify-center">
            <p>Add Balance</p>
            <input className='text-black' type="number" placeholder="ETH Value" onChange={(e) => setEthValue(BigInt(e.target.value))} />
            <button className='mt-2 border rounded p-2' onClick={() => {
                if (ethValue == 0n) {
                    return;
                }
                writeContract({
                    address: "0xB9cb365F599885F6D97106918bbd406FE09b8590" as Address,
                    abi: VAULT,
                    functionName: "addBalance",
                    args: [multipoolAddress],
                    value: ethValue
                });
            }}>
                Add Balance
            </button>
        </div>
    )
}

function UpdateDistributionParams({ multipoolAddress }: { multipoolAddress: Address }) {
    const { writeContract } = useWriteContract({
        mutation: {
            onError: (error) => {
                console.error(error);
                toast({
                    title: "Error",
                    description: `An error occured while updating the distribution params ${error}`,
                    duration: 1000
                });
            }
        }
    });

    const [cashbackPerSecond, setCashbackPerSecond] = useState<bigint>(0n);
    const [cashbackLimit, setCashbackLimit] = useState<bigint>(0n);
    const [cashbackBalanceChange, setCashbackBalanceChange] = useState<bigint>(0n);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <p>Update Distribution Params</p>
            <input className='text-black' type="number" placeholder="Cashback Per Second" onChange={(e) => setCashbackPerSecond(BigInt(e.target.value))} />
            <input className='text-black' type="number" placeholder="Cashback Limit" onChange={(e) => setCashbackLimit(BigInt(e.target.value))} />
            <input className='text-black' type="number" placeholder="Cashback Balance Change" onChange={(e) => setCashbackBalanceChange(BigInt(e.target.value))} />

            <button className='mt-2 border rounded p-2' onClick={() => {
                writeContract({
                    address: "0xB9cb365F599885F6D97106918bbd406FE09b8590" as Address,
                    abi: VAULT,
                    functionName: "updateDistributionParams",
                    args: [multipoolAddress, cashbackPerSecond, cashbackLimit, cashbackBalanceChange]
                });
            }}>
                Update Distribution Params
            </button>
        </div>
    )
}

const ApplyTargetSharesChanges = observer(() => {
    const { writeContract } = useWriteContract();
    const { multipoolAddress, assets, targetSharesToSet } = useMultipoolStore();

    const targetSharesToChange: {
        name: string,
        address: Address,
        targetShare: number
        newTargetShare: BigNumber
    }[] = [];

    const _totalNewTargetShares = assets.reduce((acc, val) => {
        // take new target shares, for assets that need to be update, and target shares for assets that don't need to be updated
        const newTargetShare = targetSharesToSet.get(val.address);
        const targetShare = val.idealShare;

        if (newTargetShare == undefined) {
            return acc.plus(targetShare!);
        }

        return acc.plus(newTargetShare!.toString());
    }, BigNumber(0));
    const totalNewTargetShares = BigNumber(_totalNewTargetShares.toString());

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const targetShare = asset.idealShare;
        const newTargetShare = targetSharesToSet.get(asset.address);
        
        if (newTargetShare == undefined) {
            const _newTargetShare = targetShare!.dividedBy(totalNewTargetShares).multipliedBy(100);

            targetSharesToChange.push({
                name: asset.symbol,
                address: asset.address,
                targetShare: targetShare!.toNumber(),
                newTargetShare: _newTargetShare
            });

            continue;
        }

        const _newTargetShareBG = BigNumber((newTargetShare ?? 0n).toString());
        const _newTargetShare = _newTargetShareBG.dividedBy(totalNewTargetShares).multipliedBy(100);

        targetSharesToChange.push({
            name: asset.symbol,
            address: asset.address,
            targetShare: targetShare!.toNumber(),
            newTargetShare: _newTargetShare
        });
    }

    const addresses = Array.from(targetSharesToSet).map((asset) => asset[0]);
    const numbers = Array.from(targetSharesToSet).map((asset) => asset[1]);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Old Target Share</TableHead>
                        <TableHead>New Target Share</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {targetSharesToChange.map((asset) => {
                        return (
                            <TableRow key={asset.address}>
                                <TableCell>{asset.name}</TableCell>
                                <TableCell>{asset.targetShare}%</TableCell>
                                <TableCell>{asset.newTargetShare.toFixed(2)}%</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <button className='mt-2 border rounded p-2' onClick={() => {
                writeContract({
                    address: multipoolAddress,
                    abi: ETF,
                    functionName: "updateTargetShares",
                    args: [addresses, numbers]
                });
            }}>
                Apply Target Shares Changes
            </button>
        </div>
    )
});

export const ActionForm = observer(() => {
    const { multipoolAddress, selectedTab, setSelectedTabWrapper, isAdminView } = useMultipoolStore();
    const publicClient = usePublicClient();
    const [unit, setUnit] = useState<"wei" | "kwei" | "mwei" | "gwei" | "szabo" | "finney" | "eth">("eth");

    const { data: cashback } = useQuery({
        queryKey: ["cashback", multipoolAddress],
        queryFn: async () => {
            const cashback = await publicClient?.readContract({
                address: "0xB9cb365F599885F6D97106918bbd406FE09b8590" as Address,
                abi: VAULT,
                functionName: "getDistrubutor",
                args: [multipoolAddress]
            });

            return cashback;
        },
    });

    const { data: balance } = useBalance({ address: "0xB9cb365F599885F6D97106918bbd406FE09b8590" });

    const perSecBigNumber = new BigNumber(cashback?.cashbackPerSec.toString() ?? 0);
    const perMin = perSecBigNumber.multipliedBy(60);
    const perHour = perMin.multipliedBy(60);
    const perDay = perHour.multipliedBy(24);
    const perWeek = perDay.multipliedBy(7);
    const perMonth = perDay.multipliedBy(30);

    function nextUnit() {
        switch (unit) {
            case "wei":
                return "kwei";
            case "kwei":
                return "mwei";
            case "mwei":
                return "gwei";
            case "gwei":
                return "szabo";
            case "szabo":
                return "finney";
            case "finney":
                return "eth";
            case "eth":
                return "wei";
        }
    }

    function switchNextUnit() {
        setUnit(nextUnit());
    }

    function toEther(value: BigNumber): string {
        switch (unit) {
            case "wei":
                return value.toFixed(0);
            case "kwei":
                return value.dividedBy("1000").decimalPlaces(6).toString();
            case "mwei":
                return value.dividedBy("1000000").decimalPlaces(6).toString();
            case "gwei":
                return value.dividedBy("1000000000").decimalPlaces(6).toString();
            case "szabo":
                return value.dividedBy("1000000000000").decimalPlaces(6).toString();
            case "finney":
                return value.dividedBy("1000000000000000").decimalPlaces(6).toString();
            case "eth":
                return value.dividedBy("1000000000000000000").decimalPlaces(6).toString();
        }
    }

    if (isAdminView) {
        return (
            <div className="h-[528px] w-[21.4375rem] p-4 bg-[#0c0a09] rounded border gap-2 border-[#292524] flex flex-col">
                <p className="text-white cursor-pointer text-lg font-bold">Admin Panel</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>Cashback per asset</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(perMin)} {unit} / min</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(perHour)} {unit} / hour</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(perDay)} {unit} / day</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(perWeek)} {unit} / week</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(perMonth)} {unit} / month</p>
                <Separator />
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>Balance</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(BigNumber(balance?.value.toString() ?? "0"))} {unit}</p>
                <Separator />
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>Limit</p>
                <p className="text-white cursor-pointer text-sm" onClick={() => switchNextUnit()}>{toEther(BigNumber(cashback?.cashbackLimit.toString() ?? "0"))} {unit}</p>
                <Dialog>
                    <DialogTrigger>
                        <button className="bg-[#0c0a09] text-white rounded border p-2 w-full">
                            Add Balance
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <AddBalance multipoolAddress={multipoolAddress} />
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger>
                        <button className="bg-[#0c0a09] text-white rounded border p-2 w-full">
                            Update Distribution Params
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <UpdateDistributionParams multipoolAddress={multipoolAddress} />
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger>
                        <button className="bg-[#0c0a09] text-white rounded border p-2 w-full">
                            Apply target shares changes
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <ApplyTargetSharesChanges />
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <div>
            <div className="h-fit w-[21.4375rem] p-4 bg-[#0c0a09] rounded border border-[#292524]">
                <Tabs className="grid-cols-3" value={selectedTab} onValueChange={(value: string | undefined) => setSelectedTabWrapper(value)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mint" className='text-lg font-bold'>Mint</TabsTrigger>
                        <TabsTrigger value="burn" className='text-lg font-bold'>Burn</TabsTrigger>
                        <TabsTrigger value="swap" className='text-lg font-bold'>Swap</TabsTrigger>

                        <TabsTrigger value="set-token-in" className="hidden" />
                        <TabsTrigger value="set-token-out" className="hidden" />
                    </TabsList>
                    <TabsContent value="mint">
                        <TradePaneInner />
                    </TabsContent>
                    <TabsContent value="burn">
                        <TradePaneInner />
                    </TabsContent>
                    <TabsContent value="swap">
                        <TradePaneInner />
                    </TabsContent>

                    <TabsContent value="set-token-in">
                        <TokenSelector action="set-token-in" />
                    </TabsContent>

                    <TabsContent value="set-token-out">
                        <TokenSelector action="set-token-out" />
                    </TabsContent>
                </Tabs >
            </div>
        </div>
    )
});

export const Head = observer(() => {
    const { multipoolId, multipoolIsLoading: _mpLoading, multipoolAddress, logo } = useMultipoolStore();
    const { toast } = useToast();

    const { data: multipool, refetch } = useQuery({
        queryKey: ["multipoolMarketData"],
        queryFn: async () => {
            if (!multipoolAddress) {
                throw new Error("No multipool address provided");
            }
            return await getMultipoolMarketData(multipoolAddress);
        },
        refetchInterval: 15000,
        retry: () => { return multipoolAddress != undefined },
    });

    useEffect(() => {
        refetch();
    }, [multipoolAddress]);

    function getColor(change: string | undefined): string {
        if (change == undefined) {
            return "hidden";
        }

        if (Number(change) > 0) {
            return "text-green-400";
        } else if (Number(change) < 0) {
            return 'text-red-400';
        } else {
            return '0';
        }
    }

    if (!multipool) {
        // skeleton
        return (
            <div className='flex w-full rounded-2xl p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
                <div className="flex flex-row items-center justify-between gap-2 px-8 py-2 xl:py-0 w-full">
                    <div className="flex flex-row text-left gap-2">
                        <img src={logo} alt="Logo" className='w-8 h-8' />
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <Skeleton className="rounded w-16 h-4" />
                </div>
                <div className="hidden gap-1 flex-row xl:flex">
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>24h change</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>24h high</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>24h low</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                </div>
            </div>
        );
    }

    const change = multipool.change24h.toFixed(4);
    const high = multipool.high24h.toFixed(4);
    const low = multipool.low24h.toFixed(4);
    const price = multipool.price.toFixed(4);

    function copyToClipboard() {
        navigator.clipboard.writeText(multipoolAddress);
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
                    <img src={`/multipools/${multipoolId}_eclipse.svg`} alt="Logo" className='w-10 h-10' />
                    <div>
                        <div className='text-[#fff] p-0 text-2xl flex flex-row items-center gap-1'>
                            {multipoolId.toUpperCase()}
                            <div className='cursor-pointer'>
                                <Link to={`/analytics/${multipoolId}`}>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="blue" xmlns="http://www.w3.org/2000/svg"><path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                </Link>
                            </div>
                        </div>
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
                    <p className='text-sm'>24h change</p>
                    <p className={'text-base ' + getColor(change)}>{change}%</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h high</p>
                    <p className='text-base'>{high}$</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h low</p>
                    <p className='text-base'>{low}$</p>
                </div>
            </div>
        </div>
    );
});
