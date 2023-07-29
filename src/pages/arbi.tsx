import * as React from 'react';
import { fetchAssets, type MultipoolAsset, MultipoolShareAsset, SolidAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { mintAdapter, burnAdapter } from '../lib/trade-adapters';
import { TVChartContainer } from '../components/tv-chart';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { useMobileMedia } from '../hooks/tokens';
import { SmoothCorners } from 'react-smooth-corners'


export function Arbi() {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const [multipoolAsset, setMultipoolAsset] = useState<SolidAsset | undefined>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets();
            console.log(result);
            setFetchedAssets(result.assets);
            setMultipoolAsset(result.multipool);
        }
        inner();
    }, []);

    const isMobile = useMobileMedia();

    if (!isMobile) {
        return (
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    rowGap: "10px",
                    marginTop: "20px",
                    gap: "10px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                        <Head multipool={multipoolAsset} />
                        {multipoolAsset && <TVChartContainer symbol={multipoolAsset.symbol} />}
                        <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
                    </div>
                    <MintBurnTabs fetchedAssets={fetchedAssets} multipoolAsset={multipoolAsset} />
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
                    marginTop: "20px",
                    gap: "10px",
                    width: "100%",
                }}>
                    <Head multipool={multipoolAsset} />
                    {multipoolAsset && <TVChartContainer symbol={multipoolAsset.symbol} />}
                    <MintBurnTabs fetchedAssets={fetchedAssets} multipoolAsset={multipoolAsset} />
                    <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
                </div >
            </div >
        );
    }
}

export function MintBurnTabs({ fetchedAssets, multipoolAsset }) {

    const [isMintDisplayed, setMintDisplayed] = useState<boolean>(true);
    const me = useRef(null);

    function displayOrHide(hide: boolean, props: React.CSSProperties): React.CSSProperties {
        if (hide) {
            props.display = "none";
        } else {
            props.display = "flex";
        }
        return props;
    }

    return (
        <SmoothCorners
            corners="30"
            borderRadius="20px"
            style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bc)",
                justifyContent: "center",
                flexDirection: "column",
                borderRadius: "13px",
                width: "100%",
                maxWidth: "400px",
            }}>
            <div
                style={{
                    display: "flex", width: "100%",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: "400px",
                }}
                ref={me}
            >
                <div style={{ margin: "5px 10px", marginBottom: "0px", display: "flex", width: "100%" }}>
                    <SmoothCorners
                        corners="30, 3"
                        borderRadius="10px"
                        style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            margin: "10px",
                            padding: "5px",
                            backgroundColor: "#161616",
                        }}>
                        <SmoothCorners
                            corners="30, 3"
                            borderRadius="10px"
                            as="button"
                            style={{
                                width: "100%",
                                fontSize: "20px",
                                margin: "0",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: !isMintDisplayed ? "#161616" : "#0047FE",
                            }}
                            onClick={() => setMintDisplayed(true)}>
                            Mint
                        </SmoothCorners>
                        <SmoothCorners
                            corners="30, 3"
                            borderRadius="10px"
                            as="button"
                            style={{
                                width: "100%",
                                fontSize: "20px",
                                margin: "0",
                                padding: "2px",
                                color: "#fff",
                                backgroundColor: isMintDisplayed ? "#161616" : "#0047FE",
                            }}
                            onClick={() => setMintDisplayed(false)}>
                            Burn
                        </SmoothCorners>
                    </SmoothCorners>
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <div style={displayOrHide(!isMintDisplayed, { width: "100%" })}>
                        <TradePane
                            assetsIn={fetchedAssets}
                            assetsOut={[multipoolAsset]}
                            tradeLogicAdapter={mintAdapter}
                            selectTokenParent={me}
                            paneTexts={{
                                buttonAction: "Mint",
                                section1Name: "Send",
                                section2Name: "Receive",
                            }} />

                    </div >
                    <div style={displayOrHide(isMintDisplayed, { width: "100%" })}>
                        <TradePane
                            assetsIn={[multipoolAsset]}
                            assetsOut={fetchedAssets}
                            tradeLogicAdapter={burnAdapter}
                            selectTokenParent={me}
                            paneTexts={{
                                buttonAction: "Burn",
                                section1Name: "Send",
                                section2Name: "Receive",
                            }} />

                    </div >
                </div >
            </div>
        </SmoothCorners >
    );
}

export function Head({ multipool }) {
    const isMobile = useMobileMedia();
    const multipoolInfo: SolidAsset | undefined = multipool;
    console.log("mp ", multipoolInfo);
    return (
        <SmoothCorners
            corners="10000, 3"
            borderRadius="10px"
            style={{
                display: "grid",
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
                <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.price.toFixed(4) : "0"}$</span>
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
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.change24h.toFixed(4) : "0"}%</span>
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
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.high24h.toFixed(4) : "0"}$</span>
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
                        <span style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.low24h.toFixed(4) : "0"}$</span>
                    </div>
                </>
                : undefined}
        </SmoothCorners>
    );
}
