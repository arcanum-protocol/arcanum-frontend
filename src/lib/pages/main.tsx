import { IndexAssetsBreakdown } from '../../components/index-breakdown';
import { TradePaneInner } from '../../components/trade-pane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getSVG } from "@/lib/svg-adapter";
import { observer } from "mobx-react-lite";
import { MultipoolStore } from "@/store/MultipoolStore";
import TVChartContainer from "@/components/tv-chart";
import { TokenSelector } from "@/components/token-selector";
import { AdminPannel } from './admin';
import { useQuery } from '@tanstack/react-query';
import { StoreProvider, useStore } from '@/contexts/StoreContext';
import { getMultipoolMarketData } from '@/api/arcanum';
import { toast, useToast } from '@/components/ui/use-toast';

export const Admin = observer(() => {
    return (
        <>
            <AdminPannel />
        </>
    )
});

export const SPI = () => {
    const multipool = new MultipoolStore("spi");

    return (
        <StoreProvider store={multipool}>
            <MainInner />
        </StoreProvider>
    )
};

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
                        <TabsTrigger value="mint" className='text-lg font-bold'>Mint</TabsTrigger>
                        <TabsTrigger value="burn" className='text-lg font-bold'>Burn</TabsTrigger>
                        <TabsTrigger value="swap" className='text-lg font-bold'>Swap</TabsTrigger>

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
    const { multipoolId, multipoolAddress, logo } = useStore();
    const { toast } = useToast();

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
                        <img src={logo} alt="Logo" className='w-8 h-8' />
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

    function copyToClipboard() {
        navigator.clipboard.writeText(multipoolAddress || "");
        toast({
            title: "Copied to clipboard!",
            description: "The multipool address has been copied to your clipboard",
            duration: 1000
        });
    }

    return (
        <div className='flex w-full rounded p-1 justify-between items-center bg-[#0c0a09] border border-[#292524]'>
            <div className="flex flex-row items-center justify-between gap-2 pl-4 pr-8 py-2 xl:py-0 w-full">
                <div className="flex flex-row text-left gap-2 items-center">
                    <img src={`/multipools/${multipoolId}_eclipse.svg`} alt="Logo" className='w-14 h-14' />
                    <div>
                        <p className='text-[#fff] p-0 text-2xl'>{multipoolId.toLocaleUpperCase() || ""}</p>
                        <div className='flex flex-row gap-2 items-center text-white opacity-70 cursor-pointer' onClick={copyToClipboard}>
                            {multipoolAddress && <p className='text-white opacity-70 p-0 text-sm'>{multipoolAddress.slice(0, 6) + "..." + multipoolAddress.slice(-4)}</p>}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                        </div>
                    </div>
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

