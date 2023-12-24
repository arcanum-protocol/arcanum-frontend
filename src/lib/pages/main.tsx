import { IndexAssetsBreakdown } from '../../components/index-breakdown';
import { TradePaneInner } from '../../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getSVG } from "@/lib/svg-adapter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { observer } from "mobx-react-lite";
import { MultipoolStore } from "@/store/MultipoolStore";
import TVChartContainer from "@/components/tv-chart";
import { TokenSelector } from "@/components/token-selector";
import { AdminPannel } from './admin';
import { useQuery } from '@tanstack/react-query';
import { StoreProvider, useStore } from '@/contexts/StoreContext';
import { getMultipoolMarketData } from '@/api/arcanum';

export const Admin = observer(() => {
    return (
        <>
            <AdminPannel />
        </>
    )
});

export const Arbi = () => {
    const multipool = new MultipoolStore("arbi");

    return (
        <StoreProvider store={multipool}>
            <MainInner />
        </StoreProvider>
    )
};

export const MainInner = () => {
    return (
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
                <ActionForm className="h-fit w-[21.4375rem] min-w-[21.4375rem]" />
            </div >
        </>
    );
};

interface ActionFormProps {
    className?: string;
}

export const ActionForm = observer(({ className }: ActionFormProps) => {
    const { selectedTab, setSelectedTabWrapper } = useStore();

    return (
        <div>
            <div className={`${className} p-4 bg-[#0c0a09] rounded-md border border-[#292524]`}>
                <Tabs className="grid-cols-3" value={selectedTab} onValueChange={(value: string | undefined) => setSelectedTabWrapper(value)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mint">Mint</TabsTrigger>
                        <TabsTrigger value="burn">Burn</TabsTrigger>
                        <TabsTrigger value="swap">Swap</TabsTrigger>

                        <TabsTrigger value="set-token-in" className="hidden" />
                        <TabsTrigger value="set-token-out" className="hidden" />
                    </TabsList>
                    <TabsContent value="mint">
                        <TradePaneInner />
                    </TabsContent>
                    <TabsContent value="burn">
                        <TradePaneInner />
                    </TabsContent>
                    <TabsContent value="swap">
                        <TradePaneInner />
                    </TabsContent>

                    <TabsContent value="set-token-in">
                        <TokenSelector action="set-token-in" />
                    </TabsContent>

                    <TabsContent value="set-token-out">
                        <TokenSelector action="set-token-out" />
                    </TabsContent>
                </Tabs >
            </div>
        </div>
    )
});

export const Head = observer(() => {
    const { multipoolId } = useStore();

    const { data: multipool, isLoading: multipoolIsLoading } = useQuery(["multipool"], async () => {
        return await getMultipoolMarketData(multipoolId);
    }, {
        refetchInterval: 15000,
    });

    function getColor(change: string | undefined): string {
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

    if (multipoolIsLoading) {
        // skeleton
        return (
            <div className='flex w-full rounded-2xl p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
                <div className="flex flex-row items-center justify-between gap-2 px-8 py-2 xl:py-0 w-full">
                    <div className="flex flex-row text-left gap-2">
                        <img src={getSVG("ARBI")} alt="Logo" className='w-8 h-8' />
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <Skeleton className="rounded w-16 h-4" />
                </div>
                <div className="hidden gap-1 flex-row xl:flex">
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-xs'>24h change</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-xs'>24h high</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-xs'>24h low</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                </div>
            </div>
        );
    }

    const change = multipool?.change24h?.toFixed(4);
    const high = multipool?.high24h?.toFixed(4);
    const low = multipool?.low24h?.toFixed(4);
    const price = multipool?.price?.toFixed(4);

    return (
        <div className='flex w-full rounded p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
            <div className="flex flex-row items-center justify-between gap-2 px-8 py-2 xl:py-0 w-full">
                <div className="flex flex-row text-left gap-2">
                    <img src={getSVG("ARBI")} alt="Logo" className='w-8 h-8' />
                    <p className='text-[#7E7E7E] p-0 text-2xl'>{multipoolId.toLocaleUpperCase() || ""}</p>
                </div>
                <p className='text-xl'>${price}</p>
            </div>
            <div className="hidden gap-1 flex-row xl:flex">
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-xs'>24h change</p>
                    <p className={'text-base ' + getColor(change)}>{change}%</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-xs'>24h high</p>
                    <p className='text-base'>{high}$</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-xs'>24h low</p>
                    <p className='text-base'>{low}$</p>
                </div>
            </div>
        </div>
    );
});

