import FARM from "@/abi/FARM";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Address, getContract } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function truncateAddress(address: Address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function FarmsAdmin() {

    return (
        <div className="bg-[#0c0a09] border rounded p-4">
            <h1 className="mb-4">Farms Admin</h1>
            <div className="flex flex-row gap-3">
                <Pools />
                <AddPool />
            </div>
        </div>
    );
}

function Pools() {
    const publicClient = usePublicClient();

    const { data, isLoading } = useQuery({
        queryKey: ["pools"],
        queryFn: async () => {
            if (!publicClient) {
                return;
            }
            const contract = getContract({ abi: FARM, address: "0x573377794733fb86c7383DeB3502D6C5E1EDa947", client: publicClient });
            const pools: {
                lockAsset: `0x${string}`;
                lockAssetTotalNumber: bigint;
                rewardAsset: `0x${string}`;
                rpb: bigint;
                arps: bigint;
                availableRewards: bigint;
                lastUpdateBlock: bigint;
            }[] = [];

            for (let i = 0; i < 5; i++) {
                const pool = await contract.read.getPool([BigInt(i)]);
                if (pool.lockAsset === "0x0000000000000000000000000000000000000000") {
                    break;
                }
                pools.push(pool);
            }

            return pools;
        },
        initialData: [],
    });

    if (isLoading) {
        return <Skeleton className="w-2/3" />;
    }

    if (!data) {
        return <div>Error</div>;
    }

    return (
        <div className="bg-[#0c0a09] border rounded p-4 w-2/3">
            <h1>Pools</h1>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Lock Asset</TableHead>
                            <TableHead className="text-center">Reward Asset</TableHead>
                            <TableHead className="text-center">RPB</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((pool: {
                            lockAsset: `0x${string}`;
                            lockAssetTotalNumber: bigint;
                            rewardAsset: `0x${string}`;
                            rpb: bigint;
                            arps: bigint;
                            availableRewards: bigint;
                            lastUpdateBlock: bigint;
                        }, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{truncateAddress(pool.lockAsset)}</TableCell>
                                <TableCell>{truncateAddress(pool.rewardAsset)}</TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="flex flex-row gap-1 items-center justify-center hover:opacity-55 cursor-pointer">
                                                {pool.rpb.toString()}
                                                <Pencil size={10} />
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#0c0a09] rounded sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit RPB Value</DialogTitle>
                                                <DialogDescription>
                                                    Edit the RPB value for the pool.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <Input className="w-full" />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => {
                                                    
                                                }}>Submit</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}

function AddPool() {
    const [lockAsset, setLockAsset] = useState("");
    const [rewardAsset, setRewardAsset] = useState("");

    const { writeContractAsync } = useWriteContract();

    async function addPool() {
        await writeContractAsync({
            abi: FARM,
            address: "0x573377794733fb86c7383DeB3502D6C5E1EDa947",
            functionName: "addPool",
            args: [lockAsset as Address, rewardAsset as Address]
        });
    }

    return (
        <div className="bg-[#0c0a09] border rounded p-4 flex flex-col gap-2 w-1/3">
            <h1>Add Pool</h1>
            <div className="flex flex-row items-center">
                <label className="w-1/3">Lock Asset</label>
                <Input className="w-2/3" type="text" value={lockAsset} onChange={(e) => setLockAsset(e.target.value)} />
            </div>
            <div className="flex flex-row items-center">
                <label className="w-1/3">Reward Asset</label>
                <Input className="w-2/3" type="text" value={rewardAsset} onChange={(e) => setRewardAsset(e.target.value)} />
            </div>
            <Button className="bg-[#0c0a09] border rounded text-white hover:bg-[#0c0a09] hover:opacity-55" onClick={() => addPool()}>Add Pool</Button>
        </div>
    );
}

export { FarmsAdmin };
