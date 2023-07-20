import { useState, useEffect } from "react";
import { fetchIndex, IndexAsset, type Index } from "../lib/indexes";
import * as React from 'react';
import { MultipoolAsset } from "../lib/multipool";
import { toHumanReadable } from "../lib/format-number";
import { useMobileMedia } from "../hooks/tokens";

export function IndexAssetsBreakdown({ fetchedAssets }) {
    const isMobile = useMobileMedia();
    const assets = fetchedAssets?.map((asset: MultipoolAsset, index: number) =>
        <>
            <div style={{ gridRow: index + 3, gridColumn: "1 / 2", display: "flex", justifyContent: "flex-start", gap: "20px" }}>
                <img style={{ width: "25px", height: "25px" }} src={asset.logo || "https://arcanum.to/logo.png"} />
                {!isMobile ? <>{asset.name}({asset.symbol})</> : <>{asset.symbol}</>}
            </div>
            <div style={{ gridRow: index + 3, gridColumn: "3" }}>
                {asset.currentShare.toString()}%
            </div>
            <div style={{ gridRow: index + 3, gridColumn: "4" }}>
                {Number(asset.price.toString()).toFixed(4)}
            </div>
            <div style={{ gridRow: index + 3, gridColumn: "5" }}>
                {Number(asset.priceChange24h.toString()).toFixed(4)}%
            </div>
            <div style={{ gridRow: index + 3, gridColumn: "6" }}>
                {toHumanReadable(asset.volume24h.toString())}
            </div>
            <div style={{ gridRow: index + 3, gridColumn: "7", display: "flex", justifyContent: "flex-end" }}>
                {toHumanReadable(asset.mcap.toString())}
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
            <h1 style={{ display: "flex", alignSelf: isMobile ? "center" : "flex-start", fontSize: "20px" }}>Asset breakdown</h1>
            <div style={{
                margin: "5px 10px",
                display: "grid",
                gap: "10px",
                overflowX: "scroll",
            }}>
                <div style={{ gridRow: "1", gridColumn: isMobile ? "1" : "1 / 2", display: "flex", justifyContent: "flex-start", gap: "10px" }}>
                    Name
                </div>
                <div style={{ gridRow: "1", gridColumn: "3" }}>
                    share
                </div>
                <div style={{ gridRow: "1", gridColumn: "4" }}>
                    Price
                </div>
                <div style={{ gridRow: "1", gridColumn: "5" }}>
                    24h change
                </div>
                <div style={{ gridRow: "1", gridColumn: "6" }}>
                    24h volume
                </div>
                <div style={{ gridRow: "1", gridColumn: "7", display: "flex", justifyContent: "flex-end" }}>
                    Market cap
                </div>
                <div style={{ gridRow: "2", gridColumn: "1/8" }}>
                    <div style={{ height: "1px", width: "100%", backgroundColor: "#fff" }}></div>
                </div>
                {assets}
            </div>
        </div >
    );
}
