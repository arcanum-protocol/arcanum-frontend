import { configureChains } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { createConfig } from "wagmi";
import {
    getDefaultConfig,
} from "connectkit";

export const polygonMumbai = {
    id: 80001,
    name: 'Polygon Mumbai',
    network: 'Polygon Mumbai',
    nativeCurrency: {
        decimals: 18,
        name: 'MATIC',
        symbol: 'MATIC',
    },
    rpcUrls: {
        public: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
        default: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
    },
    blockExplorers: {
        etherscan: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
        default: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
    },
};

export const arbitrumSepolia = {
    id: 421614,
    name: 'Arbitrum sepolia',
    network: 'Arbitrum sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
        default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    },
    blockExplorers: {
        etherscan: { name: 'ArbiScan', url: 'https://sepolia-explorer.arbitrum.io' },
        default: { name: 'ArbiScan', url: 'https://sepolia-explorer.arbitrum.io' },
    },
};

export const opBnb = {
    id: 5611,
    name: 'OpBNB Testnet',
    network: 'OpBNB Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'tcBNB',
        symbol: 'tcBNB',
    },
    rpcUrls: {
        public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
        default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        etherscan: { name: 'SnowTrace', url: 'https://opbnb-testnet.bscscan.com' },
        default: { name: 'SnowTrace', url: 'https://opbnb-testnet.bscscan.com' },
    },
};


import { createStorage } from 'wagmi'

export const noopStorage: BaseStorage = {
    getItem: (_key) => '',
    setItem: (_key, _value) => null,
    removeItem: (_key) => null,
}

const storage = createStorage({
    storage: noopStorage,
})

export const chains = [arbitrumSepolia, polygonMumbai, opBnb];
export const { publicClient } = configureChains(chains, [publicProvider()])

export const config = createConfig({
    //storage: storage,
    ...getDefaultConfig({
        publicClient,
        alchemyId: "K7c6nsX9dY6D4OhdtkKc2f05yEcFdtqU",
        walletConnectProjectId: "1d63d7e43fd1d5ea177bdb4a8939ade4",

        chains: chains,

        // Required
        appName: "ARCANUM",

        // Optional
        appDescription:
            "Decentralized asset management protocol that allows to create complicated asset management portfolio and manage them in a DeFi manner.",
        appUrl: "https://arcanum.to",
        appIcon: "https://arcanum.to/logo.png",
    }),
})

