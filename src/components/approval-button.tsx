import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useQuery, useSendTransaction, useSignTypedData } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { JAMBalanceManager, submitOrder } from "@/api/bebop";
import { toJS } from "mobx";
import { toObject } from "@/types/bebop";
import { fromBigNumber } from "@/lib/utils";
import { getWalletClient } from "@wagmi/core";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swapType } = useStore();

    // const [ttlLeft, setTtlLeft] = useState<number>(600);
    // const [isCounting, setIsCounting] = useState<boolean>(false);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (ttlLeft < 100 && isCounting) {
    //             return;
    //         }
    //         setTtlLeft(ttlLeft - 1);
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, [ttlLeft]);

    // const { data: allowance, isLoading: allowanceLoading, refetch } = useContractRead({
    //     address: inputAsset?.address,
    //     abi: ERC20,
    //     functionName: "allowance",
    //     args: [address!, swapType === ActionType.ARCANUM ? router.address : JAMBalanceManager],
    //     watch: true,
    // });

    // const { data: approve, isLoading: approveLoading } = useQuery(["approve"], async () => {
    //     const approveTo = swapType === ActionType.ARCANUM ? router.address : JAMBalanceManager;
    //     return await _approve(address!, inputAsset?.address, approveTo);
    // }, {
    //     enabled: address !== undefined && inputAsset !== undefined && inputQuantity !== undefined,
    // });

    // const { config: approvalConfig } = usePrepareContractWrite(approve);
    // const { write: approvalWrite } = useContractWrite(approvalConfig);

    // const { data: localSwap, isLoading: localSwapLoading } = useQuery(["swap"], async () => {
    //     refetch();

    //     return await _swap(address!);
    // }, {
    //     enabled: address !== undefined && inputAsset !== undefined && inputQuantity !== undefined,
    // });

    // const { config } = usePrepareContractWrite(localSwap!);
    // const { write } = useContractWrite(config);

    // const domain = dataToSign?.PARAM_DOMAIN;
    // const types = dataToSign?.PARAM_TYPES;
    // const message = toObject(dataToSign?.toSign);
    // const { data: signedData, signTypedData } = useSignTypedData({ domain, types, primaryType: 'JamOrder', message });

    // useQuery(["JAMOrder"], async () => {
    //     if (signedData) {
    //         await submitOrder({ quoteId: orderId!, signature: signedData });
    //     }
    //     return 1;
    // }, {
    //     enabled: signedData !== undefined,
    // });

    // async function swapCall() {
    //     if (swapType === ActionType.ARCANUM) {
    //         const ttl = await getSharePriceParams();

    //         write!();
    //         setTtlLeft(ttl);
    //         setIsCounting(true);
    //     }
    //     if (swapType === ActionType.BEBOP) {
    //         signTypedData();
    //     }
    // }

    if (swapType === ActionType.ARCANUM) {
        return <ArcanumSwap />
    }

    if (swapType === ActionType.UNISWAP) {
        return <UniswapSwap />
    }


    // if (allowanceLoading || localSwapLoading) {
    //     <LoadingButton />
    // }

    // if (exchangeError) {
    //     return (
    //         <div className="w-full">
    //             <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
    //                 <p style={{ margin: "10px" }}>{exchangeError}</p>
    //             </Button>
    //         </div >
    //     )
    // }

    // if (allowance! < BigInt(inputQuantity!.toFixed())) {
    //     if (approveLoading) {
    //         return (
    //             <div className="w-full">
    //                 <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
    //                     <p style={{ margin: "10px" }}>Loading...</p>
    //                 </Button>
    //             </div >
    //         )
    //     }

    //     return (
    //         <div className="w-full">
    //             <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={approvalWrite!}>
    //                 <p style={{ margin: "10px" }}>Approve</p>
    //             </Button>
    //         </div >
    //     )
    // }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-red-500 hover:bg-transparent" disabled={false}>
                <p style={{ margin: "10px" }}>BUG</p>
            </Button>
        </div >
    )
});

function LoadingButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Loading...</p>
            </Button>
        </div >
    )
}

function DefaultButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
}

function ConnectWalletButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Connect Wallet</p>
            </Button>
        </div >
    )
}

function ApprovalButton({ approveTo }: { approveTo: Address }) {
    const { inputAsset, approve: _approve } = useStore();

    const { config: approvalConfig } = usePrepareContractWrite({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "approve",
        args: [approveTo, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
    });
    const { write: approve } = useContractWrite(approvalConfig);

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={approve}>
                <p style={{ margin: "10px" }}>Approve</p>
            </Button>
        </div >
    )
}

const UniswapSwap = observer(() => {
    const { address } = useAccount();
    const { swap, inputQuantity, inputAsset, router } = useStore();

    const { data: allowance, isLoading: allowanceIsLoading } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, router.address],
        watch: true,
    });

    const { data: swapAction, isLoading: swapActionIsLoading } = useQuery(["swap"], async () => {
        const res = await swap(address!);
        return res;
    }, {
        refetchInterval: 30000,
    });

    const { config } = usePrepareContractWrite(swapAction!);
    const { write } = useContractWrite(config);


    if (swapActionIsLoading) {
        return <LoadingButton />
    }

    async function CallSwap() {
        write!();
    }

    if (address === undefined) {
        <ConnectWalletButton />
    }

    if (allowanceIsLoading) {
        return <LoadingButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={router.address} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});

const ArcanumSwap = observer(() => {
    const { address } = useAccount();
    const { swap, inputQuantity, inputAsset, router } = useStore();

    const { data: allowance, isLoading: allowanceIsLoading } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, router.address],
        watch: true,
    });

    const { data: swapAction, isLoading: swapActionIsLoading, refetch } = useQuery(["swap"], async () => {
        const res = await swap(address!);
        return res;
    }, {
        refetchInterval: 1000,
        enabled: address !== undefined && inputQuantity !== undefined && !inputQuantity.isZero()
    });

    const { config } = usePrepareContractWrite(swapAction!);
    const { write } = useContractWrite(config);

    if (swapActionIsLoading) {
        return <LoadingButton />
    }

    async function CallSwap() {
        refetch();
        if (write === undefined) return;
        write();
    }

    if (address === undefined) {
        <ConnectWalletButton />
    }

    if (allowanceIsLoading) {
        return <LoadingButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={router.address} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});
