import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, usePrepareSendTransaction, useQuery, useSendTransaction, useSignTypedData } from "wagmi";
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
    // const { config: testConfig } = usePrepareSendTransaction({
    //     data: "0xc04b8d59000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000004810e5a7741ea5fdbb658eda632ddfac3b19e3c600000000000000000000000000000000000000000000000000000000658a61970000000000000000000000000000000000000000000000000000000000ead48e000000000000000000000000000000000000000000000000046920e6a8b66c640000000000000000000000000000000000000000000000000000000000000042fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb90001f482af49447d8a07e3bd95bd0d56f35241523fbab1002710fc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a000000000000000000000000000000000000000000000000000000000000",
    //     to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    //     value: BigInt("0"),
    //     gasPrice: BigInt("100000000"),
    // });

    // const { sendTransaction: test } = useSendTransaction(testConfig);
    // if (test === undefined) return <LoadingButton />;
    // test!();

    const { address } = useAccount();
    const { swap, inputQuantity, inputAsset } = useStore();

    const { data: swapAction, isLoading: swapActionIsLoading } = useQuery(["swap"], async () => {
        const res = await swap(address!);
        return res;
    }, {
        refetchInterval: 30000,
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
