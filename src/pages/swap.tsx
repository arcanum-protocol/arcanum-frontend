import { useRef } from 'react';
import { Faucet } from '../components/faucet-modal';
import { swapAdapter } from '../lib/trade-adapters';
import { TradePaneInner } from '../components/trade-pane';
import { useMultipoolData } from '../lib/multipool';
<<<<<<< HEAD
=======
import { getSVG } from '../lib/svg-adapter';
>>>>>>> 5fcb4e7 (add config fetcher (#11))
import { TradeProvider } from '../contexts/TradeContext';
import { Address } from 'wagmi';
import {
    Accordion,
    ArcanumAccordion,
} from "@/components/ui/accordion"


export function Swap() {
<<<<<<< HEAD
=======
    const { chain } = useNetwork();

>>>>>>> 5fcb4e7 (add config fetcher (#11))
    const me = useRef(null);

    const { data, error, isLoading } = useMultipoolData('arbi');

    if (isLoading) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    
    if (error) {
        return (
            <div>
                {error.message}
            </div>
        )
    }

    return (
<<<<<<< HEAD
        <div className='flex flex-col justify-center items-center gap-5 mt-8 w-full'>
            <div className='gap-10 w-fit'>
                <div className='bg-zinc-900 rounded-2xl mx-auto'>
                    <div className='flex w-full justify-center' ref={me}>
                        <TradeProvider
                            tradeLogicAdapter={swapAdapter}
                            multipoolAddress={data?.multipool.address as Address}
=======
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
                        <TradeProvider
                            tradeLogicAdapter={swapAdapter}
                            multipoolAddress={data?.multipool.assetAddress as Address}
>>>>>>> 5fcb4e7 (add config fetcher (#11))
                            routerAddress={data?.multipool.routerAddress as Address}
                            fetchedAssets={data?.assets!}
                        >
                            <TradePaneInner
                                routerAddress={data?.multipool.routerAddress as Address}
<<<<<<< HEAD
                                multipoolAddress={data?.multipool.address as Address}
=======
                                multipoolAddress={data?.multipool.assetAddress as Address}
>>>>>>> 5fcb4e7 (add config fetcher (#11))
                                assetsIn={data?.assets!}
                                assetsOut={data?.assets!}
                                tradeLogicAdapter={swapAdapter}
                                networkId={Number(data?.multipool?.chainId!)}
                                selectTokenParent={me}
                                paneTexts={{
                                    buttonAction: "Swap",
                                    section1Name: "Send",
                                    section2Name: "Receive",
                                }} />
                        </TradeProvider>
                    </div >
                </div >
                <Accordion type="single" collapsible style={{ width: "400px", "padding-left": "12px", "padding-right": "12px" }}>
                    <ArcanumAccordion
                        title={"Note?"}
                        content={"This is the DEMO page for the Arcanum cross-ETF swaps. Currently available on Arbitrum sepolia only."}
                    />
                    <ArcanumAccordion
                        title={"What is it for?"}
                        content={"For swapping of assets between ETFs on one chain. This creates more arbitrage opportunities - between ETFs' pools on Arcanum platform."}
                    />
                    <ArcanumAccordion
                        title={"When can I test?"}
                        content={"When more than one ETF on one chain is released."}
                    />
                    <ArcanumAccordion
                        title={"Where can I get test native(gas) tokens?"}
                        content={"Best choise is to find tokens on faucet.quicknode.com"}
                    />
                </Accordion>
                <Faucet assets={data?.assets} />
            </div >
        </div >
    );
}
