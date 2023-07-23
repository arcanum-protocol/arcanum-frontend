import * as React from 'react';
import multipoolABI from '../abi/ETF';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount } from 'wagmi'
import { MaxUint256 } from "ethers";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { SmoothCorners } from 'react-smooth-corners'

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
    const { isConnected } = useAccount();

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
        backgroundColor: "#fff",
        //border: "1px solid black",
    };

    if (isTokenDataLoading) {
        mintButton = (<SmoothCorners
            corners="200"
            borderRadius="20px"
            as="button"
            style={defaultStyle} disabled={true}>
            <Skeleton />
        </SmoothCorners>);
    } else if (!isConnected) {
        mintButton = (<SmoothCorners
            corners="30"
            borderRadius="20px"
            as="button"
            style={defaultStyle} disabled={true}> Connect wallet </SmoothCorners>);
    } else if (isTokenDataUnset) {
        mintButton = (<SmoothCorners
            corners="30"
            borderRadius="20px"
            as="button"
            style={defaultStyle} disabled={true}> Select token </SmoothCorners>);
    } else if (approvalTxnIsLoading || txnIsLoading) {
        mintButton = (<SmoothCorners
            corners="30"
            borderRadius="20px"
            as="button"
            style={defaultStyle} disabled={true}> <Skeleton /> </SmoothCorners>);
    } else if (token.balance.row < interactionBalance) {
        mintButton = (<SmoothCorners
            corners="30"
            borderRadius="20px"
            as="button"
            style={defaultStyle} disabled={true}> Insufficient balance </SmoothCorners>);
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);

        if (approveRequired) {
            mintButton = (
                <SmoothCorners
                    corners="30, 3"
                    borderRadius="20px"
                    as={"button"}
                    style={{ color: "#3C3997", ...defaultStyle }}
                    disabled={!sendBalanceApproval}
                    onClick={() => sendBalanceApproval()}>Approve balance
                </SmoothCorners>
            );
        } else {
            mintButton = (<SmoothCorners
                corners="30"
                borderRadius="20px"
                as="button"

                style={defaultStyle}
                disabled={!sendTxn}
                onClick={() => sendTxn()}>
                {actionName}
            </SmoothCorners>);
        }
    }
    return (
        <div>
            {mintButton}
        </div>
    );
}
