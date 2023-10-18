import { MaxUint256 } from "ethers";
import { useModal } from 'connectkit';
import multipoolABI from '../abi/ETF';
import { Address, switchNetwork } from '@wagmi/core';
import 'react-loading-skeleton/dist/skeleton.css'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { TokenWithAddress } from '../hooks/tokens';
import { useTradeContext } from '../contexts/TradeContext';
import { useMultiPoolContext } from "@/contexts/MultiPoolContext";
import { Button } from "./ui/button";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    token: TokenWithAddress | undefined,
    networkId: number,
    errorMessage?: string
}

export function InteractionWithApprovalButton({
    approveMax,
    token
}: InteractionWithApprovalButtonProps) {
    const { multipool } = useMultiPoolContext();
    const { estimationErrorMessage, estimatedValues } = useTradeContext();

    const networkId = multipool?.chainId as number;
    const interactionBalance = BigInt(String(estimatedValues?.estimatedAmountIn?.row ? estimatedValues?.estimatedAmountIn?.row : 0));
    const interactionTxnBody = estimatedValues?.txn;
    
    if (estimationErrorMessage) {
        return (
            <>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-red-500 hover:bg-transparent">
                    <p className="m-4">{estimationErrorMessage}</p>
                </Button>
            </>
        );
    }

    const allowance: bigint = token?.approval?.row || BigInt(0);
    const { isConnected } = useAccount();

    // hooks 
    // send approval
    const { config: approvalConfig } = usePrepareContractWrite({
        address: token?.address as Address,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        enabled: allowance >= interactionBalance,
        chainId: multipool?.chainId,
    });
    
    const { data: mayBeApprovalHash, write: sendBalanceApproval } = useContractWrite(approvalConfig)

    const { isLoading: approvalTxnIsLoading } = useWaitForTransaction({
        hash: mayBeApprovalHash?.hash,
    })

    // send interaction
    const { config, error } = usePrepareContractWrite(interactionTxnBody);
    const { data: mayBeHash, error: writeMultipoolError, write: sendTxn } = useContractWrite(config);

    const { isLoading: txnIsLoading } = useWaitForTransaction({
        hash: mayBeHash?.hash,
    })

    let switchNetworkCb = () => {
        switchNetwork({
            chainId: networkId,
        })
    };

    
    const { chain, chains } = useNetwork();
    const { setOpen: openWalletModal } = useModal();

    if (!isConnected) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={() => openWalletModal(true)}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </Button>
            </div >
        );
    } else if (Array.isArray(chains) && networkId != chain?.id) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false} onClick={switchNetworkCb}>
                    <p style={{ margin: "10px" }}>Switch to {chains.find(c => c.id == networkId)?.name}</p>
                </Button>
            </div >
        );
    } else if (approvalTxnIsLoading || txnIsLoading) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-gray-500 hover:bg-transparent">
                    <p style={{ margin: "10px" }}>{"Loading..."}</p>
                </Button>
            </div >
        );
    } else if (token == undefined || interactionTxnBody == undefined) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent hover:animate-float" disabled={true}>
                    <p style={{ margin: "10px" }}>{"Mint"}</p>
                </Button>
            </div >
        );
    } else if (token?.balance! < interactionBalance || interactionBalance == BigInt(0)) {
        return (
            <div>
                <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-red-500 hover:bg-transparent hover:animate-float">
                    <p style={{ margin: "10px" }}>{"Insufficient Balance"}</p>
                </Button>
            </div >
        );
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            return (
                <div>
                    <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent hover:animate-float" disabled={false} onClick={sendBalanceApproval}>
                        <p style={{ margin: "10px" }}>{"Approve"}</p>
                    </Button>
                </div >
            );
        } else {
            return (
                <div>
                    <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent hover:animate-float" disabled={false} onClick={sendTxn}>
                        <p style={{ margin: "10px" }}>{"Mint"}</p>
                    </Button>
                </div >
            );
        }
    }
}
