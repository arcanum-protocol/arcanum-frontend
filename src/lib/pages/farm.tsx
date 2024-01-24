import { fetchFarms } from "@/api/arcanum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query"


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
            <div className="grid grid-cols-6 gap-1">
                {
                    farms?.map((farm: any) => {
                        return (
                            <div className="border rounded bg-[#0c0a09]">
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
                                    Details
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
                                        </path>
                                    </svg>
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