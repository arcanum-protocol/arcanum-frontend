import { BigNumber } from "bignumber.js";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { TransactionParamsSelector } from './transaction-params-selector';
import { InteractionWithApprovalButton } from './approval-button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from "./ui/skeleton";
import { Button } from './ui/button';
import { observer } from 'mobx-react-lite';
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useMultipoolStore } from "@/contexts/StoreContext";
import { useQuery } from "@tanstack/react-query";
import { getSignedPrice } from "@/api/arcanum";


export const TradePaneInner = observer(() => {
    const { multipoolAddress, swapAssets, updateMPPrice, assetsIsLoading } = useMultipoolStore();

    console.log("multipoolAddress", multipoolAddress);

    const { isLoading } = useQuery({
        queryKey: ["assets"],
        queryFn: async () => {
            const price = await getSignedPrice(multipoolAddress);
            updateMPPrice(price);

            return 1;
        },
        refetchInterval: 30000,
        retry: true,
    });

return (
    <div className="flex flex-col justify-center gap-2 mt-2">
        <div className="flex flex-col gap-4 items-center">
            {
                isLoading || assetsIsLoading ?
                    <Skeleton className="rounded w-[309.4px] h-[102.4px]"></Skeleton> :
                    <TokenQuantityInput text={"Send"} />
            }

            <div onClick={swapAssets}
                className="my-[-2rem] z-10 bg-[#0c0a09] border border-[#2b2b2b] p-2 rounded">
                <svg className="w-[1.5rem] h-[1.5rem]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
            </div>

            {
                isLoading || assetsIsLoading ?
                    <Skeleton className="rounded w-[309.4px] h-[102.4px]"></Skeleton> :
                    <TokenQuantityInput text={"Receive"} />
            }
        </div>
        <div className="flex flex-col items-center gap-2">
            <TransactionParamsSelector />
            <InteractionWithApprovalButton />
        </div>
    </div>
)
});

interface TokenQuantityInputProps {
    text: "Send" | "Receive";
}

export const TokenQuantityInput = observer(({ text }: TokenQuantityInputProps) => {
    const { setMainInput, inputAsset, outputAsset, setSelectedTabWrapper, etherPrice, getItemPrice, hrQuantity, mainInput, setQuantity, swapIsLoading } = useMultipoolStore();
    const { address } = useAccount();
    const [debounce, setDebounce] = useState<NodeJS.Timeout | undefined>();
    const [inputType, setInputType] = useState<"balance" | "input">("input");

    const quantity = hrQuantity(text);

    const theAsset = text === "Send" ? inputAsset : outputAsset;
    const isDisabled = theAsset?.type === "solid";

    const isThisMainInput = text === "Send" ? mainInput === "in" : mainInput === "out";

    function dollarValue() {
        if (theAsset?.type === 'external') {
            return new BigNumber(quantity.replace(',', "")).multipliedBy(getItemPrice(text)).toFixed(4);
        }
        return new BigNumber(quantity.replace(',', "")).multipliedBy(getItemPrice(text)).multipliedBy(etherPrice).toFixed(4);
    }

    function getBalance(): JSX.Element {
        const { data: balance, isLoading } = useBalance({
            address: address,
            token: theAsset?.address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : theAsset?.address,
            watch: true,
            enabled: address !== undefined,
        });

        if (address === undefined) {
            return (
                <div className="inline-flex font-mono text-xs text-gray-500">0</div>
            );
        }

        if (balance == undefined) {
            return (
                <div className="inline-flex font-mono text-xs text-gray-500">0</div>
            );
        }

        if (isLoading) {
            return (
                <Skeleton className="rounded w-1 h-0.5" />
            );
        }

        const realTokenBalance = new BigNumber(balance.value.toString()).dividedBy(new BigNumber(10).pow(balance.decimals));

        // if its eth we need to left something for gas, so we substract 0.01
        if (theAsset?.address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
            const tokenBalance = new BigNumber(balance.value.toString()).dividedBy(new BigNumber(10).pow(balance.decimals)).minus(0.01);
            return (
                <div className={`inline-flex font-mono text-xs cursor-pointer transition-colors text-gray-500 hover:text-gray-400`} onClick={() => handleInputChange(tokenBalance.toFixed(), "balance")}>{realTokenBalance.toFixed(4)}</div>
            );
        }

        return (
            <div className={`inline-flex font-mono text-xs cursor-pointer transition-colors text-gray-500 hover:text-gray-400`} onClick={() => handleInputChange(realTokenBalance.toFixed(), "balance")}>{realTokenBalance.toFixed(4)}</div>
        );
    }

    function handleInputChange(e: string, inputType: "balance" | "input") {
        if (inputType === "input") {
            setInputType("input");
        }
        if (e === "") {
            setQuantity(text, undefined)
            return;
        }

        const regex = new RegExp("^[0-9]*[.,]?[0-9]*$");
        if (!regex.test(e)) {
            // prevent non-numeric input
            e = e.slice(0, -1);
            return;
        }

        const value = e.replace(",", ".");

        setMainInput(text);

        if (inputType === "balance") {
            setInputType("balance");
            setQuantity(text, value);
            return;
        }

        debounce && clearTimeout(debounce);
        setDebounce(setTimeout(() => {
            setQuantity(text, value);
        }, 1000));
    };

    const overrideText = text === "Send" ? "You pay" : "You receive";

    return (
        <div className="flex flex-col justify-between items-start h-full p-3 rounded-md border bg-[#0c0a09] w-full">
            <p className="leading-4 m-0 text-[13px] text-[#888888] hover:text-[#a1a1a1] transition ease-in-out delay-10 font-light">{overrideText} </p>
            <div className="flex flex-row flex-start items-start justify-between w-full gap-1">
                <div className={'flex flex-row items-center justify-between w-full'}>
                    {
                        isThisMainInput ?
                            <input className="w-full text-2xl h-10 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                placeholder="0"
                                onChange={(value) => handleInputChange(value.target.value, "input")}
                                value={inputType == "balance" ? quantity : undefined}
                            /> :
                            swapIsLoading ?
                                <Skeleton className="rounded w-full h-10" /> :
                                <input className="w-full text-2xl h-10 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                    placeholder="0"
                                    value={quantity}
                                    onFocus={() => setMainInput(text === "Send" ? "in" : "out")}
                                />
                    }
                </div>
                <Button className="grow max-w-min rounded py-[6px] pr-[5px] pl-[8px] justify-between bg-[#0c0a09] border border-[#292524] disabled:opacity-100" variant="secondary" onClick={() => setSelectedTabWrapper(text === "Send" ? "set-token-in" : "set-token-out")} disabled={isDisabled}>
                    <Avatar className="bg-[#0c0a09] h-6 w-6 mr-1">
                        <AvatarImage src={theAsset?.logo} alt="Logo" />
                        <AvatarFallback>{theAsset?.symbol}</AvatarFallback>
                    </Avatar>
                    <p className="px-0.5 text-white opacity-100">{theAsset?.symbol}</p>
                    {
                        isDisabled ?
                            <></> :
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    }
                </Button>
            </div>
            <div className="flex flex-row justify-between w-full mt-[4px]">
                <p className="m-0 text-xs text-gray-500">
                    = {dollarValue()}$
                </p>
                <p className="m-0 text-gray-500 text-xs whitespace-nowrap">
                    Balance: {
                        getBalance()
                    }
                </p>
            </div>
        </div>
    );
});
