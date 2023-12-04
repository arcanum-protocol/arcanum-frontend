import { multipool } from "@/store/MultipoolStore";
import { Button } from "./ui/button";
import { observer } from "mobx-react-lite";
import { toast } from "./ui/use-toast";
import { useAccount, useContractRead } from "wagmi";
import ERC20 from "@/abi/ERC20";
import { Address } from 'viem';

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export const InteractionWithApprovalButton = observer(() => {
    const { swap: _swap, inputQuantity, inputAsset, getRouter, approve: _approve, exchangeError } = multipool;
    const { address } = useAccount();

    const { data: allowance, isLoading: allowanceLoading, refetch } = useContractRead({
        address: inputAsset?.address,
        abi: ERC20,
        functionName: "allowance",
        args: [address!, getRouter],
        enabled: address !== undefined && inputAsset !== undefined,

    });

    async function swap() {
        refetch();
        const hash = await _swap(address!);

        if (hash) {
            toast({
                title: "Swap successful",
                description: "Swap submitted to the blockchain",
            });
        }
    }

    async function approve(address: Address, tokenAddress: Address | undefined, spender: Address) {
        await _approve(address!, tokenAddress, spender);

        refetch();
    }

    if (address === undefined) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </Button>
            </div >
        )
    }

    if (inputQuantity === undefined || inputAsset === undefined) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Swap</p>
                </Button>
            </div >
        )
    }

    if (allowanceLoading) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>Loading...</p>
                </Button>
            </div >
        )
    }

    if (exchangeError) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={true}>
                    <p style={{ margin: "10px" }}>{exchangeError}</p>
                </Button>
            </div >
        )
    }

    if (allowance! < BigInt(inputQuantity!.toFixed())) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => approve(address!, inputAsset?.address, getRouter)}>
                    <p style={{ margin: "10px" }}>Approve</p>
                </Button>
            </div >
        )
    }

    return (
        <div>
            <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => swap()}>
                <p style={{ margin: "10px" }}>Swap</p>
            </Button>
        </div >
    );
});
