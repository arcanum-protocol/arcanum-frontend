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
import { multipool } from "@/store/MultipoolStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toJS } from "mobx";
import { Skeleton } from "./ui/skeleton";

interface TokenSelectorProps {
    action: "set-token-in" | "set-token-out";
    className?: string;
}

const TokenSelector = observer(({ action }: TokenSelectorProps) => {
    const { assets, setSelectedTabWrapper, setInputAsset, setOutputAsset, inputAsset, outputAsset, etherPrice } = multipool;
    const [search, setSearch] = useState("");

    const setToken = action === "set-token-in" ? setInputAsset : setOutputAsset;
    const oppositeToken = action === "set-token-in" ? outputAsset : inputAsset;

    const tokenList = assets.filter((asset) => asset.type === "multipool")
        .filter((asset) => asset.address !== oppositeToken?.address) as MultipoolAsset[];

    function toDollarValue(token: ExternalAsset | MultipoolAsset): BigNumber {
        if (!token.balance || !token.price) {
            return new BigNumber(0);
        }

        const divisor = new BigNumber(10).pow(token.decimals);

        const balance = new BigNumber(token.balance).dividedBy(divisor);
        const price = new BigNumber(token.price);
        const value = balance.multipliedBy(price).multipliedBy(etherPrice[42161]);

        return value;
    }

    function DollarValue({ token }: { token: ExternalAsset | MultipoolAsset }) {
        if (!token.balance || !token.price) {
            return <Skeleton className="w-[50px] h-[20px] rounded-2xl"></Skeleton>;
        }

        const value = toDollarValue(token);

        return <div>{"$" + value.toFixed(5).toString()}</div>
    }

    function getBalanceDecaration(token: ExternalAsset | MultipoolAsset) {
        const decimals = new BigNumber(10).pow(token.decimals);
        const balance = token.balance?.dividedBy(decimals).toNumber();

        if (balance === undefined) {
            return (
                <Skeleton className="w-[20px] h-[10px] rounded-2xl"></Skeleton>
            );
        }

        if (token.type === "external") {
            return (
                <div className="font-mono text-xs text-gray-500">{balance}</div>
            );
        } else {
            const isDeviationNegative = (token as MultipoolAsset).deviationPercent?.isNegative();
            return (
                <>
                    <NeonText color={isDeviationNegative ? "emerald" : "crimson"} text={balance + " " + token.symbol} />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="inline-flex bg-black border text-gray-300 max-w-xs font-mono">
                                <p>This asset is part of an {
                                    <NeonText text="ETF" color="purple" />
                                }, by choosing it you will mint according to the rules of the {
                                        <NeonText text="multipool" color="purple" />
                                    }, {
                                        <NeonText text="read here" color="blue" href="https://docs.arcanum.to/basics/asset-management" className="underline" rightIcon={<ExternalLinkIcon height={10} />} />
                                    } to get acquainted with the details</p>
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
                        if (search !== "" && !asset.name.toLowerCase().includes(search.toLowerCase())) {
                            return null;
                        }

                        return (
                            <div key={index} className={
                                `flex flex-row justify-between items-center h-12 hover:bg-gray-900 cursor-pointer ease-in-out duration-100 rounded-xl`
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
