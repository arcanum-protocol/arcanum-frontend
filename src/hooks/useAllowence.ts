import ERC20 from "@/abi/ERC20";
import { Address, useContractRead } from "wagmi";

export function useAllowence({ address, tokenAddress, to }: { address: Address, tokenAddress: Address, to: Address }) {
    const { data, isLoading } = useContractRead({
        address: tokenAddress,
        abi: ERC20,
        functionName: "allowance",
        args: [address, to],
        enabled: tokenAddress != "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        watch: true
    });

    if (tokenAddress == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        return {
            data: BigInt(2) ** BigInt(256) - BigInt(1),
            isLoading: false,
        }
    }

    return {
        data: data ? BigInt(data) : BigInt(0),
        isLoading,
    }
}

