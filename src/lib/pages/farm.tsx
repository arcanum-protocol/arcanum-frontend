import { fetchFarms } from "@/api/arcanum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { FarmsStore } from "@/store/FarmsStore";
import { StoreProvider, useFarmsStore } from "@/contexts/StoreContext";
import { observer } from "mobx-react-lite";
import type { Farm as FarmType } from "@/store/FarmsStore";
import { useToken } from "@/hooks/useToken";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useWriteContract } from "wagmi";
import BigNumber from "bignumber.js";
import ERC20 from "@/abi/ERC20";
import { readContract } from "@wagmi/core";
import { config } from "@/config";
import { Address } from "viem";
import { getAssetPrice } from "../multipoolUtils";
import { useModal } from "connectkit";
import { toHumanReadable } from "../format-number";

export const ConnectWallet = () => {
    const { setOpen } = useModal();

    return (
        <button onClick={() => setOpen(true)} className="w-full border h-9 bg-transparent rounded-md text-slate-50 border-white-300 hover:border-green-500 hover:bg-transparent">
            Connect Wallet
        </button>
    );
};

// from rewards per block to APY
const apyFromRPB = (rpb: bigint, price: number, _decimals: number, tvl: bigint) => {
    const decimals = BigNumber(10).pow(_decimals);
    const deposited = BigNumber(tvl.toString()).dividedBy(decimals);

    const apy = BigNumber(rpb.toString()).dividedBy(decimals).multipliedBy(price).multipliedBy(60 * 60 * 24 * 365).dividedBy(deposited);
    return apy.toFixed(2);
}

// from rewards per block to user APY based on its investment
const projectedAPY = (rpb: bigint, _decimals: number, tvl: bigint, userStake: bigint) => {
    const decimals = BigNumber(10).pow(_decimals);
    const deposited = BigNumber(tvl.toString()).dividedBy(decimals);

    const apy = BigNumber(rpb.toString()).dividedBy(decimals).multipliedBy(60 * 60 * 24 * 365).dividedBy(deposited);

    const user = BigNumber(userStake.toString()).dividedBy(deposited);
    const userApy = apy.multipliedBy(user).dividedBy(decimals);

    if (userApy.isZero()) {
        return {
            day: 0,
            week: 0,
            month: 0,
            year: 0,
        };
    }

    return {
        day: userApy.dividedBy(365),
        week: userApy.dividedBy(52),
        month: userApy.dividedBy(12),
        year: userApy,
    };
}

const toContractBigint = (value: string) => {
    const bn = BigNumber(value).multipliedBy(BigNumber(10).pow(18));
    if (bn.isNaN()) {
        return BigInt(0);
    }
    return BigInt(bn.toString());
}

const fromContractBigint = (value: BigInt) => {
    const data = new BigNumber(value.toString()).dividedBy(BigNumber(10).pow(18));
    if (data.isZero()) {
        return "0";
    }
    if (data.isLessThan(0.01)) {
        return ">0.01";
    } else {
        return data.toFixed(2);
    }
}

function Deposit({ id, address, icon, name }: { id: number, address: Address, icon: string, name: string }) {
    const { mpIdToPrice, FarmsConatractInstance } = useFarmsStore();
    const { address: userAddress } = useAccount();

    const [input, setInput] = useState<string>('');

    function handleInput(e: any) {
        const text = e.target.value;

        const regex = new RegExp("^[0-9]*[.,]?[0-9]*$");
        if (!regex.test(text)) {
            // prevent non-numeric input
            e.target.value = text.slice(0, -1);
            return;
        }

        const value = text.replace(",", ".");
        setInput(value);
    }

    const lowAddress = address.toLocaleLowerCase() as Address;
    const { writeContractAsync } = useWriteContract();

    const { data, isLoading, refetch: checkAllowance } = useQuery({
        queryKey: ['token', lowAddress],
        queryFn: async () => {
            if (!userAddress) {
                return {
                    balance: 0n,
                    balanceFormatted: "0",
                    allowance: 0n,
                };
            }
            const balanceRaw = await readContract(config, {
                address: lowAddress,
                abi: ERC20,
                functionName: "balanceOf",
                args: [userAddress],
            });
            const balance = fromContractBigint(balanceRaw);

            const allowanceRaw = await readContract(config, {
                address: lowAddress,
                abi: ERC20,
                functionName: "allowance",
                args: [userAddress, FarmsConatractInstance.address],
            });

            return {
                balance,
                balanceFormatted: balance.toString(),
                allowance: allowanceRaw,
            };
        },
        initialData: {
            balance: 0n,
            balanceFormatted: "0",
            allowance: 0n,
        },
    });

    if (isLoading || !data) {
        return (
            <>
                <Skeleton className="mt-2 w-full h-32" />
            </>
        )
    }

    const _price = mpIdToPrice.get(lowAddress) || 0;
    const dollarValue = (Number(input) * _price).toFixed(4);

    return (
        <>
            <div className="flex flex-col items-center rounded border border-[#292524] mt-2 p-2">
                <div className="leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 text-left w-[95%]">
                    Deposit:
                </div>

                <div className="flex flex-row flex-start items-center justify-between w-full gap-1">

                    <div className={'flex flex-row items-center justify-between w-full'}>
                        <input className="w-full text-2xl h-10 rounded p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="0" value={input} onChange={handleInput} />
                    </div>

                    <Button className="grow max-w-min rounded py-[6px] pr-[5px] pl-[8px] ml-6 mr-[1px] h-full justify-between border bg-[#0c0a09] disabled:opacity-100" variant="secondary">
                        <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                            <AvatarImage src={icon} alt="Logo" />
                            <AvatarFallback>{name}</AvatarFallback>
                        </Avatar>
                        <p className="px-0.5 text-white opacity-100">{name}</p>
                    </Button>

                </div>

                <div className="flex flex-row justify-between w-[95%]">
                    <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left"> = {dollarValue.toString()}$</div>
                    <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left">Balance: {data.balanceFormatted}</div>
                </div>
            </div>

            <div className="w-full">
                {userAddress ?
                    <Button className="w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={async () => {
                        try {
                            if (data.allowance ?? 0n < toContractBigint(input)) {
                                await writeContractAsync({
                                    address: FarmsConatractInstance.address,
                                    abi: FarmsConatractInstance.abi,
                                    functionName: "deposit",
                                    args: [BigInt(id), toContractBigint(input)],
                                })
                            } else {
                                await writeContractAsync({
                                    address: address,
                                    abi: ERC20,
                                    functionName: "approve",
                                    args: [FarmsConatractInstance.address, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
                                })
                                await checkAllowance();
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>
                        <p style={{ margin: "10px" }}>{data.allowance ?? 0n < toContractBigint(input) ? "Stake" : "Approve"}</p>
                    </Button>
                    : <ConnectWallet />}
            </div >
        </>
    )
}

function Withdraw({ id, address, icon, name }: { id: number, address: Address, icon: string, name: string }) {
    const { mpIdToPrice, FarmsConatractInstance } = useFarmsStore();
    const { address: userAddress } = useAccount();

    const [input, setInput] = useState<string>('');

    function handleInput(e: any) {
        const text = e.target.value;

        const regex = new RegExp("^[0-9]*[.,]?[0-9]*$");
        if (!regex.test(text)) {
            // prevent non-numeric input
            e.target.value = text.slice(0, -1);
            return;
        }

        const value = text.replace(",", ".");
        setInput(value);
    }

    const lowAddress = address.toLocaleLowerCase() as Address;
    const { data, isLoading } = useToken(lowAddress);
    const { writeContractAsync } = useWriteContract();

    if (isLoading || !data) {
        return (
            <>
                <Skeleton className="mt-2 w-full h-32" />
            </>
        )
    }

    const _price = mpIdToPrice.get(lowAddress) || 0;
    const dollarValue = (Number(input) * _price).toFixed(4);

    return (
        <>
            <div className="flex flex-col items-center rounded border border-[#292524] mt-2 p-2">
                <div className="leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left w-[95%]">
                    Withdrawn:
                </div>

                <div className="flex flex-row flex-start items-center justify-between w-full gap-1">

                    <div className={'flex flex-row items-center justify-between w-full'}>
                        <input className="w-full text-2xl h-10 rounded p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="0" value={input} onChange={handleInput} />
                    </div>

                    <Button className="grow max-w-min rounded py-[6px] pr-[5px] pl-[8px] ml-6 mr-[1px] h-full justify-between border bg-[#0c0a09] disabled:opacity-100" variant="secondary">
                        <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                            <AvatarImage src={icon} alt="Logo" />
                            <AvatarFallback>{name}</AvatarFallback>
                        </Avatar>
                        <p className="px-0.5 text-white opacity-100">{name}</p>
                    </Button>

                </div>

                <div className="flex flex-row justify-between w-[95%]">
                    <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left"> = {dollarValue.toString()}$</div>
                    <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left">Balance: {data.balanceFormatted}</div>
                </div>
            </div>

            <div className="w-full">
                {userAddress ?
                    <Button className="w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={async () => {
                        await writeContractAsync({
                            address: FarmsConatractInstance.address,
                            abi: FarmsConatractInstance.abi,
                            functionName: "withdraw",
                            args: [
                                BigInt(id),
                                toContractBigint(input),
                                true,
                                "0x0000000000000000000000000000000000000000" as Address,
                                "0x0000000000000000000000000000000000000000" as Address,
                            ],
                        })
                    }}>
                        <p style={{ margin: "10px" }}>Unstake</p>
                    </Button>
                    : <ConnectWallet />}
            </div >
        </>
    )
}

function Claim({ id, address }: { id: number, address: Address }) {
    const { FarmsConatractInstance } = useFarmsStore();
    const { writeContractAsync } = useWriteContract();
    const { address: userAddress } = useAccount();

    return (
        <div className="w-full flex flex-col mt-2 gap-2">
            <div className="flex items-center gap-1">
                {/* <Checkbox id="compound" />
                <label
                    htmlFor="compound"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Compound
                </label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <svg className="opacity-50 cursor-help" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49972C0.877075 3.84204 3.84222 0.876892 7.49991 0.876892C11.1576 0.876892 14.1227 3.84204 14.1227 7.49972C14.1227 11.1574 11.1576 14.1226 7.49991 14.1226C3.84222 14.1226 0.877075 11.1574 0.877075 7.49972ZM7.49991 1.82689C4.36689 1.82689 1.82708 4.36671 1.82708 7.49972C1.82708 10.6327 4.36689 13.1726 7.49991 13.1726C10.6329 13.1726 13.1727 10.6327 13.1727 7.49972C13.1727 4.36671 10.6329 1.82689 7.49991 1.82689ZM8.24993 10.5C8.24993 10.9142 7.91414 11.25 7.49993 11.25C7.08571 11.25 6.74993 10.9142 6.74993 10.5C6.74993 10.0858 7.08571 9.75 7.49993 9.75C7.91414 9.75 8.24993 10.0858 8.24993 10.5ZM6.05003 6.25C6.05003 5.57211 6.63511 4.925 7.50003 4.925C8.36496 4.925 8.95003 5.57211 8.95003 6.25C8.95003 6.74118 8.68002 6.99212 8.21447 7.27494C8.16251 7.30651 8.10258 7.34131 8.03847 7.37854L8.03841 7.37858C7.85521 7.48497 7.63788 7.61119 7.47449 7.73849C7.23214 7.92732 6.95003 8.23198 6.95003 8.7C6.95004 9.00376 7.19628 9.25 7.50004 9.25C7.8024 9.25 8.04778 9.00601 8.05002 8.70417L8.05056 8.7033C8.05924 8.6896 8.08493 8.65735 8.15058 8.6062C8.25207 8.52712 8.36508 8.46163 8.51567 8.37436L8.51571 8.37433C8.59422 8.32883 8.68296 8.27741 8.78559 8.21506C9.32004 7.89038 10.05 7.35382 10.05 6.25C10.05 4.92789 8.93511 3.825 7.50003 3.825C6.06496 3.825 4.95003 4.92789 4.95003 6.25C4.95003 6.55376 5.19628 6.8 5.50003 6.8C5.80379 6.8 6.05003 6.55376 6.05003 6.25Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono rounded">
                            <div className="text-base">Compound your rewards</div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider> */}
            </div>

            {userAddress ?

                <Button className="w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={async () => {
                    await writeContractAsync({
                        address: FarmsConatractInstance.address,
                        abi: FarmsConatractInstance.abi,
                        functionName: "withdraw",
                        args: [
                            BigInt(id),
                            BigInt(0),
                            true,
                            "0x0000000000000000000000000000000000000000" as Address,
                            "0x0000000000000000000000000000000000000000" as Address,
                        ],
                    })
                }}>
                    <p style={{ margin: "10px" }}>Claim</p>
                </Button>
                : <ConnectWallet />}
        </div >
    )
}

const Farm = observer(({ id, address, tvl: tvlRaw, apy: apyRaw, rewardAddress }: { id: number, address: Address, tvl: bigint, apy: bigint, rewardAddress: Address }) => {
    const { addressToIds, FarmsConatractInstance, mpIdToPrice } = useFarmsStore();
    const { address: userAddress } = useAccount();

    const lowAddress = address.toLocaleLowerCase() as Address;
    const rngName = addressToIds.get(lowAddress) || "Unknown";
    const name = rngName.toLocaleUpperCase();

    const icon = `/multipools/${name}.svg`;

    const [tab, setTabPrivate] = useState<'stake' | 'unstake' | 'claim'>('stake');
    const [selectedTimeSpan, nextTimeSpan] = useState<'day' | 'week' | 'month' | 'year' | 'all' | 'max'>('day');

    function next() {
        switch (selectedTimeSpan) {
            case 'day':
                nextTimeSpan('week');
                break;
            case 'week':
                nextTimeSpan('month');
                break;
            case 'month':
                nextTimeSpan('year');
                break;
            case 'year':
                nextTimeSpan('day');
                break;
        }
    }

    const { data: price } = useQuery({
        queryKey: ['price', id],
        queryFn: async () => {
            const arbPrice = await getAssetPrice(rewardAddress);
            return {
                price: arbPrice.price || 0,
                decimals: arbPrice.decimals || 18,
            }
        },
        refetchInterval: 10000,
        initialData: {
            price: 0,
            decimals: 18,
        }
    });

    const { data: staked } = useQuery({
        queryKey: ['staked', id, userAddress],
        queryFn: async () => {
            if (userAddress) {
                const staked = await FarmsConatractInstance.read.getUser([BigInt(id), userAddress]);
                return staked;
            }
            return {
                amount: 0n,
                rd: 0n,
                accRewards: 0n,
            };
        },
        initialData: {
            amount: 0n,
            rd: 0n,
            accRewards: 0n,
        },
        refetchInterval: 10000,
    });

    const setTab = (value: 'stake' | 'unstake' | 'claim') => {
        setTabPrivate(value);
    }

    const tvl = BigNumber(tvlRaw.toString()).multipliedBy(mpIdToPrice.get(lowAddress) || 0).dividedBy(BigNumber(10).pow(18)).toFixed(2);
    const apy = apyFromRPB(apyRaw, price.price, price.decimals, tvlRaw);
    const userApy = projectedAPY(apyRaw, price.decimals, tvlRaw, staked?.amount || 0n);

    function displayApy() {
        switch (selectedTimeSpan) {
            case 'day':
                return toHumanReadable(userApy.day);
            case 'week':
                return toHumanReadable(userApy.week);
            case 'month':
                return toHumanReadable(userApy.month);
            case 'year':
                return toHumanReadable(userApy.year);
        }
    }

    return (
        <div className="flex flex-col max-h-fit transition-height duration-500 ease-in-out w-[300px]">
            <div className="flex flex-col border rounded bg-[#0c0a09] px-2 py-2 items-center gap-1">
                <div className="flex flex-row justify-between w-full">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={icon} className="w-12 h-12" />
                        <AvatarFallback>{name}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-300 text-2xl font-bold">${name}</div>
                    </div>
                    <div className="px-4 py-4 h-5">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    </div>
                </div>

                <div className="w-full border p-2 rounded mt-4">

                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-base">APY:</div>
                            <div className="text-xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">{apy}%</div>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-base">TVL:</div>
                            <div className="text-xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">{tvl.toString()}$</div>
                        </div>
                    </div>

                </div>

                <div className="border rounded p-2 w-full">
                    <div className="flex flex-row justify-between">
                        <div className="text-base">Staked:</div>
                        <div className="text-base">{fromContractBigint(staked?.amount)} ${name}</div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="text-base">Unclaimed:</div>
                        <div className="text-base inline-flex">{fromContractBigint(staked.accRewards)} $ARB</div>
                    </div>
                    <div className="flex flex-row select-none justify-between">
                        <div className="text-base">Rewards:</div>
                        <div className="text-base hover:text-[#a1a1a1] transition ease-in-out delay-10 inline-flex cursor-pointer underline" onClick={() => next()}>{displayApy()} $ARB/{selectedTimeSpan}</div>
                    </div>
                </div>

                <div className="border rounded p-2 w-full">
                    <Tabs value={tab} className="w-full" onValueChange={(value) => setTab(value)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='stake'>Stake</TabsTrigger>
                            <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='unstake'>Unstake</TabsTrigger>
                            <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='claim'>Claim</TabsTrigger>
                        </TabsList>
                        <TabsContent className="flex flex-col gap-2" value='stake'>

                            <Deposit id={id} address={address} icon={icon} name={name} />

                        </TabsContent>
                        <TabsContent className="flex flex-col gap-2" value='unstake'>

                            <Withdraw id={id} address={address} icon={icon} name={name} />

                        </TabsContent>
                        <TabsContent className="flex flex-col gap-2" value='claim'>

                            <Claim id={id} address={address} />

                        </TabsContent>
                    </Tabs>
                </div>

            </div>
        </div>
    )
});

function FarmContainer() {
    const { FarmsConatractInstance } = useFarmsStore();

    const { data: farms, isLoading } = useQuery({
        queryKey: ['farmsOnChain'], queryFn: async () => {
            const farms: FarmType[] = [];
            for (let i = 0; i < 30; i++) {
                const farm = await FarmsConatractInstance.read.getPool([BigInt(i)]);
                if (farm.lockAsset === "0x0000000000000000000000000000000000000000") {
                    break;
                }
                farms.push({ ...farm, id: i });
            }

            return farms;
        }
    });

    if (isLoading || !farms) {
        return <div>Loading...</div>
    }

    return (
        <>
            {
                farms.map((farm) => {
                    return <Farm id={farm.id} address={farm.lockAsset} tvl={farm.lockAssetTotalNumber} apy={farm.rpb} rewardAddress={farm.rewardAsset} key={farm.id} />
                })
            }
        </>
    )
}

function Farms() {
    const { data, isLoading, error } = useQuery({ queryKey: ['farms'], queryFn: () => fetchFarms() });

    if (isLoading || !data) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error...</div>
    }

    const farmAddress = data.address;

    const farmsStore = new FarmsStore(farmAddress as Address);

    return (
        <StoreProvider store={farmsStore}>
            <div className="flex flex-col gap-2">
                <div className="w-full flex flex-col items-center bg-[#0c0a09] rounded border border-[#292524] p-4">
                    <div className="text-3xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">🌱FARMS🌱</div>
                    <div className="text-gray-300 text-xl">EARN REWARDS BY STAKING YOUR ETF</div>
                </div>
                <div className="flex flex-row w-full justify-center gap-1 text-gray-300">
                    <FarmContainer />
                </div>
            </div>
        </StoreProvider>
    )
}

export { Farms }
