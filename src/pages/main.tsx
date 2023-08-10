import * as React from 'react';
import { fetchAssets, type MultipoolAsset, MultipoolShareAsset, SolidAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { mintAdapter, burnAdapter } from '../lib/trade-adapters';
import { TVChartContainer } from '../components/tv-chart';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { useMobileMedia } from '../hooks/tokens';
import { useSearchParams } from 'react-router-dom';
import { Faucet } from '../components/faucet-modal';

export function Cpt() {
    return (<Main assetAddress={'0x3a57210dc2cb93eb8e18055308f51ee2a20a3c38'} />)
}

export function Arbi() {
    return (<Main assetAddress={'0x990c5f02e2d1b11cf12360005645dff886038758'} />)
}

export function Bini() {
    return (<Main assetAddress={'0x755f06fcc2c7225fbcba32655bef0954aa1f4eeb'} />)
}

export function Custom() {
    const [searchParams, setSearchParams] = useSearchParams();
    console.log(searchParams);
    return (<Main assetAddress={searchParams.get("address")} />)
}

export function Main({ assetAddress }) {

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const [multipoolAsset, setMultipoolAsset] = useState<SolidAsset | undefined>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets(assetAddress);
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
        <div
            style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bc)",
                justifyContent: "center",
                flexDirection: "column",
                borderRadius: "20px",
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
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            margin: "10px",
                            padding: "5px",
                            backgroundColor: "#1B1B1B",
                            borderRadius: "16px",
                            border: "1px solid #363636",
                        }}>
                        <button
                            style={{
                                width: "100%",
                                fontSize: "20px",
                                margin: "0",
                                padding: "5px",
                                borderRadius: "10px",
                                color: "#fff",
                                backgroundColor: !isMintDisplayed ? "#1B1B1B" : "var(--bl)",
                            }}
                            disabled={isMintDisplayed}
                            onClick={() => setMintDisplayed(true)}>
                            Mint
                        </button>
                        <button
                            style={{
                                width: "100%",
                                fontSize: "20px",
                                borderRadius: "10px",
                                margin: "0",
                                padding: "2px",
                                color: "#fff",
                                backgroundColor: isMintDisplayed ? "#1B1B1B" : "var(--bl)",
                            }}
                            disabled={!isMintDisplayed}
                            onClick={() => setMintDisplayed(false)}>
                            Burn
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <div style={displayOrHide(!isMintDisplayed, { width: "100%" })}>
                        <TradePane
                            assetsIn={fetchedAssets}
                            assetsOut={[multipoolAsset]}
                            assetInDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) > 10}
                            assetOutDisableFilter={() => false}
                            tradeLogicAdapter={mintAdapter}
                            selectTokenParent={me}
                            networkId={multipoolAsset?.chainId}
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
                            assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10}
                            assetInDisableFilter={() => false}
                            tradeLogicAdapter={burnAdapter}
                            selectTokenParent={me}
                            networkId={multipoolAsset?.chainId}
                            paneTexts={{
                                buttonAction: "Burn",
                                section1Name: "Send",
                                section2Name: "Receive",
                            }} />

                    </div >
                </div >
            </div>
        </div >
    );
}

export function Head({ multipool }) {
    const isMobile = useMobileMedia();
    const multipoolInfo: SolidAsset | undefined = multipool;
    const RED = "#fa3c58";
    const GREEN = "#0ecc83";
    return (
        <div
            style={{
                display: "flex",
                backgroundColor: "var(--bc)",
                width: "100%",
                borderRadius: "10px",
                gap: "40px",
            }}>
            <p style={{
                fontSize: "35px",
                padding: "0",
                marginTop: "5px",
                marginBottom: "0px",
                alignSelf: "center",
                height: "95%",
                justifySelf: "flex-start",
                gridRow: "1/12",
                gridColumn: "1",
                marginLeft: "10px",
            }}>{multipoolInfo?.symbol || ""}</p>
            <div style={{
                display: "flex",
                flex: "1",
                justifyContent: "space-around",
                marginTop: "8px",
                height: "100%",
                alignItems: "flex-start"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    alignItems: "flex-start"
                }}>
                    <p style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>Price</p>
                    <p style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.price.toFixed(4) : "0"}$</p>
                </div>
                {!isMobile ?
                    <>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start"
                        }}>
                            <p style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h change</p>
                            <p style={{
                                fontSize: "16px",
                                margin: "0px", padding: "0px",
                                color: multipoolInfo?.change24h > 0 ? GREEN : (multipoolInfo?.change24h < 0 ? RED : undefined),
                            }}>{multipoolInfo ? multipoolInfo.change24h.toFixed(4) : "0"}%</p>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start"
                        }}>
                            <p style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h hight</p>
                            <p style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.high24h.toFixed(4) : "0"}$</p>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start"
                        }}>
                            <p style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h low</p>
                            <p style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.low24h.toFixed(4) : "0"}$</p>
                        </div>
                    </>
                    : undefined}
            </div>
        </div>
    );
}
