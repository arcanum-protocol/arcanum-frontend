import * as React from 'react';
import multipoolABI from '../abi/ETF';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import { MaxUint256 } from "ethers";
import 'react-loading-skeleton/dist/skeleton.css'
import { switchNetwork } from '@wagmi/core';
import { useModal } from 'connectkit';

export function InteractionWithApprovalButton({
    interactionTxnBody,
    interactionBalance,
    externalErrorMessage = undefined,
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
        address: token?.tokenAddress!,
        abi: multipoolABI,
        functionName: 'approve',
        args: [token?.interactionAddress, approveMax ? MaxUint256 : interactionBalance - allowance],
        enabled: !isTokenDataLoading && !isTokenDataUnset && allowance >= interactionBalance,
    })
    const { data: mayBeApprovalHash, write: sendBalanceApproval } = useContractWrite(approvalConfig)

    const { isLoading: approvalTxnIsLoading } = useWaitForTransaction({
        hash: mayBeApprovalHash?.hash,
    })


    const [interactionTxn, setInteractionTxn] = React.useState({ body: undefined, flag: false });
    React.useEffect(() => {
        setInteractionTxn({ body: interactionTxnBody, flag: !interactionTxnBody?.flag });
        console.log("changed", interactionTxn);
    }, [interactionTxnBody, tokenData]);

    // send interaction
    const { config } = usePrepareContractWrite(interactionTxn?.body);
    console.log("config", config, "ip", interactionTxn?.body);
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

    let contents: any;
    let isDisabled = false;
    let onClick: any;

    let switchNetworkCb = () => {
        switchNetwork({
            chainId: networkId,
        })
    };

    const { chain, chains } = useNetwork()
    const { setOpen: openWalletModal } = useModal();

    if (!isConnected) {
        contents = "Connect wallet";
        onClick = () => openWalletModal(true);
    } else if (Array.isArray(chains) && networkId != chain?.id) {
        onClick = switchNetworkCb;
        contents = `Switch to ${chains.find(c => c.id == networkId)?.name}`;
    } else if (externalErrorMessage != undefined) {
        contents = externalErrorMessage;
        isDisabled = true;
    } else if (token == undefined || interactionTxnBody == undefined || isTokenDataLoading || approvalTxnIsLoading || txnIsLoading) {
        contents = actionName;
        isDisabled = true;

    } else if (token.balance.row < interactionBalance || interactionBalance == BigInt(0)) {
        contents = "Insufficient balance";
        isDisabled = true;
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        if (approveRequired) {
            contents = "Approve balance";
            onClick = sendBalanceApproval;
        } else {
            console.log("HEREEEEEE");
            console.log(interactionTxnBody);
            console.log(sendTxn);
            contents = actionName;
            onClick = sendTxn;
        }
    }
    return (
        <div>
            <button className='approvalBalanceButton' style={{ ...defaultStyle(isDisabled) }} disabled={isDisabled} onClick={onClick}>
                <p style={{ margin: "10px" }}>{contents}</p>
            </button>
        </div >
    );
}
