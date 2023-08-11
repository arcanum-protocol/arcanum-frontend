import * as React from 'react';
import { fetchAssets, routerAddress, type MultipoolAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { Faucet } from '../components/faucet-modal';
import { swapAdapter } from '../lib/trade-adapters';
import { useMobileMedia } from '../hooks/tokens';
import { SolidAsset } from '../lib/multipool';

export function Swap() {

    const me = useRef(null);
    const isMobile = useMobileMedia();

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const [multipoolAsset, setMultipoolAsset] = useState<SolidAsset | undefined>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result.assets);
            setMultipoolAsset(result.multipool);
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
                style={{
                    display: "flex",
                    backgroundColor: "#1B1B1B",
                    borderRadius: "20px",
                    margin: "10px",
                    width: !isMobile ? "400px" : "100%",
                    justifyContent: "center"
                }}>
                <div style={{ display: "flex", width: "100%" }} ref={me}>
                    <TradePane
                        assetInDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) > 10}
                        assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10}
                        routerAddress={routerAddress}
                        assetsIn={fetchedAssets}
                        assetsOut={fetchedAssets}
                        tradeLogicAdapter={swapAdapter}
                        networkId={multipoolAsset?.chainId}
                        selectTokenParent={me}
                        paneTexts={{
                            buttonAction: "Swap",
                            section1Name: "Send",
                            section2Name: "Receive",
                        }} />
                </div >
            </div >
            <Faucet assets={fetchedAssets} />
        </div >
    );
}

