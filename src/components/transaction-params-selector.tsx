import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import { Fragment } from "ethers";
Modal.setAppElement('#root');
import icon from '/transaction-params-icon.svg';

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

export function TransactionParamsSelector({ setter }) {
    const [slippage, setSlippage] = useState<number>();
    const [deadline, setDeadline] = useState<number>();

    const [modalIsOpen, setIsOpen] = useState<boolean>(false);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <div>
            <div onClick={openModal} >
                <img style={{ width: "100%", height: "100%" }} src={icon} />
            </div>
            <Modal
                isOpen={modalIsOpen}
                style={customStyles}
                onRequestClose={closeModal}
                contentLabel="Select tokens"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                        {[0.1, 0.5, 1, 3].map((slippage: number) => {
                            return (
                                <div onClick={(e) => { this.style.color = "red"; }}>
                                    <p>
                                        {slippage}%
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div >
    );
}
