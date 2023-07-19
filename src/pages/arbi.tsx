import * as React from 'react';
import { fetchAssets, type MultipoolAsset, ArbiAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { emptyAdapter } from '../lib/trade-adapters';
import { TVChartContainer } from '../components/tv-chart';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { useMobileMedia } from '../hooks/tokens';


export function Arbi() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            setFetchedAssets(result);
        }
        inner();
    }, []);

    const isMobile = useMobileMedia();

    if (!isMobile) {
        return (
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    rowGap: "10px",
                    marginTop: "40px",
                    gap: "10px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Head />
                        <TVChartContainer symbol={'ARBI'} />
                        <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
                    </div>
                    <ArbiMintBurn fetchedAssets={fetchedAssets} />
                </div >
            </div >
        );
    } else {
        return (
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    rowGap: "10px",
                    marginTop: "40px",
                    gap: "10px",
                    width: "100%",
                }}>
                    <Head />
                    <TVChartContainer symbol={'ARBI'} />
                    <ArbiMintBurn fetchedAssets={fetchedAssets} />
                    <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
                </div >
            </div >
        );
    }
}
export function ArbiMintBurn({ fetchedAssets }) {

    const [isMintDisplayed, setMintDisplayed] = useState<boolean>(true);
    const me = useRef(null);
    const isMobile = useMobileMedia();

    function displayOrHide(hide: boolean, props: React.CSSProperties): React.CSSProperties {
        if (hide) {
            props.display = "none";
        } else {
            props.display = "flex";
        }
        return props;
    }

    return (
        <div
            ref={me}
            style={{
                display: "flex", alignItems: "center",
                backgroundColor: "rgba(30, 29, 29, 0.8)",
                justifyContent: "center",
                flexDirection: "column", rowGap: "25px",
                borderRadius: "13px",
                width: "100%",
            }}>
            <div style={{ margin: "5px 10px", display: "flex", width: isMobile ? "100%" : "400px" }}>
                <div style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    padding: "5px",
                    borderRadius: "10px",
                    backgroundColor: "#161616"
                }}>
                    <button style={{
                        width: "100%",
                        fontSize: "20px",
                        margin: "0",
                        padding: "5px",
                        color: !isMintDisplayed ? "#fff" : "#000",
                        borderRadius: "10px",
                        backgroundColor: !isMintDisplayed ? "#161616" : "#F9F9F9",
                    }}
                        onClick={() => setMintDisplayed(true)}>
                        Mint
                    </button>
                    <button style={{
                        width: "100%",
                        fontSize: "20px",
                        margin: "0",
                        padding: "2px",
                        borderRadius: "10px",
                        color: isMintDisplayed ? "#fff" : "#000",
                        backgroundColor: isMintDisplayed ? "#161616" : "#F9F9F9",
                    }}
                        onClick={() => setMintDisplayed(false)}>
                        Burn
                    </button>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={displayOrHide(!isMintDisplayed, { width: "100%" })}>
                    <TradePane
                        assetsIn={fetchedAssets}
                        assetsOut={[ArbiAsset]}
                        tradeLogicAdapter={emptyAdapter}
                        selectTokenParent={me}
                        paneTexts={{
                            buttonAction: "Mint",
                            section1Name: "Send",
                            section2Name: "Receive",
                        }} />

                </div >
                <div style={displayOrHide(isMintDisplayed, { width: "100%" })}>
                    <TradePane
                        assetsIn={[ArbiAsset]}
                        assetsOut={fetchedAssets}
                        tradeLogicAdapter={emptyAdapter}
                        selectTokenParent={me}
                        paneTexts={{
                            buttonAction: "Burn",
                            section1Name: "Send",
                            section2Name: "Receive",
                        }} />

                </div >
            </div >
        </div >
    );
}

export function Head() {
    const isMobile = useMobileMedia();
    return (
        <div style={{
            display: "grid",
            borderRadius: "10px",
            backgroundColor: "var(--bc)",
            width: "100%",
            gap: "40px",
        }}>
            <span style={{
                fontSize: "35px",
                padding: "0",
                marginTop: "0px",
                marginBottom: "0px",
                gridRow: "1",
                gridColumn: "1",
                marginLeft: "10px",
            }}>ARBI</span>
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gridRow: "1",
                gridColumn: "3",
                alignItems: "flex-start"
            }}>
                <span style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>Price</span>
                <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>0.33$</span>
            </div>
            {!isMobile ?
                <>
                    <div style={{
                        display: "flex",
                        gridRow: "1",
                        gridColumn: "4",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start"
                    }}>
                        <span style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h change</span>
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>0.33$</span>
                    </div>
                    <div style={{
                        display: "flex",
                        gridRow: "1",
                        gridColumn: "5",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start"
                    }}>
                        <span style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h hight</span>
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>0.33$</span>
                    </div>
                    <div style={{
                        display: "flex",
                        gridRow: "1",
                        gridColumn: "6",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start"
                    }}>
                        <span style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h low</span>
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>0.33$</span>
                    </div>
                </>
                : undefined}
        </div>
    );
}
