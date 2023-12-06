import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Separator } from "@radix-ui/react-separator";
import { observer } from "mobx-react-lite";
import { multipool } from "@/store/MultipoolStore";
import BigNumber from "bignumber.js";


export function TransactionParamsSelector() {
    return (
        <div className="text-xs flex flex-col gap-2">
            <SlippageSelector />
            <div className="flex flex-col gap-2">
                <ExchangeInfo />
                <Fee />
                <NetworkFee />
            </div >
        </div >
    );
}

const NetworkFee = observer(() => {
    const { transactionCost } = multipool;

    if (!transactionCost) {
        return (
            <></>
        );
    }

    const dollarValue = new BigNumber(transactionCost.toString()).dividedBy(new BigNumber(10).pow(18));
    const dollar = dollarValue.multipliedBy(multipool.etherPrice[42161]);

    return (
        <div className="flex justify-between">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-row items-center gap-1 text-lg lg:text-xs">
                            Transaction cost
                            <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                        <p>Cost of the transaction on the blockchain.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <p className="m-0">{dollar.toFixed(4)}$</p>
        </div>
    );
});

const Fee = observer(() => {
    const { inputQuantity, fee } = multipool;

    if (!inputQuantity || !fee) {
        return (
            <></>
        );
    }

    const dollarValue = new BigNumber(inputQuantity!.toString()).multipliedBy(fee!.toString()).dividedBy(new BigNumber(10).pow(18));
    const feeDollar = dollarValue.multipliedBy(multipool.etherPrice[42161]).dividedBy(new BigNumber(10).pow(18));
    const feePersent = new BigNumber(fee!.toString()).dividedBy(new BigNumber(10).pow(18)).multipliedBy(100);

    // if fee dollar is less than 0.0001$ then it is zero and if fee persent is less than 0.0001% then it is zero
    const humanReadableFeeDollar = feeDollar.isLessThan(0.0001) ? 0 : feeDollar.toFixed(4);
    const humanReadableFeePersent = feePersent.isLessThan(0.0001) ? 0 : feePersent.toFixed(4);

    if (feeDollar.isLessThan(0.0001)) {
        return (
            <></>
        );
    }

    return (
        <div className="flex justify-between">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-row items-center gap-1 text-lg lg:text-xs">
                            Fee
                            <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                        <p>Platform fee is a summ of base fee and deviation fee.<br />
                            Base fee - the platform's commission, for swaps is equal 0.01%. It is zero for minting and burning. <br />
                            Deviation fee is added when you increase the current deviation of the token.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <p className="m-0">{humanReadableFeeDollar}$ ({humanReadableFeePersent}%)</p>
        </div>
    )
});

const ExchangeInfo = observer(() => {
    const { maximumSend, minimalReceive, inputAsset, outputAsset, etherPrice } = multipool;

    if (minimalReceive) {
        const bgMinimalReceive = new BigNumber(minimalReceive.toString());
        const decimals = outputAsset?.decimals || 18;
        const minimalReceiveFormatted = bgMinimalReceive.dividedBy(new BigNumber(10).pow(decimals));
        const minimalReceiveFormattedDollar = minimalReceiveFormatted.multipliedBy(etherPrice[42161]);

        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-xs">
                                Minimal receive
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                            <p>The minimum amount of tokens you'll receive in case of the maximal slippage.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <p className="m-0">
                    {minimalReceiveFormatted.toFixed(4)} ({minimalReceiveFormattedDollar.toFixed(4)}$)
                </p>
            </div>
        );
    }

    if (maximumSend) {
        const bgMaximumSend = new BigNumber(maximumSend.toString());
        const decimals = inputAsset?.decimals || 18;
        const maximumSendFormatted = bgMaximumSend.dividedBy(new BigNumber(10).pow(decimals));
        const maximumSendFormattedDollar = maximumSendFormatted.multipliedBy(etherPrice[42161]);

        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-lg lg:text-xs">
                                Maximum send
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                            <p>The maximum amount of tokens you'll pay in the case of the maximal slippage.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <p className="m-0">
                    {maximumSendFormatted.toFixed(4)} ({maximumSendFormattedDollar.toFixed(4)}$)
                </p>
            </div>
        );
    }

    return (
        <></>
    );
});

export const SlippageSelector = observer(() => {
    const { slippage, setSlippage } = multipool;

    // 0,1,2,3 - presets, 4 - custom
    const slippagePresets = [0.5, 1, 3];

    return (
        <div className='flex w-full mt-2'>
            <div className='flex flex-col items-start w-full gap-[10px]'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-xs w-full justify-between">
                                <div className="flex flex-row gap-1 items-center">
                                    Slippage tolerance
                                    <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                                </div>
                                <p className="m-0">{slippage}%</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                            <p>The parameter that shows how much funds is allowed to be spend according to fast price change.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className='flex rounded-lg w-1/4 h-8 items-center min-w-full gap-1'>
                    {slippagePresets.map((slippagePreseted: number, index: number) => {
                        return (
                            <Button
                                key={index}
                                onClick={() => setSlippage(slippagePreseted)}
                                className={
                                    `flex-initial text-center rounded-lg cursor-pointer ease-out delay-100 transition-all text-xs font-thin min-h-full text-[#FFF] bg-[#1B1B1B]
                                        hover:bg-[#2D2D2D] focus:bg-[#2D2D2D] active:bg-[#2D2D2D]`
                                }>
                                {slippagePreseted + '%'}
                            </Button>
                        );
                    })}
                    <div className={
                        `flex flex-row text-center rounded-lg cursor-pointer ease-out delay-100 h-9 gap-2 transition-all text-xs font-thin min-h-full text-[#FFF] bg-[#1B1B1B] items-center
                            hover:bg-[#2D2D2D] focus:bg-[#2D2D2D] active:bg-[#2D2D2D]`
                    }>
                        <input
                            className={
                                `flex-initial overflow-hidden text-xs font-thin slate-600 bg-transparent outline-none text-end h-full`
                            }
                            value={slippagePresets.indexOf(slippage) ? slippage : undefined}
                            placeholder="Custom"
                            onChange={e => {
                                try {
                                    if (e.target.value == "") {
                                        setSlippage(slippagePresets[0]);
                                    }

                                    let num = Number(e.target.value);
                                    if (num < 100) {
                                        setSlippage(num);
                                    }
                                } catch { }
                            }}
                        />
                        <div className='text-xs font-thin pr-2'>%</div>
                    </div>
                </div>
                <Separator orientation="horizontal" className="w-full h-[1px] bg-[#2b2b2b] my-[1rem]" />
            </div>
        </div >
    );
});
