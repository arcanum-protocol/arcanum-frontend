import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import { Fragment } from "ethers";
Modal.setAppElement('#root');

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

export function MultipoolAssetSelector({ assetList, setter }) {
    const [selectedAsset, setSelectedAsset] = useState<MultipoolAsset | undefined>();

    const [modalIsOpen, setIsOpen] = useState<boolean>(false);

    if (assetList && !Array.isArray(assetList)) {
        const asset: SolidAsset = assetList;
        setter(asset);
        return (
            <div>
                <button onClick={openModal}>{asset.symbol}</button>
            </div>
        );
    }

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const assets = assetList?.map((asset: MultipoolAsset) =>
        <button onClick={() => { setSelectedAsset(asset); setter(asset); closeModal() }}>
            {asset.name}<br />
            {asset.deviationPercent.toString()}
        </button>
    );

    let selectedText = "Select token";
    if (selectedAsset) {
        selectedText = selectedAsset.symbol;
    }

    return (
        <div>
            <button onClick={openModal}>{selectedText}</button>
            <Modal
                isOpen={modalIsOpen}
                style={customStyles}
                onRequestClose={closeModal}
                contentLabel="Select tokens"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {assets}
                </div>
            </Modal>
        </div >
    );
}
