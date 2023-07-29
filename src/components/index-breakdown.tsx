import { useState, useEffect } from "react";
import { fetchIndex, IndexAsset, type Index } from "../lib/indexes";
import * as React from 'react';
import { MultipoolAsset } from "../lib/multipool";
import { toHumanReadable } from "../lib/format-number";
import { useMobileMedia } from "../hooks/tokens";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";

export function IndexAssetsBreakdown({ fetchedAssets }) {
    let v = toHumanReadable(FixedNumber.fromString("2999990999000000000").divUnsafe(FixedNumber.from(BigInt(10) ** BigInt(18))));
    const isMobile = useMobileMedia();
    const assets = fetchedAssets?.map((asset: MultipoolAsset, index: number) =>
        <>
            <div key={"1" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "1", display: "flex", justifyContent: "flex-start" }}>
                <img style={{ width: "25px", height: "25px" }} src={asset.logo || "https://arcanum.to/logo.png"} />
                {!isMobile ? <>{asset.name} ({asset.symbol})</> : <>{asset.symbol}</>}
            </div>
            <div key={"3" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "2", display: "flex", justifyContent: "flex-end" }}>
                {asset.idealShare.toString()}%
            </div>
            <div key={"4" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "3", display: "flex", justifyContent: "flex-end" }}>
                {Number(asset.currentShare.toString()).toFixed(4)}%
            </div>
            <div key={"5" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "4", display: "flex", justifyContent: "flex-end" }}>
                {Number(asset.price.toString()).toFixed(4)}$
            </div>
            <div key={"6" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "5", display: "flex", justifyContent: "flex-end" }}>
                {toHumanReadable(FixedNumber.fromValue(asset.quantity).divUnsafe(FixedNumber.from(BigInt(10) ** BigInt(asset.decimals))))}
            </div>
            <div key={"7" + index} style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: index + 2, gridColumn: "6", display: "flex", justifyContent: "flex-end" }}>
                {toHumanReadable(asset.mcap.toString())}$
            </div>
        </>
    );

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bc)",
            justifyContent: "center",
            borderRadius: "10px",
            width: "100%",
        }}>
            <h1 style={{ display: "flex", alignSelf: isMobile ? "center" : "flex-start", fontSize: "20px", marginLeft: !isMobile ? "15px" : undefined }}>Asset breakdown</h1>
            <div style={{
                margin: "5px 10px",
                display: "grid",
                overflowX: "auto",
                border: "1px solid var(--bl)",
                gap: "1px",
                gridGap: "1px",
                backgroundColor: "var(--bl)"
            }}>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "1", display: "flex", justifyContent: "flex-start" }}>
                    Name
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "2", display: "flex", justifyContent: "flex-end" }}>
                    Target share
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "3", display: "flex", justifyContent: "flex-end" }}>
                    Current share
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "4", display: "flex", justifyContent: "flex-end" }}>
                    Price
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "5", display: "flex", justifyContent: "flex-end" }}>
                    Quantity
                </div>
                <div style={{ backgroundColor: "var(--bc)", padding: "5px", gridRow: "1", gridColumn: "6", display: "flex", justifyContent: "flex-end" }}>
                    Market cap
                </div>
                {assets}
            </div>
        </div >
    );
}
