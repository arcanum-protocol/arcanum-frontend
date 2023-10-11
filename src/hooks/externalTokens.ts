import { alchemiUrl, moralisKey } from '@/config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Address } from 'viem';

interface ExternalToken {
    name: string,
    symbol: string,
    logo: string,
    decimals: number,
    address: string,
    balance?: number,
    price?: number,
}

function useArbitrumTokens(): {
    externalTokens: ExternalToken[] | undefined;
    isLoading: boolean;
    error: any;
} {
    const { data, isLoading, error } = useQuery(['externalTokens'], async () => {
        const response = await axios.get('https://tokens.1inch.io/v1.2/42161');
        const data = response.data;

        const tokens = Object.values(data);

        // map tokens to ExternalToken interface
        const externalTokens = tokens.map((token: any) => {
            return {
                name: token.name,
                symbol: token.symbol,
                logo: token.logoURI,
                decimals: token.decimals,
                address: token.address,
            };
        });

        return externalTokens;
    });

    return {
        externalTokens: (data as ExternalToken[]),
        isLoading,
        error,
    };
}

function useUpdateTokenBalances(address: Address | undefined, tokens: ExternalToken[] | undefined): {
    externalTokens: ExternalToken[] | undefined;
    isLoading: boolean;
    error: any;
} {
    if (!address) {
        return {
            externalTokens: tokens,
            isLoading: false,
            error: "address was undefined"
        };
    }

    if (!tokens) {
        return {
            externalTokens: undefined,
            isLoading: false,
            error: "tokens was undefined"
        };
    }

    const { data, isLoading, error } = useQuery(['tokenBalances'], async () => {
        const externalTokens = [...tokens];
        const tokensAddresses = externalTokens.map((token) => token.address);

        const request = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "alchemy_getTokenBalances",
            "params": [address, tokensAddresses],
            "id": 42
        });

        const config = {
            method: 'post',
            url: alchemiUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            data: request
        };

        const response = await axios(config);
        const balances = response.data.result.tokenBalances;

        for (let i = 0; i < externalTokens.length; i++) {
            // find the token in the balances array
            const tokenIndex = externalTokens.findIndex((token) => token.address === balances[i].contractAddress);
            // check if the token exists
            if (tokenIndex === -1) continue;
            const balance = balances[i].tokenBalance;
            // check if the tokenBalance is not null
            if (balance === null) continue;
            // update the token balance
            externalTokens[tokenIndex].balance = parseInt(balance, 16);
        }

        return externalTokens;
    });

    return {
        externalTokens: data,
        isLoading,
        error,
    };
}

function useExternalTokens(address?: Address | undefined, externalTokensPrefetch?: ExternalToken[] | undefined, blockNumber?: bigint | undefined): {
    externalTokens: ExternalToken[] | undefined;
    isLoading: boolean;
    error: any;
} {
    if (!address) {
        return useArbitrumTokens();
    }
    
    const { externalTokens: tokenBalance, isLoading: balanceLoading, error: balanceError } = useUpdateTokenBalances(address, externalTokensPrefetch);
    const { tokenPrices, isLoading: pricesLoading, error: priceError } = useTokenPrices(externalTokensPrefetch, blockNumber);

    const isLoading = balanceLoading || pricesLoading;
    const error = balanceError || priceError;

    return {
        externalTokens: pricesLoading ? balanceLoading ? externalTokensPrefetch : tokenBalance : tokenPrices,
        isLoading,
        error,
    };
}

function useTokenPrices(tokens: ExternalToken[] | undefined): {
    tokenPrices: ExternalToken[] | undefined;
    isLoading: boolean;
    error: any;
} {
    if (!tokens) {
        return {
            tokenPrices: undefined,
            isLoading: false,
            error: "tokens was undefined"
        };
    }

    const { data, isLoading, error } = useQuery(['tokenPrices'], async () => {
        const configEthPriceRequest = {
            method: 'get',
            url: 'https://token-rates-aggregator.1inch.io/v1.0/native-token-rate?vs=USD'
        };

        const ethPriceResponse = await axios(configEthPriceRequest);
        const ethPrice = Number(ethPriceResponse.data["42161"]["USD"]);

        const config = {
            method: 'get',
            url: `https://token-prices.1inch.io/v1.1/42161`
        };

        const responce = await axios(config);
        const contracts = Object.keys(responce.data);

        contracts?.map((token) => {
            const tokenIndex = tokens?.findIndex((t) => t.address === token);
            if (tokenIndex === -1) return;
            tokens[tokenIndex].price = Number(responce.data[token]) * ethPrice;
        });

        return tokens;
    });

    console.log(data);

    return {
        tokenPrices: data,
        isLoading,
        error,
    };
}

export { useArbitrumTokens, useUpdateTokenBalances, useExternalTokens, useTokenPrices, type ExternalToken };
