import React, { useState } from 'react';
import type { MultipoolAsset } from '../types/multipoolAsset';
import Modal from 'react-modal';
import { Address, fetchToken, writeContract } from "@wagmi/core";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { useAccount, useNetwork } from "wagmi";
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
    const { chain } = useNetwork();

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
            address: tokenAddress as Address
        })
        const rowAmountToMint = FixedNumber
            .fromValue(BigNumber.from(amountToMint))
            .mulUnsafe(FixedNumber.fromValue(BigNumber.from(10).pow(BigNumber.from(token.decimals))))
            .toString()
            .slice(0, -2);
        const { hash } = await writeContract({
            address: tokenAddress as Address,
            abi: erc20Abi,
            functionName: 'mint',
            args: [address, rowAmountToMint],
        })
    }

    if (chain == undefined || chain.testnet !== true) {
        return <></>
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
                    {assets ? assets.map((asset: MultipoolAsset) => {
                        return (
                            <div key={asset.address}>
                                <button onClick={() => mint(asset.address)}>{asset.name}
                                </button>
                            </div>
                        );
                    }) : <></>}
                </div>
            </Modal>
        </div >
    );
}
