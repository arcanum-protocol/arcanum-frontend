import { BigNumber } from "bignumber.js";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { TransactionParamsSelector } from './transaction-params-selector';
import { InteractionWithApprovalButton } from './approval-button';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { observer } from 'mobx-react-lite';
import { multipool } from "@/store/MultipoolStore";


interface TradePaneProps {
    action: "mint" | "burn" | "swap";
}

export function TradePaneInner({
    action
}: TradePaneProps) {

    return (
        <div className="flex flex-col justify-center mt-[1rem]">
            <div className="flex flex-col gap-4 items-center">
                <TokenQuantityInput
                    text={"Send"}
                    balance={"0"}
                    isDisabled={false}
                    action={action}
                />

                <div className="my-[-2rem] z-10 bg-[#161616] border border-[#2b2b2b] p-2 rounded-lg">
                    <svg className="w-[1.5rem] h-[1.5rem]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                    </svg>
                </div>

                <TokenQuantityInput
                    text={"Receive"}
                    balance={"0"}
                    isDisabled={false}
                    action={action}
                />
            </div>
            <div className="flex flex-col gap-4 items-center">
                <TransactionParamsSelector />
                <InteractionWithApprovalButton />
            </div>
        </div>
    )
}

function toHumanReadable(number: number | undefined, decimals: number | undefined) {
    if (!number) {
        return "0";
    }

    const root = new BigNumber(number);
    const divisor = new BigNumber(10).pow(decimals || 18);

    return root.div(divisor).toFixed(4).toString();
}

interface TokenQuantityInputProps {
    text: "Send" | "Receive";
    balance: string;
    isDisabled?: boolean;
    action: "mint" | "burn" | "swap";
}

export const TokenQuantityInput = observer(({ text, isDisabled }: TokenQuantityInputProps) => {
    const { inputAsset, outputAsset } = multipool;

    const theAsset = text === "Send" ? inputAsset : outputAsset;
    
    return (
        <div className="flex flex-col justify-between items-start rounded-2xl h-full p-3 bg-[#1b1b1b]">
            <p className="leading-4 m-0 uppercase text-xs font-light">{text} </p>
            <div className="flex flex-row flex-start items-start justify-between w-full">
                <div className={''}
                    style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    <input className="w-full text-3xl h-10 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-transparent"
                        value={0}
                        placeholder="0"
                        // onChange={handleInputChange}
                    />
                </div>
                <Button className="grow max-w-min rounded-2xl pl-0.5 pr-0.5 justify-between" variant="secondary">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={theAsset?.logo} alt="Logo" />
                        <AvatarFallback>{theAsset?.name}</AvatarFallback>
                    </Avatar>
                    <p className="px-0.5 text-white opacity-100">{"TEST"}</p>
                    {
                        !isDisabled ?
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" /> :
                            <div className="w-2"></div>
                    }
                </Button>
            </div>
            <div className="flex flex-row justify-between w-full mt-[4px]">
                <p className="m-0 text-xs text-gray-500">
                    = {(0) + "$"}
                </p>
                <p className="m-0 text-gray-500 text-xs">
                    Balance: {
                        toHumanReadable(
                            parseFloat("0"),
                            text === "Send" ? 18 : 18
                        )
                    }
                </p>
            </div>
        </div>
    );
});

