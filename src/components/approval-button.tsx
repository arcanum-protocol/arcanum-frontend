import * as React from 'react';
import { MaxUint256 } from "ethers";
import { useModal } from 'connectkit';
import multipoolABI from '../abi/ETF';
import { Address, switchNetwork } from '@wagmi/core';
import 'react-loading-skeleton/dist/skeleton.css'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { TokenWithAddress } from '../hooks/tokens';

export interface InteractionWithApprovalButtonProps {
    interactionTxnBody: any,
    interactionBalance: bigint,
    externalErrorMessage?: string,
    approveMax?: boolean,
    tokenData: {
        data: TokenWithAddress | undefined;
        isLoading: boolean;
        isError: boolean;
        isUnset: boolean;
    },
    networkId: number,
    errorMessage?: string
    isLoading?: boolean
}

export function InteractionWithApprovalButton({
    interactionTxnBody,
    interactionBalance,
    externalErrorMessage,
    approveMax,
    tokenData,
    networkId
}: InteractionWithApprovalButtonProps) {
    const {
        data: token,
        isLoading: isTokenDataLoading,
        isError: isTokenDataError,
        isUnset: isTokenDataUnset,
    } = tokenData;

    if (externalErrorMessage != undefined) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ width: "100%" }} disabled={true}>
                    <p style={{ margin: "10px" }}>{externalErrorMessage}</p>
                </button>
            </div >
        );
    }

    if (isTokenDataError || isTokenDataUnset) {
        return (
            <div>
                <button className='approvalBalanceButton' style={{ width: "100%" }} disabled={true}>
                    <p style={{ margin: "10px" }}>{"Error"}</p>
                </button>
            </div >
        );
    }

    const allowance: bigint = token?.approval?.row || BigInt(0);
    const { isConnected } = useAccount();

    // hooks 
    // send approval
    const { config: approvalConfig } = usePrepareContractWrite({
        address: token?.tokenAddress as Address,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        // enabled: !isTokenDataLoading && !isTokenDataUnset && allowance >= interactionBalance,
        chainId: networkId,
    });
    
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

    let defaultStyle = (isDisabled: any) => {
        return {
            width: "100%",
        }
    };

    let isDisabled = false;

    let switchNetworkCb = () => {
        switchNetwork({
            chainId: networkId,
        })
    };

    const { chain, chains } = useNetwork()
    const { setOpen: openWalletModal } = useModal();

    if (!isConnected) {
        console.log("not connected")
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled} onClick={() => openWalletModal(true)}>
                    <p style={{ margin: "10px" }}>Connect Wallet</p>
                </button>
            </div >
        );
    } else if (Array.isArray(chains) && networkId != chain?.id) {
        console.log("wrong network")
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled} onClick={switchNetworkCb}>
                    <p style={{ margin: "10px" }}>Switch to {chains.find(c => c.id == networkId)?.name}</p>
                </button>
            </div >
        );
    } else if (externalErrorMessage != undefined) {
        console.log("external error")
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled}>
                    <p style={{ margin: "10px" }}>{externalErrorMessage}</p>
                </button>
            </div >
        );
    } else if (token == undefined || interactionTxnBody == undefined || isTokenDataLoading || approvalTxnIsLoading || txnIsLoading) {
        console.log("loading")
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={true}>
                    <p style={{ margin: "10px" }}>{"Mint"}</p>
                </button>
            </div >
        );
    } else if (token.balance.row < interactionBalance || interactionBalance == BigInt(0)) {
        console.log("insufficient balance")
        return (
            <div>
                <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled}>
                    <p style={{ margin: "10px" }}>{"Insufficient Balance"}</p>
                </button>
            </div >
        );
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            console.log("approve required")
            console.log(sendBalanceApproval)
            return (
                <div>
                    <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled} onClick={sendBalanceApproval}>
                        <p style={{ margin: "10px" }}>{"Approve"}</p>
                    </button>
                </div >
            );
        } else {
            console.log("approve not required")
            return (
                <div>
                    <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled} onClick={sendTxn}>
                        <p style={{ margin: "10px" }}>{"Mint"}</p>
                    </button>
                </div >
            );
        }
    }
}
