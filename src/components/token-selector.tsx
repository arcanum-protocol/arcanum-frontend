import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { BigNumber } from "bignumber.js";
import { useState } from "react";
import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useMultipoolStore } from "@/contexts/StoreContext";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { NeonText } from "./ui/sine-wave-text";
import ERC20 from "@/abi/ERC20";
import { toast } from "./ui/use-toast";


function MultipoolTokenTooltip() {
    return (
        <div className="font-mono text-sm">
            {"This asset is part of an "}
            <NeonText color="purple">
                ETF
            </NeonText>
            {", by choosing it you will mint according to the rules of the "}
            <NeonText color="purple">
                multipool
            </NeonText>
            {", "}
            <NeonText color="blue" href="https://docs.arcanum.to/basics/asset-management" className="underline" rightIcon={<ExternalLinkIcon height={10} />}>
                read here
            </NeonText>
            {" to get acquainted with the details"}
        </div>
    );
}

interface TokenSelectorProps {
    action: "set-token-in" | "set-token-out";
    className?: string;
}

const TokenSelector = observer(({ action }: TokenSelectorProps) => {
    const { address } = useAccount();
    const { data: userBalance } = useBalance({ address: address });
    const publicClient = usePublicClient();
    const { assets, externalAssets, setSelectedTabWrapper, setInputAsset, setOutputAsset, inputAsset, outputAsset, etherPrice, currentShares: _currentShares, selectedSCTab, prices } = useMultipoolStore();
    const [search, setSearch] = useState("");

    const { data: balances, isLoading, error } = useQuery({
        queryKey: ["balances"],
        queryFn: async () => {
            const addresses = [...assets, ...externalAssets];

            if (publicClient === undefined) {
                throw new Error("Chain not supported.");
            }

            const results = await publicClient.multicall({
                contracts: addresses.map((asset) => {
                    return {
                        address: asset.address!,
                        abi: ERC20,
                        functionName: "balanceOf",
                        args: [address],
                    };
                }),
            });

            const balances: { [address: string]: BigNumber } = {};
            for (let i = 0; i < results.length; i++) {
                if (results[i].status !== "success") continue;
                balances[addresses[i].address!] = new BigNumber((results[i].result as bigint).toString());
            }
            balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] = new BigNumber(userBalance?.value.toString() || 0);

            return balances;
        },
        refetchInterval: 15000,
        retry: true,
        enabled: address !== undefined,
    });

    if (error) {
        toast({
            title: "Error fetching balances",
            description: error.message,
        });
    }

    const setToken = action === "set-token-in" ? setInputAsset : setOutputAsset;
    const oppositeToken = action === "set-token-in" ? outputAsset : inputAsset;

    let tokenList = [...assets, ...externalAssets].filter((asset) => asset.address !== oppositeToken?.address);
    // exclude repetitions at the address
    tokenList = tokenList.filter((asset, index) => tokenList.findIndex((a) => a.address?.toLocaleLowerCase() === asset.address?.toLocaleLowerCase()) === index);

    if (selectedSCTab !== "mint") {
        tokenList = tokenList.filter((asset) => asset.type === "multipool");
    }

    function toDollarValue(token: ExternalAsset | MultipoolAsset): BigNumber {
        if (!balances || !prices[token.address]) {
            return new BigNumber(0);
        }

        const divisor = new BigNumber(10).pow(token.decimals);

        const balance = new BigNumber(balances[token.address!]).dividedBy(divisor);
        const value = balance.multipliedBy(prices[token.address]) ?? new BigNumber(0);

        if (token.type === "external") {
            return value;
        }

        return value.multipliedBy(etherPrice);
    }

    function DollarValue({ token }: { token: ExternalAsset | MultipoolAsset }) {
        if (address === undefined) {
            return <div className="p-2 opacity-70">{"$" + 0}</div>
        }
        if (token.address === undefined) {
            return <Skeleton className="w-[50px] h-[20px] rounded"></Skeleton>;
        }
        if (!balances || !prices[token.address]) {
            return <Skeleton className="w-[50px] h-[20px] rounded"></Skeleton>;
        }
        if (isLoading) {
            return <Skeleton className="w-[50px] h-[20px] rounded"></Skeleton>;
        }

        const value = toDollarValue(token);

        return <div className="p-2 opacity-70">{"$" + value.toFixed(5).toString()}</div>
    }

    function getBalanceDecaration(token: ExternalAsset | MultipoolAsset) {
        if (address === undefined) {
            return <div className="font-mono text-sm text-gray-500">~0</div>
        }
        if (balances === undefined || token.address === undefined) {
            return (
                <Skeleton className="w-[20px] h-[10px] rounded"></Skeleton>
            );
        }

        const decimals = new BigNumber(10).pow(token.decimals);
        const balancebg = balances[token.address];
        const balance = balancebg?.dividedBy(decimals).toFixed(4);

        if (Number(balance) === 0) {
            return (
                <div className="font-mono text-sm text-gray-500">~0</div>
            );
        }

        return (
            <div className="font-mono text-sm text-gray-500">{balance}</div>
        );
    }

    function getTokenNameDecaration(token: ExternalAsset | MultipoolAsset) {
        if (token.type === "multipool") {
            return (
                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="text-sm">
                                <p>{token.symbol} 👁</p>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                <MultipoolTokenTooltip />
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        }

        return (
            <div className="font-mono text-sm">{token.symbol}</div>
        );
    }

    return (
        <>
            <div className="inline-flex w-full gap-2 py-1">
                <div className="flex w-[11%] items-center justify-center border rounded p-[0.2rem] cursor-pointer hover:bg-gray-900 transition ease-in-out duration-100" onClick={() => setSelectedTabWrapper("back")}>
                    <svg width='50' viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </div>
                <Input className="w-11/12" placeholder="Search for a token" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <ScrollArea className="h-[478px] w-full py-1">
                {
                    tokenList.map((asset, index) => {
                        if (search !== "" && !asset.symbol.toLowerCase().includes(search.toLowerCase())) {
                            return null;
                        }

                        return (
                            <div key={index} className={
                                `flex flex-row justify-between items-center h-12 hover:bg-gray-900 cursor-pointer ease-in-out duration-100 rounded mr-2`
                            } onClick={() => { setToken(asset); setSelectedTabWrapper("back") }}>
                                <div className="flex flex-row justify-between items-center gap-2 m-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={asset.logo} alt="Logo" />
                                        <AvatarFallback>{"?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-start">
                                        {getTokenNameDecaration(asset)}
                                        <div className="flex flex-row gap-1 items-center">
                                            {
                                                getBalanceDecaration(asset)
                                            }
                                        </div>
                                    </div>
                                </div>
                                <DollarValue token={asset} />
                            </div>
                        );
                    })
                }
            </ScrollArea>
        </>
    )
});

export { TokenSelector };


