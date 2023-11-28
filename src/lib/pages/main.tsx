import { getMassiveMintRouter } from "../multipool";
import { useSearchParams } from 'react-router-dom';
import { IndexAssetsBreakdown } from '../../components/index-breakdown';
import { mintAdapter, burnAdapter, swapAdapter } from '../trade-adapters';
import { TradeProvider } from '../../contexts/TradeContext';
import { TradePaneInner } from '../../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMultiPoolContext } from '@/contexts/MultiPoolContext';
import { TokenSelector } from '@/components/token-selector';
import { Skeleton } from "@/components/ui/skeleton"
import { getSVG } from "@/lib/svg-adapter";
<<<<<<< HEAD
<<<<<<< HEAD
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
<<<<<<< HEAD:src/pages/main.tsx
import { Terminal } from "lucide-react";
=======
>>>>>>> 731d6af (Add styling changes and update components)
=======
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
>>>>>>> 78cdfa2 (Add background image and update dependencies)

=======
// import { tokenStore } from "@/store/TokenStore";
import { observer } from "mobx-react-lite";
import { multipool } from "@/store/MultipoolStore";
import { toJS } from "mobx";
import TVChartContainer from "@/components/tv-chart";
>>>>>>> ff857d5 (Add mobx and mobx-react-lite dependencies):src/lib/pages/main.tsx

export function Cpt() {
    return (<MainInner />)
}

export const Arbi = observer(() => {
    return (
        <>
            <MainInner />
        </>
    )
});

export function Bali() {
    return (<MainInner />)
}

export function Custom() {
    const [searchParams, setSearchParams] = useSearchParams();
    return (<MainInner />)
}

export const MainInner = () => {
    return (
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 78cdfa2 (Add background image and update dependencies)
        <>
            <div className='flex flex-col min-w-full mt-0.5 gap-2 items-center xl:flex-row xl:items-stretch'>
                <div className='flex flex-col items-center w-full gap-2'>
                    <Alert>
                        <AlertTitle className="text-red-300 text-xl">Warning</AlertTitle>
                        <AlertDescription className="whitespace-break-spaces">
                            Arcanum right now is under heavy development. Most of the features are under reconstruction.
                            <br />
                            Go to our <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="w-4"><path fill="#fff" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                            <a href="https://discord.gg/v4Qc472u3X" className="ml-1 text-blue-500">Discord</a> to get notified when we release new features.
                        </AlertDescription>
                    </Alert>
                    <Head />
                    <TVChartContainer />
                    <IndexAssetsBreakdown />
                </div >
<<<<<<< HEAD:src/pages/main.tsx
                <MultiPoolProvider ExternalAssets={ExternalAssets} multipoolAsset={fetchedAssets} multiPool={multipoolAsset} router={routerAddress}>
<<<<<<< HEAD
                    <MintBurnTabs className="h-fit w-[21.4375rem] min-w-[21.4375rem]" />
                </MultiPoolProvider>
=======
        <div className='flex flex-row min-w-full mt-0.5 gap-2 align-start'>
            <div className='flex flex-col items-center w-full gap-2'>
                <Head multipool={multipoolAsset} />
                {multipoolAsset && <TVChartContainer symbol={multipool_id} />}
                <Faucet assets={fetchedAssets} />
                <IndexAssetsBreakdown fetchedAssets={fetchedAssets} />
>>>>>>> 731d6af (Add styling changes and update components)
            </div >
<<<<<<< HEAD
        </>
=======
            <MultiPoolProvider ExternalAssets={ExternalAssets} multipoolAsset={fetchedAssets} multiPool={multipoolAsset} router={routerAddress}>
                <MintBurnTabs className="h-fit min-w-[22.75rem]" />
            </MultiPoolProvider>
        </div >
>>>>>>> cb1b31e (Refactor UI styles for consistency)
=======
                    <MintBurnTabs className="h-fit max-w-[21.4375rem]" />
                </MultiPoolProvider>
=======
                {/* <MultiPoolProvider ExternalAssets={ExternalAssets} multipoolAsset={fetchedAssets} multiPool={multipoolAsset} router={routerAddress}>
                    <MintBurnTabs className="h-fit w-[21.4375rem] min-w-[21.4375rem]" />
                </MultiPoolProvider> */}
>>>>>>> ff857d5 (Add mobx and mobx-react-lite dependencies):src/lib/pages/main.tsx
            </div >
        </>
>>>>>>> 78cdfa2 (Add background image and update dependencies)
    );
};

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

    setSelectedTab(selectedTab);

    return (
<<<<<<< HEAD
<<<<<<< HEAD
        <div className={`${className} p-4 bg-[#161616] rounded-2xl border border-[#292524]`}>
=======
        <div className={`${className} p-4 bg-[#161616] rounded-2xl`}>
>>>>>>> cb1b31e (Refactor UI styles for consistency)
=======
        <div className={`${className} p-4 bg-[#161616] rounded-2xl border border-[#292524]`}>
>>>>>>> 78cdfa2 (Add background image and update dependencies)
            <Tabs className="grid-cols-3" value={selectedTab} onValueChange={(value: string | undefined) => setSelectedTab(value)}>
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

export const Head = observer(() => {
    const { priceChange } = multipool;

    function getColor(change: number | undefined): string {
        if (change == undefined) {
            return "hidden";
        }

        if (Number(change) > 0) {
            return "text-green-600";
        } else if (Number(change) < 0) {
            return 'text-red-700';
        } else {
            return '0';
        }
    }

<<<<<<< HEAD:src/pages/main.tsx
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0684c35 (sync)
    if (multipoolInfo == undefined) {
=======
    if (priceChange.multipool_id == undefined) {
>>>>>>> ff857d5 (Add mobx and mobx-react-lite dependencies):src/lib/pages/main.tsx
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
                    <div className={'text-base ' + getColor(priceChange.change_24h)}>
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

<<<<<<< HEAD:src/pages/main.tsx
<<<<<<< HEAD
=======
    const _priceChange = toJS(priceChange);

>>>>>>> ff857d5 (Add mobx and mobx-react-lite dependencies):src/lib/pages/main.tsx
    return (
        <div className='flex w-full rounded-2xl p-1 justify-between items-center bg-[#161616] border border-[#292524]'>
            <div className="flex flex-row items-center justify-between gap-2 px-8 py-2 xl:py-0 w-full">
                <div className="flex flex-row text-left gap-2">
                    <img src={getSVG("ARBI")} alt="Logo" className='w-8 h-8' />
                    <p className='text-[#7E7E7E] p-0 text-2xl'>{_priceChange?.multipool_id || ""}</p>
                </div>
                <p className='text-xl'>${_priceChange?.current_price.toFixed(4)}</p>
            </div>
            <div className="hidden gap-1 flex-row xl:flex">
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h change</p>
                    <p className={'text-base ' + getColor(_priceChange.change_24h)}>{_priceChange?.change_24h.toFixed(4)}%</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h high</p>
                    <p className='text-base'>{_priceChange?.high_24h.toFixed(4)}$</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h low</p>
                    <p className='text-base'>{_priceChange?.low_24h.toFixed(4)}$</p>
                </div>
=======
=======
>>>>>>> 0684c35 (sync)
    return (
        <div className='flex w-full rounded-2xl p-1 justify-between items-center bg-[#161616] border border-[#292524]'>
            <div className="flex flex-row items-center justify-between gap-2 px-8 py-2 xl:py-0 w-full">
                <div className="flex flex-row text-left gap-2">
                    <img src={getSVG("ARBI")} alt="Logo" className='w-8 h-8' />
                    <p className='text-[#7E7E7E] p-0 text-2xl'>{multipoolInfo?.symbol || ""}</p>
                </div>
                <p className='text-xl'>${multipoolInfo?.price?.toFixed(4)}</p>
            </div>
<<<<<<< HEAD
<<<<<<< HEAD
            <div>
                <p className='text-xs'>24h change</p>
                <p className={'text-base ' + getColor(multipoolInfo)}>{multipoolInfo?.change24h.toFixed(4)}%</p>
            </div>
            <div>
                <p className='text-xs'>24h hight</p>
                <p className='text-base'>{multipoolInfo?.high24h.toFixed(4)}$</p>
            </div>
            <div>
<<<<<<< HEAD
                <p style={{ fontSize: "14px", margin: "0px", padding: "0px" }}>24h low</p>
                <p style={{ fontSize: "16px", margin: "0px", padding: "0px" }}>{multipoolInfo ? multipoolInfo.low24h.toFixed(4) : "0"}$</p>
>>>>>>> a9e0f04 (fix head)
=======
                <p className='text-xs'>24h low</p>
                <p className='text-base'>{multipoolInfo?.low24h.toFixed(4)}$</p>
>>>>>>> 0684c35 (sync)
=======
            <div className="flex flex-row gap-1">
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem]">
=======
            <div className="hidden gap-1 flex-row xl:flex">
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
>>>>>>> 78cdfa2 (Add background image and update dependencies)
                    <p className='text-sm'>24h change</p>
                    <p className={'text-base ' + getColor(multipoolInfo)}>{multipoolInfo?.change24h.toFixed(4)}%</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h high</p>
                    <p className='text-base'>{multipoolInfo?.high24h.toFixed(4)}$</p>
                </div>
                <div className="rounded-2xl bg-[#1B1B1B] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h low</p>
                    <p className='text-base'>{multipoolInfo?.low24h.toFixed(4)}$</p>
                </div>
>>>>>>> 731d6af (Add styling changes and update components)
            </div>
        </div>
    );
});
