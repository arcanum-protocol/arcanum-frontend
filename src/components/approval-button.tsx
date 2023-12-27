import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useQuery } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { useStore } from "@/contexts/StoreContext";
import { ActionType } from "@/store/MultipoolStore";
import { fromBigNumber } from "@/lib/utils";

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
    const { swap, inputQuantity, inputAsset } = useStore();

    const { data: swapAction, isLoading: swapActionIsLoading } = useQuery(["swap"], async () => {
        const res = await swap(address!);
        return res;
    }, {
        refetchInterval: 1000,
    });

    const { data: allowance, isLoading: allowanceIsLoading } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, "0xE592427A0AEce92De3Edee1F18E0157C05861564"],
        watch: true,
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
        return <ApprovalButton approveTo={"0xE592427A0AEce92De3Edee1F18E0157C05861564"} />
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
