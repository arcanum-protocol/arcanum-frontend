import { useMultiPoolContext } from "@/contexts/MultiPoolContext";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ExternalToken, useExternalTokens, } from "@/hooks/externalTokens";
import { useAccount, useBlockNumber } from "wagmi";
import { BigNumber } from "bignumber.js";
import { Skeleton } from "@/components/ui/skeleton"

function TokenSelector() {
    const {
        externalAssets,
        multipool
    } = useMultiPoolContext();

    const { address } = useAccount();
    const { data: blockNumber } = useBlockNumber({ chainId: 42161 });
    const { externalTokens: tokens, isLoading } = useExternalTokens(address, externalAssets, blockNumber);

    function toHumanReadable(number: number | undefined, decimals: number) {
        if (!number) {
            return "0";
        }

        const root = new BigNumber(number);
        const divisor = new BigNumber(10).pow(decimals);

        return root.div(divisor).toFixed(4).toString();
    }

    function toHumanDollarValue(token: ExternalToken) {
        if (!token.balance || !token.price) {
            return "";
        }

        const divisor = new BigNumber(10).pow(token.decimals);
        const balance = new BigNumber(token.balance);
        const price = new BigNumber(token.price).div(divisor);
        const value = balance.div(divisor).multipliedBy(price);

        return "$" + value.toFixed(5).toString();
    }

    return (
        <>
            <div>Select a token</div>
            <div className="px-2 py-1">
                <Input />
            </div>
            <Separator className="my-1" />
            <ScrollArea className="h-[478px] w-full p-4">
                {
                    tokens?.sort((a, b) => b.balance - a.balance)?.map((token, index) => {
                        return (
                            <div key={index} className="flex flex-row justify-between items-center h-12 hover:bg-gray-900 cursor-pointer">
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={token.logo} alt="Logo" />
                                        <AvatarFallback>{"?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-start">
                                        <p className="font-mono">{token.symbol}</p>
                                        <p className="font-mono text-xs opacity-50">{toHumanReadable(token.balance, token.decimals) + " " + token.symbol}</p>
                                    </div>
                                </div>
                                <p className="font-mono">{isLoading ? <Skeleton className="h-6 w-12" /> : toHumanDollarValue(token)}</p>
                            </div>
                        )
                    })
                }
            </ScrollArea>
        </>
    )
}

export { TokenSelector };
