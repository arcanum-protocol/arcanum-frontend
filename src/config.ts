import { configureChains } from '@wagmi/core'
import { createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { arbitrum } from 'wagmi/chains';
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";


export const chains = [arbitrum];
export const { publicClient } = configureChains(chains, [
    alchemyProvider({ apiKey: "MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_" }),
    jsonRpcProvider({
        rpc: (chain) => {
            if (chain.id !== 42161) {
                return null;
            }
            return { http: "https://arbitrum.llamarpc.com" };
        }
    }),
])

export const config = createConfig(
    getDefaultConfig({
        publicClient,
        alchemyId: "MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_",
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
);

export const alchemyClient = createAlchemyWeb3("https://arb-mainnet.g.alchemy.com/v2/MERXmvJOqhiBs4LYV_rOFMueneDC3Sq_").alchemy;
