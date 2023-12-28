import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { BigNumber } from "bignumber.js";
import { useState } from "react";
import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";
import { ChevronLeftIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useStore } from "@/contexts/StoreContext";
import { alchemyClient } from "@/config";
import { useAccount, useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { NeonText } from "./ui/sine-wave-text";


function MultipoolTokenTooltip() {
    return (
        <div className="font-mono text-xs">
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
    const { data: userBalance } = useBalance({ address });
    const { assets, externalAssets, setSelectedTabWrapper, setInputAsset, setOutputAsset, inputAsset, outputAsset, etherPrice, currentShares: _currentShares } = useStore();
    const [search, setSearch] = useState("");

    const { data: balances } = useQuery(["balances"], async () => {
        const assetsAddress = [...assets, ...externalAssets].map((asset) => asset.address!).filter((asset) => asset !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") || [];
        const rawBalances = await alchemyClient.getTokenBalances(address!, assetsAddress);

        const balances: { [address: string]: BigNumber } = {};
        for (const balance of rawBalances.tokenBalances) {
            balances[balance.contractAddress] = new BigNumber(balance.tokenBalance!);
        }
        balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] = new BigNumber(userBalance?.value.toString() || 0);

        return balances;
    }, {
        refetchInterval: 15000,
        enabled: address !== undefined,
    });

    const setToken = action === "set-token-in" ? setInputAsset : setOutputAsset;
    const oppositeToken = action === "set-token-in" ? outputAsset : inputAsset;

    const tokenList = [...assets, ...externalAssets].filter((asset) => asset.address !== oppositeToken?.address);

    function toDollarValue(token: ExternalAsset | MultipoolAsset): BigNumber {
        if (!balances || !token.price) {
            return new BigNumber(0);
        }

        const divisor = new BigNumber(10).pow(token.decimals);

        const balance = new BigNumber(balances[token.address!]).dividedBy(divisor);
        const value = balance.multipliedBy(token.price);

        if (token.type === "external") {
            return value;
        }

        return value.multipliedBy(etherPrice);
    }

    function DollarValue({ token }: { token: ExternalAsset | MultipoolAsset }) {
        if (!balances || !token.price) {
            return <Skeleton className="w-[50px] h-[20px] rounded"></Skeleton>;
        }

        const value = toDollarValue(token);

        return <div className="p-2 opacity-70">{"$" + value.toFixed(5).toString()}</div>
    }

    function getBalanceDecaration(token: ExternalAsset | MultipoolAsset) {
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
                <div className="font-mono text-xs text-gray-500">~0</div>
            );
        }

        return (
            <div className="font-mono text-xs text-gray-500">{balance}</div>
        );
    }

    function getTokenNameDecaration(token: ExternalAsset | MultipoolAsset) {
        if (token.type === "multipool") {
            return (
                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="text-xs">
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
            <div className="font-mono text-xs">{token.symbol}</div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-4 items-center whitespace-nowrap text-center" onClick={() => setSelectedTabWrapper("back")}>
                <a className="flex flex-col place-items-center hover:cursor-pointer hover:rounded-xl hover:bg-gray-900 hover:transition ease-in-out duration-100 w-10 h-10">
                    <ChevronLeftIcon className="pt-2 h-8 w-8" />
                </a>
                <div className="font-mono font-bold col-span-2">Select a token</div>
            </div>
            <div className="py-1">
                <Input placeholder="Search for a token" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <ScrollArea className="h-[478px] w-full py-2">
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
                                        <AvatarImage src={asset.logo || undefined} alt="Logo" />
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


