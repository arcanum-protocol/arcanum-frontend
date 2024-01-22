import { fetchFarms } from "@/api/arcanum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    )
}

export { Farms }