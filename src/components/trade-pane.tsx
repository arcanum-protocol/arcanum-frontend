import { BigNumber } from "bignumber.js";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { TransactionParamsSelector } from './transaction-params-selector';
import { InteractionWithApprovalButton } from './approval-button';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { observer } from 'mobx-react-lite';
import { multipool } from "@/store/MultipoolStore";
import { ChangeEvent } from "react";
import ERC20 from "@/abi/ERC20";
import { useAccount, useContractRead } from "wagmi";
import { Skeleton } from "./ui/skeleton";


export const TradePaneInner = observer(() => {
    const { assetsIsLoading, swapAssets } = multipool;

    return (
        <div className="flex flex-col justify-center mt-[1rem]">
            <div className="flex flex-col gap-4 items-center">
                {
                    assetsIsLoading ?
                    <Skeleton className="w-[309.4px] h-[100.8px] rounded-2xl"></Skeleton> :
                        <TokenQuantityInput text={"Send"} />
                }

                <div onClick={swapAssets} 
                    className="my-[-2rem] z-10 bg-[#161616] border border-[#2b2b2b] p-2 rounded-lg">
                    <svg className="w-[1.5rem] h-[1.5rem]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                    </svg>
                </div>

                { 
                    assetsIsLoading ?
                    <Skeleton className="w-[309.4px] h-[100.8px] rounded-2xl"></Skeleton> :
                        <TokenQuantityInput text={"Receive"} />
                }
            </div>
            <div className="flex flex-col gap-4 items-center transition-[height]">
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
    const { setMainInput, inputAsset, outputAsset, setSelectedTabWrapper, checkSwap, etherPrice, getInputPrice, getOutputPrice, multipool: _multipool } = multipool;
    const { address } = useAccount();

    const quantity = text === "Send" ? multipool.hrInQuantity : multipool.hrOutQuantity;
    const theAsset = text === "Send" ? inputAsset : outputAsset;
    const isDisabled = theAsset?.type === "solid";

    const isThisMainInput = text === "Send" ? multipool.mainInput === "in" : multipool.mainInput === "out";

    function getBalance(): JSX.Element {
        const { data: balance, isLoading } = useContractRead({
            address: theAsset?.address,
            abi: ERC20,
            functionName: "balanceOf",
            args: [address!],
            watch: true,
            enabled: address !== undefined && theAsset !== undefined,
        });

        if (isLoading) {
            return (
                <Skeleton className="w-1 h-0.5" />
            );
        }

        if (balance === undefined) {
            return (
                <div className="font-mono text-xs text-gray-500">0</div>
            );
        }

        const tokenBalance = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(theAsset?.decimals!));

        return (
            <div className="inline-flex font-mono text-xs text-gray-500">{tokenBalance.toFixed(4)}</div>
        );
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value === "") {
            if (text === "Send") {
                multipool.setInputQuantity(undefined);
            } else {
                multipool.setOutputQuantity(undefined);
            }
            return;
        }

        const regex = new RegExp("^[0-9]*[.,]?[0-9]*$");
        if (!regex.test(e.target.value)) {
            // prevent non-numeric input
            e.target.value = e.target.value.slice(0, -1);
            return;
        }

        const value = e.target.value.replace(",", ".");

        if (text === "Send") {
            setMainInput("in");
        } else {
            setMainInput("out");
        }

        if (text === "Send") {
            multipool.setInputQuantity(value);
        } else {
            multipool.setOutputQuantity(value);
        }
        checkSwap();
    };

    function getDollarValue(): string {
        if (theAsset === undefined || quantity === undefined || etherPrice === undefined) {
            return "0";
        }

        const price = text === "Send" ? getInputPrice : getOutputPrice;

        if (theAsset.address === _multipool.address) {
            const value = new BigNumber(quantity).multipliedBy(etherPrice[42161]);
            return value.toFixed(2);
        }
        
        const value = new BigNumber(quantity).multipliedBy(price).multipliedBy(etherPrice[42161]);
        return value.toFixed(2);
    }

    return (
        <div className="flex flex-col justify-between items-start rounded-2xl h-full p-3 bg-[#1b1b1b]">
            <p className="leading-4 m-0 uppercase text-xs font-light">{text} </p>
            <div className="flex flex-row flex-start items-start justify-between w-full">
                <div className={''}
                    style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    {
                        isThisMainInput ?
                            <input className="w-full text-3xl h-10 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                placeholder="0"
                                onChange={handleInputChange}
                            /> :
                            <input className="w-full text-3xl h-10 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                                placeholder="0"
                                value={quantity === undefined ? "" : quantity}
                                onFocus={() => setMainInput(text === "Send" ? "in" : "out")}
                            />
                    }
                </div>
                <Button className="grow max-w-min rounded-2xl pl-0.5 pr-0.5 justify-between" variant="secondary" onClick={() => setSelectedTabWrapper(text === "Send" ? "set-token-in" : "set-token-out")} disabled={isDisabled}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={theAsset?.logo} alt="Logo" />
                        <AvatarFallback>{theAsset?.name}</AvatarFallback>
                    </Avatar>
                    <p className="px-0.5 text-white opacity-100">{theAsset?.name}</p>
                    {
                        !isDisabled ?
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                            <div className="w-2"></div>
                    }
                </Button>
            </div>
            <div className="flex flex-row justify-between w-full mt-[4px]">
                <p className="m-0 text-xs text-gray-500">
                    = {getDollarValue() + "$"}
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
