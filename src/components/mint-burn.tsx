import * as React from 'react';
import { MultipoolAssetSelector } from "./multipool-assets-selector";
import { fetchAssets, routerAddress, multipoolAddress, type MultipoolAsset } from "../lib/multipool";
import multipoolABI from '../abi/ETF';
import routerABI from '../abi/ROUTER';
import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useDebounce } from 'use-debounce';
import { QuantityInput } from './quantity-input';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'
import { formatEther, MaxUint256 } from "ethers";

export function MintBurn() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result);
        }
        inner();
    }, []);

    return (
        <div>
            <p> Mint </p>
            <Mint assets={fetchedAssets} />
        </div>
    );
}

export function Mint({ assets }) {

    const [mintAsset, setMintAsset] = useState<MultipoolAsset | undefined>();
    const bindMintAsset = (value: MultipoolAsset) => setMintAsset(value);
    const [mintQuantity, setMintQuantity] = useState<BigNumber>(BigNumber.from("0"));
    const [debouncedMintQuantity] = useDebounce(mintQuantity, 500);
    const bindMintQuantity = (value: BigNumber) => setMintQuantity(value);

    const { address } = useAccount()

    const { data: mintTokenBalance, isLoading: readLoading } = useContractRead({
        address: mintAsset ? mintAsset.assetAddress : '',
        abi: multipoolABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: mintAsset != undefined,
        watch: true,
    });

    const { data: approvedTokenBalance, isLoading: approvedReadLoading } = useContractRead({
        address: mintAsset ? mintAsset.assetAddress : '',
        abi: multipoolABI,
        functionName: 'allowance',
        args: [address, routerAddress],
        enabled: mintAsset != undefined,
        watch: true,
    });

    console.log("is loading: ", approvedTokenBalance);

    let inputQuantity: any;
    if (!readLoading && mintTokenBalance) {
        inputQuantity = (<div>
            <p> balance: {formatEther(mintTokenBalance.toString())}</p>
            <QuantityInput quantitySetter={bindMintQuantity} maxAmount={mintTokenBalance} />
        </div>);
    } else {
        inputQuantity = (<div>
            <p> balance: 0</p>
            <QuantityInput disabled={true} quantitySetter={bindMintQuantity} maxAmount={0} />
        </div>);
    }

    let approvalLoaded = !approvedReadLoading && approvedTokenBalance != undefined;
    let approveRequired = approvalLoaded && (approvedTokenBalance < mintQuantity || approvedTokenBalance == 0);

    // approve balance hooks
    const { config, error, isError } = usePrepareContractWrite({
        address: mintAsset?.assetAddress || '',
        abi: multipoolABI,
        functionName: 'approve',
        args: [routerAddress, MaxUint256],
        enabled: mintAsset != undefined && approveRequired,
    })
    const { data: mayBeHash, write: sendBalanceApproval } = useContractWrite(config)

    const { data, isError: isTransactionError, isLoading: approvalTxnIsLoading } = useWaitForTransaction({
        hash: mayBeHash?.hash,
    })

    let mintButton: any;
    if (approvalLoaded) {
        if (!approveRequired) {
            mintButton = (<button>Mint</button>);
        } else {
            mintButton = (<button disabled={!sendBalanceApproval} onClick={() => sendBalanceApproval()}>Approve balance</button>);
        }
    } else if (approvalTxnIsLoading) {
        mintButton = (<button disabled={true}> Waiting for transaction... </button>);
    } else {
        mintButton = (<button disabled={true}> Mint </button>);
    }

    const { data: estimatedAmountOut, isLoading: mintEstimationLoading } = useContractRead({
        address: routerAddress,
        abi: routerABI,
        functionName: 'estimatedMintQuantity',
        args: [mintAsset?.assetAddress,],
        enabled: mintAsset != undefined,
        watch: true,
    });

    return (
        <div>
            <MultipoolAssetSelector assetList={assets} setter={bindMintAsset} />
            {inputQuantity}
            {mintButton}
        </div >
    );
}

export type TokenWithAddress = {
    address: string
    decimals: number
    name: string
    symbol: string
    totalSupply: bigint,
    balance: bigint,
    approval: bigint | undefined,
}

export function useTokenWithAddress(address: string): TokenWithAddress {

}

export function InteractionWithApprovalButton({ interactionTxnBody, token }) {
}
