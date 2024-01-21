import { fetchFarms } from "@/api/arcanum"
import { useQuery } from "@tanstack/react-query"


function Farms() {
    const { data: farms, isLoading, isError } = useQuery(['farms'], () => fetchFarms(), { refetchOnWindowFocus: false });

    return (
        <div>
            <h1>Farms</h1>
        </div>
    )
}

export { Farms }