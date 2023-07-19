import * as React from 'react';
import { fetchAssets, type MultipoolAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { Faucet } from '../components/faucet-modal';
import { emptyAdapter, mintAdapter } from '../lib/trade-adapters';
import { useMobileMedia } from '../hooks/tokens';

export function Swap() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const me = useRef(null);
    const isMobile = useMobileMedia();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result);
        }
        inner();
    }, []);

    return (
        <div
            style={{
                display: "flex",
                marginTop: "40px",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                rowGap: "10px",
                width: "100%",
            }}>
            <div
                ref={me}
                style={{
                    display: "flex",
                    backgroundColor: "var(--bc)",
                    borderRadius: "10px",
                    margin: "10px",
                    width: !isMobile ? "400px" : "100%",
                    justifyContent: "center"
                }}>
                <TradePane
                    assetsIn={fetchedAssets}
                    assetsOut={fetchedAssets}
                    tradeLogicAdapter={emptyAdapter}
                    selectTokenParent={me}
                    paneTexts={{
                        buttonAction: "Mint",
                        section1Name: "Send",
                        section2Name: "Receive",
                    }} />

            </div >
            <Faucet assets={fetchedAssets} />
        </div >
    );
}

