import { useState, useEffect, useRef } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import chevron from '/chevron-down.svg';
import { FixedFormat } from "@ethersproject/bignumber";

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

export function MultipoolAssetSelector({ assetList, setter, initialIndex = 0, modalParent }) {
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

    const [buttonHovered, setButtonHovered] = useState(null);

    const assets = assetList?.map((asset: MultipoolAsset, index) =>
        <button
            style={{
                width: "100%",
                backgroundColor: buttonHovered != null && buttonHovered == index ? "var(--bl)" : "var(--solid-bc)",
                color: "var(--wh)"
            }}
            key={asset.id}
            onClick={() => { setSelectedAsset(asset); setter(asset); closeModal() }}
            onMouseOver={e => setButtonHovered(index)}
            onMouseOut={e => setButtonHovered(null)}
        >
            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                <img style={{ width: "30px", height: "30px" }} src={asset.logo || "https://arcanum.to/logo.png"} />
                <div style={{ display: "flex", width: "100%", flexDirection: "column", marginLeft: "10px", alignItems: "flex-start", }}>
                    <p style={{ margin: "0", padding: "0", fontSize: "18px" }}>
                        {asset.name} ({asset.symbol})
                    </p>
                    <p style={{ margin: "0", padding: "0", fontSize: "14px" }}>
                        Balance: {0}
                    </p>
                </div>
                <div style={{ display: "flex", marginLeft: "auto", justifySelf: "flex-end", fontSize: "14px" }}>
                    Deviation: {Number(asset.deviationPercent.toString()).toFixed(4)}
                </div>
            </div>
        </button >
    );

    const modal = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modal.current && !modal.current.contains(event.target)) {
                closeModal();
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modal]);

    const [backHovered, setBackHovered] = useState(false);

    console.log(modalParent.current);
    return (
        <div>
            {selected(selectedAsset?.logo || undefined, selectedAsset?.symbol || undefined, true)}
            <div
                ref={modal}
                style={{
                    display: modalIsOpen ? "flex" : "none",
                    position: "absolute",
                    top: modalParent?.current?.offsetTop,
                    left: modalParent?.current?.offsetLeft,
                    height: modalParent?.current?.offsetHeight,
                    width: modalParent?.current?.offsetWidth,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    backgroundColor: "var(--solid-bc)",
                    borderRadius: "10px",
                }}
            >
                <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                    <div style={{
                        flex: "1",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                    }}>
                        <div style={{
                            flex: "1",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                            backgroundColor: backHovered ? "var(--bl)" : "var(--bc)",
                            alignItems: "center",
                            justifyItems: "center",
                            borderRadius: "10px",
                            marginLeft: "10px",
                            width: "30px",
                            margin: "0",
                            padding: "0",
                        }}
                            onMouseOver={e => { setBackHovered(true) }}
                            onMouseOut={e => { setBackHovered(false) }}
                            onClick={e => closeModal()}
                        >
                            <img style={{
                                transform: "rotate(90deg)",
                            }} src={chevron} />
                        </div>
                    </div>
                    <div style={{
                        flex: "1",
                        justifyContent: "center",
                        width: "100%",
                        flexWrap: "wrap",
                    }}>
                        <p style={{
                            fontSize: "24px",
                            minWidth: "200px",
                        }}>Select a token</p>
                    </div>
                    <div style={{ flex: "1", justifyContent: "flex-end" }} />
                </div>
                <div style={{ display: "flex", width: "100%", height: "1px", color: "var(-wh)" }} />
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                }}>
                    {assets}
                </div>
            </div>
        </div >
    );
}

