import { useAccount, useSimulateContract, useSignTypedData, useWriteContract } from "wagmi";
import { useMultipoolStore } from "@/contexts/StoreContext";
import { fromBigNumber, parseError } from "@/lib/utils";
import { truncateAddress } from "@/store/StoresUtils";
import { ActionType } from "@/store/MultipoolStore";
import { useAllowence } from "@/hooks/useAllowence";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { submitOrder } from "@/api/bebop";
import { toObject } from "@/types/bebop";
import { toast } from "./ui/use-toast";
import { useModal } from "connectkit";
import { Button } from "./ui/button";
import { useEffect } from "react";
import ERC20 from "@/abi/ERC20";
import { Address } from "viem";


const ParseErrorMessage = (failureReason: any) => {
    if (failureReason.message.includes("DeviationExceedsLimit")) {
        return "Deviation Exceeds Limit";
    }
    if (failureReason.message.includes("transfer amount exceeds allowance")) {
        return "Insufficient Allowance";
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
    }
    if (failureReason.message.includes("InvalidForcePushSignatureNumber")) {
        return "Invalid Force Push Signature Number";
    }
    if (failureReason.message.includes("InvalidTargetShareAuthority")) {
        return "Invalid Target Share Authority";
    }
    if (failureReason.message.includes("InvalidForcePushAuthority")) {
        return "Invalid Force Push Authority";
    }
    if (failureReason.message.includes("ZeroAmountSupplied")) {
        return "Zero Amount Supplied";
    }
    if (failureReason.message.includes("SleepageExceeded")) {
        return "Sleepage Exceeded";
    }
    if (failureReason.message.includes("AssetsNotSortedOrNotUnique")) {
        return "Assets Not Sorted Or Not Unique";
    }
    if (failureReason.message.includes("IsPaused")) {
        return "Is Paused";
    }
    if (failureReason.message.includes("FeeExceeded")) {
        return "Fee Exceeded";
    }
    if (failureReason.message.includes("NotEnoughQuantityToBurn")) {
        return "Not Enough Quantity To Burn";
    }
    if (failureReason.message.includes("NoPriceOriginSet")) {
        return "No Price Origin Set";
    }
    if (failureReason.message.includes("UniV3PriceFetchingReverted")) {
        return "UniV3 Price Fetching Reverted";
    }
    if (failureReason.message.includes("SignaturesNotSortedOrNotUnique")) {
        return "Signatures Not Sorted Or Not Unique";
    }
    return "Unknown Error";
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
    const { setLoading, setLoadingOver, swapUniswap, inputQuantity, inputAsset, router, swapIsLoading } = useMultipoolStore();

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, refetch, failureReason } = useQuery({
        queryKey: ["uniswap-swap"],
        queryFn: async () => {
            if (fromBigNumber(inputQuantity) == BigInt(0)) {
                throw new Error("No Swap Action");
            }
            setLoading();
            try {
                return await swapUniswap(address);
            } catch (error) {
                setLoadingOver();
                throw error;
            } finally {
                setLoadingOver();
            }
        },
        refetchInterval: 30000,
        staleTime: 9000,
        enabled: false,
        initialData: {
            request: undefined,
            value: 0n
        },
        retry: (failureCount: number, error: any) => {
            if (error.toString().includes("Insufficient Allowance") ||
                error.toString().includes("Insufficient Balance") || 
                error.toString().includes("of executing this transaction exceeds the balance of the account")) {
                return false;
            } else {
                return true;
            }
        },
        retryDelay: 30000
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

    if (!address) {
        return <ConnectWalletButton />
    }

    if (failureReason) {
        if (failureReason.message.includes("No Swap Action")) {
            return <DefaultButton />
        }
        return <ErrorButton errorMessage={ParseErrorMessage(failureReason)} />
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
    const { uniswapFromMultipool, swapMultipool, setLoading, setLoadingOver, mainInput, inputQuantity, outputQuantity, inputAsset, router, swapIsLoading } = useMultipoolStore();

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading: swapActionIsLoading, refetch, failureReason } = useQuery({
        queryKey: ["arcanum-swap"],
        queryFn: async () => {
            if (fromBigNumber(inputQuantity) == BigInt(0) && mainInput === 'in') {
                throw new Error("No Swap Action");
            }
            if (fromBigNumber(outputQuantity) == BigInt(0) && mainInput === 'out') {
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
                setLoadingOver();
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
        retry: (failureCount: number, error: any) => {
            if (error.toString().includes("Insufficient Allowance") ||
                error.toString().includes("Insufficient Balance") || 
                error.toString().includes("of executing this transaction exceeds the balance of the account")) {
                return false;
            } else {
                return true;
            }
        },
        retryDelay: 30000
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

    if (!address) {
        return <ConnectWalletButton />
    }

    if (failureReason) {
        if (failureReason.message.includes("No Swap Action")) {
            return <DefaultButton />
        }

        return <ErrorButton errorMessage={ParseErrorMessage(failureReason)} />
    }

    if (swapActionIsLoading || allowanceIsLoading || swapIsLoading) {
        return <LoadingButton />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={router.address} />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});
