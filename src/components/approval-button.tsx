import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useQuery, useSignTypedData } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { JAMBalanceManager, submitOrder } from "@/api/bebop";
import { toJS } from "mobx";
import { toObject } from "@/types/bebop";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swap: _swap, inputQuantity, inputAsset, approve: _approve, exchangeError, getSharePriceParams, router, dataToSign, swapType, orderId } = useStore();
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
        args: [address!, swapType === ActionType.ARCANUM ? router.address : JAMBalanceManager],
        watch: true,
    });

    const { data: approve, isLoading: approveLoading } = useQuery(["approve"], async () => {
        const approveTo = swapType === ActionType.ARCANUM ? router.address : JAMBalanceManager;
        return await _approve(address!, inputAsset?.address, approveTo);
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

    const domain = dataToSign?.PARAM_DOMAIN;
    const types = dataToSign?.PARAM_TYPES;
    const message = toObject(dataToSign?.toSign);
    const { data: signedData, signTypedData } = useSignTypedData({ domain, types, primaryType: 'JamOrder', message });

    useQuery(["JAMOrder"], async () => {
        if (signedData) {
            await submitOrder({ quoteId: orderId!, signature: signedData });
        }
        return 1;
    }, {
        enabled: signedData !== undefined,
    });

    async function swapCall() {
        if (swapType === ActionType.ARCANUM) {
            const ttl = await getSharePriceParams();

            write!();
            setTtlLeft(ttl);
            setIsCounting(true);
        }
        if (swapType === ActionType.BEBOP) {
            signTypedData();
        }
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
