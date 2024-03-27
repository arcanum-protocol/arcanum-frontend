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
import { useAccount, useChainId, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import BigNumber from "bignumber.js";
import ERC20 from "@/abi/ERC20";
import { readContract } from "@wagmi/core";
import { config } from "@/config";
import { Address } from "viem";
import { getAssetPrice } from "../multipoolUtils";
import { useModal } from "connectkit";
import { toHumanReadable } from "../format-number";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";


function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const Content: { [key: string]: string } = {
    "ARBI": "Arbitrum Ecosystem Index ($ARBI) is a token that contains Arbitum's DeFi protocol tokens. Currently it is managed manually but with liquidity grow it will be managed either as market cap weighted or revenue weighted ETF.",
    "SPI": "Sharpe Portfolio Index includes largest crypto assets weighted via Black-Litterman model.",
};

function getClaimedRewards(rewards: bigint, price: number, decimals: number) {
    const decimalsBN = BigNumber(10).pow(decimals);
    const rewardsBN = BigNumber(rewards.toString()).dividedBy(decimalsBN);
    return rewardsBN.multipliedBy(price).toFixed(2);
}

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
    if (price === 0) {
        price = 2;
    }
    const decimals = BigNumber(10).pow(_decimals);
    const deposited = BigNumber(tvl.toString()).dividedBy(decimals);
    const rawApy = BigNumber(rpb.toString()).dividedBy(decimals);

    const apy = rawApy.multipliedBy(price).multipliedBy(60 * 60 * 24 * 365).dividedBy(deposited);
    return apy.toFixed(2);
}

// from rewards per block to user APY based on its investment
const projectedAPY = (rpb: bigint, _decimals: number, tvl: bigint, userStake: bigint) => {
    const decimals = BigNumber(10).pow(_decimals);
    const deposited = BigNumber(tvl.toString()).dividedBy(decimals);
    const rawApy = BigNumber(rpb.toString()).dividedBy(decimals);
    const userStakeFormatted = BigNumber(userStake.toString()).dividedBy(decimals);

    const apy = rawApy.multipliedBy(60 * 60 * 24 * 365).dividedBy(deposited);

    const userShare = userStakeFormatted.dividedBy(deposited);
    const userApy = apy.multipliedBy(userShare);

    if (userApy.isZero() || userApy.isNaN()) {
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
    const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false);

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

        if (value === "") {
            setInsufficientBalance(false);
            return;
        }

        if (Number(value) > Number(data.balanceFormatted)) {
            setInsufficientBalance(true);
        } else {
            setInsufficientBalance(false);
        }
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
                <Skeleton className="mt-2 w-full h-[142px]" />
            </>
        )
    }

    const _price = mpIdToPrice.get(lowAddress) || 0;
    const dollarValue = (Number(input) * _price).toFixed(4);

    return (
        <>
            <div className={`flex flex-col items-center rounded border mt-2 p-2`}>
                <div className="leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 text-left w-[95%]">
                    Deposit:
                </div>

                <div className={`flex flex-row flex-start items-center justify-between w-full gap-1`}>

                    <div className={'flex flex-row items-center justify-between w-full'}>
                        <input className={`w-full text-2xl h-10 rounded p-2 focus:outline-none focus:border-blue-500 bg-transparent`}
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
                    <Button className={`w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent ${(insufficientBalance ? "border-[#ff0000]" : "border-[#292524]")}`} disabled={insufficientBalance} onClick={async () => {
                        try {
                            if (input === "") {
                                return;
                            }
                            if (data.allowance ?? 0n < toContractBigint(input)) {
                                await writeContractAsync({
                                    address: FarmsConatractInstance.address,
                                    abi: FarmsConatractInstance.abi,
                                    functionName: "deposit",
                                    args: [BigInt(id), toContractBigint(input), false],
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
                            console.log(e)
                        }
                    }}>
                        <p style={{ margin: "10px" }}>{data.allowance ?? 0n < toContractBigint(input) ? "Stake" : "Approve"}</p>
                    </Button>
                    : <ConnectWallet />}
            </div >
        </>
    )
}

function Withdraw({ id, address, icon, name, staked }: { id: number, address: Address, icon: string, name: string, staked: BigNumber }) {
    const { mpIdToPrice, FarmsConatractInstance } = useFarmsStore();
    const { address: userAddress } = useAccount();

    const [input, setInput] = useState<string>('');
    const [insufficientStake, setInsufficientStake] = useState<boolean>(false);

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

        if (value === "") {
            setInsufficientStake(false);
            return;
        }

        if (staked.isLessThan(BigNumber(value).multipliedBy(BigNumber(10).pow(18)))) {
            setInsufficientStake(true);
        } else {
            setInsufficientStake(false);
        }
    }

    const lowAddress = address.toLocaleLowerCase() as Address;
    const { data } = useToken({ address: lowAddress, watch: true });
    const { writeContractAsync } = useWriteContract();

    if (!data) {
        return (
            <>
                <Skeleton className="mt-2 w-full h-[134px]" />
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
                    <Button className={`w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent ${(insufficientStake ? "border-[#ff0000]" : "border-[#292524]")}`} disabled={insufficientStake} onClick={async () => {
                        if (input === "") {
                            return;
                        }
                        await writeContractAsync({
                            address: FarmsConatractInstance.address,
                            abi: FarmsConatractInstance.abi,
                            functionName: "withdraw",
                            args: [
                                BigInt(id),
                                toContractBigint(input),
                                true,
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

    const { data: amountToClaim } = useReadContract({
        address: FarmsConatractInstance.address,
        abi: FarmsConatractInstance.abi,
        functionName: "getUser",
        args: [BigInt(id), userAddress],
    });

    return (
        <div className="w-full flex flex-col mt-2 gap-2">
            <div className="flex items-center gap-1 h-[90px]">
            </div>

            {userAddress ?

                <Button className="w-full border bg-transparent rounded border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={async () => {
                    if (amountToClaim?.rd === 0n) {
                        return;
                    }
                    await writeContractAsync({
                        address: FarmsConatractInstance.address,
                        abi: FarmsConatractInstance.abi,
                        functionName: "withdraw",
                        args: [
                            BigInt(id),
                            BigInt(0),
                            true,
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
    const publicClient = usePublicClient();
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
            const tokenName = await publicClient?.readContract({
                address: rewardAddress,
                abi: ERC20,
                functionName: "name",
            });

            // const arbPrice = await getAssetPrice(rewardAddress);
            return {
                name: tokenName?.toUpperCase(),
                price: 1,
                decimals: 18,
            }
        },
        refetchInterval: 10000,
        initialData: {
            name: "ARB",
            price: 0,
            decimals: 18,
        }
    });

    const { data: staked } = useQuery({
        queryKey: ['staked', id, userAddress],
        queryFn: async () => {
            if (userAddress) {
                return await FarmsConatractInstance.read.getUser([BigInt(id), userAddress]);
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

    const stakedValue = {
        realValue: staked?.amount,
        dollarValue: BigNumber(staked?.amount.toString()).multipliedBy(mpIdToPrice.get(lowAddress) || 0).dividedBy(BigNumber(10).pow(18)).toFixed(2),
    };

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

    const [stakedTooltip, privateSetStakedTooltip] = useState(false);
    function setStakedTooltip(value: boolean) {
        if (userAddress) {
            privateSetStakedTooltip(value);
        }
    }

    const [unclaimed, privateSetUnclaimed] = useState(false);
    function setUnclaimed(value: boolean) {
        if (userAddress) {
            privateSetUnclaimed(value);
        }
    }

    return (
        <div className="flex flex-col max-h-fit transition-height duration-500 ease-in-out w-full sm:w-[300px]">
            <div className="flex flex-col border rounded bg-[#0c0a09] px-2 py-2 items-center gap-1">
                <div className="flex flex-row justify-between w-full">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={icon} className="w-12 h-12" />
                        <AvatarFallback>{name}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-300 text-2xl font-bold">${name}</div>
                        {/* farm contreact address for copy */}
                        <div className="text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 inline-flex cursor-pointer items-center" onClick={
                            () => {
                                toast({
                                    title: "Address copied",
                                    description: "Farm contract address copied to clipboard",
                                    duration: 3000
                                });
                                navigator.clipboard.writeText(FarmsConatractInstance.address);
                            }
                        }>
                            <div className="text-xs">{truncateAddress(FarmsConatractInstance.address)}</div>
                            <svg width="10" height="10" viewBox="0 0 15 15" fill="888888" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </div>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="px-4 py-3 h-5">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                <p>{Content[name]}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="w-full border p-2 rounded mt-4">

                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-base">APR:</div>
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
                        <TooltipProvider>
                            <Tooltip open={stakedTooltip} onOpenChange={setStakedTooltip}>
                                <TooltipTrigger>
                                    <div onClick={() => setStakedTooltip(!stakedTooltip)} className="text-base underline decoration-dotted">{fromContractBigint(staked?.amount)} {name}</div>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                    <p>{stakedValue.dollarValue} $</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="text-base">Unclaimed:</div>
                        <TooltipProvider>
                            <Tooltip open={unclaimed} onOpenChange={setUnclaimed}>
                                <TooltipTrigger>
                                    <div onClick={() => setUnclaimed(!unclaimed)} className="text-base underline decoration-dotted">{fromContractBigint(staked?.rd)} {price.name}</div>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                    <p>{getClaimedRewards(staked?.rd, price.price, 18)}$</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex flex-row select-none justify-between">
                        <div className="text-base">Rewards:</div>
                        {
                            displayApy() === "-" ?
                                <div className="text-base hover:text-[#a1a1a1] transition ease-in-out delay-10 inline-flex cursor-pointer" onClick={() => next()}>-</div>
                                :
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className="text-base hover:text-[#a1a1a1] transition ease-in-out delay-10 inline-flex cursor-pointer underline" onClick={() => next()}>{displayApy()} {price.name}/{selectedTimeSpan}</div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                            <p>{(Number(displayApy()) * price.price).toFixed(3)}$ {selectedTimeSpan}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                        }
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

                            <Withdraw id={id} address={address} icon={icon} name={name} staked={BigNumber((staked?.amount || 0n).toString())} />

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
                if (farm.rpb === 0n) {
                    break;
                }
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
    const id = useChainId();
    const { data, isLoading, error } = useQuery({ 
        queryKey: ['farms'], 
        queryFn: () => fetchFarms(),
        initialData: {
            farms: {
                1: {
                    address: "0x",
                }
            }
        }
    });

    console.log(data)

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error...</div>
    }

    if (data.farms[id] == undefined) {
        return (
            <div>
                Wait for updates...
            </div>
        )
    }

    const farmAddress = data.farms[id].address as Address;

    const farmsStore = new FarmsStore(farmAddress);

    return (
        <StoreProvider store={farmsStore}>
            <div className="flex flex-col gap-2">
                <div className="w-full justify-center flex flex-col items-center bg-[#0c0a09] rounded border border-[#292524] h-[73.6px]">
                    <div className="text-gray-300 text-xl">EARN REWARDS BY STAKING YOUR ETF</div>
                </div>
                <div className="flex lg:flex-row flex-col w-full lg:justify-center gap-1 text-gray-300">
                    <FarmContainer />
                </div>
            </div>
        </StoreProvider>
    )
}

export { Farms }
