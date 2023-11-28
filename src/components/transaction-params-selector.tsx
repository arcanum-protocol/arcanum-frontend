import { FixedNumber } from "ethers";

import 'react-loading-skeleton/dist/skeleton.css'
import { useTradeContext } from '../contexts/TradeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { SendTransactionParams } from "@/types/sendTransactionParams";
import { Button } from "./ui/button";
import { Separator } from "@radix-ui/react-separator";


interface TransactionParamsSelectorProps {
    txnParams: SendTransactionParams | undefined;
}

export function TransactionParamsSelector({ txnParams }: TransactionParamsSelectorProps) {
    const { estimatedValues, transactionCost } = useTradeContext();

    const p: SendTransactionParams | undefined = txnParams;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column"
        }} className="text-xs">
            <SlippageSelector />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                    transition: "max-height .5s",
                }}>
                {
                    estimatedValues?.minimalAmountOut != undefined ?
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                            <p style={{ margin: "0" }}>
                                {estimatedValues?.minimalAmountOut.formatted}({estimatedValues?.minimalAmountOut.usd}$)
                            </p>
                        </div>
                        : (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                                <p style={{ margin: "0" }}>
                                    {estimatedValues?.maximumAmountIn?.formatted || 0} ({estimatedValues?.maximumAmountIn?.usd || 0}$)
                                </p>
                            </div>

                        )
                }
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-row items-center gap-1 text-lg lg:text-xs">
                                    Cashback
                                    <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono text-xs">
                                <p>The amount of tokens in the corresponding asset you'll get for your pool balancing swaps (good actions). Cashback equal 0 means that your action was not directed towards balance.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {p ?
                        <Tooltip>
                            <p
                                style={{
                                    margin: "0",
                                    textDecoration: p ? "underline" : undefined,
                                }}>
                                {p ? <>
                                    {
                                        (
                                            Number(estimatedValues?.estimatedCashbackIn?.usd || "0") +
                                            Number(estimatedValues?.estimatedCashbackOut?.usd || "0")
                                        ).toString()}$
                                </> : <>{"-"} </>}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", margin: "5px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ margin: "0", marginRight: "10px" }}>
                                        {p?.tokenIn?.symbol}:
                                    </div>
                                    <div style={{ margin: "0" }}>
                                        {Number(estimatedValues?.estimatedCashbackIn?.formatted) || "0"}({Number(estimatedValues?.estimatedCashbackIn?.usd) || "0"})$
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ margin: "0", marginRight: "10px" }}>
                                        {p?.tokenOut?.symbol}:
                                    </div>
                                    <div style={{ margin: "0" }}>
                                        {Number(estimatedValues?.estimatedCashbackOut?.formatted) || "0"}({Number(estimatedValues?.estimatedCashbackOut?.usd) || "0"})$
                                    </div>
                                </div>
                            </div>
                        </Tooltip>
                        :
                        <>{"-"}</>
                    }
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                    <p style={{ margin: "0" }}>{estimatedValues?.fee?.usd || 0}$ ({estimatedValues?.fee?.percent || 0}%)</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                    <p style={{ margin: "0" }}>{Number(transactionCost?.cost || "0").toFixed(4)}$</p>
                </div>
            </div >
        </div >
    );
}

export function SlippageSelector() {
    const { slippage, setSlippage } = useTradeContext();

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
                                <p style={{ margin: "0" }}>{slippage}%</p>
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
>>>>>>> 78cdfa2 (Add background image and update dependencies)
                                        hover:bg-[#2D2D2D] focus:bg-[#2D2D2D] active:bg-[#2D2D2D]`
                                }>
                                {slippagePreseted + '%'}
                            </Button>
                        );
                    })}
                    <div className={
                        `flex flex-row text-center rounded-lg cursor-pointer ease-out delay-100 h-9 gap-2 transition-all text-xs font-thin min-h-full text-[#FFF] bg-[#1B1B1B] items-center
>>>>>>> 78cdfa2 (Add background image and update dependencies)
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
                                    let val = FixedNumber.fromString(e.target.value);
                                    let num = Number(val.toString());
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
}
