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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", width: "35px", height: "35px" }}>
                    <img src={asset.logo || "https://arcanum.to/logo.png"} />
                </div>
                <div onClick={openModal}>
                    <p style={{ fontSize: "30px", margin: "0" }} >{asset.symbol}</p>
                </div>
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
    let selectedLogo = "https://arcanum.to/logo.png";
    if (selectedAsset) {
        selectedLogo = selectedAsset.logo || selectedLogo;
        selectedText = selectedAsset.symbol;
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", width: "35px", height: "35px" }}>
                    <img src={selectedLogo} />
                </div>
                <div onClick={openModal}>
                    <p style={{ fontSize: "30px", margin: "0" }} >{selectedText}</p>
                </div>
            </div>
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
