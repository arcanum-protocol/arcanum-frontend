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
        retry: true,
    });

    function getColor(change: string | undefined): string {
        if (change == undefined) {
            return "hidden";
        }

        if (Number(change) > 0) {
            return "text-green-400";
        } else if (Number(change) < 0) {
            return 'text-red-400';
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
                        <p className='text-sm'>24h change</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>24h high</p>
                        <Skeleton className="rounded w-16 h-4" />
                    </div>
                    <div className="rounded-2xl bg-[#0c0a09] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                        <p className='text-sm'>24h low</p>
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
                    <p className='text-[#fff] p-0 text-2xl'>{multipoolId.toLocaleUpperCase() || ""}</p>
                </div>
                <p className='text-xl'>${price}</p>
            </div>
            <div className="hidden gap-1 flex-row xl:flex">
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h change</p>
                    <p className={'text-base ' + getColor(change)}>{change}%</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h high</p>
                    <p className='text-base'>{high}$</p>
                </div>
                <div className="rounded bg-[#0c0a09] border border-[#292524] px-[1.5rem] py-[0.75rem] max-h-16 whitespace-nowrap">
                    <p className='text-sm'>24h low</p>
                    <p className='text-base'>{low}$</p>
                </div>
            </div>
        </div>
    );
});

