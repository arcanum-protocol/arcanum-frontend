import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { BigNumber } from "bignumber.js";
import { NeonText } from "./ui/sine-wave-text";
import { useState } from "react";
import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useStore } from "@/contexts/StoreContext";
import { alchemyClient } from "@/config";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

interface TokenSelectorProps {
    action: "set-token-in" | "set-token-out";
    className?: string;
}

const TokenSelector = observer(({ action }: TokenSelectorProps) => {
    const { address } = useAccount();
    const { assets, externalAssets, setSelectedTabWrapper, setInputAsset, setOutputAsset, inputAsset, outputAsset, etherPrice, currentShares: _currentShares } = useStore();
    const [search, setSearch] = useState("");
    const currentShares = _currentShares;

    const { data: balances } = useQuery(["balances"], async () => {
        const assetsAddress = [...assets, ...externalAssets].filter((asset) => asset !== undefined).filter((asset) => asset.address?.toLocaleLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee").map((asset) => asset.address!) || [];
        const rawBalances = await alchemyClient.getTokenBalances(address!, assetsAddress);

        
        const balances: { [address: string]: BigNumber } = {};
        for (const balance of rawBalances.tokenBalances) {
            if (balance.contractAddress === undefined || balance.tokenBalance === null || balance.tokenBalance === "0x0") {
                continue;
            }
            balances[balance.contractAddress] = new BigNumber(balance.tokenBalance);
        }
        
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
        const value = balance.multipliedBy(token.price).multipliedBy(etherPrice);

        return value;
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

        if (token.type === "external") {
            return (
                <div className="font-mono text-xs text-gray-500">{balance}</div>
            );
        } else {
            const idealShare = (token as MultipoolAsset).idealShare;
            const thisAssetShare = currentShares.data.get(token.address);

            const deviation = thisAssetShare?.minus(idealShare!);
            const isDeviationNegative = deviation?.isNegative();

            return (
                <>
                    <NeonText color={isDeviationNegative ? "emerald" : "crimson"}>
                        {balance}
                    </NeonText>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="block bg-black border text-gray-300 max-w-xs font-mono">
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
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            );
        }
    }

    return (
        <>
            <div className="grid grid-cols-3 items-center px-2 whitespace-nowrap" onClick={() => setSelectedTabWrapper("back")}>
                <a className="flex flex-col place-items-center hover:cursor-pointer hover:rounded-xl hover:bg-gray-900 hover:transition ease-in-out duration-100 w-10 h-10">
                    <ChevronLeftIcon className="pt-2 h-8 w-8" />
                </a>
                <div className="font-mono font-bold">Select a token</div>
            </div>
            <div className="px-2 py-1">
                <Input placeholder="Search for a token" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Separator className="my-1" />
            <ScrollArea className="h-[478px] w-full py-2">
                {
                    tokenList.map((asset, index) => {
                        if (search !== "" && !asset.symbol.toLowerCase().includes(search.toLowerCase())) {
                            return null;
                        }

                        return (
                            <div key={index} className={
                                `flex flex-row justify-between items-center h-12 hover:bg-gray-900 cursor-pointer ease-in-out duration-100 rounded pr-2`
                            } onClick={() => { setToken(asset); setSelectedTabWrapper("back") }}>
                                <div className="flex flex-row justify-between items-center gap-2 m-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={asset.logo || undefined} alt="Logo" />
                                        <AvatarFallback>{"?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-start">
                                        <p className="font-mono">{asset.symbol}</p>
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

