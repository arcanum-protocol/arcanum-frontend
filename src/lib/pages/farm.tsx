import { fetchFarms } from "@/api/arcanum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { getExternalAssets } from "../multipoolUtils";
import { useAccount, useBalance } from "wagmi";
import BigNumber from "bignumber.js";
import { Checkbox } from "@/components/ui/checkbox";


function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function TokenSelector() {
    const { address } = useAccount();
    const { data: tokens, isLoading, isError } = useQuery(['tokens'], () => getExternalAssets(), { refetchOnWindowFocus: false });

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error...</div>
    }

    return (
        <div className="flex flex-col gap-2">
            {
                tokens?.map((token: any) => {
                    const balance = useBalance({
                        address: address,
                        token: token.address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : token.address,
                    });

                    return (
                        <div className="flex flex-row items-center justify-between w-full rounded border p-2">
                            <div className="flex flex-row items-center justify-between">
                                <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                                    <AvatarImage src={token.logoURI} alt="Logo" />
                                    <AvatarFallback>{token.name}</AvatarFallback>
                                </Avatar>
                                <div className="text-base">{token.symbol}</div>
                            </div>
                            <div className="text-base">{BigNumber(balance.data?.formatted!).toFixed(2)}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

function Farm({ farm }: { farm: any }) {
    const [open, setOpen] = useState<boolean>(false);
    const [tab, setTab] = useState<'stake' | 'unstake' | 'claim'>('stake');

    return (
        <div className="flex flex-col max-h-fit transition-height duration-500 ease-in-out">
            <div className="flex flex-col border rounded bg-[#0c0a09] px-3 pt-3 pb-2 items-center gap-1">
                <div className="flex flex-row justify-between w-full">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={farm.logo} className="w-12 h-12" />
                        <AvatarFallback>{farm.name}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-300 text-2xl font-bold">${farm.name}/Stake</div>
                        <div className="inline-flex gap-1 opacity-50 items-center cursor-pointer transition-opacity ease-in-out duration-300 hover:opacity-100">
                            <div className="text-gray-300 text-sm">{truncateAddress(farm.address)}</div>
                            <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </div>
                    </div>
                    <div className="w-12 h-10 mt-2">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    </div>
                </div>

                <div className="w-full border p-2 rounded mt-4">

                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="text-base">APY:</div>
                        <div className="text-xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">30%</div>

                        <div className="text-base">TVL:</div>
                        <div className="text-xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">13.37M</div>
                    </div>

                </div>

                {
                    open ? (
                        <>
                            <div className="border rounded p-2 w-full">
                                <div className="flex flex-row justify-between">
                                    <div className="text-base">Staked:</div>
                                    <div className="text-base">0 ${farm.name}</div>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <div className="text-base">Unclaimed:</div>
                                    <div className="text-base inline-flex">0 $ARB<img className='w-3' src="/brands/arbitrum.svg" /></div>
                                </div>
                                <div className="flex flex-row w-full justify-between">
                                    <div className="text-base">Returns:</div>
                                    <Dialog>
                                        <DialogTrigger>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="text-base bg-gradient-to-r underline decoration-dotted cursor-pointer">
                                                            332 ARB
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[16px] h-[16px]">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
                                                            </svg>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono rounded">
                                                        <div className="text-base">412$</div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </DialogTrigger>
                                        <DialogContent className='rounded'>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-row justify-between">
                                                    <div className="text-base">Daily:</div>
                                                    <div className="text-base">0.1 ARB</div>
                                                </div>
                                                <div className="flex flex-row justify-between">
                                                    <div className="text-base">Weekly:</div>
                                                    <div className="text-base">0.7 ARB</div>
                                                </div>
                                                <div className="flex flex-row justify-between">
                                                    <div className="text-base">Monthly:</div>
                                                    <div className="text-base">3 ARB</div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="border rounded p-2 w-full mt-2">
                                <Tabs value={tab} className="w-full" onValueChange={(value) => setTab(value)}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='stake'>Stake</TabsTrigger>
                                        <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='unstake'>Unstake</TabsTrigger>
                                        <TabsTrigger className="rounded py-[0.325rem] mx-[0.125rem]" value='claim'>Claim</TabsTrigger>
                                    </TabsList>
                                    <TabsContent className="flex flex-col gap-2" value='stake'>

                                        <div className="flex flex-col items-center border border-[#292524] mt-2 p-2">
                                            <div className="leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left w-[95%]">
                                                Deposit:
                                            </div>
                                            
                                            <div className="flex flex-row flex-start items-center justify-between w-full gap-1">
                                                
                                                <div className={'flex flex-row items-center justify-between w-full'}>
                                                    <input className="w-full text-2xl h-10 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                                        placeholder="0" />
                                                </div>

                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="grow max-w-min rounded py-[6px] pr-[5px] pl-[8px] ml-6 mr-[1px] h-full justify-between border bg-[#0c0a09] disabled:opacity-100" variant="secondary">
                                                            <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                                                                <AvatarImage src={farm.logo} alt="Logo" />
                                                                <AvatarFallback>{farm.name}</AvatarFallback>
                                                            </Avatar>
                                                            <p className="px-0.5 text-white opacity-100">{farm.name}</p>
                                                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className='rounded w-64'>
                                                        {
                                                            <TokenSelector />
                                                        }
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <div className="flex flex-row justify-between w-[95%]">
                                                <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left"> = 0 ${farm.name}</div>
                                                <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left">Balance: 0 ${farm.name}</div>
                                            </div>
                                        </div>


                                        <div className="w-full">
                                            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => setOpen(!open)}>
                                                <p style={{ margin: "10px" }}>Stake</p>
                                            </Button>
                                        </div >
                                    </TabsContent>
                                    <TabsContent className="flex flex-col gap-2" value='unstake'>
                                    <div className="flex flex-col items-center border border-[#292524] mt-2 p-2">
                                            <div className="leading-4 m-0 text-xs text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left w-[95%]">
                                                Withdrawn:
                                            </div>
                                            
                                            <div className="flex flex-row flex-start items-center justify-between w-full gap-1">
                                                
                                                <div className={'flex flex-row items-center justify-between w-full'}>
                                                    <input className="w-full text-2xl h-10 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                                        placeholder="0" />
                                                </div>

                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="grow max-w-min rounded py-[6px] pr-[5px] pl-[8px] ml-6 mr-[1px] h-full justify-between border bg-[#0c0a09] disabled:opacity-100" variant="secondary">
                                                            <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                                                                <AvatarImage src={farm.logo} alt="Logo" />
                                                                <AvatarFallback>{farm.name}</AvatarFallback>
                                                            </Avatar>
                                                            <p className="px-0.5 text-white opacity-100">{farm.name}</p>
                                                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className='rounded w-64'>
                                                        {
                                                            <TokenSelector />
                                                        }
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <div className="flex flex-row justify-between w-[95%]">
                                                <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left"> = 0 ${farm.name}</div>
                                                <div className="text-xs leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light text-left">Balance: 0 ${farm.name}</div>
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => setOpen(!open)}>
                                                <p style={{ margin: "10px" }}>Unstake</p>
                                            </Button>
                                        </div >
                                    </TabsContent>
                                    <TabsContent className="flex flex-col gap-2" value='claim'>
                                        <div className="w-full flex flex-col mt-2 gap-2">
                                            <div className="flex items-center gap-1">
                                                <Checkbox id="compound" />
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
                                                </TooltipProvider>
                                            </div>

                                            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => { }}>
                                                <p style={{ margin: "10px" }}>Claim</p>
                                            </Button>
                                        </div >
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    ) : <></>
                }

                <div className={`w-full p-1 hover:bg-[#292524] rounded cursor-pointer transition`} onClick={() => setOpen(!open)}>
                    <svg open={open} className={`open:rotate-180`} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.14645 6.85355C7.34171 7.04882 7.65829 7.04882 7.85355 6.85355L11.8536 2.85355C12.0488 2.65829 12.0488 2.34171 11.8536 2.14645C11.6583 1.95118 11.3417 1.95118 11.1464 2.14645L7.5 5.79289L3.85355 2.14645ZM3.85355 8.14645C3.65829 7.95118 3.34171 7.95118 3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355L7.14645 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L11.8536 8.85355C12.0488 8.65829 12.0488 8.34171 11.8536 8.14645C11.6583 7.95118 11.3417 7.95118 11.1464 8.14645L7.5 11.7929L3.85355 8.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </div >
            </div>
        </div>
    )
}

function Farms() {
    const { data, isLoading, isError } = useQuery(['farms'], () => fetchFarms(), { refetchOnWindowFocus: false });

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error...</div>
    }

    const { farms } = data;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col items-center bg-[#0c0a09] rounded-md border border-[#292524] p-4">
                <div className="text-3xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">🌱FARMS🌱</div>
                <div className="text-gray-300 text-xl">EARN REWARDS BY STAKING YOUR ETF</div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-gray-300">
                {
                    farms?.map((farm: any) => {
                        return <Farm farm={farm} />
                    })
                }
            </div>
        </div>
    )
}

export { Farms }