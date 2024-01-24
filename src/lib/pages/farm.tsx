import { fetchFarms } from "@/api/arcanum"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query"


function Details() {
    return (
        <Accordion type="single" collapsible className="w-full px-4">
            <AccordionItem value="item-1">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 justify-between">
                        <p className="text-left">Pool</p>
                        <p className="text-right">0xd0fF••••048F</p>
                        <p className="text-left">ETF</p>
                        <p className="text-right">0xd0fF••••048F</p>
                        <p className="text-left">Reward token</p>
                        <p className="text-right">
                            <div className="inline-flex align-baseline">
                                <img className="w-5 h-5" src='/brands/arbitrum.svg' />$ARB
                            </div>
                        </p>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

function Farms() {
    const { data, isLoading, isError } = useQuery(['farms'], () => fetchFarms(), { refetchOnWindowFocus: false });

    if (isLoading) {
        return <div>Loading...</div>
    }

    const { farms } = data;

    if (isError) {
        return <div>Error...</div>
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col items-center bg-[#0c0a09] rounded-md border border-[#292524] p-4">
                <div className="text-3xl bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">🌱FARMS🌱</div>
                <div className="text-gray-300 text-xl">EARN <a className="bg-gradient-to-r from-red-700 to-purple-400 text-transparent bg-clip-text animate-gradient">REWARDS</a> BY STAKING YOUR <a className="underline decoration-indigo-500">ETF</a> TOKENS</div>
            </div>
            <div className="grid grid-cols-4 gap-1">
                {
                    farms?.map((farm: any) => {
                        return (
                            <div className="flex flex-col border rounded bg-[#0c0a09] h-min">
                                <div className="flex flex-col items-center px-4 pb-4">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={farm.logo} className="w-12 h-12" />
                                        <AvatarFallback>{farm.name}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-gray-300 text-2xl">{farm.name}</div>
                                    <div className="flex flex-row w-full justify-between">
                                        <div className="text-sm text-gray-300">APY</div>
                                        <div className="text-sm bg-gradient-to-r from-blue-700 to-green-400 text-transparent bg-clip-text animate-gradient">30%</div>
                                    </div>
                                    <div className="flex flex-row w-full justify-between">
                                        <div className="text-sm text-gray-300">TVL</div>
                                        <div className="text-sm text-gray-300">332332$</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="text-xs p-1 cursor-pointer">
                                    <Details />
                                </div>
                                <div className="w-full">
                                    <Button className="w-full border bg-transparent rounded-md border-green-300 text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false}>
                                        <p style={{ margin: "10px" }}>Stake</p>
                                    </Button>
                                </div >
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export { Farms }