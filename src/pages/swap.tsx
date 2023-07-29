import * as React from 'react';
import { fetchAssets, type MultipoolAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { Faucet } from '../components/faucet-modal';
import { swapAdapter } from '../lib/trade-adapters';
import { useMobileMedia } from '../hooks/tokens';
import { SmoothCorners } from 'react-smooth-corners'

export function Swap() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const me = useRef(null);
    const isMobile = useMobileMedia();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result.assets);
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
            <SmoothCorners
                corners="30"
                borderRadius="20px"
                style={{
                    display: "flex",
                    backgroundColor: "#1B1B1B",
                    borderRadius: "10px",
                    margin: "10px",
                    width: !isMobile ? "400px" : "100%",
                    justifyContent: "center"
                }}>
                <div style={{ display: "flex", width: "100%" }} ref={me}>
                    <TradePane
                        assetsIn={fetchedAssets}
                        assetsOut={fetchedAssets}
                        initialOutIndex={1}
                        tradeLogicAdapter={swapAdapter}
                        selectTokenParent={me}
                        paneTexts={{
                            buttonAction: "Swap",
                            section1Name: "Send",
                            section2Name: "Receive",
                        }} />
                </div >
            </SmoothCorners >
            <Faucet assets={fetchedAssets} />
        </div >
    );
}

