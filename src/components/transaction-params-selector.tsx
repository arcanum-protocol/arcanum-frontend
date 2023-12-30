import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-separator";
import { useStore } from "@/contexts/StoreContext";
import { observer } from "mobx-react-lite";
import BigNumber from "bignumber.js";


export function TransactionParamsSelector() {
    return (
        <div className="p-4 rounded-md border bg-[#0c0a09] w-full">
            <div className="text-sm flex flex-col w-full">
                <SlippageSelector />
                <div className="flex flex-col gap-2">
                    <ExchangeInfo />
                    <Fee />
                    <NetworkFee />
                </div>
            </div>
        </div>
    );
}

const NetworkFee = observer(() => {
    const { transactionCost, etherPrice } = useStore();

    if (transactionCost == undefined) {
        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
                                Transaction cost
                                <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                            <p>Cost of the transaction on the blockchain.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <p className="m-0">-</p>
            </div>
        );
    }

    const dollarValue = new BigNumber(transactionCost.toString()).dividedBy(new BigNumber(10).pow(18));
    const dollar = dollarValue.multipliedBy(etherPrice);

    return (
        <div className="flex justify-between">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
    const { inputQuantity, fee: _fee, etherPrice } = useStore();

    if (!inputQuantity || !_fee) {
        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
                <p className="m-0">-</p>
            </div>
        );
    }

    const fee = BigNumber(_fee?.toString());
    const feeDollar = fee.multipliedBy(etherPrice).dividedBy(new BigNumber(10).pow(18));
    const feePersent = new BigNumber(fee!.toString()).dividedBy(new BigNumber(10).pow(18)).multipliedBy(100);

    // if fee dollar is less than 0.0001$ then it is zero and if fee persent is less than 0.0001% then it is zero
    const humanReadableFeeDollar = feeDollar.isLessThan(0.0001) ? 0 : feeDollar.toFixed(4);
    const humanReadableFeePersent = feePersent.isLessThan(0.0001) ? 0 : feePersent.toFixed(4);

    return (
        <div className="flex justify-between">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
    const { maximumSend, minimalReceive, inputAsset, outputAsset, etherPrice, getItemPrice } = useStore();

    if (minimalReceive) {
        const bgMinimalReceive = new BigNumber(minimalReceive.toString());
        const decimals = outputAsset?.decimals || 18;
        const price = getItemPrice("Receive");

        const absminimalReceiveFormatted = bgMinimalReceive.dividedBy(new BigNumber(10).pow(decimals)).abs();
        const absminimalReceiveFormattedDollar = absminimalReceiveFormatted.multipliedBy(price).multipliedBy(etherPrice);

        const tooLong = absminimalReceiveFormattedDollar.isGreaterThan(new BigNumber(1000).multipliedBy(BigNumber(10).pow(18)));

        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
                    {absminimalReceiveFormatted.toFixed(5, BigNumber.ROUND_UP)}
                    {
                        tooLong ?
                            absminimalReceiveFormattedDollar.toFixed(4) + "$" :
                            ""
                    }

                </p>
            </div>
        );
    }

    if (maximumSend) {
        const bgMaximumSend = new BigNumber(maximumSend.toString());
        const decimals = inputAsset?.decimals || 18;
        const price = getItemPrice("Send");

        const absMaximumSendFormatted = bgMaximumSend.dividedBy(new BigNumber(10).pow(decimals)).abs();
        const absMaximumSendFormattedDollar = absMaximumSendFormatted.multipliedBy(price).multipliedBy(etherPrice);

        console.log(absMaximumSendFormatted.toFixed());
        const tooLong = absMaximumSendFormatted.isGreaterThan(new BigNumber(1000).multipliedBy(BigNumber(10).pow(18)));

        return (
            <div className="flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
                    {absMaximumSendFormatted.toFixed(5, BigNumber.ROUND_UP)}
                    {
                        tooLong ?
                            absMaximumSendFormattedDollar.toFixed(4) + "$" :
                            ""
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="flex justify-between">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-row items-center gap-1 text-lg lg:text-sm">
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
                {0} (0$)
            </p>
        </div>
    );
});

export const SlippageSelector = observer(() => {
    const { slippage, setSlippage } = useStore();

    // 0,1,2,3 - presets, 4 - custom
    const slippagePresets = [0.5, 1, 3];

    return (
        <div className='flex w-full'>
            <div className='flex flex-col items-start gap-[10px] w-full'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-row items-center gap-1 text-sm w-full justify-between">
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
                <div className='flex w-full items-center gap-1'>
                    {slippagePresets.map((slippagePreseted: number, index: number) => {
                        return (
                            <button
                                key={index}
                                onClick={() => setSlippage(slippagePreseted)}
                                className={
                                    `flex-initial w-1/4 p-0 h-6 text-center cursor-pointer rounded ease-out delay-100 transition-all text-sm font-semibold text-[#FFF] bg-[#0c0a09] border border-[#292524]
                                        hover:bg-[#2D2D2D] focus:bg-[##0c0a09] active:bg-[#0c0a09]`
                                }>
                                {slippagePreseted + '%'}
                            </button>
                        );
                    })}
                    <input
                        className={`flex-initial w-1/4 p-0 h-6 text-center cursor-pointer rounded ease-out delay-100 transition-all text-sm font-semibold text-[#FFF] bg-[#0c0a09] border border-[#292524]
                            hover:bg-[#2D2D2D] focus:bg-[#0c0a09] active:bg-[#0c0a09] outline-none`}
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
                </div>
                <Separator orientation="horizontal" className="w-full h-[1px] bg-[#2b2b2b] mb-[0.5rem]" />
            </div>
        </div >
    );
});
