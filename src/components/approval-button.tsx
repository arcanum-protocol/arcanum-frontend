import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { useAccount, useSimulateContract, useSignTypedData, useWriteContract } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useMultipoolStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { fromBigNumber, parseError } from "@/lib/utils";
import { useEffect } from "react";
import { toObject } from "@/types/bebop";
import { submitOrder } from "@/api/bebop";
import { useModal } from "connectkit";
import { useAllowence } from "@/hooks/useAllowence";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/hooks/useToken";
import { toast } from "./ui/use-toast";
import { truncateAddress } from "@/store/StoresUtils";

const ParseErrorMessage = (failureReason: any) => {
    if (failureReason.message.includes("DeviationExceedsLimit")) {
        return "Deviation Exceeds Limit";
    }
    if (failureReason.message.includes("transfer amount exceeds balance")) {
        return "Insufficient Balance";
    }
    if (failureReason.message.includes("The total cost (gas * gas fee + value) of executing")) {
        return "Insufficient Balance";
    }
    if (failureReason.message.includes("TargetShareIsZero")) {
        return "Target Share Is Zero"
    }
    if (failureReason.message.includes("CallFailed")) {
        return "Call Failed";
    } else {
        return failureReason.message;
    }
}

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
        queryKey: ["bebop-swap"],
        queryFn: async () => {
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
    const { swapUniswap, inputQuantity, inputAsset, router, swapIsLoading } = useMultipoolStore();

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, refetch, failureReason } = useQuery({
        queryKey: ["uniswap-swap"],
        queryFn: async () => {
            if (inputQuantity) {
                return await swapUniswap(address);
            } else {
                return {
                    request: undefined,
                    value: 0
                }
            }
        },
        refetchInterval: 30000,
        staleTime: 9000,
        enabled: false,
        retry: true,
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { writeContract } = useWriteContract({
        mutation: {
            onSuccess: (txHash) => {
                toast({
                    title: 'Transaction Sent',
                    description: `Transaction Sent: ${truncateAddress(txHash)}`
                });
            },
            onError: (error) => {
                if (error.message.includes("User rejected the request.")) {
                    toast({
                        title: 'Error',
                        description: "User rejected the request."
                    });

                    return;
                }

                toast({
                    title: 'Error',
                    description: error.message.split("Contract Call")[0]
                });
            }
        }
    });

    function CallSwap() {
        if (swapAction) {
            toast({
                title: 'Transaction being prepared',
                description: "Please wait for the transaction to be prepared."
            });

            writeContract({
                abi: router.abi,
                address: router.address,
                functionName: "swap",
                args: swapAction.request,
                value: swapAction.value,
            });

            return;
        }
        toast({
            title: 'Error',
            description: "No Swap Action"
        });
    }

    if (failureReason) {
        return <ErrorButton errorMessage={ParseErrorMessage(failureReason)} />
    }

    if (!address) {
        return <ConnectWalletButton />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    if (allowanceIsLoading || !swapAction || swapIsLoading) {
        return <LoadingButton />
    }

    if (allowance < fromBigNumber(inputQuantity)) {
        return <ApprovalButton approveTo={"0x36ebe888dc501e3a764f1c4910b13aaf8efd0583"} />
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
    const { uniswapFromMultipool, swapMultipool, setLoading, mainInput, inputQuantity, outputQuantity, inputAsset, router, swapIsLoading } = useMultipoolStore();

    const { data: tokenData, isLoading: balanceIsLoading } = useToken({
        address: inputAsset?.address,
        watch: true
    });

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading: swapActionIsLoading, refetch, failureReason } = useQuery({
        queryKey: ["arcanum-swap"],
        queryFn: async () => {
            if (!inputQuantity && mainInput === 'in') {
                throw new Error("No Swap Action");
            }
            if (!outputQuantity && mainInput === 'out') {
                throw new Error("No Swap Action");
            }

            setLoading();

            try {
                return await swapMultipool(address);
            } catch (error) {
                if (parseError(error) === "DeviationExceedsLimit") {
                    return await uniswapFromMultipool(address);
                }
                throw error;
            } finally {
                setLoading();
            }

        },
        refetchInterval: 30000,
        enabled: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        initialData: {
            request: undefined,
            value: 0n
        },
        retry: (error: any) => {
            if (error.toString().includes("Insufficient Allowance")) {
                return false;
            } else {
                return true;
            }
        },
    });

    useEffect(() => {
        if (mainInput === 'out') return;
        refetch();
    }, [inputQuantity]);

    useEffect(() => {
        if (mainInput === 'in') return;
        refetch();
    }, [outputQuantity]);

    const { writeContract } = useWriteContract({
        mutation: {
            onSuccess: (txHash) => {
                toast({
                    title: 'Transaction Sent',
                    description: `Transaction Sent: ${truncateAddress(txHash)}`
                });
            },
            onError: (error) => {
                if (error.message.includes("User rejected the request.")) {
                    toast({
                        title: 'Error',
                        description: "User rejected the request."
                    });

                    return;
                }

                toast({
                    title: 'Error',
                    description: error.message.split("Contract Call")[0]
                });
            }
        }
    });

    function CallSwap() {
        if (swapAction) {
            writeContract({
                abi: router.abi,
                address: router.address,
                functionName: "swap",
                args: swapAction.request,
                value: swapAction.value,
            });
        }
    }
    
    if (swapActionIsLoading || balanceIsLoading || allowanceIsLoading || swapIsLoading) {
        return <LoadingButton />
    }
    
    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={router.address} />
    }

    if (failureReason) {
        if (failureReason.message.includes("No Swap Action")) {
            return <DefaultButton />
        }
        
        return <ErrorButton errorMessage={ParseErrorMessage(failureReason)} />
    }

    if (!address) {
        return <ConnectWalletButton />
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
