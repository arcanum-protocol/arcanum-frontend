import * as React from 'react';
import multipoolABI from '../abi/ETF';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { MaxUint256 } from "ethers";
import 'react-loading-skeleton/dist/skeleton.css'
import { switchNetwork } from '@wagmi/core';
import { useModal } from 'connectkit';
import { useState } from 'react';

interface ButtonState {
    contents: string,
    isDisabled: boolean,
    onClick: () => void
}

export function InteractionWithApprovalButton({
    interactionTxnBody,
    interactionBalance,
    externalErrorMessage,
    actionName,
    approveMax = true,
    tokenData,
    networkId,
    updatePaneCb,
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
        address: token?.tokenAddress,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        enabled: !isTokenDataLoading && !isTokenDataUnset && allowance >= interactionBalance,
        chainId: networkId
    });

    console.log("approvalConfig", approvalConfig);

    const { data: mayBeApprovalHash, write: sendBalanceApproval } = useContractWrite(approvalConfig);

    const { isLoading: approvalTxnIsLoading } = useWaitForTransaction({
        hash: mayBeApprovalHash?.hash,
    })


    const [interactionTxn, setInteractionTxn] = React.useState({ body: undefined, flag: false });
    React.useEffect(() => {
        setInteractionTxn({ body: interactionTxnBody, flag: !interactionTxnBody?.flag });
    }, [interactionTxnBody, tokenData]);

    // send interaction
    const { config } = usePrepareContractWrite(interactionTxn?.body);
    const { data: mayBeHash, write: sendTxn } = useContractWrite(config)

    const { isLoading: txnIsLoading } = useWaitForTransaction({
        hash: mayBeHash?.hash,
    })

    if (mayBeApprovalHash != undefined && sendTxn == undefined) {
        window.location.reload();
    }

    let defaultStyle = (isDisabled: any) => {
        return {
            width: "100%",
        }
    };

    let buttonState: ButtonState = {
        contents: "Connect wallet",
        isDisabled: false,
        onClick: () => { }
    };

    let switchNetworkCb = () => {
        switchNetwork({
            chainId: networkId,
        })
    };

    const { chain, chains } = useNetwork()
    const { setOpen: openWalletModal } = useModal();

    if (!isConnected) {
        buttonState.contents = "Connect wallet";
        buttonState.onClick = () => openWalletModal(true);
    } else if (Array.isArray(chains) && networkId != chain?.id) {
        buttonState.contents = `Switch to ${chains.find(c => c.id == networkId)?.name}`;
        buttonState.onClick = switchNetworkCb;
    } else if (externalErrorMessage != undefined) {
        buttonState.contents = externalErrorMessage;
        buttonState.isDisabled = true;
    } else if (token == undefined || interactionTxnBody == undefined || isTokenDataLoading || approvalTxnIsLoading || txnIsLoading) {
        buttonState.contents = actionName;
        buttonState.isDisabled = true;
    } else if (token.balance.row < interactionBalance || interactionBalance == BigInt(0)) {
        buttonState.contents = "Insufficient balance";
        buttonState.isDisabled = true;
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            console.log("approve required");
            console.log("approve balance txn", sendBalanceApproval);

            buttonState.contents = "Approve balance";
            buttonState.onClick = () => sendBalanceApproval;
        } else {
            console.log("send txn");

            buttonState.contents = actionName;
            buttonState.onClick = () => sendTxn;
        }
    }

    console.log(buttonState.onClick);

    return (
        <div>
            <button className='approvalBalanceButton' style={{ ...defaultStyle(buttonState.isDisabled) }} disabled={buttonState.isDisabled} onClick={buttonState.onClick}>
                <p style={{ margin: "10px" }}>{buttonState.contents}</p>
            </button>
        </div >
    );
}
