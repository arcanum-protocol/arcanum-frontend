import * as React from 'react';
import { fetchAssets, routerAddress, type MultipoolAsset, multipoolAddress } from "../lib/multipool";
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
            const result = await fetchAssets('0x936154414520a1d925f15a2ee88a1ce31ae24c1e');
            setFetchedAssets(result.assets);
            setMultipoolAsset(result.multipool);
        }

        const id = setInterval(() => {
            inner();
        }, 10000);

        inner();

        return () => clearInterval(id);
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
                    justifyContent: "center",
                    flexDirection: isMobile ? "column" : undefined,
                    gap: "10px",
                    width: "100%",
                }}>
                <div
                    style={{
                        display: "flex",
                        backgroundColor: "#1B1B1B",
                        maxWidth: "400px",
                        justifySelf: "center",
                        borderRadius: "20px",
                        marginLeft: isMobile ? "auto" : undefined,
                        marginRight: isMobile ? "auto" : undefined,
                        width: !isMobile ? "400px" : "100%",
                        justifyContent: "center"
                    }}>
                    <div style={{ display: "flex", width: "100%", justifyContent: "center" }} ref={me}>
                        <TradePane
                            assetInDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) > 10}
                            assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10}
                            routerAddress={routerAddress}
                            multipoolAddress={multipoolAddress}
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
                <div style={{
                    display: "flex",
                    maxWidth: isMobile ? undefined : "200px",
                    marginTop: "15px",
                    justifyContent: "center",
                    width: isMobile ? "100%" : undefined,
                }}>
                    <div style={{ textAlign: isMobile ? "center" : "left" }}>
                        <p style={{ fontWeight: "bold" }}>Note</p>
                        This is the DEMO page for the Arcanum cross-ETF swaps. Currently available on Polygon Mumbai only.<br />
                        <p style={{ fontWeight: "bold" }}>What is it for?</p>
                        - For swapping of assets between ETFs on one chain. This creates more arbitrage opportunities - between ETFs' pools on Arcanum platform.<br />
                        <p style={{ fontWeight: "bold" }}>When can I test?</p>
                        - When more than one ETF on one chain is released
                    </div>
                </div>
            </div >
            <Faucet assets={fetchedAssets} />
        </div >
    );
}

