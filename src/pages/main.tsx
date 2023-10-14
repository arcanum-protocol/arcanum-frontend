import { useState } from 'react';
import { useMultipoolData } from "../lib/multipool";
import { useSearchParams } from 'react-router-dom';
import { Faucet } from '../components/faucet-modal';
import TVChartContainer from '../components/tv-chart';
import type { MultipoolAsset, SolidAsset } from '../types/multipoolAsset';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { mintAdapter, burnAdapter, swapAdapter } from '../lib/trade-adapters';
import { TradeProvider } from '../contexts/TradeContext';
import { TradePaneInner } from '../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiPoolProvider, useMultiPoolContext } from '@/contexts/MultiPoolContext';
import { useArbitrumTokens } from '@/hooks/externalTokens';
import { TokenSelector } from '@/components/token-selector';
import { set } from 'lodash';

export function Cpt() {
    return (<MainInner
        multipool_id='arbi-testnet'
    />)
}

export function Arbi() {
    return (<MainInner
        multipool_id='arbi'
    />)
}

export function Bali() {
    return (<MainInner
        multipool_id='bali-testnet'
    />)
}

export function Custom() {
    const [searchParams, setSearchParams] = useSearchParams();
    return (<MainInner multipool_id={searchParams.get("id")!} />)
}

interface MainInnerProps {
    multipool_id: string;
}

export function MainInner({ multipool_id }: MainInnerProps) {
    const { data, error, isLoading } = useMultipoolData(multipool_id);
    const { ExternalAssets } = useArbitrumTokens();

    if (isLoading) {
        return (
            <div>
                {"Loading..."}
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {"Error"}
            </div>
        );
    }

    const routerAddress = data!.multipool.routerAddress;
    const fetchedAssets = data!.assets;
    const multipoolAsset = data!.multipool;

    return (
        <div className='flex flex-row w-full mt-0.5 gap-2 align-start'>
            <div className='flex flex-col items-center w-full gap-2'>
                <Head multipool={multipoolAsset} />
                {multipoolAsset && <TVChartContainer symbol={multipool_id} />}
                <Faucet assets={fetchedAssets} />
                <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
            </div >
            <MultiPoolProvider ExternalAssets={ExternalAssets} multipoolAsset={fetchedAssets} multiPool={multipoolAsset} >
                <MintBurnTabs className="max-h-fit"
                    routerAddress={routerAddress}
                    fetchedAssets={fetchedAssets}
                    multipoolAsset={multipoolAsset}
                />
            </MultiPoolProvider>
        </div >
    );
}

interface MintBurnTabsProps {
    className?: string;
    fetchedAssets: MultipoolAsset[];
    multipoolAsset: SolidAsset | undefined;
    routerAddress: string;
}

export function MintBurnTabs({ fetchedAssets, multipoolAsset, routerAddress, className }: MintBurnTabsProps) {
    const {
        selectedTab,
        setSelectedTab,
    } = useMultiPoolContext();

    setSelectedTab(selectedTab);
    
    return (
        <div className={className}>
            <Tabs className="grid-cols-3 w-[400px] bg-[#09090b] rounded-xl border" value={selectedTab} onValueChange={(value: string | undefined) => setSelectedTab(value)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="mint">Mint</TabsTrigger>
                    <TabsTrigger value="burn">Burn</TabsTrigger>
                    <TabsTrigger value="swap">Swap</TabsTrigger>

                    <TabsTrigger value="set-token-in" className="hidden" />
                    <TabsTrigger value="set-token-out" className="hidden" />

                </TabsList>
                <TabsContent value="mint">
                    <TradeProvider tradeLogicAdapter={mintAdapter} multipoolAddress={multipoolAsset?.address} routerAddress={routerAddress}>
                        <TradePaneInner
                            assetsIn={fetchedAssets}
                            assetsOut={multipoolAsset!}
                            networkId={multipoolAsset?.chainId as number}
                            action="mint" />
                    </TradeProvider>
                </TabsContent>
                <TabsContent value="burn">
                    <TradeProvider tradeLogicAdapter={burnAdapter} multipoolAddress={multipoolAsset?.address} routerAddress={routerAddress}>
                        <TradePaneInner
                            assetsIn={multipoolAsset!}
                            assetsOut={fetchedAssets}
                            networkId={multipoolAsset?.chainId as number}
                            action="burn" />
                    </TradeProvider>
                </TabsContent>
                <TabsContent value="swap">
                    <TradeProvider tradeLogicAdapter={swapAdapter} multipoolAddress={multipoolAsset?.address} routerAddress={routerAddress}>
                        <TradePaneInner
                            assetsIn={fetchedAssets}
                            assetsOut={fetchedAssets}
                            networkId={multipoolAsset?.chainId as number}
                            action="swap" />
                    </TradeProvider>
                </TabsContent>

                <TabsContent value="set-token-in">
                    <TokenSelector action="set-token-in" />
                </TabsContent>

                <TabsContent value="set-token-out">
                    <TokenSelector action="set-token-out" />
                </TabsContent>
            </Tabs >
        </div>
    )
}

export function Head({ multipool }) {
    const multipoolInfo: SolidAsset | undefined = multipool;
    const RED = "#fa3c58";
    const GREEN = "#0ecc83";

    function getColor(asset: SolidAsset | undefined): string {
        if (asset == undefined) {
            return "var(--bl)";
        }

        if (Number(asset.change24h) > 0) {
            return GREEN;
        } else if (Number(asset.change24h) < 0) {
            return RED;
        } else {
            return "var(--bl)";
        }
    }

    return (
        <div className='flex w-full rounded-lg border'
            style={{
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
                    <p style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo?.price?.toFixed(4) : "0"}$</p>
                </div>
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
                            color: getColor(multipoolInfo),
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
            </div>
        </div>
    );
}
