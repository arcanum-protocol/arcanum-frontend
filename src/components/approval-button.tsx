import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useQuery, useSignTypedData } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { fromBigNumber } from "@/lib/utils";
import { useEffect } from "react";
import { toObject } from "@/types/bebop";
import { submitOrder } from "@/api/bebop";
import { ConnectKitButton } from "connectkit";

export const ConnectWallet = () => {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, address }) => {
                return (
                    <button onClick={show} className="w-full border h-9 bg-transparent rounded-md text-slate-50 border-white-300 hover:border-green-500 hover:bg-transparent">
                        {isConnected ? address : "Connect Wallet"}
                    </button>
                );
            }}
        </ConnectKitButton.Custom>
    );
};

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swapType } = useStore();

    if (swapType === ActionType.ARCANUM) {
        return <ArcanumSwap />
    }

    if (swapType === ActionType.UNISWAP) {
        return <UniswapSwap />
    }

    if (swapType === ActionType.BEBOP) {
        return <BebopSwap />
    }

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-red-300 hover:border-red-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
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
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-green-300 hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Loading...</p>
            </Button>
        </div >
    )
}

function DefaultButton() {
    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-green-300 hover:border-green-500 hover:bg-transparent" disabled={true}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
}

function ConnectWalletButton() {
    return <ConnectWallet />
}

function ApprovalButton({ approveTo }: { approveTo: Address }) {
    const { inputAsset } = useStore();

    const { config: approvalConfig } = usePrepareContractWrite({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "approve",
        args: [approveTo, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
    });
    const { write: approve } = useContractWrite(approvalConfig);

    return (
        <div className="w-full">
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-green-300 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={approve}>
                <p style={{ margin: "10px" }}>Approve</p>
            </Button>
        </div >
    )
}

const BebopSwap = observer(() => {
    const { address } = useAccount();
    const { checkSwapBebop, inputQuantity, inputAsset, transactionCost, exchangeError } = useStore();

    const { data: swapData, refetch } = useQuery(["swap"], async () => {
        if (address === undefined) return;
        return await checkSwapBebop(address);
    }, {
        refetchInterval: 3000,
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { data: allowance, isLoading: allowanceIsLoading } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, "0xfE96910cF84318d1B8a5e2a6962774711467C0be"], // JAM Balance Manager address
        watch: true,
        enabled: inputAsset?.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    });

    const domain = swapData!.PARAM_DOMAIN;
    const types = swapData!.PARAM_TYPES;
    const message = toObject(swapData!.toSign);

    const { signTypedDataAsync } = useSignTypedData({ domain, types, primaryType: 'JamOrder', message: message });

    if (exchangeError) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    if (transactionCost == undefined) {
        return <LoadingButton />
    }

    async function CallSwap() {
        const signedData = await signTypedDataAsync();
        await submitOrder({ quoteId: swapData!.orderId, signature: signedData! });
    }

    if (address === undefined) {
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
    const { swap, inputQuantity, inputAsset, transactionCost, exchangeError } = useStore();

    const { data: swapAction, refetch } = useQuery(["swap"], async () => {
        if (address === undefined) return;
        return await swap(address);
    }, {
        refetchInterval: 10000,
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { data: allowance, isLoading: allowanceIsLoading } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, "0x1d5E89Bc628f194470380a99C10615591C91F4bd"],
        watch: true,
        enabled: inputAsset?.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        onSuccess: () => {
            refetch();
        }
    });

    const { config } = usePrepareContractWrite(swapAction);
    const { write } = useContractWrite(config);

    if (address === undefined) {
        return <ConnectWalletButton />
    }

    if (allowanceIsLoading) {
        return <LoadingButton />
    }

    if (allowance! < fromBigNumber(inputQuantity!)) {
        return <ApprovalButton approveTo={"0x1d5E89Bc628f194470380a99C10615591C91F4bd"} />
    }

    if (exchangeError) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return <DefaultButton />
    }

    if (transactionCost == undefined) {
        return <LoadingButton />
    }

    async function CallSwap() {
        write!();
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
    const { swap, inputQuantity, inputAsset, router, exchangeError } = useStore();

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
        refetchInterval: 15000,
        enabled: address !== undefined && inputQuantity !== undefined && !inputQuantity.isZero()
    });

    const { config } = usePrepareContractWrite(swapAction!);
    const { write } = useContractWrite(config);

    console.log("address", address, !address);
    if (!address) {
        return <ConnectWalletButton />
    }

    if (exchangeError) {
        return <ErrorButton errorMessage={exchangeError} />
    }

    if (swapActionIsLoading) {
        return <LoadingButton />
    }

    async function CallSwap() {
        refetch();
        if (write === undefined) return;
        write();
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
            <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={CallSwap}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    )
});
