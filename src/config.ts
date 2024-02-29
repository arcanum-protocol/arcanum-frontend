import { createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { arbitrum } from 'wagmi/chains';
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { Chain, createPublicClient, http } from 'viem';
import { injected } from "@wagmi/core";

const customTestnet = {
    id: 31337,
    name: 'anvil',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        public: { http: ['http://81.163.22.190:8545'] },
        default: { http: ['http://81.163.22.190:8545'] },
    },
} as const satisfies Chain;

export const config = createConfig(
    getDefaultConfig({
        walletConnectProjectId: "1d63d7e43fd1d5ea177bdb4a8939ade4",
        connectors: [injected()],

        chains: [customTestnet, arbitrum],
        transports: {
            [customTestnet.id]: http(),
            [arbitrum.id]: http(),
        },

        // Required
        appName: "ARCANUM",

        // Optional
        appDescription:
            "Decentralized asset management protocol that allows to create complicated asset management portfolio and manage them in a DeFi manner.",
        appUrl: "https://arcanum.to",
        appIcon: "https://arcanum.to/logo.png",
    }),
);

export const publicClient = createPublicClient({
    chain: customTestnet,
    transport: http()
});

export const alchemyClient = createAlchemyWeb3("https://arb-mainnet.g.alchemy.com/v2/MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_").alchemy;
