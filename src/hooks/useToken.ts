import { useQuery } from '@tanstack/react-query';
import { Address, PublicClient, getContract } from 'viem';
import { BigNumber } from 'bignumber.js';
import { useAccount, usePublicClient } from 'wagmi';
import ERC20 from '@/abi/ERC20';

// ETH Special Address
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Define the fetch function with account check
async function fetchTokenDetails(tokenAddress: Address | undefined, publicClient: PublicClient | undefined, userAddress?: Address) {
    if (!tokenAddress) {
        throw new Error('Token address is required');
    }
    if (!publicClient) {
        throw new Error('Public client is not available');
    }

    // Handling Ethereum separately
    if (tokenAddress === ETH_ADDRESS) {
        if (!userAddress) {
            return {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                balanceRaw: 0n,
                balanceFormatted: '0',
            };
        }

        // Replace this part with the correct method to fetch ETH balance using userAddress
        // This is a placeholder example using a generic web3 call
        const balanceRaw = await publicClient.getBalance({ address: userAddress }); // Make sure to replace this with the actual method you have
        const balanceFormatted = new BigNumber(balanceRaw.toString()).dividedBy(new BigNumber(10).pow(18)).toString();

        return {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            balanceRaw,
            balanceFormatted,
        };
    } else {
        // ERC20 handling
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
    }
};

// Updated useToken hook to handle no account scenario
const useToken = ({
        address,
        watch 
    }: {
        address?: Address,
        watch?: boolean,
    }) => {
    const { address: userAddress } = useAccount();
    const client = usePublicClient();

    const { data, error, isLoading } = useQuery({
        queryKey: ['tokenDetails', address],
        queryFn: () => fetchTokenDetails(address, client, userAddress),
        enabled: !!address, // Query is enabled if tokenAddress is provided, independent of userAddress
        refetchInterval: watch ? 10000 : false,
    });

    return {
        data,
        isLoading,
        error,
    };
};

export { useToken };
