import * as React from 'react';
import multipoolABI from '../abi/ETF';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'
import { MaxUint256 } from "ethers";

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

    if (isTokenDataLoading) {
        mintButton = (<button disabled={true}> Loading data.. </button>);
    } else if (isTokenDataUnset) {
        mintButton = (<button disabled={true}> Select token </button>);
    } else if (approvalTxnIsLoading || txnIsLoading) {
        mintButton = (<button disabled={true}> Waiting approval transaction... </button>);
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            mintButton = (
                <button
                    disabled={!sendBalanceApproval}
                    onClick={() => sendBalanceApproval()}>Approve balance
                </button>
            );
        } else {
            mintButton = (<button
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
