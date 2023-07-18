import * as React from 'react';
import { fetchAssets, type MultipoolAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { Faucet } from '../components/faucet-modal';
import { emptyAdapter, mintAdapter } from '../lib/trade-adapters';

export function Swap() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const me = useRef(null);

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
                //height: "calc(100vh - 150px)", 
                marginTop: "40px",
                alignItems: "center",
                justifyContent: "center", flexDirection: "column", rowGap: "10px"
            }}>
            <div
                ref={me}
                style={{
                    display: "flex",
                    backgroundColor: "var(--bc)",
                    borderRadius: "10px",
                    padding: "20px",
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

