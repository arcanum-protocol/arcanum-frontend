import * as React from 'react';
import multipoolABI from '../abi/ETF';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'
import { MaxUint256 } from "ethers";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function InteractionWithApprovalButton({
    interactionTxnBody,
    interactionBalance,
    actionName,
    approveMax = true,
    tokenData,
}) {
    const {
        data: token,
        isLoading: isTokenDataLoading,
        isError: isTokenDataError,
        isUnset: isTokenDataUnset,
    } = tokenData;

    const allowance: bigint = token?.approval?.row || BigInt(0);
    // hooks 
    // send approval
    const { config: approvalConfig } = usePrepareContractWrite({
        address: token?.tokenAddress!,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        enabled: !isTokenDataLoading && !isTokenDataUnset,
    })
    const { data: mayBeApprovalHash, write: sendBalanceApproval } = useContractWrite(approvalConfig)

    const { isLoading: approvalTxnIsLoading } = useWaitForTransaction({
        hash: mayBeApprovalHash?.hash,
    })

    // send interaction
    const { config } = usePrepareContractWrite(interactionTxnBody);
    const { data: mayBeHash, write: sendTxn } = useContractWrite(config)

    const { isLoading: txnIsLoading } = useWaitForTransaction({
        hash: mayBeHash?.hash,
    })

    // render
    let mintButton: any;

    let defaultStyle = {
        width: "100%",
        borderRadius: "20px",
    };

    if (isTokenDataLoading) {
        mintButton = (<button style={defaultStyle} disabled={true}> <Skeleton /> </button>);
    } else if (isTokenDataUnset) {
        mintButton = (<button style={defaultStyle} disabled={true}> Select token </button>);
    } else if (approvalTxnIsLoading || txnIsLoading) {
        mintButton = (<button style={defaultStyle} disabled={true}> <Skeleton /> </button>);
    } else if (token.balance.row < interactionBalance) {
        mintButton = (<button style={defaultStyle} disabled={true}> Insufficient balance </button>);
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);

        if (approveRequired) {
            mintButton = (
                <button
                    style={{ color: "#3C3997", ...defaultStyle }}
                    disabled={!sendBalanceApproval}
                    onClick={() => sendBalanceApproval()}>Approve balance
                </button>
            );
        } else {
            mintButton = (<button
                style={defaultStyle}
                disabled={!sendTxn}
                onClick={() => sendTxn()}>
                {actionName}
            </button>);
        }
    }
    return (
        <div>
            {mintButton}
        </div>
    );
}
