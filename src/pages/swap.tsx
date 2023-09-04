import * as React from 'react';
import { fetchAssets, routerAddress, type MultipoolAsset, multipoolAddress } from "../lib/multipool";
import { useState, useEffect, useRef } from 'react';
import { TradePane } from '../components/trade-pane';
import { Faucet } from '../components/faucet-modal';
import { swapAdapter } from '../lib/trade-adapters';
import { useMobileMedia } from '../hooks/tokens';
import { SolidAsset } from '../lib/multipool';
import chevron from '/chevron-down.svg';

export function Swap() {

    const me = useRef(null);
    const isMobile = useMobileMedia();

    const [fetchedAssets, setFetchedAssets] = useState<MultipoolAsset[]>([]);
    const [multipoolAsset, setMultipoolAsset] = useState<SolidAsset | undefined>();

    useEffect(() => {
        async function inner() {
            const result = await fetchAssets('0x060bf7c37fcb1ef52e10fde3f645ce9b8f163134');
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
                rowGap: "5px",
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
                            assetOutDisableFilter={(a: MultipoolAsset) => Number(a.deviationPercent) < -10 || a.quantity.isZero()}
                            routerAddress={routerAddress}
                            multipoolAddress={multipoolAddress}
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
            </div >
            <Accordion
                title={"Note?"}
                content={"This is the DEMO page for the Arcanum cross-ETF swaps. Currently available on Polygon Mumbai only."}
            />
            <Accordion
                title={"What is it for?"}
                content={"For swapping of assets between ETFs on one chain. This creates more arbitrage opportunities - between ETFs' pools on Arcanum platform."}
            />
            <Accordion
                title={"When can I test?"}
                content={"When more than one ETF on one chain is released."}
            />
            <Accordion
                title={"Where can I get test native(gas) tokens?"}
                content={"Best choise is to find tokens on faucet.quicknode.com"}
            />
            <Faucet assets={fetchedAssets} />
        </div >
    );
}

export function Accordion({ title, content }) {
    const isMobile = useMobileMedia();
    const [isOpened, setOpen] = useState(false);
    return (
        <>

            <div
                onClick={(e) => setOpen(!isOpened)}
                style={{
                    display: "flex",
                    backgroundColor: "#1B1B1B",
                    maxWidth: "400px",
                    justifySelf: "center",
                    borderRadius: "10px",
                    marginLeft: isMobile ? "auto" : undefined,
                    marginRight: isMobile ? "auto" : undefined,
                    width: !isMobile ? "400px" : "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}>
                <div style={{
                    display: "flex",
                    maxWidth: "400px",
                    justifySelf: "center",
                    width: !isMobile ? "400px" : "100%",
                }}>
                    <div style={{
                        display: "flex",
                        paddingTop: "0px",
                        justifySelf: "center", margin: "0", marginLeft: "20px",
                        fontWeight: "bold"
                    }}>
                        {title}
                    </div>
                    <div style={{
                        marginLeft: "auto", flex: 1,
                        marginRight: "20px",
                        justifySelf: "flex-end",
                        justifyContent: "flex-end",
                        display: "flex", width: "20px", height: "20px",
                        margin: "2px",
                    }}>
                        <img style={{
                            transform: isOpened ? "rotate(180deg)" : undefined,
                            transition: "transform 2s",
                            transitionDelay: "0.1s",
                        }} src={chevron} />
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    maxWidth: "400px",
                    justifySelf: "center",
                    transition: "max-height 2s",
                    transitionDelay: "0.1s",
                    maxHeight: isOpened ? "400px" : "0",
                    overflow: "hidden",
                    width: !isMobile ? "400px" : "100%",
                    textAlign: isMobile ? "center" : "left",
                }}>
                    <p style={{ marginLeft: "10px", marginRight: "10px" }}>
                        {content}
                    </p>
                </div>
            </div>
        </>
    );
}
