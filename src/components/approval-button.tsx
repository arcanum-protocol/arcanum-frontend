import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { useAccount, useBalance, useSimulateContract, useSignTypedData, useWriteContract } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useMultipoolStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { fromBigNumber } from "@/lib/utils";
import { useEffect } from "react";
import { toObject } from "@/types/bebop";
import { submitOrder } from "@/api/bebop";
import { useModal } from "connectkit";
import { useAllowence } from "@/hooks/useAllowence";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/hooks/useToken";

export const ConnectWallet = () => {
    const { setOpen } = useModal();

    return (
        <button onClick={() => setOpen(true)} className="w-full border h-9 bg-transparent rounded-md text-slate-50 border-white-300 hover:border-green-500 hover:bg-transparent">
            Connect Wallet
        </button>
    );
};

export const InteractionWithApprovalButton = observer(() => {
    const { swapType } = useMultipoolStore();

    console.log("swapType", swapType);

    if (swapType === ActionType.ARCANUM) {
        return <ArcanumSwap />
    }

    if (swapType === ActionType.UNISWAP) {
        return <UniswapSwap />
    }

    if (swapType === ActionType.BEBOP) {
        return <BebopSwap />
    }
});

const ErrorButton = observer(({ errorMessage }: { errorMessage: string }) => {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-red-300 hover:border-red-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>{errorMessage}</p>
            </Button>
        </div >
    )
});

function LoadingButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-white hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Loading...</p>
            </Button>
        </div >
    )
}

function DefaultButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-white hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
}

function ConnectWalletButton() {
    return <ConnectWallet />
}

function ApprovalButton({ approveTo }: { approveTo: Address }) {
    const { inputAsset } = useMultipoolStore();

    const { data: approvalConfig } = useSimulateContract({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "approve",
        args: [approveTo, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
    });
    const { writeContract } = useWriteContract();

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-green-300 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => writeContract(approvalConfig!.request)}>
                <p style={{ margin: "10px" }}>Approve</p>
            </Button>
        </div >
    )
}

const BebopSwap = observer(() => {
    const { address } = useAccount();
    const { checkSwapBebop, inputQuantity, inputAsset, transactionCost, exchangeError, swapIsLoading } = useMultipoolStore();

    const { data: swapData, refetch } = useQuery({
        queryKey: ["swap"], queryFn: async () => {
            return await checkSwapBebop(address);
        }
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: "0xfE96910cF84318d1B8a5e2a6962774711467C0be" });

    const domain = swapData?.PARAM_DOMAIN;
    const types = swapData?.PARAM_TYPES;
    const message = toObject(swapData?.toSign);

    const { signTypedData } = useSignTypedData({ domain, types, primaryType: 'JamOrder', message: message });

    if (exchangeError && !swapIsLoading) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    if (transactionCost == undefined || swapIsLoading) {
        return <LoadingButton />
    }

    async function CallSwap() {
        const signedData = signTypedData({
            types, primaryType: 'JamOrder', message, domain
        });
        await submitOrder({ quoteId: swapData!.orderId, signature: signedData! });
    }

    if (!address) {
        return <ConnectWalletButton />
    }

    if (allowanceIsLoading) {
        return <LoadingButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={"0xfE96910cF84318d1B8a5e2a6962774711467C0be"} />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-green-300 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});

const UniswapSwap = observer(() => {
    const { address } = useAccount();
    const { swapUniswap, inputQuantity, inputAsset, router, exchangeError, updateErrorMessage, swapIsLoading } = useMultipoolStore();

    const inputQuantityBigInt = BigInt(inputQuantity?.toFixed(0) || "0");

    const { data: token } = useToken({
        address: address,
        watch: true,
    });

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading, refetch } = useQuery({
        queryKey: ["swap"],
        queryFn: async () => {
            if (token && inputQuantity) {
                if (token.balanceRaw < inputQuantityBigInt) {
                    updateErrorMessage("Insufficient Balance", false);
                } else {
                    updateErrorMessage(undefined, false);
                }
            }

            if (inputQuantity === undefined) {
                return {
                    request: undefined,
                    value: 0n
                }
            }

            return await swapUniswap(address);
        },
        refetchInterval: 10000,
        enabled: inputQuantity !== undefined && !inputQuantity.isZero(),
        initialData: {
            request: undefined,
            value: 0n
        }
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { error } = useSimulateContract({
        abi: router.abi,
        address: router.address,
        functionName: "swap",
        args: swapAction.request
    });
    const { writeContract } = useWriteContract();
    
    function CallSwap() {
        if (swapAction.request === undefined) return;
        writeContract({
            abi: router.abi,
            address: router.address,
            functionName: "swap",
            args: swapAction.request
        });
    }

    if (exchangeError && !swapIsLoading) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (!address) {
        return <ConnectWalletButton />
    }

    if (allowanceIsLoading || isLoading || swapIsLoading) {
        return <LoadingButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={"0x36ebe888dc501e3a764f1c4910b13aaf8efd0583"} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});

const ArcanumSwap = observer(() => {
    const { address } = useAccount();
    const { swapMultipool, mainInput, inputQuantity, outputQuantity, inputAsset, router, exchangeError, updateErrorMessage, swapIsLoading } = useMultipoolStore();

    const { data: tokenData, isLoading: balanceIsLoading } = useToken({
        address: inputAsset?.address,
        watch: true
    });
    const inputQuantityBigInt = BigInt(inputQuantity?.toFixed(0) || "0");

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading: swapActionIsLoading, refetch } = useQuery({
        queryKey: ["swap"],
        queryFn: async () => {
            const data = await swapMultipool(address);

            if (tokenData?.balanceRaw && inputQuantity) {
                if (tokenData?.balanceRaw < inputQuantityBigInt) {
                    updateErrorMessage("Insufficient Balance", false);
                }
            }

            return data;
        },
        refetchInterval: 15000,
        initialData: {
            request: undefined,
            value: 0n
        }
    });

    useEffect(() => {
        if (mainInput === 'out') return;
        refetch();
    }, [inputQuantity]);

    useEffect(() => {
        if (mainInput === 'in') return;
        refetch();
    }, [outputQuantity]);

    const { error } = useSimulateContract({
        abi: router.abi,
        address: router.address,
        functionName: "swap",
        args: swapAction.request
    });

    const { writeContract } = useWriteContract();

    function CallSwap() {
        refetch();
        if (swapAction.request === undefined) return;
        writeContract({
            abi: router.abi,
            address: router.address,
            functionName: "swap",
            args: swapAction.request
        });
    }

    if (exchangeError && !swapIsLoading) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (!address) {
        return <ConnectWalletButton />
    }

    if (swapActionIsLoading || balanceIsLoading || allowanceIsLoading || swapIsLoading) {
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
            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});
