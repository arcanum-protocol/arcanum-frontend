import { fetchFarms } from "@/api/arcanum"
import { useQuery } from "@tanstack/react-query"


function Farms() {
    const { data, isLoading, isError } = useQuery(['farms'], () => fetchFarms(), { refetchOnWindowFocus: false });
    if (isLoading) {
        return <div>Loading...</div>
    }

    const { farms } = data;
    console.log(farms);

    if (isError) {
        return <div>Error...</div>
    }

    return (
        <div className="grid grid-cols-6 gap-1">
            {
                farms?.map((farm: any) => {
                    return (
                        <div className="border rounded bg-[#0c0a09]">
                            <div className="flex items-start">
                                <img src={farm.logo} className="w-10 h-10" />
                                <div className="text-gray-300 text-2xl">{farm.name}</div>
                            </div>
                            <div className="text-gray-300 text-sm">{farm.token}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export { Farms }