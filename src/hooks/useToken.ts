import { useQuery } from '@tanstack/react-query';
import { Address, PublicClient, getContract } from 'viem';
import { BigNumber } from 'bignumber.js';
import { useAccount, usePublicClient } from 'wagmi';
import ERC20 from '@/abi/ERC20';

// Define the fetch function with account check
async function fetchTokenDetails(tokenAddress: Address, publicClient: PublicClient, userAddress?: Address) {
    const contract = getContract({
        address: tokenAddress,
        abi: ERC20,
        client: publicClient,
    });

    const [name, symbol, decimals] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals(),
    ]);

    // Check if userAddress is provided
    let balanceRaw = 0n; // Default balance if no account is connected
    let balanceFormatted = '0'; // Default formatted balance
    if (userAddress) {
        balanceRaw = await contract.read.balanceOf([userAddress]);
        balanceFormatted = new BigNumber(balanceRaw.toString()).dividedBy(new BigNumber(10).pow(decimals)).toString();
    }

    return {
        name,
        symbol,
        decimals: Number(decimals),
        balanceRaw,
        balanceFormatted,
    };
};

// Updated useToken hook to handle no account scenario
const useToken = (tokenAddress: Address) => {
    const { address: userAddress } = useAccount();
    const client = usePublicClient();

    const { data, error, isLoading } = useQuery({
        queryKey: ['tokenDetails'],
        queryFn: async () => fetchTokenDetails(tokenAddress, client, userAddress),
        enabled: !!tokenAddress, // Query is enabled if tokenAddress is provided, independent of userAddress
    });

    return {
        data: data,
        isLoading,
        error,
    };
};

export { useToken };
