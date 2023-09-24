import React, { useState, useRef } from 'react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getSVG } from '../lib/svg-adapter';
import { MultipoolAsset } from '../types/multipoolAsset';
import { SolidAsset } from '../types/solidAsset';
import { useTradeContext } from '../contexts/TradeContext';

interface MultipoolAssetSelectorProps {
    name: "Send" | "Receive";
    assetList: MultipoolAsset[] | SolidAsset;
    initialIndex?: number;
    modalParent?: React.RefObject<HTMLDivElement>;
    disableFilter: (asset: MultipoolAsset) => boolean;
}

export function MultipoolAssetSelector({ name, assetList, modalParent, disableFilter }: MultipoolAssetSelectorProps) {
    const { inputAsset, setInputAsset, outputAsset, setOutputAsset } = useTradeContext();

    function setter(asset: MultipoolAsset | SolidAsset) {
        if (name == "Send") {
            if (asset == outputAsset) {
                setOutputAsset(inputAsset!);
                setInputAsset(asset);
            } else {
                setInputAsset(asset);
            }
        } else {
            if (asset == inputAsset) {
                setInputAsset(outputAsset!);
                setOutputAsset(asset);
            } else {
                setOutputAsset(asset);
            }
        }
    }

    function getter() {
        if (name == "Send") {
            if (inputAsset == undefined) {
                if (Array.isArray(assetList)) {
                    return assetList[0];
                }
                return assetList;
            }
            return inputAsset;
        } else {
            if (outputAsset == undefined) {
                if (Array.isArray(assetList)) {
                    return assetList[1];
                }
                return assetList;
            }
            return outputAsset;
        }
    }

    const [modalIsOpen, setIsOpen] = useState<boolean>(false);
    const [hover, setHover] = useState(false);

    const buttonInner = (logo: string | null, symbol: string | undefined) => (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "flex-end",
            gap: "5px",
            height: "100%",
            minWidth: "80px",
        }}>
            <div style={{ display: "flex", width: "25px", height: "25px", margin: "2px", borderRadius: "50%", overflow: "hidden", }}>
                <img src={logo || "https://api.arcanum.to/logo.png"} />
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
                    marginRight: "10px",
                }} >{symbol}</p>
            </div>
        </div >
    )


    //backgroundColor: !isMintDisplayed ? "#DFDFDF" : "#F9F9F9",
    const selected = (logo: string | null, symbol: string | undefined, clickable: boolean) =>
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "flex-end",
            gap: "5px",
            height: "30px",
            minWidth: "100px",
        }}>
            {
                (logo != undefined || symbol != undefined) ?
                    (
                        clickable ?
                            <button
                                onMouseOver={() => setHover(true)}
                                onMouseOut={() => setHover(false)}
                                onClick={() => setIsOpen(true)}
                                style={{
                                    margin: "0px",
                                    padding: "0px",
                                    borderRadius: "24px",
                                    border: hover ? "1px solid #393939" : "1px solid #1B1B1B",
                                    background: "#1B1B1B",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {buttonInner(logo, symbol)}
                                    <img src={getSVG("chevron-down")} style={{ width: "25px", height: "25px", margin: "2px" }} />
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
                                {buttonInner(logo, symbol)}
                            </div>
                    ) :
                    <Skeleton containerClassName="flex-1" height={30} />
            }
        </div >;

    const [buttonHovered, setButtonHovered] = useState<number | null>(null);

    if (!Array.isArray(assetList)) {
        const asset: SolidAsset = assetList as SolidAsset;
        return selected(asset?.logo, asset?.symbol, false);
    }

    const RED = "#fa3c58";
    const GREEN = "#0ecc83";
    const coloriseDeviation = (deviation: any) => {
        if (name == "Send") {
            if (deviation > 0) {
                return RED;
            } else if (deviation < 0) {
                return GREEN;
            } else {
                return undefined;
            }
        } else {
            if (deviation > 0) {
                return GREEN;
            } else if (deviation < 0) {
                return RED;
            } else {
                return undefined;
            }
        }
    };

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
            onClick={() => { setter(asset); setIsOpen(false); }}
            onMouseOver={() => setButtonHovered(index)}
            onMouseOut={() => setButtonHovered(null)}
        >
            <div style={{ display: "flex", width: "100%", alignItems: "center", color: isDisabled ? "#363636" : "var(--wh)" }}>
                <div style={{
                    display: "flex", borderRadius: "50%", width: "35px", height: "35px", overflow: "hidden",
                }}>
                    <img style={{ width: "35px", height: "35px", }} src={asset.logo || "https://api.arcanum.to/logo.png"} />
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
                <div style={{ maxWidth: "100px", flexDirection: "column", display: "flex", flex: "1", fontSize: "14px", justifyContent: "flex-end" }}>
                    <p
                        style={{ margin: "0" }}>
                        Deviation:
                    </p>
                    <p
                        style={{ margin: "0", color: coloriseDeviation(asset.deviationPercent) }}>
                        {Number(asset.deviationPercent.toString()).toFixed(2)}%
                    </p>
                </div>
            </div>
        </button >
    });

    const modal = useRef<HTMLDivElement>(null);

    function handleClickOutside(event: MouseEvent) {
        if (modal.current && !modal.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.removeEventListener("mousedown", handleClickOutside);

    const [backHovered, setBackHovered] = useState(false);

    return (
        <div>
            {selected(getter()?.logo, getter()?.symbol, true)}
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
                            onMouseOver={() => setBackHovered(true)}
                            onMouseOut={() => setBackHovered(false)}
                            onClick={() => setIsOpen(false)}
                        >
                            <img style={{
                                width: backHovered ? "30px" : "25px",
                                height: backHovered ? "30px" : "25px",
                                transform: "rotate(90deg)",
                            }} src={getSVG("chevron-down")} />
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
