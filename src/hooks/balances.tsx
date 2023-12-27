import ERC20 from "@/abi/ERC20";
import { Address, useContractRead, useBalance as useBalanceWagmi } from "wagmi";


export function useBalance(address: Address | undefined, asset: Address | undefined) {
    if (address === undefined || asset === undefined) {
        return { balance: undefined, isLoading: true };
    }

    const { data: ethBalance, isLoading: ethBalanceLoading } = useBalanceWagmi({
        address,
        watch: true
    });

    if (asset.toLocaleLowerCase() === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLocaleLowerCase()) {
        if (ethBalanceLoading) {
            return { balance: undefined, isLoading: true };
        }
        return { balance: ethBalance?.value, isLoading: false };
    }

    const { data: balance, isLoading } = useContractRead({
        address: asset,
        abi: ERC20,
        functionName: "balanceOf",
        args: [address],
        watch: true
    });

    return { balance, isLoading };
}
