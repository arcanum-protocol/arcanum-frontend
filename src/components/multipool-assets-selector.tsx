import { useState, useEffect, useRef } from "react";
import { fetchAssets, type MultipoolAsset, type SolidAsset } from "../lib/multipool";
import * as React from 'react';
import Modal from 'react-modal';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import chevron from '/chevron-down.svg';
import { FixedFormat } from "@ethersproject/bignumber";
const RED = "#fa3c58";

export function MultipoolAssetSelector({ assetList, setter, initialIndex = 0, modalParent, disableFilter }) {
    const [selectedAsset, setSelectedAsset] = useState<MultipoolAsset | undefined>(undefined);

    useEffect(() => {
        setSelectedAsset(assetList.filter(a => !disableFilter(a))[initialIndex]);
        setter(assetList.filter(a => !disableFilter(a))[initialIndex])
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
            <div style={{ display: "flex", width: "25px", height: "25px", margin: "2px", borderRadius: "50%", overflow: "hidden", }}>
                <img src={logo || "https://arcanum.to/logo.png"} />
            </div>
            <div >
                <p style={{
                    color: "#fff",
                    fontFamily: "Neue Machina",
                    fontSize: "18px",
                    fontStyle: "normal",
                    fontWeight: "800",
                    lineHeight: "105.01%", /* 12.601px */
                    height: "16px",
                    margin: "0",
                }} >{symbol}</p>
            </div>
        </div >
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
                (logo != undefined || symbol != undefined) ?
                    (
                        clickable ?
                            <button
                                onMouseOver={() => setHover(true)}
                                onMouseOut={() => setHover(false)}
                                onClick={openModal}
                                style={{
                                    margin: "0px",
                                    padding: "0px",
                                    borderRadius: "24px",
                                    border: hover ? "1px solid #393939" : "1px solid #1B1B1B",
                                    background: "#1B1B1B",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {buttonInner(logo, symbol, clickable)}
                                    <img src={chevron} style={{ width: "25px", height: "25px", margin: "2px" }} />
                                </div>
                            </button>
                            :
                            <div
                                style={{
                                    margin: "0px",
                                    padding: "0px",
                                    borderRadius: "24px",
                                    border: "1px solid #1B1B1B",
                                    background: "#1B1B1B",
                                }}
                            >
                                {buttonInner(logo, symbol, clickable)}
                            </div>
                    ) :
                    <Skeleton containerClassName="flex-1" height={30} />
            }
        </div >;

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

    const assets = assetList?.map((asset: MultipoolAsset, index) => {
        const isDisabled = disableFilter(asset);
        return <button
            style={{
                width: "100%",
                backgroundColor: buttonHovered != null && buttonHovered == index ? "var(--bl)" : "var(--bc)",
                color: "var(--wh)",
                borderRadius: "10px",
                marginTop: "10px",
            }}
            disabled={isDisabled}
            key={asset.id}
            onClick={() => { setSelectedAsset(asset); setter(asset); closeModal() }}
            onMouseOver={e => setButtonHovered(index)}
            onMouseOut={e => setButtonHovered(null)}
        >
            <div style={{ display: "flex", width: "100%", alignItems: "center", color: isDisabled ? "#363636" : "var(--wh)" }}>
                <div style={{
                    display: "flex", borderRadius: "50%", width: "35px", height: "35px", overflow: "hidden",
                }}>
                    <img style={{ width: "35px", height: "35px", }} src={asset.logo || "https://arcanum.to/logo.png"} />
                </div>
                <div style={{ display: "flex", flex: "1", flexDirection: "column", alignItems: "flex-start", marginLeft: "10px" }}>
                    <p style={{ margin: "0", padding: "0", fontSize: "18px" }}>
                        {asset.symbol}
                    </p>
                    <p style={{ margin: "0", padding: "0", fontSize: "14px" }}>
                        {asset.name}
                    </p>
                </div>
                {isDisabled ?
                    <div style={{ display: "flex", flex: "1", justifyContent: "flex-end" }}>
                        <p style={{ margin: "0", padding: "0", fontSize: "14px" }}>
                            deviation exceeded
                        </p>
                    </div>
                    : undefined}
                <div style={{ maxWidth: "100px", display: "flex", flex: "1", fontSize: "14px", justifyContent: "flex-end" }}>
                    Deviation: {Number(asset.deviationPercent.toString()).toFixed(4)}
                </div>
            </div>
        </button >
    });

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
                    zIndex: "1000",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    backgroundColor: "var(--bc)",
                    borderRadius: "20px",
                }}
            >
                <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                    <div style={{
                        display: "flex",
                        flex: "1",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                    }}>
                        <button style={{
                            display: "flex",
                            flex: "1",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                            backgroundColor: "var(--bc)",
                            alignItems: "center",
                            justifyItems: "flex-start",
                            borderRadius: "20px",
                            marginLeft: "10px",
                            width: "30px",
                            padding: "0",
                        }}
                            onMouseOver={e => { setBackHovered(true) }}
                            onMouseOut={e => { setBackHovered(false) }}
                            onClick={e => closeModal()}
                        >
                            <img style={{
                                width: backHovered ? "30px" : "25px",
                                height: backHovered ? "30px" : "25px",
                                transform: "rotate(90deg)",
                            }} src={chevron} />
                        </button>
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

