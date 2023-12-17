import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useQuery } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swap: _swap, inputQuantity, inputAsset, approve: _approve, exchangeError, getSharePriceParams, router } = useStore();
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
        args: [address!, router.address],
        watch: true,
        enabled: address !== undefined && inputAsset !== undefined,
    });

    const { data: approve, isLoading: approveLoading } = useQuery(["approve"], async () => {
        return await _approve(address!, inputAsset?.address, router.address);
    }, {
        enabled: address !== undefined && inputAsset !== undefined && inputQuantity !== undefined,
    });

    const { config: approvalConfig } = usePrepareContractWrite(approve);
    const { write: approvalWrite } = useContractWrite(approvalConfig);

    const { data: localSwap, isLoading: localSwapLoading } = useQuery(["swap"], async () => {
        refetch();
        
        return await _swap(address!);
    }, {
        enabled: address !== undefined && inputAsset !== undefined && inputQuantity !== undefined,
    });
    
    const { config } = usePrepareContractWrite(localSwap!);
    const { write } = useContractWrite(config);
    
    async function swapCall() {
        const ttl = await getSharePriceParams();
        
        write!();
        setTtlLeft(ttl);
        setIsCounting(true);
    }

    function toHumanReadableTime(ttl: number) {
        const minutes = Math.floor(ttl / 60);
        const seconds = ttl - minutes * 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }

    if (address === undefined) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </Button>
            </div >
        )
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Swap</p>
                </Button>
            </div >
        )
    }

    if (allowanceLoading) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Loading...</p>
                </Button>
            </div >
        )
    }

    if (exchangeError) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>{exchangeError}</p>
                </Button>
            </div >
        )
    }

    if (allowance! < BigInt(inputQuantity!.toFixed())) {
        if (approveLoading) {
            return (
                <div className="w-full">
                    <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                        <p style={{ margin: "10px" }}>Loading...</p>
                    </Button>
                </div >
            )
        }

        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={approvalWrite!}>
                    <p style={{ margin: "10px" }}>Approve</p>
                </Button>
            </div >
        )
    }

    if (localSwapLoading) {
        return (
            <div className="w-full">
                <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Loading...</p>
                </Button>
            </div >
        )
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-red-500 hover:bg-transparent" disabled={false} onClick={swapCall}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});
