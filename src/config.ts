import { configureChains } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { createConfig } from "wagmi";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { getDefaultConfig } from "connectkit";

export const arbitrumMainnet = {
    id: 42161,
    name: 'Arbitrum',
    network: 'Arbitrum',
    testnet: false,
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['https://arbitrum.llamarpc.com'] },
        default: { http: ['https://arbitrum.llamarpc.com'] },
    },
    blockExplorers: {
        etherscan: { name: 'ArbiScan', url: 'https://arbiscan.io' },
        default: { name: 'ArbiScan', url: 'https://arbiscan.io' },
    },
};

export const polygonMumbai = {
    id: 80001,
    name: 'Polygon Mumbai',
    network: 'Polygon Mumbai',
    testnet: true, 
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

export const opBnb = {
    id: 5611,
    name: 'OpBNB Testnet',
    network: 'OpBNB Testnet',
    testnet: true,
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

export const arbitrumSepolia = {
    id: 421614,
    name: 'Arbitrum Sepolia',
    network: 'Arbitrum Sepolia',
    testnet: true,
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['https://arbitrum-sepolia.blockpi.network/v1/rpc/public'] },
        default: { http: ['https://arbitrum-sepolia.blockpi.network/v1/rpc/public'] },
    },
};

export const anvil = {
    id: 31337,
    name: 'Anvil',
    network: 'Anvil',
    testnet: true,
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['http://81.163.22.190:8545/'] },
        default: { http: ['http://81.163.22.190:8545/'] },
    },
} 

export const chains = [anvil];
export const { publicClient } = configureChains(chains, [publicProvider()])

export const config = createConfig({
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

export const alchemiClient = createAlchemyWeb3(
    `https://arb-mainnet.g.alchemy.com/v2/MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_`
);

export const alchemiUrl = "https://arb-mainnet.g.alchemy.com/v2/MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_";

export const moralisKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjgwZjMxYzlmLTA5MTgtNDMyZC05OTAxLThmZjc3NzkyNGM4MyIsIm9yZ0lkIjoiMzYwNDkwIiwidXNlcklkIjoiMzcwNDg3IiwidHlwZUlkIjoiZDgzNDIyNDctZjFjMC00YjZkLWFjNTUtNmY0MWQ3M2E1NjJiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTY5MDMyNTEsImV4cCI6NDg1MjY2MzI1MX0.gnF_rOCqtfg96quvHLkZD2G71hO5HE1uUBXXYllZH7c";
