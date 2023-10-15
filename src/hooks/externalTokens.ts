import { alchemiUrl } from '@/config';
import { ExternalAsset, MultipoolAsset } from '@/types/multipoolAsset';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Address } from 'viem';

function useArbitrumTokens(): {
    ExternalAssets: ExternalAsset[] | undefined;
    isLoading: boolean;
    error: any;
} {
    const { data, isLoading, error } = useQuery(['ExternalAssets'], async () => {
        const response = await axios.get('https://tokens.1inch.io/v1.2/42161');
        const data = response.data;

        const tokens = Object.values(data);

        // map tokens to ExternalAsset interface
        const ExternalAssets = tokens.map((token: any) => {
            return {
                name: token.name,
                symbol: token.symbol,
                logo: token.logoURI,
                decimals: token.decimals,
                address: token.address,
                type: "external",
            };
        });

        return ExternalAssets;
    });

    return {
        ExternalAssets: (data as ExternalAsset[]),
        isLoading,
        error,
    };
}

function useUpdateTokenBalances(address: Address | undefined, tokens: ExternalAsset[] | undefined): {
    ExternalAssets: ExternalAsset[] | undefined;
    isLoading: boolean;
    error: any;
} {
    if (!address) {
        return {
            ExternalAssets: tokens,
            isLoading: false,
            error: "address was undefined"
        };
    }

    if (!tokens) {
        return {
            ExternalAssets: undefined,
            isLoading: false,
            error: "tokens was undefined"
        };
    }

    const { data, isLoading, error } = useQuery(['tokenBalances'], async () => {
        const ExternalAssets = [...tokens];
        const tokensAddresses = ExternalAssets.map((token) => token.address);

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

        for (let i = 0; i < ExternalAssets.length; i++) {
            // find the token in the balances array
            const tokenIndex = ExternalAssets.findIndex((token) => token.address === balances[i].contractAddress);
            // check if the token exists
            if (tokenIndex === -1) continue;
            const balance = balances[i].tokenBalance;
            // check if the tokenBalance is not null
            if (balance === null) continue;
            // update the token balance
            ExternalAssets[tokenIndex].balance = parseInt(balance, 16);
        }

        return ExternalAssets;
    });

    return {
        ExternalAssets: data,
        isLoading,
        error,
    };
}

function useExternalAssets(address?: Address | undefined, ExternalAssetsPrefetch?: ExternalAsset[] | undefined): {
    ExternalAssets: ExternalAsset[] | undefined;
    isLoading: boolean;
    error: any;
} {
    if (!address) {
        return useArbitrumTokens();
    }
    
    const { ExternalAssets: tokenBalance, isLoading: balanceLoading, error: balanceError } = useUpdateTokenBalances(address, ExternalAssetsPrefetch);
    const { tokenPrices, isLoading: pricesLoading, error: priceError } = useTokenPrices(ExternalAssetsPrefetch);

    const isLoading = balanceLoading || pricesLoading;
    const error = balanceError || priceError;

    return {
        ExternalAssets: pricesLoading ? balanceLoading ? ExternalAssetsPrefetch : tokenBalance : tokenPrices,
        isLoading,
        error,
    };
}

function useMultiPoolTokens(externalAssets: ExternalAsset[] | undefined, multipoolTokens: MultipoolAsset[] | undefined): {
    assets: (ExternalAsset | MultipoolAsset)[] | undefined;
} {
    if (!externalAssets) {
        return {
            assets: undefined,
        };
    }

    if (!multipoolTokens) {
        return {
            assets: externalAssets,
        };
    }
    
    // if multipool asset already exist in external assets
    // then change the type to multipool
    
    const assets: (ExternalAsset | MultipoolAsset)[] = [...externalAssets];
    multipoolTokens.forEach((token) => {
        const index = assets.findIndex((asset) => asset.address.toLocaleLowerCase() === token.address.toLocaleLowerCase());
        if (index === -1) {
            assets.push({
                ...token,
                type: "multipool",
            });
            return
        }
        const asset: MultipoolAsset = {
            ...assets[index],
            ...token,
            type: "multipool",
        }
        assets[index] = asset;
    });

    return {
        assets,
    };
}

function useTokenPrices(tokens: ExternalAsset[] | undefined): {
    tokenPrices: ExternalAsset[] | undefined;
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

    return {
        tokenPrices: data,
        isLoading,
        error,
    };
}

export { useArbitrumTokens, useUpdateTokenBalances, useExternalAssets, useTokenPrices, useMultiPoolTokens };
