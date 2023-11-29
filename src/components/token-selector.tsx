import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useAccount } from "wagmi";
import { BigNumber } from "bignumber.js";
import { SineWaveText } from "./ui/sine-wave-text";
import { useState } from "react";
import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { ChevronLeftIcon } from "@radix-ui/react-icons";


interface TokenSelectorProps {
    action: "set-token-in" | "set-token-out";
    // setSelectedTabWrapper
    setter: (value: "mint" | "burn" | "swap" | "set-token-in" | "set-token-out" | "back") => void;
    className?: string;
}

function TokenSelector({ action, setter }: TokenSelectorProps) {
    const [search, setSearch] = useState("");

    const { address } = useAccount();

    function toHumanReadable(number: number | undefined, decimals: number) {
        if (!number) {
            return "0";
        }

        const root = new BigNumber(number);
        const divisor = new BigNumber(10).pow(decimals);

        return root.div(divisor).toFixed(4).toString();
    }

    function toDollarValue(token: ExternalAsset | MultipoolAsset): BigNumber {
        if (!token.balance || !token.price) {
            return new BigNumber(0);
        }

        const divisor = new BigNumber(10).pow(token.decimals);
        const balance = token.type === "external" ? new BigNumber(token.balance) : new BigNumber(token.balance).multipliedBy(divisor);
        const price = new BigNumber(token.price).div(divisor);
        const value = balance.div(divisor).multipliedBy(price);

        return value;
    }

    function toHumanDollarValue(token: ExternalAsset | MultipoolAsset) {
        if (!token.balance || !token.price) {
            return "";
        }

        const value = toDollarValue(token);

        return "$" + value.toFixed(5).toString();
    }

    function getBalanceDecaration(token: ExternalAsset | MultipoolAsset) {
        if (token.type === "external") {
            return (
                <div className="font-mono text-xs text-gray-500">{toHumanReadable(token.balance, token.decimals)}</div>
            );
        } else {
            const isDeviationNegative = (token as MultipoolAsset).deviationPercent?.isNegative();
            return (
                <>
                    <SineWaveText color={isDeviationNegative ? "emerald" : "crimson"} text={toHumanReadable(token.balance, token.decimals) + " " + token.symbol} />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                <p>This asset is part of an {
                                    <SineWaveText text="ETF" color="purple" asSpan={true} />
                                }, by choosing it you will mint according to the rules of the {
                                        <SineWaveText text="multipool" color="purple" asSpan={true} />
                                    }, {
                                        <SineWaveText text="read here" color="blue" asSpan={true} href="https://docs.arcanum.to/basics/asset-management" className="underline" rightIcon={<ExternalLinkIcon height={10} />} />
                                    } to get acquainted with the details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            );
        }
    }

    function setToken(token: ExternalAsset | MultipoolAsset) {
        if (action === "set-token-in") {
            setter("back");
        } else {
            setter("back");
        }
    }


    return (
        <>
            <div className="grid grid-cols-3 items-center px-2 whitespace-nowrap">
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
                }
            </ScrollArea>
        </>
    )
}

export { TokenSelector };
