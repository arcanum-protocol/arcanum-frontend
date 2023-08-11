import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import { erc20ABI, fetchToken, writeContract } from "@wagmi/core";
import { BigNumber, FixedFormat, FixedNumber } from "@ethersproject/bignumber";
import { useAccount } from "wagmi";
import erc20Abi from '../abi/ERC20';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

export function Faucet({ assets }) {
    const [slippage, setSlippage] = useState<number>();
    const [deadline, setDeadline] = useState<number>();

    const [modalIsOpen, setIsOpen] = useState<boolean>(false);
    const { address } = useAccount()

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const amountToMint: number = 10;

    async function mint(tokenAddress: string) {
        const token = await fetchToken({
            address: tokenAddress,
        })
        const rowAmountToMint = FixedNumber
            .fromValue(BigNumber.from(amountToMint))
            .mulUnsafe(FixedNumber.fromValue(BigNumber.from(10).pow(BigNumber.from(token.decimals))))
            .toString()
            .slice(0, -2);
        const { hash } = await writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'mint',
            args: [address, BigInt(rowAmountToMint)],
        })
    }

    return (
        <div style={{ margin: "0", width: "200px" }}>
            <button style={{ background: "none", width: "200px", }} onClick={openModal}>get test tokens</button>
            <Modal
                isOpen={modalIsOpen}
                style={customStyles}
                onRequestClose={closeModal}
                contentLabel="Select tokens"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {assets.map((asset: MultipoolAsset) => {
                        return (
                            <div key={asset.assetAddress}>
                                <button onClick={() => mint(asset.assetAddress)}>{asset.name}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div >
    );
}
