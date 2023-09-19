import { FixedNumber } from "ethers";
import { useState } from "react";
import { SendTransactionParams } from "./trade-pane";

import 'react-loading-skeleton/dist/skeleton.css'
import { useTradeContext } from '../contexts/TradeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";


interface TransactionParamsSelectorProps {
    txnParams: SendTransactionParams | undefined;
}

export function TransactionParamsSelector({ txnParams }: TransactionParamsSelectorProps) {
    const { estimatedValues, transactionCost } = useTradeContext();

    const [priceToggled, togglePrice] = useState(true);

    const p: SendTransactionParams | undefined = txnParams;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column"
        }}>
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
                                        <div className="flex flex-row items-center gap-1">
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
                                            <div className="flex flex-row items-center gap-1">
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
                <div
                    onClick={() => togglePrice(!priceToggled)}
                    style={{ display: "flex", justifyContent: "space-between" }}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-row items-center gap-1">
                                    Price
                                    <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                <p>Current price of the input token estimated in the output token.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p
                        className={p ? "price-pane" : undefined}
                        style={{ margin: "0" }}
                    >
                        {
                            p ?
                                priceToggled
                                    ?
                                    <>
                                        1 {p?.tokenIn?.symbol
                                        }={(Number(estimatedValues?.estimatedAmountOut?.formatted || "0")
                                            / Number(estimatedValues?.estimatedAmountIn?.formatted || "1")).toFixed(4)}
                                        {" "}
                                        {p?.tokenOut?.symbol}
                                    </>
                                    :
                                    <>
                                        1 {p?.tokenOut?.symbol}={(Number(estimatedValues?.estimatedAmountIn?.formatted || "0")
                                            / Number(estimatedValues?.estimatedAmountOut?.formatted || "1")).toFixed(4)}
                                        {" "}
                                        {p?.tokenIn?.symbol}
                                    </>
                                :
                                <>{"-"}</>
                        }
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-row items-center gap-1">
                                    Cashback
                                    <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
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
                                <div className="flex flex-row items-center gap-1">
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
                                <div className="flex flex-row items-center gap-1">
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
    const slippagePresets = [0.1, 0.5, 1, 3];

    return (
        <div className='flex w-full mb-0'>
            <div className='flex flex-col w-full gap-[10px] w-full'>
                <div className='flex m-auto border border-[##292524] rounded-2xl min-w-full pr-1'>
                    <div className='flex rounded-lg justify-between h-4 items-center min-w-full'>
                        {slippagePresets.map((slippagePreseted: number, index: number) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => setSlippage(slippagePreseted)}
                                    className={
                                        `flex-initial w-1/6 rounded-xl cursor-pointer justify-between text-lg transition ease-in-out delay-50 transition-all -my-1 -ml-[1px]
                                        ${slippagePresets.indexOf(slippage) == index ? "bg-[#292524]" : "bg-transparent"}`
                                    }>
                                    <p className='text-xs font-thin min-h-full hover:border rounded-2xl'>{slippagePreseted}%</p>
                                </div>
                            );
                        })}
                        <div className={
                            `inline-flex inline-flex flex-row w-2/6 hover:border rounded-2xl -mx-[0.5px] border border-transparent
                            ${slippagePresets.indexOf(slippage) === 4 ? "bg-[#292524]" : "bg-transparent"}`
                        }>
                            <input
                                className={
                                    `flex-initial overflow-hidden text-xs font-thin slate-600 bg-transparent outline-none text-end mr-2`
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
                            <div className='text-xs font-thin'>%</div>
                        </div>
                    </div>
                </div>
                <div className='flex w-full justify-between'>
                    <div className='flex'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-row items-center gap-1">
                                        Slippage tolerance
                                        <QuestionMarkCircledIcon height={12} width={12} opacity={0.5} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="bg-black border text-gray-300 max-w-xs font-mono">
                                    <p>The parameter that shows how much funds is allowed to be spend according to fast price change.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div style={{ display: "flex" }}>
                        <p style={{ margin: "0" }}>{slippage}%</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
