<<<<<<< HEAD
import { getMassiveMintRouter, useMultipoolData } from "../lib/multipool";
=======
import React, { useState, useRef } from 'react';
import { useMultipoolData } from "../lib/multipool";
import { SolidAsset } from '../types/solidAsset';
import { useMobileMedia } from '../hooks/tokens';
>>>>>>> 5fcb4e7 (add config fetcher (#11))
import { useSearchParams } from 'react-router-dom';
import { Faucet } from '../components/faucet-modal';
import TVChartContainer from '../components/tv-chart';
import type { SolidAsset } from '../types/multipoolAsset';
import { IndexAssetsBreakdown } from '../components/index-breakdown';
import { mintAdapter, burnAdapter, swapAdapter } from '../lib/trade-adapters';
import { TradeProvider } from '../contexts/TradeContext';
import { TradePaneInner } from '../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiPoolProvider, useMultiPoolContext } from '@/contexts/MultiPoolContext';
import { useArbitrumTokens } from '@/hooks/externalTokens';
import { TokenSelector } from '@/components/token-selector';
import { Skeleton } from "@/components/ui/skeleton"


export function Cpt() {
<<<<<<< HEAD
    return (<MainInner
        multipool_id='arbi-testnet'
=======
    return (<Main
        multipool_id='arbi'
>>>>>>> 5fcb4e7 (add config fetcher (#11))
    />)
}

export function Arbi() {
<<<<<<< HEAD
    return (<MainInner
=======
    return (<Main
>>>>>>> 5fcb4e7 (add config fetcher (#11))
        multipool_id='arbi'
    />)
}

export function Bali() {
<<<<<<< HEAD
    return (<MainInner
        multipool_id='bali-testnet'
=======
    return (<Main
        multipool_id='arbi'
>>>>>>> 5fcb4e7 (add config fetcher (#11))
    />)
}

export function Custom() {
    const [searchParams, setSearchParams] = useSearchParams();
<<<<<<< HEAD
    return (<MainInner multipool_id={searchParams.get("id")!} />)
=======
    return (<Main multipool_id={searchParams.get("id")!} />)
>>>>>>> 5fcb4e7 (add config fetcher (#11))
}

interface MainInnerProps {
    multipool_id: string;
}

<<<<<<< HEAD
export function MainInner({ multipool_id }: MainInnerProps) {
    const { data, error, isLoading } = useMultipoolData(multipool_id);
    const { ExternalAssets } = useArbitrumTokens();
=======
export function MainInner(props: MainInnerProps) {
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
                        <Head multipool={props.multipoolAsset} />
                        {props.multipoolAsset && <TVChartContainer symbol={props.multipoolAsset.symbol} />}
                        <IndexAssetsBreakdown fetchedAssets={props.fetchedAssets} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", maxWidth: "400px", width: "100%" }}>
                        <MintBurnTabs
                            fetchedAssets={props.fetchedAssets}
                            multipoolAsset={props.multipoolAsset}
                            routerAddress={props.routerAddress}
                        />
                        <Faucet assets={props.fetchedAssets} />
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
                    <Head multipool={props.multipoolAsset} />
                    {props.multipoolAsset && <TVChartContainer symbol={props.multipoolAsset.symbol} />}
                    <MintBurnTabs
                        routerAddress={props.routerAddress}
                        fetchedAssets={props.fetchedAssets}
                        multipoolAsset={props.multipoolAsset}
                    />
                    <Faucet assets={props.fetchedAssets} />
                    <IndexAssetsBreakdown fetchedAssets={props.fetchedAssets} />
                </div >
            </div >
        );
    }
}

export interface MainProps {
    multipool_id: string;
}

export function Main({ multipool_id }: MainProps): JSX.Element {
    const { data, error, isLoading } = useMultipoolData(multipool_id);

    if (isLoading || data == undefined) {
        return (
            <div>
                Loading...
            </div>
        )
    }
>>>>>>> 5fcb4e7 (add config fetcher (#11))

    if (error) {
        return (
            <div>
                {"Error"}
            </div>
        );
    }

<<<<<<< HEAD
    const routerAddress = data?.multipool?.routerAddress;
    const fetchedAssets = data?.assets;
    const multipoolAsset = data?.multipool;

    if (isLoading || !fetchedAssets || !multipoolAsset) {
        return (
            <div className='flex flex-row w-full mt-0.5 gap-2 align-start'>
            </div >
        );
    }

    return (
        <div className='flex flex-row w-full mt-0.5 gap-2 align-start'>
            <div className='flex flex-col items-center w-full gap-2'>
                <Head multipool={multipoolAsset} />
                {multipoolAsset && <TVChartContainer symbol={multipool_id} />}
                <Faucet assets={fetchedAssets} />
                <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
            </div >
            <MultiPoolProvider ExternalAssets={ExternalAssets} multipoolAsset={fetchedAssets} multiPool={multipoolAsset} router={routerAddress}>
                <MintBurnTabs className="max-h-fit" />
            </MultiPoolProvider>
        </div >
    );
=======
    return (<MainInner
        assetAddress={data.multipool.assetAddress}
        routerAddress={data.multipool.routerAddress}
        fetchedAssets={data.assets}
        multipoolAsset={data.multipool}
    />);
>>>>>>> 5fcb4e7 (add config fetcher (#11))
}

interface MintBurnTabsProps {
    className?: string;
}

export function MintBurnTabs({ className }: MintBurnTabsProps) {
    const {
        multipool,
        selectedTab,
        router,
        setSelectedTab,
    } = useMultiPoolContext();

    const massiveMintRouter = getMassiveMintRouter();

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
                    <TradeProvider tradeLogicAdapter={mintAdapter} multipoolAddress={multipool?.address} routerAddress={router} MassiveMintRouter={massiveMintRouter}>
                        <TradePaneInner
                            action="mint" />
                    </TradeProvider>
                </TabsContent>
                <TabsContent value="burn">
                    <TradeProvider tradeLogicAdapter={burnAdapter} multipoolAddress={multipool?.address} routerAddress={router}>
                        <TradePaneInner
                            action="burn" />
                    </TradeProvider>
                </TabsContent>
                <TabsContent value="swap">
                    <TradeProvider tradeLogicAdapter={swapAdapter} multipoolAddress={multipool?.address} routerAddress={router}>
                        <TradePaneInner
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

export function Head({ multipool }: { multipool: SolidAsset | undefined }) {
    const multipoolInfo: SolidAsset | undefined = multipool;

    function getColor(asset: SolidAsset | undefined): string {
        if (asset == undefined) {
            return "hidden";
        }

        if (Number(asset.change24h) > 0) {
            return "text-green-600";
        } else if (Number(asset.change24h) < 0) {
            return 'text-red-700';
        } else {
            return '0';
        }
    }

    if (multipoolInfo == undefined) {
        // skeleton
        return (
            <div className='flex w-full rounded-lg border p-1 px-4 justify-between items-center'>
                <div className='text-3xl p-0 font-bold'>
                    <Skeleton className='w-20 h-8' />
                </div>
                <div>
                    <p className='text-xs'>Price</p>
                    <div className='text-base'>
                        <Skeleton className='w-20 h-8' />
                    </div>
                </div>
                <div>
                    <p className='text-xs'>24h change</p>
                    <div className={'text-base ' + getColor(multipoolInfo)}>
                        <Skeleton className='w-20 h-8' />
                    </div>
                </div>
                <div>
                    <p className='text-xs'>24h hight</p>
                    <div className='text-base'>
                        <Skeleton className='w-20 h-8' />
                    </div>
                </div>
                <div>
                    <p className='text-xs'>24h low</p>
                    <div className='text-base'>
                        <Skeleton className='w-20 h-8' />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex w-full rounded-lg border p-1 px-4 justify-between items-center'>
            <p className='text-3xl p-0 font-bold'>{multipoolInfo?.symbol || ""}</p>
            <div>
                <p className='text-xs'>Price</p>
                <p className='text-base'>{multipoolInfo?.price?.toFixed(4)}$</p>
            </div>
            <div>
                <p className='text-xs'>24h change</p>
                <p className={'text-base ' + getColor(multipoolInfo)}>{multipoolInfo?.change24h.toFixed(4)}%</p>
            </div>
            <div>
                <p className='text-xs'>24h hight</p>
                <p className='text-base'>{multipoolInfo?.high24h.toFixed(4)}$</p>
            </div>
            <div>
                <p className='text-xs'>24h low</p>
                <p className='text-base'>{multipoolInfo?.low24h.toFixed(4)}$</p>
            </div>
        </div>
    );
}
