import * as React from 'react';
import { fetchAssets, type MultipoolAsset, MultipoolShareAsset, SolidAsset } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { mintAdapter, burnAdapter, swapAdapter } from '../lib/trade-adapters';
import { TVChartContainer } from '../components/tv-chart';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { useMobileMedia } from '../hooks/tokens';
import { useSearchParams } from 'react-router-dom';
import { Faucet } from '../components/faucet-modal';

export function Cpt() {
    return (<Main
        assetAddress={'0xe04062d2d9b5f8d4186d52cc582808df0477f29d'}
        routerAddress={'0xf387bcf8a9c79267f5940505100806d09491cbcd'}
    />)
}

export function Arbi() {
    return (<Main
        assetAddress={'0x452f9ca404c55722b9073575af8b35bfd655e61e'}
        routerAddress={'0xad79b9d522367294d228379d7c040b952bd3b462'}
    />)
}

export function Bali() {
    return (<Main
        assetAddress={'0xc7d2b08a1dfb6c4ac1a951fdb7269638bbc7155c'}
        routerAddress={'0x241630cf68AB007AfA8E503554249f0746c8DC66'}
    />)
}

export function Custom() {
    const [searchParams, setSearchParams] = useSearchParams();
    console.log(searchParams);
    return (<Main assetAddress={searchParams.get("address")} routerAddress={searchParams.get("router")} />)
}


export function MainInner({ assetAddress, routerAddress, multipoolAsset, fetchedAssets }) {


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
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", maxWidth: "400px", width: "100%" }}>
                        <MintBurnTabs
                            fetchedAssets={fetchedAssets}
                            multipoolAsset={multipoolAsset}
                            routerAddress={routerAddress}
                        />
                        <Faucet assets={fetchedAssets} />
                    </div>
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
                    <MintBurnTabs
                        routerAddress={routerAddress}
                        fetchedAssets={fetchedAssets}
                        multipoolAsset={multipoolAsset}
                    />
                    <Faucet assets={fetchedAssets} />
                    <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
                </div >
            </div >
        );
    }
}

export const MemoInner = React.memo(MainInner);
export function Main({ assetAddress, routerAddress }) {
    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const [multipoolAsset, setMultipoolAsset] = useState<SolidAsset | undefined>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets(assetAddress);
            if (fetchedAssets != result.assets) {
                setFetchedAssets(result.assets);
            }
            if (multipoolAsset != result.multipool) {
                setMultipoolAsset(result.multipool);
            }
        }
        const id = setInterval(() => {
            inner();
        }, 10000);

        inner();

        return () => clearInterval(id);
    }, []);

    return <MemoInner
        assetAddress={assetAddress}
        routerAddress={routerAddress}
        fetchedAssets={fetchedAssets}
        multipoolAsset={multipoolAsset}
    />;
}

export function MintBurnTabs({ fetchedAssets, multipoolAsset, routerAddress }) {

    const [displayed, setDisplayed] = useState<number>(1);
    const me = useRef(null);
    console.log("displayed", displayed);

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
                                backgroundColor: displayed != 1 ? "#1B1B1B" : "var(--bl)",
                            }}
                            disabled={displayed == 1}
                            onClick={() => setDisplayed(1)}>
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
                                backgroundColor: displayed != 2 ? "#1B1B1B" : "var(--bl)",
                            }}
                            disabled={displayed == 2}
                            onClick={() => setDisplayed(2)}>
                            Burn
                        </button>
                        <button
                            style={{
                                width: "100%",
                                fontSize: "20px",
                                borderRadius: "10px",
                                margin: "0",
                                padding: "2px",
                                color: "#fff",
                                backgroundColor: displayed != 3 ? "#1B1B1B" : "var(--bl)",
                            }}
                            disabled={displayed == 3}
                            onClick={() => setDisplayed(3)}>
                            Swap
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <div style={displayOrHide(displayed != 1, { width: "100%" })}>
                        <TradePane
                            assetsIn={fetchedAssets}
                            assetsOut={[multipoolAsset]}
                            assetInDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) > 10}
                            assetOutDisableFilter={() => false}
                            tradeLogicAdapter={mintAdapter}
                            selectTokenParent={me}
                            routerAddress={routerAddress}
                            multipoolAddress={multipoolAsset?.assetAddress}
                            networkId={multipoolAsset?.chainId}
                            paneTexts={{
                                buttonAction: "Mint",
                                section1Name: "Send",
                                section2Name: "Receive",
                            }} />

                    </div >
                    <div style={displayOrHide(displayed != 2, { width: "100%" })}>
                        <TradePane
                            assetsIn={[multipoolAsset]}
                            assetsOut={fetchedAssets}
                            assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10 || a.quantity.isZero()}
                            multipoolAddress={multipoolAsset?.assetAddress}
                            assetInDisableFilter={() => false}
                            tradeLogicAdapter={burnAdapter}
                            routerAddress={routerAddress}
                            selectTokenParent={me}
                            networkId={multipoolAsset?.chainId}
                            paneTexts={{
                                buttonAction: "Burn",
                                section1Name: "Send",
                                section2Name: "Receive",
                            }} />

                    </div >
                    <div style={displayOrHide(displayed != 3, { width: "100%" })}>
                        <TradePane
                            assetInDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) > 10}
                            assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10}
                            routerAddress={routerAddress}
                            multipoolAddress={multipoolAsset?.assetAddress}
                            initialOutIndex={1}
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
