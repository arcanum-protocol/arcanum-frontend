import * as React from 'react';
import { MaxUint256 } from "ethers";
import { useModal } from 'connectkit';
import multipoolABI from '../abi/ETF';
import { Address, switchNetwork } from '@wagmi/core';
import 'react-loading-skeleton/dist/skeleton.css'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { TokenWithAddress } from '../hooks/tokens';
import { useTradeContext } from '../contexts/TradeContext';

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    tokenData: {
        data: TokenWithAddress | undefined;
        isLoading: boolean;
        isError: boolean;
        isUnset: boolean;
    },
    networkId: number,
    errorMessage?: string
}

export function InteractionWithApprovalButton({
    approveMax,
    tokenData,
    networkId
}: InteractionWithApprovalButtonProps) {
    const { estimationErrorMessage, estimatedValues } = useTradeContext();
    const interactionBalance = BigInt(String(estimatedValues?.estimatedAmountIn?.row ? estimatedValues?.estimatedAmountIn?.row : 0));
    const interactionTxnBody = estimatedValues?.txn;
    
    if (estimationErrorMessage) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ width: "100%" }} disabled={true}>
                    <p style={{ margin: "10px" }}>{estimationErrorMessage}</p>
                </button>
            </div >
        );
    }

    const {
        data: token,
        isLoading: isTokenDataLoading,
        isUnset: isTokenDataUnset,
    } = tokenData;

    const allowance: bigint = token?.approval?.row || BigInt(0);
    const { isConnected } = useAccount();

    // hooks 
    // send approval
    const { config: approvalConfig } = usePrepareContractWrite({
        address: token?.tokenAddress as Address,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        enabled: !isTokenDataLoading && !isTokenDataUnset && allowance >= interactionBalance,
        chainId: networkId,
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

    let defaultStyle = () => {
        return {
            width: "100%",
        }
    };

    let switchNetworkCb = () => {
        switchNetwork({
            chainId: networkId,
        })
    };

    
    const { chain, chains } = useNetwork()
    const { setOpen: openWalletModal } = useModal();

    if (!isConnected) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={true} onClick={() => openWalletModal(true)}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </button>
            </div >
        );
    } else if (Array.isArray(chains) && networkId != chain?.id) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={false} onClick={switchNetworkCb}>
                    <p style={{ margin: "10px" }}>Switch to {chains.find(c => c.id == networkId)?.name}</p>
                </button>
            </div >
        );
    } else if (isTokenDataLoading || approvalTxnIsLoading || txnIsLoading) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={true}>
                    <p style={{ margin: "10px" }}>{"Loading..."}</p>
                </button>
            </div >
        );
    } else if (token == undefined || interactionTxnBody == undefined) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={true}>
                    <p style={{ margin: "10px" }}>{"Mint"}</p>
                </button>
            </div >
        );
    } else if (token.balance.row < interactionBalance || interactionBalance == BigInt(0)) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={true}>
                    <p style={{ margin: "10px" }}>{"Insufficient Balance"}</p>
                </button>
            </div >
        );
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            return (
                <div>
                    <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={false} onClick={sendBalanceApproval}>
                        <p style={{ margin: "10px" }}>{"Approve"}</p>
                    </button>
                </div >
            );
        } else {
            return (
                <div>
                    <button className='approvalBalanceButton' style={{ ...defaultStyle() }} disabled={false} onClick={sendTxn}>
                        <p style={{ margin: "10px" }}>{"Mint"}</p>
                    </button>
                </div >
            );
        }
    }
}
