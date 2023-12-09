import { multipool } from "@/store/MultipoolStore";
import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { toast } from "./ui/use-toast";
import { useAccount, useContractRead } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { Address } from 'viem';
import { useEffect, useState } from "react";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swap: _swap, inputQuantity, inputAsset, getRouter, approve: _approve, exchangeError, getSharePriceParams } = multipool;
    const { address } = useAccount();

    const [ttlLeft, setTtlLeft] = useState<number>(600);
    const [isCounting, setIsCounting] = useState<boolean>(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (ttlLeft < 100 && isCounting) {
                return;
            }
            setTtlLeft(ttlLeft - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [ttlLeft]);

    const { data: allowance, isLoading: allowanceLoading, refetch } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, getRouter],
        enabled: address !== undefined && inputAsset !== undefined,

    });

    async function swap() {
        refetch();
        const ttl = await getSharePriceParams();
        setTtlLeft(ttl);
        setIsCounting(true);

        const _hash = await _swap(address!);
        const hash = _hash as string;

        console.log("hash", hash);

        if (hash.includes("User rejected the request")) {
            toast({
                title: "Swap rejected",
                description: hash,
            });
            return;
        }
        
        if (hash.includes("insufficient allowance")) {
            toast({
                title: "Insufficient allowance",
                description: hash,
            });
            return;
        }
        
        if (hash.includes("ContractFunctionExecutionError")) {
            toast({
                title: "Swap failed",
                description: hash,
            });
            return;
        }
        
        if (hash) {
            toast({
                title: "Swap successful",
                description: "Swap submitted to the blockchain",
            });
        }

        setIsCounting(false);
        setTtlLeft(0);
    }

    async function approve(address: Address, tokenAddress: Address | undefined, spender: Address) {
        setIsCounting(false);
        try {
            await _approve(address!, tokenAddress, spender);
        } catch (e) {
            console.log(e);
            if (e.message.includes("The Provider is disconnected from all chains")) {
                toast({
                    title: "Wallet disconnected",
                    description: e.message,
                });
                return;
            }
        }
        refetch();
    }

    function toHumanReadableTime(ttl: number) {
        const minutes = Math.floor(ttl / 60);
        const seconds = ttl - minutes * 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }

    if (address === undefined) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </Button>
            </div >
        )
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Swap</p>
                </Button>
            </div >
        )
    }

    if (allowanceLoading) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Loading...</p>
                </Button>
            </div >
        )
    }

    if (exchangeError) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>{exchangeError}</p>
                </Button>
            </div >
        )
    }

    if (allowance! < BigInt(inputQuantity!.toFixed())) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => approve(address!, inputAsset?.address, getRouter)}>
                    <p style={{ margin: "10px" }}>Approve</p>
                </Button>
            </div >
        )
    }

    if (isCounting) {  
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-red-500 hover:bg-transparent " disabled={true}>
                    <p style={{ margin: "10px" }}>Swap {toHumanReadableTime(ttlLeft)}</p>
                </Button>
            </div >
        )
    } 
    if (isCounting) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-red-500 hover:bg-transparent" disabled={false} onClick={() => swap()}>
                    <p style={{ margin: "10px" }}>Swap expired</p>
                </Button>
            </div >
        )
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => swap()}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    );
});
