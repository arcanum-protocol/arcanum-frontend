import { getMassiveMintRouter, useMultipoolData } from "../lib/multipool";
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
import { getSVG } from "@/lib/svg-adapter";


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

    if (error) {
        return (
            <div>
                {"Error"}
            </div>
        );
    }

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
        <div className='flex flex-row min-w-full mt-0.5 gap-2 align-start'>
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
        <div className='flex w-full rounded-2xl p-1 justify-between items-center bg-[#161616]'>
            <div className="flex flex-row items-center gap-2 px-8">
                <img src={getSVG("ARBI")} alt="Logo" className='w-8 h-8' />
                <div className="text-left">
                    <p className='text-[#7E7E7E] text-3xl p-0 text-sm'>{multipoolInfo?.symbol || ""}</p>
                    <p className='text-base'>${multipoolInfo?.price?.toFixed(4)}</p>
                </div>
            </div>
            <div className="flex flex-row gap-1">
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem]">
                    <p className='text-sm'>24h change</p>
                    <p className={'text-base ' + getColor(multipoolInfo)}>{multipoolInfo?.change24h.toFixed(4)}%</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem]">
                    <p className='text-sm'>24h high</p>
                    <p className='text-base'>{multipoolInfo?.high24h.toFixed(4)}$</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem]">
                    <p className='text-sm'>24h low</p>
                    <p className='text-base'>{multipoolInfo?.low24h.toFixed(4)}$</p>
                </div>
            </div>
        </div>
    );
}
