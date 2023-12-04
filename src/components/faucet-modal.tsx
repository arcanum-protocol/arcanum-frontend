import { useState } from 'react';
import type { MultipoolAsset, SolidAsset } from '../types/multipoolAsset';
import Modal from 'react-modal';
import { Address, fetchToken, writeContract } from "@wagmi/core";
import { useAccount, useNetwork } from "wagmi";
import { observer } from 'mobx-react-lite';
import erc20Abi from '../abi/ERC20';
import { multipool } from '@/store/MultipoolStore';
import { BigNumber } from 'bignumber.js';

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

export const Faucet = observer(() => {
    const { assets } = multipool;
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
        const rowAmountToMint = new BigNumber(10).multipliedBy(new BigNumber(10).pow(token.decimals)).toString()

        const { hash } = await writeContract({
            address: tokenAddress as Address,
            abi: erc20Abi,
            functionName: 'mint',
            args: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", BigInt(rowAmountToMint.toString())],
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
                <div className='bg-[#1b1b1b] rounded-2xl p-3' 
                    style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {assets ? assets.filter(asset => asset.type == "multipool").map((asset: (MultipoolAsset | SolidAsset)) => {
                        const _asset = asset as MultipoolAsset;

                        return (
                            <div key={asset.address}>
                                <button onClick={() => mint(_asset.address!.toString())}>{_asset.name}
                                </button>
                            </div>
                        );
                    }) : <></>}
                </div>
            </Modal>
        </div >
    );
});
