import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { Address, useAccount, useBalance, useContractRead, useContractWrite, usePrepareContractWrite, useQuery, useSendTransaction, useSignTypedData } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { fromBigNumber } from "@/lib/utils";
import { useEffect } from "react";
import { toObject } from "@/types/bebop";
import { submitOrder } from "@/api/bebop";
import { ConnectKitButton } from "connectkit";
import { useAllowence } from "@/hooks/useAllowence";
import BigNumber from "bignumber.js";

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
            <Button className="w-full border bg-transparent rounded-md text-slate-50 border-white hover:border-red-500 hover:bg-transparent" disabled={true}>
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
    const { checkSwapBebop, inputQuantity, inputAsset, transactionCost, exchangeError, swapIsLoading } = useStore();

    const { data: swapData, refetch } = useQuery(["swap"], async () => {
        return await checkSwapBebop(address);
    }, {
        refetchInterval: 3000,
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: "0xfE96910cF84318d1B8a5e2a6962774711467C0be" });

    const domain = swapData?.PARAM_DOMAIN;
    const types = swapData?.PARAM_TYPES;
    const message = toObject(swapData?.toSign);

    const { signTypedDataAsync } = useSignTypedData({ domain, types, primaryType: 'JamOrder', message: message });

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
    const { swap, inputQuantity, inputAsset, router, exchangeError, updateErrorMessage, swapIsLoading } = useStore();

    const inputQuantityBigInt = BigInt(inputQuantity?.toFixed() || "0");

    const { data: balance } = useBalance({
        address: address,
        token: inputAsset?.address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : inputAsset?.address,
        watch: true,
    });

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading, refetch } = useQuery(["swap"], async () => {
        if (balance && inputQuantity) {
            if (balance.value < inputQuantityBigInt) {
                updateErrorMessage("Insufficient Balance", false);
            } else {
                updateErrorMessage(undefined, false);
            }
        }

        if (address === undefined) return 1;
        if (inputQuantity === undefined) return 1;

        return await swap(address);
    }, {
        refetchInterval: 10000,
        enabled: address !== undefined && inputQuantity !== undefined && !inputQuantity.isZero()
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { config } = usePrepareContractWrite(swapAction);
    const { write } = useContractWrite(config);

    const { sendTransaction } = useSendTransaction();
    // sendTransaction({
    //     to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    //     value: BigInt(new BigNumber("0xcc08186cbb01", 16).toFixed(0)),
    //     data: "0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000104db3e219800000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000fc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a00000000000000000000000000000000000000000000000000000000000027100000000000000000000000004810e5a7741ea5fdbb658eda632ddfac3b19e3c60000000000000000000000000000000000000000000000000000000065a3c10a0000000000000000000000000000000000000000000000000024ad1e88be4d060000000000000000000000000000000000000000000000000000cc08186cbb01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000",
    // });

    if (address === undefined) {
        return <ConnectWalletButton />
    }

    if (exchangeError && !swapIsLoading) {
        return <ErrorButton errorMessage={exchangeError.toString()} />
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
    const { swap, inputQuantity, inputAsset, router, exchangeError, updateErrorMessage, swapIsLoading } = useStore();

    const { data: balance, isLoading: balanceIsLoading } = useBalance({
        address: address,
        token: inputAsset?.address == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : inputAsset?.address,
        watch: true,
    });
    const inputQuantityBigInt = BigInt(inputQuantity?.toFixed() || "0");

    const { data: allowance, isLoading: allowanceIsLoading } = useAllowence({ address: address!, tokenAddress: inputAsset?.address!, to: router.address });

    const { data: swapAction, isLoading: swapActionIsLoading, refetch } = useQuery(["swap"], async () => {
        const data = await swap(address!);

        if (balance && inputQuantity) {
            if (balance.value < inputQuantityBigInt) {
                updateErrorMessage("Insufficient Balance", false);
            }
        }

        return data;
    }, {
        refetchInterval: 15000,
        enabled: address !== undefined && inputQuantity !== undefined && !inputQuantity.isZero()
    });

    useEffect(() => {
        refetch();
    }, [inputQuantity]);

    const { config } = usePrepareContractWrite(swapAction!);
    const { write } = useContractWrite(config);

    async function CallSwap() {
        refetch();
        if (write === undefined) return;
        write();
    }

    if (!address) {
        return <ConnectWalletButton />
    }

    if (exchangeError && !swapIsLoading) {
        return <ErrorButton errorMessage={exchangeError} />
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
