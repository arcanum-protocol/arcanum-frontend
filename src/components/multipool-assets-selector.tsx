import { useState, useEffect } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import chevron from '/chevron-down.svg';

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

export function MultipoolAssetSelector({ assetList, setter, initialIndex = 0 }) {
    const [selectedAsset, setSelectedAsset] = useState<MultipoolAsset | undefined>(undefined);

    useEffect(() => {
        setSelectedAsset(assetList[initialIndex]);
        setter(assetList[initialIndex])
    }, [assetList]);

    const [modalIsOpen, setIsOpen] = useState<boolean>(false);
    const [hover, setHover] = useState(false);

    const buttonInner = (logo: string | undefined, symbol: string | undefined, clickable: boolean) => (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "flex-end",
            gap: "5px",
            height: "100%",
            minWidth: "80px",
        }}>
            <div style={{ display: "flex", width: "25px", height: "25px" }}>
                <img src={logo || "https://arcanum.to/logo.png"} />
            </div>
            <div onClick={openModal}>
                <p style={{ fontSize: "30px", margin: "0", color: "#fff" }} >{symbol}</p>
            </div>
        </div>
    )


    //backgroundColor: !isMintDisplayed ? "#DFDFDF" : "#F9F9F9",
    const selected = (logo: string | undefined, symbol: string | undefined, clickable: boolean) =>
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "flex-end",
            gap: "5px",
            height: "30px",
            minWidth: "80px",
        }}>
            {
                (!logo || !symbol) ?
                    (
                        clickable ?
                            <button
                                onMouseOver={() => setHover(true)}
                                onMouseOut={() => setHover(false)}
                                style={{
                                    margin: "0px",
                                    padding: "0px",
                                    backgroundColor: hover && clickable ? "#000" : "rgba(0,0,0,0)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginLeft: "5px" }}>
                                    {buttonInner(logo, symbol, clickable)}
                                    <img src={chevron} />
                                </div>
                            </button>
                            :
                            <div>
                                {buttonInner(logo, symbol, clickable)}
                            </div>
                    ) :
                    <Skeleton containerClassName="flex-1" height={30} />
            }
        </div>;

    if (assetList.length == 1) {
        const asset: SolidAsset = assetList[0];
        setter(asset);
        return selected(asset?.logo || undefined, asset?.symbol, false);
    }


    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const assets = assetList?.map((asset: MultipoolAsset) =>
        <button key={asset.id} onClick={() => { setSelectedAsset(asset); setter(asset); closeModal() }}>
            {asset.name}<br />
            {asset.deviationPercent.toString()}
        </button>
    );

    return (
        <div>
            {selected(selectedAsset?.logo || undefined, selectedAsset?.symbol || undefined, true)}
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
