import ETF from '@/abi/ETF';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { multipool, FeedType } from '@/store/MultipoolStore';
import { observer } from 'mobx-react-lite'
import { useState } from 'react';
import { Address } from 'viem';
import { useContractRead } from 'wagmi';


export const AdminPannel = observer(() => {
    const { updatePrice,
        withdrawFees,
        togglePause,
        setCurveParams,
        setSharePriceTTL,
        toggleForcePushAuthority,
        toggleTargetShareAuthority, 
        increaseCashback } = multipool;

    const [updatePriceState, setUpdatePriceState] = useState<{ address: Address, feedType: FeedType, bytes: string } | undefined>();
    const [withdrawFeesState, setWithdrawFeesState] = useState<{ to: Address } | undefined>();
    const [curveParamsState, setCurveParamsState] = useState<{ newDeviationLimit: string, newHalfDeviationFee: string, newDepegBaseFee: string, newBaseFee: string } | undefined>();
    const [setSharePriceTTLState, setSetSharePriceTTLState] = useState<{ newSharePriceTTL: string } | undefined>();
    const [toggleForcePushAuthorityState, setToggleForcePushAuthorityState] = useState<{ newSharePriceTTL: string } | undefined>();
    const [toggleTargetShareAuthorityState, setToggleTargetShareAuthorityState] = useState<{ newSharePriceTTL: string } | undefined>();
    const [increaseCashbackState, setIncreaseCashback] = useState<{ address: Address } | undefined>();

    const { data: owner } = useContractRead({
        address: multipool.multipool.address,
        abi: ETF,
        functionName: "owner"
    });

    async function callWrapprer(func: any, ...args: any) {
        try {
            await func(...args);
        } catch (e) {
            toast({
                title: "Error",
                description: e.toString(),
                duration: 9000,
            })
            console.log(e)
        }
    }

    // etherscan-like interface
    return (
        <div className="flex flex-col gap-4 items-center bg-[#161616] border border-[#292524] p-4 rounded-2xl">
            <div className="flex flex-col gap-4 items-center">
                <p>{owner}</p>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["address", "FeedType", "string"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "address") {
                                            setUpdatePriceState({
                                                address: e.target.value,
                                                feedType: updatePriceState?.feedType,
                                                bytes: updatePriceState?.bytes
                                            })
                                        } else if (type === "FeedType") {
                                            setUpdatePriceState({
                                                address: updatePriceState?.address,
                                                feedType: e.target.value,
                                                bytes: updatePriceState?.bytes
                                            })
                                        } else if (type === "string") {
                                            setUpdatePriceState({
                                                address: updatePriceState?.address,
                                                feedType: updatePriceState?.feedType,
                                                bytes: e.target.value
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(updatePrice, updatePriceState?.address!, updatePriceState?.feedType!, updatePriceState?.bytes!)}>update price</Button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["address"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "address") {
                                            setWithdrawFeesState({
                                                to: e.target.value,
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(withdrawFees, (withdrawFeesState?.to))}>withdraw fees</Button>
                </div>
                <Button onClick={() => callWrapprer(togglePause)}>toggle pause</Button>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["newDeviationLimit", "newHalfDeviationFee", "newDepegBaseFee", "newBaseFee"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "newDeviationLimit") {
                                            setCurveParamsState({
                                                A: e.target.value,
                                                B: curveParamsState?.B!,
                                                C: curveParamsState?.C!,
                                                D: curveParamsState?.D!
                                            })
                                        } else if (type === "newHalfDeviationFee") {
                                            setCurveParamsState({
                                                A: curveParamsState?.A!,
                                                B: e.target.value,
                                                C: curveParamsState?.C!,
                                                D: curveParamsState?.D!
                                            })
                                        } else if (type === "newDepegBaseFee") {
                                            setCurveParamsState({
                                                A: curveParamsState?.A!,
                                                B: curveParamsState?.B!,
                                                C: e.target.value,
                                                D: curveParamsState?.D!
                                            })
                                        } else if (type === "newBaseFee") {
                                            setCurveParamsState({
                                                A: curveParamsState?.A!,
                                                B: curveParamsState?.B!,
                                                C: curveParamsState?.C!,
                                                D: e.target.value
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(setCurveParams, curveParamsState?.newDeviationLimit, curveParamsState?.newHalfDeviationFee, curveParamsState?.newDepegBaseFee, curveParamsState?.newBaseFee)}>set curve params</Button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["newSharePriceTTL"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "newSharePriceTTL") {
                                            setSetSharePriceTTLState({
                                                newSharePriceTTL: e.target.value
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(setSharePriceTTL, setSharePriceTTLState?.newSharePriceTTL)}>set share price ttl</Button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["newSharePriceTTL"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "newSharePriceTTL") {
                                            setToggleForcePushAuthorityState({
                                                newSharePriceTTL: e.target.value
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(toggleForcePushAuthority, toggleForcePushAuthorityState?.newSharePriceTTL)}>toggle force push authority</Button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["newSharePriceTTL"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "newSharePriceTTL") {
                                            setToggleTargetShareAuthorityState({
                                                newSharePriceTTL: e.target.value
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(toggleTargetShareAuthority, toggleTargetShareAuthorityState?.newSharePriceTTL)}>toggle target share authority</Button>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    {
                        ["address"].map((type, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="text-[#ffffff]">{type}</div>
                                    <input className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-2" type="text" onChange={(e: any) => {
                                        console.log(type, e.target.value)
                                        if (type === "address") {
                                            setIncreaseCashback({
                                                address: e.target.value,
                                            })
                                        }
                                    }} />
                                </div>
                            )
                        })
                    }
                    <Button onClick={() => callWrapprer(increaseCashback, increaseCashbackState?.address)}>increase cashback</Button>
                </div>
            </div>
        </div>
    )
});
