import * as React from 'react';
import { MaxUint256 } from "ethers";
import { useModal } from 'connectkit';
import { switchNetwork } from '@wagmi/core';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction, useAccount, useNetwork } from 'wagmi'
import multipoolABI from '../abi/ETF';

import 'react-loading-skeleton/dist/skeleton.css'

export function InteractionWithApprovalButton({
    interactionTxnBody,
    interactionBalance,
    externalErrorMessage,
    actionName,
    approveMax = true,
    tokenData,
    networkId
}) {
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
        contents = `Switch to ${chains.find(c => c.id == networkId)?.name}`;
        onClick = switchNetworkCb;
    } else if (externalErrorMessage != undefined) {
        contents = externalErrorMessage;
        isDisabled = true;
    } else if (
        token == undefined ||
        interactionTxnBody == undefined ||
        isTokenDataLoading ||
        approvalTxnIsLoading ||
        txnIsLoading ||
        token.balance.row < interactionBalance ||
        interactionBalance == BigInt(0)
    ) {
        contents = actionName;
        isDisabled = true;
    } else {
        const approveRequired = allowance < interactionBalance || allowance == BigInt(0);
        contents = approveRequired ? "Approve balance" : actionName;
        onClick = approveRequired ? sendBalanceApproval : sendTxn;
    }

    console.log("HEREEEEEE");
    console.log(interactionTxnBody);
    console.log(sendTxn);

    return (
        <div>
            <button className='approvalBalanceButton' style={{ width: "100%" }} disabled={isDisabled} onClick={onClick}>
                <p style={{ margin: "10px" }}>{contents}</p>
            </button>
        </div >
    );
}
